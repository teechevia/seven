"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { createWorker, Worker } from "tesseract.js"
import { ParkingSidebar } from "@/components/parking-sidebar"
import {
  Upload,
  Camera,
  Car,
  User,
  Shield,
  ShieldCheck,
  ShieldX,
  ParkingCircle,
  Clock,
  ScanLine,
  Sparkles,
  Image as ImageIcon,
  X,
  CheckCircle2,
  Loader2,
  Eye,
  Zap,
  Activity,
  AlertTriangle,
  FileWarning,
  FileText,
  Search,
  Video,
  VideoOff,
  LogOut,
  Timer,
  DollarSign,
  Receipt,
  ArrowRightCircle,
} from "lucide-react"
import Image from "next/image"

type ProcessingState = "idle" | "uploading" | "processing" | "complete"

const ALLOWED_FILE_TYPES = ["image/jpeg", "image/jpg", "image/png"]

const VEHICLE_PLATE_PATTERNS = [
  /([A-Z]{2})\s*(\d{1,2})\s*([A-Z]{1,3})\s*(\d{1,4})/gi,
  /([A-Z]{2})(\d{1,2})([A-Z]{1,3})(\d{1,4})/gi,
  /([A-Z]{2})\s*(\d{2})\s*([A-Z]{2})\s*(\d{4})/gi,
]

interface ExitDetails {
  vehicleNo: string
  owner: string
  type: string
  entryTime: string
  exitTime: string
  duration: string
  slot: string
  gate: string
  confidence: number
  parkingFee?: number
}

interface FileError {
  message: string
  type: "invalid_type" | "too_large" | "not_found" | "ocr_failed"
}

interface OCRResult {
  rawText: string
  detectedPlate: string | null
  confidence: number
  usedFallback: boolean
}

export default function VehicleExitPage() {
  const [processingState, setProcessingState] = useState<ProcessingState>("idle")
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [exitDetails, setExitDetails] = useState<ExitDetails | null>(null)
  const [fileError, setFileError] = useState<FileError | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // OCR state
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null)
  const [ocrProgress, setOcrProgress] = useState<number>(0)
  const [ocrStatus, setOcrStatus] = useState<string>("")
  const workerRef = useRef<Worker | null>(null)

  // Webcam state
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // Initialize Tesseract worker
  useEffect(() => {
    const initWorker = async () => {
      const worker = await createWorker("eng", 1, {
        logger: (m) => {
          if (m.status === "recognizing text") {
            setOcrProgress(Math.round(m.progress * 100))
            setOcrStatus("Recognizing text...")
          } else if (m.status === "loading tesseract core") {
            setOcrStatus("Loading OCR engine...")
          } else if (m.status === "initializing tesseract") {
            setOcrStatus("Initializing...")
          } else if (m.status === "loading language traineddata") {
            setOcrStatus("Loading language data...")
          }
        },
      })
      workerRef.current = worker
    }
    initWorker()

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate()
      }
    }
  }, [])

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  // Camera functions
  const startCamera = async () => {
    try {
      setCameraError(null)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } }
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setIsCameraActive(true)
      setCapturedImage(null)
    } catch (err) {
      console.error("Camera access error:", err)
      setCameraError("Unable to access camera. Please check permissions.")
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setIsCameraActive(false)
  }

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.drawImage(video, 0, 0)
        const imageData = canvas.toDataURL("image/jpeg", 0.95)
        setCapturedImage(imageData)
        setUploadedImage(imageData)
        
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `exit-capture-${Date.now()}.jpg`, { type: "image/jpeg" })
            setSelectedFile(file)
            setUploadSuccess(true)
            setTimeout(() => setUploadSuccess(false), 2000)
          }
        }, "image/jpeg", 0.95)
        
        stopCamera()
      }
    }
  }

  const retakePhoto = () => {
    setCapturedImage(null)
    setUploadedImage(null)
    setSelectedFile(null)
    setExitDetails(null)
    setOcrResult(null)
    setProcessingState("idle")
    startCamera()
  }

  // Extract vehicle plate from OCR text
  const extractVehiclePlate = (text: string): string | null => {
    const cleanedText = text
      .toUpperCase()
      .replace(/[^A-Z0-9\s]/g, "")
      .replace(/\s+/g, " ")
      .trim()

    for (const pattern of VEHICLE_PLATE_PATTERNS) {
      pattern.lastIndex = 0
      const matches = cleanedText.matchAll(pattern)

      for (const match of matches) {
        if (match) {
          const state = match[1]
          const district = match[2].padStart(2, "0")
          const series = match[3]
          const number = match[4].padStart(4, "0")
          return `${state} ${district} ${series} ${number}`
        }
      }
    }

    const simplePattern = /[A-Z]{2}\d{1,2}[A-Z]{1,3}\d{1,4}/g
    const simpleMatch = cleanedText.replace(/\s/g, "").match(simplePattern)
    if (simpleMatch && simpleMatch[0]) {
      const plate = simpleMatch[0]
      const formatted = plate.replace(
        /([A-Z]{2})(\d{1,2})([A-Z]{1,3})(\d+)/,
        "$1 $2 $3 $4"
      )
      return formatted
    }

    return null
  }

  // Run OCR
  const runOCR = async (imageData: string): Promise<OCRResult> => {
    if (!workerRef.current) {
      throw new Error("OCR engine not initialized")
    }

    setOcrStatus("Starting OCR...")
    setOcrProgress(0)

    try {
      const result = await workerRef.current.recognize(imageData)
      const rawText = result.data.text
      const confidence = result.data.confidence

      const detectedPlate = extractVehiclePlate(rawText)

      if (detectedPlate) {
        return {
          rawText,
          detectedPlate,
          confidence,
          usedFallback: false,
        }
      }

      return {
        rawText,
        detectedPlate: null,
        confidence,
        usedFallback: true,
      }
    } catch (error) {
      console.error("OCR Error:", error)
      throw error
    }
  }

  // Validate file
  const validateFile = (file: File): boolean => {
    setFileError(null)
    
    if (!ALLOWED_FILE_TYPES.includes(file.type.toLowerCase())) {
      setFileError({
        message: `Invalid file type. Please upload JPG, JPEG, or PNG files only.`,
        type: "invalid_type"
      })
      return false
    }

    if (file.size > 10 * 1024 * 1024) {
      setFileError({
        message: "File is too large. Maximum size is 10MB.",
        type: "too_large"
      })
      return false
    }

    return true
  }

  // Handle file selection
  const handleFileSelection = (file: File) => {
    if (!validateFile(file)) {
      return
    }

    setSelectedFile(file)
    setUploadSuccess(false)
    
    const reader = new FileReader()
    reader.onload = (event) => {
      setUploadedImage(event.target?.result as string)
      setUploadSuccess(true)
      setTimeout(() => setUploadSuccess(false), 2000)
    }
    reader.readAsDataURL(file)
  }

  // Process vehicle exit
  const handleProcessExit = useCallback(async () => {
    if (!selectedFile || !uploadedImage) return

    setProcessingState("uploading")
    setFileError(null)
    setOcrResult(null)
    setOcrProgress(0)

    await new Promise((resolve) => setTimeout(resolve, 500))
    setProcessingState("processing")

    try {
      const ocrData = await runOCR(uploadedImage)
      setOcrResult(ocrData)

      let vehicleNo = ocrData.detectedPlate

      if (!vehicleNo) {
        setOcrStatus("No plate detected - using fallback...")
        const states = ["KA", "MH", "DL", "TN", "GJ", "RJ", "UP", "WB", "AP", "HR"]
        const state = states[Math.floor(Math.random() * states.length)]
        const district = String(Math.floor(Math.random() * 99) + 1).padStart(2, "0")
        const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ"
        const series = letters[Math.floor(Math.random() * letters.length)] + letters[Math.floor(Math.random() * letters.length)]
        const number = String(Math.floor(Math.random() * 9999) + 1).padStart(4, "0")
        vehicleNo = `${state} ${district} ${series} ${number}`
        
        setOcrResult({
          ...ocrData,
          detectedPlate: vehicleNo,
          usedFallback: true,
        })
      }

      setOcrStatus("Processing exit...")

      // Call exit API
      const response = await fetch("/api/detect-vehicle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleNo,
          action: "exit",
          ocrConfidence: ocrData.confidence,
          rawOcrText: ocrData.rawText,
          usedFallback: ocrData.usedFallback,
        }),
      })

      const result = await response.json()

      if (result.success && result.data.action === "exit") {
        setExitDetails({
          vehicleNo: result.data.vehicleNo,
          owner: result.data.owner,
          type: result.data.type,
          entryTime: result.data.entryTime,
          exitTime: result.data.exitTime,
          duration: result.data.duration,
          slot: result.data.releasedSlot || "N/A",
          gate: result.data.gate || "Gate 1 - Main Exit",
          confidence: result.data.confidence,
          parkingFee: 0,
        })
        setProcessingState("complete")
        setOcrStatus("Complete")
      } else {
        setFileError({
          message: result.error || "No entry record found for this vehicle",
          type: "not_found"
        })
        setProcessingState("idle")
      }
    } catch (error) {
      console.error("Error processing exit:", error)
      setFileError({
        message: "Exit processing failed. Please try again.",
        type: "ocr_failed",
      })
      setProcessingState("idle")
    }
  }, [selectedFile, uploadedImage])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileSelection(file)
    }
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelection(file)
    }
  }, [])

  const resetUpload = () => {
    setUploadedImage(null)
    setSelectedFile(null)
    setProcessingState("idle")
    setExitDetails(null)
    setFileError(null)
    setUploadSuccess(false)
    setOcrResult(null)
    setOcrProgress(0)
    setOcrStatus("")
    setCapturedImage(null)
    setCameraError(null)
    stopCamera()
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="flex min-h-screen bg-zinc-950">
      {/* Ambient background effects */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full bg-lime-500/10 blur-[150px]" />
        <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-lime-500/5 blur-[120px]" />
        <div className="absolute right-1/4 top-1/4 h-72 w-72 rounded-full bg-amber-500/5 blur-[80px]" />
      </div>

      {/* Sidebar */}
      <ParkingSidebar />

      {/* Main Content */}
      <main className="relative flex-1 overflow-auto p-5 sm:p-8 lg:p-10">
        {/* Hero Section */}
        <div className="relative mb-12 overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-zinc-900/90 via-zinc-900/70 to-zinc-800/50 p-10 backdrop-blur-3xl lg:p-12">
          <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-amber-500/20 blur-[100px]" />
          <div className="absolute -bottom-10 left-1/4 h-60 w-60 rounded-full bg-lime-500/10 blur-[80px]" />

          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-5 lg:max-w-xl">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2.5 rounded-full border border-amber-500/40 bg-amber-500/15 px-5 py-2.5 text-sm font-semibold text-amber-400 shadow-xl shadow-amber-500/20">
                  <LogOut className="h-4 w-4" />
                  Vehicle Exit
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-lime-500/40 bg-lime-500/15 px-5 py-2.5 text-sm font-semibold text-lime-400 shadow-xl shadow-lime-500/20">
                  <Activity className="h-4 w-4" />
                  System Active
                </span>
              </div>

              <div>
                <h1 className="bg-gradient-to-r from-white via-zinc-100 to-zinc-300 bg-clip-text text-4xl font-bold tracking-tight text-transparent lg:text-5xl">
                  Vehicle Exit
                </h1>
                <h2 className="mt-1 bg-gradient-to-r from-amber-400 to-amber-300 bg-clip-text text-4xl font-bold tracking-tight text-transparent lg:text-5xl">
                  Processing
                </h2>
              </div>

              <p className="max-w-lg text-lg leading-relaxed text-zinc-400">
                Scan exiting vehicle to automatically calculate parking duration, release assigned slot, and generate exit receipt.
              </p>
            </div>

            {/* Camera Preview */}
            <div className="relative w-full max-w-sm lg:w-80">
              <div className="group relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-zinc-900/80 p-1 shadow-2xl backdrop-blur-xl transition-all duration-500 hover:border-amber-500/30 hover:shadow-amber-500/10">
                <div className="relative aspect-video overflow-hidden rounded-[1.25rem] bg-zinc-800">
                  <canvas ref={canvasRef} className="hidden" />
                  
                  {isCameraActive && (
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  )}
                  
                  {capturedImage && !isCameraActive && (
                    <img
                      src={capturedImage}
                      alt="Captured vehicle"
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  )}

                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-500/5 to-transparent opacity-50" />
                  
                  {!isCameraActive && !capturedImage && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4">
                      <div className="relative">
                        <Camera className="h-12 w-12 text-zinc-600" />
                        <div className="absolute -bottom-1 -right-1 h-3 w-3 animate-pulse rounded-full bg-zinc-500" />
                      </div>
                      <span className="text-sm font-medium text-zinc-500">Exit Camera</span>
                      <button
                        onClick={startCamera}
                        className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-xs font-medium text-amber-400 transition-all hover:bg-amber-500/20"
                      >
                        <Video className="h-3.5 w-3.5" />
                        Start Camera
                      </button>
                    </div>
                  )}

                  {isCameraActive && (
                    <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-2">
                      <button
                        onClick={captureImage}
                        className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-4 py-2 text-xs font-semibold text-zinc-900 shadow-lg shadow-amber-500/30 transition-all hover:bg-amber-400"
                      >
                        <Camera className="h-4 w-4" />
                        Capture
                      </button>
                      <button
                        onClick={stopCamera}
                        className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-400 transition-all hover:bg-red-500/20"
                      >
                        <VideoOff className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}

                  {capturedImage && !isCameraActive && (
                    <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center">
                      <button
                        onClick={retakePhoto}
                        className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-zinc-900/80 px-4 py-2 text-xs font-medium text-white transition-all hover:bg-zinc-800"
                      >
                        <Camera className="h-3.5 w-3.5" />
                        Retake
                      </button>
                    </div>
                  )}

                  {isCameraActive && (
                    <div className="absolute right-3 top-3">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/20 px-3 py-1 text-xs font-medium text-red-400">
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-red-400" />
                        </span>
                        REC
                      </span>
                    </div>
                  )}

                  <div className="absolute left-3 top-3 h-6 w-6 border-l-2 border-t-2 border-amber-500/50" />
                  <div className="absolute right-3 top-3 h-6 w-6 border-r-2 border-t-2 border-amber-500/50" />
                  <div className="absolute bottom-3 left-3 h-6 w-6 border-b-2 border-l-2 border-amber-500/50" />
                  <div className="absolute bottom-3 right-3 h-6 w-6 border-b-2 border-r-2 border-amber-500/50" />
                  
                  {cameraError && (
                    <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/80 p-4">
                      <div className="text-center">
                        <AlertTriangle className="mx-auto h-8 w-8 text-red-400" />
                        <p className="mt-2 text-sm text-red-400">{cameraError}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Upload and Results Grid */}
        <div className="mb-12 grid gap-8 lg:grid-cols-2">
          {/* Upload Area */}
          <div className="group relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-zinc-900/60 p-8 shadow-2xl backdrop-blur-3xl transition-all duration-500 hover:border-amber-500/20 hover:shadow-amber-500/5">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-amber-500/10 blur-[60px] transition-all duration-500 group-hover:bg-amber-500/15" />

            <div className="relative">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="flex items-center gap-3 text-xl font-semibold text-white">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15">
                    <Upload className="h-5 w-5 text-amber-400" />
                  </div>
                  Scan Exit Vehicle
                </h3>
                {uploadedImage && (
                  <button
                    onClick={resetUpload}
                    className="flex items-center gap-2 rounded-xl bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-300 transition-all hover:bg-zinc-700"
                  >
                    <X className="h-4 w-4" />
                    Reset
                  </button>
                )}
              </div>

              {fileError && (
                <div className="mb-4 flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
                  <FileWarning className="h-5 w-5 text-red-400" />
                  <span className="text-sm font-medium text-red-400">{fileError.message}</span>
                  <button
                    onClick={() => setFileError(null)}
                    className="ml-auto text-red-400 hover:text-red-300"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* Drop Zone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault()
                  setIsDragOver(true)
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                className={`relative flex min-h-[280px] cursor-pointer flex-col items-center justify-center rounded-[1.5rem] border-2 border-dashed transition-all duration-300 ${
                  fileError
                    ? "border-red-500/50 bg-red-500/5"
                    : isDragOver
                    ? "border-amber-500 bg-amber-500/10"
                    : uploadedImage
                      ? "border-amber-500/30 bg-zinc-800/50"
                      : "border-zinc-700 bg-zinc-800/30 hover:border-amber-500/50 hover:bg-zinc-800/50"
                }`}
              >
                {uploadedImage ? (
                  <div className="relative h-full w-full p-4">
                    <Image
                      src={uploadedImage}
                      alt="Uploaded vehicle"
                      fill
                      className="rounded-xl object-contain"
                    />
                    {uploadSuccess && processingState === "idle" && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center rounded-xl bg-zinc-900/80 backdrop-blur-sm">
                        <div className="relative">
                          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-amber-500/20">
                            <CheckCircle2 className="h-12 w-12 text-amber-400 animate-bounce" />
                          </div>
                          <div className="absolute inset-0 animate-ping rounded-full bg-amber-500/20" />
                        </div>
                        <span className="mt-4 text-lg font-medium text-white">Image Captured!</span>
                        <span className="mt-2 text-sm text-zinc-400">Ready for exit processing</span>
                      </div>
                    )}
                    {processingState !== "complete" && processingState !== "idle" && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center rounded-xl bg-zinc-900/80 backdrop-blur-sm">
                        {processingState === "uploading" && (
                          <>
                            <Loader2 className="h-12 w-12 animate-spin text-amber-400" />
                            <span className="mt-4 text-lg font-medium text-white">Preparing...</span>
                          </>
                        )}
                        {processingState === "processing" && (
                          <div className="flex flex-col items-center gap-4 px-8">
                            <div className="relative">
                              <ScanLine className="h-16 w-16 animate-pulse text-amber-400" />
                              <div className="absolute inset-0 animate-ping">
                                <ScanLine className="h-16 w-16 text-amber-400/30" />
                              </div>
                            </div>
                            <span className="text-lg font-medium text-white">Processing Exit...</span>
                            <span className="text-sm text-zinc-400">{ocrStatus || "Scanning plate..."}</span>
                            
                            <div className="w-full max-w-xs">
                              <div className="mb-2 flex items-center justify-between text-xs">
                                <span className="text-zinc-500">Progress</span>
                                <span className="font-mono text-amber-400">{ocrProgress}%</span>
                              </div>
                              <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-700">
                                <div 
                                  className="h-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-300"
                                  style={{ width: `${ocrProgress}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    {processingState === "complete" && (
                      <div className="absolute bottom-4 left-4 right-4 rounded-xl border border-lime-500/30 bg-lime-500/10 px-4 py-3 backdrop-blur-sm">
                        <div className="flex items-center gap-2 text-lime-400">
                          <CheckCircle2 className="h-5 w-5" />
                          <span className="font-medium">Exit Processed</span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <label className="flex cursor-pointer flex-col items-center gap-4 p-8">
                    <div className="relative">
                      <div className={`flex h-20 w-20 items-center justify-center rounded-2xl transition-all duration-300 ${
                        fileError ? "bg-red-500/20" : "bg-zinc-700/50 group-hover:bg-amber-500/20"
                      }`}>
                        {fileError ? (
                          <FileWarning className="h-10 w-10 text-red-400" />
                        ) : (
                          <ImageIcon className="h-10 w-10 text-zinc-400 transition-colors group-hover:text-amber-400" />
                        )}
                      </div>
                      <div className={`absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-lg shadow-lg ${
                        fileError ? "bg-red-500 shadow-red-500/30" : "bg-amber-500 shadow-amber-500/30"
                      }`}>
                        <Upload className="h-4 w-4 text-zinc-900" />
                      </div>
                    </div>
                    <div className="text-center">
                      <p className={`text-lg font-medium ${fileError ? "text-red-300" : "text-zinc-300"}`}>
                        {isDragOver ? "Drop your image here" : "Drop vehicle image for exit"}
                      </p>
                      <p className="mt-1 text-sm text-zinc-500">or click to browse files</p>
                    </div>
                    <span className="mt-2 rounded-full border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm text-zinc-400">
                      Supports JPG, JPEG, PNG
                    </span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".jpg,.jpeg,.png"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                {!uploadedImage ? (
                  <label className="group/btn flex flex-1 cursor-pointer items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 px-8 py-4 text-lg font-semibold text-zinc-900 shadow-xl shadow-amber-500/25 transition-all duration-300 hover:shadow-amber-500/40 hover:brightness-110">
                    <Upload className="h-5 w-5" />
                    Select Image for Exit
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>
                ) : processingState === "idle" && !uploadSuccess ? (
                  <button
                    onClick={handleProcessExit}
                    disabled={!selectedFile}
                    className={`group/btn flex flex-1 items-center justify-center gap-3 rounded-2xl px-8 py-4 text-lg font-semibold transition-all duration-300 ${
                      selectedFile
                        ? "bg-gradient-to-r from-amber-500 to-amber-400 text-zinc-900 shadow-xl shadow-amber-500/25 hover:shadow-amber-500/40 hover:brightness-110"
                        : "cursor-not-allowed bg-zinc-700 text-zinc-400"
                    }`}
                  >
                    <ArrowRightCircle className="h-5 w-5" />
                    Process Exit
                  </button>
                ) : processingState === "complete" ? (
                  <button
                    onClick={resetUpload}
                    className="group/btn flex flex-1 items-center justify-center gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-8 py-4 text-lg font-semibold text-amber-400 transition-all duration-300 hover:bg-amber-500/20"
                  >
                    <LogOut className="h-5 w-5" />
                    Process Another Exit
                  </button>
                ) : null}
              </div>
            </div>
          </div>

          {/* Exit Details Card */}
          <div className="group relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-zinc-900/60 p-8 shadow-2xl backdrop-blur-3xl transition-all duration-500 hover:border-lime-500/20 hover:shadow-lime-500/5">
            <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-lime-500/10 blur-[60px]" />

            <div className="relative">
              <h3 className="mb-6 flex items-center gap-3 text-xl font-semibold text-white">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime-500/15">
                  <Receipt className="h-5 w-5 text-lime-400" />
                </div>
                Exit Receipt
                {exitDetails && (
                  <span className="ml-auto flex items-center gap-1.5 rounded-full border border-lime-500/30 bg-lime-500/10 px-3 py-1 text-xs font-medium text-lime-400">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Processed
                  </span>
                )}
              </h3>

              {processingState === "complete" && exitDetails ? (
                <div className="space-y-4">
                  {/* Vehicle Info */}
                  <div className="flex items-center justify-center rounded-2xl border border-zinc-700/50 bg-zinc-800/50 p-6">
                    <div className="text-center">
                      <div className="mb-2 inline-flex items-center gap-2 rounded-xl bg-lime-500/10 px-6 py-4">
                        <Car className="h-8 w-8 text-lime-400" />
                        <span className="text-3xl font-bold tracking-widest text-white">
                          {exitDetails.vehicleNo}
                        </span>
                      </div>
                      <p className="text-sm text-zinc-400">Vehicle Number</p>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex items-center gap-4 rounded-xl border border-zinc-700/50 bg-zinc-800/50 p-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-700/50">
                        <User className="h-6 w-6 text-zinc-400" />
                      </div>
                      <div>
                        <p className="text-sm text-zinc-500">Owner</p>
                        <p className="font-semibold text-white">{exitDetails.owner}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 rounded-xl border border-zinc-700/50 bg-zinc-800/50 p-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-700/50">
                        <ParkingCircle className="h-6 w-6 text-zinc-400" />
                      </div>
                      <div>
                        <p className="text-sm text-zinc-500">Released Slot</p>
                        <p className="font-semibold text-lime-400">{exitDetails.slot}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 rounded-xl border border-zinc-700/50 bg-zinc-800/50 p-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-700/50">
                        <Clock className="h-6 w-6 text-zinc-400" />
                      </div>
                      <div>
                        <p className="text-sm text-zinc-500">Entry Time</p>
                        <p className="font-semibold text-white">{exitDetails.entryTime}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 rounded-xl border border-zinc-700/50 bg-zinc-800/50 p-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-700/50">
                        <LogOut className="h-6 w-6 text-zinc-400" />
                      </div>
                      <div>
                        <p className="text-sm text-zinc-500">Exit Time</p>
                        <p className="font-semibold text-white">{exitDetails.exitTime}</p>
                      </div>
                    </div>
                  </div>

                  {/* Duration & Fee */}
                  <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Timer className="h-6 w-6 text-amber-400" />
                        <div>
                          <p className="text-sm text-zinc-400">Parking Duration</p>
                          <p className="text-2xl font-bold text-white">{exitDetails.duration}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-zinc-400">Parking Fee</p>
                        <p className="text-2xl font-bold text-lime-400">FREE</p>
                      </div>
                    </div>
                  </div>

                  {/* Success Message */}
                  <div className="rounded-xl border border-lime-500/30 bg-lime-500/10 p-4 text-lime-400">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5" />
                      <span className="font-medium">Exit processed successfully - Slot {exitDetails.slot} is now available</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-zinc-700/50 bg-zinc-800/30 py-16 text-zinc-500">
                  <Receipt className="mb-3 h-12 w-12 opacity-50" />
                  <span>Exit details will appear here</span>
                  <span className="mt-2 text-sm">Scan a vehicle to process exit</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <style jsx>{`
        @keyframes scan {
          0%, 100% {
            transform: translateY(-100%);
          }
          50% {
            transform: translateY(100%);
          }
        }
        .animate-scan {
          animation: scan 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
