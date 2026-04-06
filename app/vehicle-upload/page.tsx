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
  ShieldAlert,
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
} from "lucide-react"
import Image from "next/image"
import { 
  vehicleScanHistory, 
  type AuthStatus,
  checkVehicleStatus,
  getFirstAvailableSlot,
  assignSlotToVehicle
} from "@/lib/fake-data"

type ProcessingState = "idle" | "uploading" | "processing" | "complete"

// Allowed file types
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/jpg", "image/png"]
const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png"]

// Indian vehicle number plate patterns
// Format: SS DD SS DDDD or SS DD S DDDD (S=State, D=District, S=Series, D=Number)
// Examples: UP16AB1234, DL8CAF9021, HR26DK8331, KA05MX7892
const VEHICLE_PLATE_PATTERNS = [
  /([A-Z]{2})\s*(\d{1,2})\s*([A-Z]{1,3})\s*(\d{1,4})/gi, // Standard format with possible spaces
  /([A-Z]{2})(\d{1,2})([A-Z]{1,3})(\d{1,4})/gi, // No spaces
  /([A-Z]{2})\s*(\d{2})\s*([A-Z]{2})\s*(\d{4})/gi, // Common 4-part format
]

interface VehicleDetails {
  vehicleNo: string
  owner: string
  type: string
  status: AuthStatus | null
  slot: string | null
  entryTime: string
  confidence: number
  message?: string
  zone?: string
}

interface FileError {
  message: string
  type: "invalid_type" | "too_large" | "upload_failed" | "ocr_failed"
}

interface OCRResult {
  rawText: string
  detectedPlate: string | null
  confidence: number
  usedFallback: boolean
}

// Transform vehicle scan history for recent scans table
const recentScans = vehicleScanHistory.slice(0, 5).map(scan => ({
  vehicleNo: scan.vehicleNo,
  owner: scan.owner,
  type: scan.type,
  time: scan.timestamp.split(" ")[0] + " " + scan.timestamp.split(" ")[1],
  status: scan.status,
  confidence: Math.round(scan.confidence),
}))

const statusConfig = {
  authorized: {
    label: "Authorized",
    icon: ShieldCheck,
    bgColor: "bg-lime-500/15",
    borderColor: "border-lime-500/40",
    textColor: "text-lime-400",
    shadowColor: "shadow-lime-500/20",
    glowColor: "bg-lime-500/20",
  },
  unauthorized: {
    label: "Unauthorized",
    icon: ShieldAlert,
    bgColor: "bg-red-500/15",
    borderColor: "border-red-500/40",
    textColor: "text-red-400",
    shadowColor: "shadow-red-500/20",
    glowColor: "bg-red-500/20",
  },
  blacklisted: {
    label: "Blacklisted",
    icon: ShieldX,
    bgColor: "bg-red-500/15",
    borderColor: "border-red-500/40",
    textColor: "text-red-400",
    shadowColor: "shadow-red-500/20",
    glowColor: "bg-red-500/20",
  },
}

export default function VehicleUploadPage() {
  const [processingState, setProcessingState] = useState<ProcessingState>("idle")
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [vehicleDetails, setVehicleDetails] = useState<VehicleDetails | null>(null)
  const [fileError, setFileError] = useState<FileError | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // OCR specific state
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null)
  const [ocrProgress, setOcrProgress] = useState<number>(0)
  const [ocrStatus, setOcrStatus] = useState<string>("")
  const workerRef = useRef<Worker | null>(null)

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

  // Extract vehicle plate from OCR text using regex patterns
  const extractVehiclePlate = (text: string): string | null => {
    // Clean the text - remove newlines, extra spaces, and common OCR errors
    const cleanedText = text
      .toUpperCase()
      .replace(/[^A-Z0-9\s]/g, "") // Remove special characters except spaces
      .replace(/\s+/g, " ") // Normalize spaces
      .trim()

    // Try each pattern
    for (const pattern of VEHICLE_PLATE_PATTERNS) {
      pattern.lastIndex = 0 // Reset regex state
      const matches = cleanedText.matchAll(pattern)

      for (const match of matches) {
        if (match) {
          // Format the plate number: SS DD SS DDDD
          const state = match[1]
          const district = match[2].padStart(2, "0")
          const series = match[3]
          const number = match[4].padStart(4, "0")
          return `${state} ${district} ${series} ${number}`
        }
      }
    }

    // If no pattern matched, try to find any alphanumeric sequence that looks like a plate
    const simplePattern = /[A-Z]{2}\d{1,2}[A-Z]{1,3}\d{1,4}/g
    const simpleMatch = cleanedText.replace(/\s/g, "").match(simplePattern)
    if (simpleMatch && simpleMatch[0]) {
      const plate = simpleMatch[0]
      // Try to format it nicely
      const formatted = plate.replace(
        /([A-Z]{2})(\d{1,2})([A-Z]{1,3})(\d+)/,
        "$1 $2 $3 $4"
      )
      return formatted
    }

    return null
  }

  // Run OCR on the uploaded image
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

      // Try to extract vehicle plate from the OCR result
      const detectedPlate = extractVehiclePlate(rawText)

      if (detectedPlate) {
        return {
          rawText,
          detectedPlate,
          confidence,
          usedFallback: false,
        }
      }

      // No valid plate detected - will use fallback
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

  // Validate file type
  const validateFile = (file: File): boolean => {
    setFileError(null)
    
    // Check file type
    if (!ALLOWED_FILE_TYPES.includes(file.type.toLowerCase())) {
      const extension = file.name.split('.').pop()?.toLowerCase() || ''
      if (!ALLOWED_EXTENSIONS.includes(extension)) {
        setFileError({
          message: `Invalid file type. Please upload JPG, JPEG, or PNG files only.`,
          type: "invalid_type"
        })
        return false
      }
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setFileError({
        message: "File is too large. Maximum size is 10MB.",
        type: "too_large"
      })
      return false
    }

    return true
  }

  // Handle file selection and preview
  const handleFileSelection = (file: File) => {
    if (!validateFile(file)) {
      return
    }

    setSelectedFile(file)
    setUploadSuccess(false)
    
    // Create preview
    const reader = new FileReader()
    reader.onload = (event) => {
      setUploadedImage(event.target?.result as string)
      // Show upload success animation
      setUploadSuccess(true)
      setTimeout(() => setUploadSuccess(false), 2000)
    }
    reader.readAsDataURL(file)
  }

  // Detect vehicle using Tesseract.js OCR
  const handleDetectVehicle = useCallback(async () => {
    if (!selectedFile || !uploadedImage) return

    setProcessingState("uploading")
    setFileError(null)
    setOcrResult(null)
    setOcrProgress(0)

    // Short delay to show uploading state
    await new Promise((resolve) => setTimeout(resolve, 500))
    setProcessingState("processing")

    try {
      // Run client-side OCR on the image
      const ocrData = await runOCR(uploadedImage)
      setOcrResult(ocrData)

      // Determine the vehicle number
      let vehicleNo = ocrData.detectedPlate
      let usedFallback = ocrData.usedFallback

      // If OCR didn't detect a valid plate, generate a random one for demo
      if (!vehicleNo) {
        setOcrStatus("No plate detected - using fallback...")
        // Generate a random vehicle number for demo purposes
        const states = ["KA", "MH", "DL", "TN", "GJ", "RJ", "UP", "WB", "AP", "HR"]
        const state = states[Math.floor(Math.random() * states.length)]
        const district = String(Math.floor(Math.random() * 99) + 1).padStart(2, "0")
        const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ"
        const series = letters[Math.floor(Math.random() * letters.length)] + letters[Math.floor(Math.random() * letters.length)]
        const number = String(Math.floor(Math.random() * 9999) + 1).padStart(4, "0")
        vehicleNo = `${state} ${district} ${series} ${number}`
        usedFallback = true
        
        // Update OCR result with the generated plate
        setOcrResult({
          ...ocrData,
          detectedPlate: vehicleNo,
          usedFallback: true,
        })
      }

      setOcrStatus("Looking up vehicle in database...")

      // Check the vehicle against the database
      const vehicleInfo = checkVehicleStatus(vehicleNo)

      // Determine slot assignment
      let assignedSlot: string | null = null
      let zone: string | null = null
      let message: string

      if (vehicleInfo.status === "authorized") {
        // Check if vehicle already has a slot (from existing parking zones)
        // For new entries, assign first available slot
        const availableSlot = getFirstAvailableSlot()
        if (availableSlot) {
          // Assign the slot to the vehicle
          const assigned = assignSlotToVehicle(availableSlot.slot.id, {
            number: vehicleNo,
            owner: vehicleInfo.owner,
            type: vehicleInfo.type,
          })
          if (assigned) {
            assignedSlot = availableSlot.slot.id
            zone = availableSlot.zone
            message = "Vehicle authorized - Slot assigned"
          } else {
            assignedSlot = null
            message = "Vehicle authorized - No slots available"
          }
        } else {
          message = "Vehicle authorized - Parking lot full"
        }
      } else if (vehicleInfo.status === "blacklisted") {
        message = "Access denied - Vehicle is blacklisted"
      } else {
        message = "Access denied - Vehicle not registered in system"
      }

      setVehicleDetails({
        vehicleNo: vehicleNo,
        owner: vehicleInfo.owner,
        type: vehicleInfo.type,
        status: vehicleInfo.status,
        slot: assignedSlot,
        zone: zone || undefined,
        entryTime: new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
        confidence: ocrData.confidence,
        message: message,
      })
      setProcessingState("complete")
      setOcrStatus("Complete")
    } catch (error) {
      console.error("Error detecting vehicle:", error)
      setFileError({
        message: "OCR processing failed. Please try again.",
        type: "ocr_failed",
      })
      setProcessingState("idle")
    }
  }, [selectedFile, uploadedImage])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)

      const file = e.dataTransfer.files[0]
      if (file) {
        handleFileSelection(file)
      }
    },
    []
  )

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        handleFileSelection(file)
      }
    },
    []
  )

  const resetUpload = () => {
    setUploadedImage(null)
    setSelectedFile(null)
    setProcessingState("idle")
    setVehicleDetails(null)
    setFileError(null)
    setUploadSuccess(false)
    setOcrResult(null)
    setOcrProgress(0)
    setOcrStatus("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const StatusBadge = ({ status }: { status: AuthStatus }) => {
    if (!status) return null
    const config = statusConfig[status]
    const Icon = config.icon

    return (
      <span
        className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold shadow-xl ${config.bgColor} ${config.borderColor} ${config.textColor} ${config.shadowColor}`}
      >
        <Icon className="h-4 w-4" />
        {config.label}
      </span>
    )
  }

  return (
    <div className="flex min-h-screen bg-zinc-950">
      {/* Ambient background effects */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full bg-lime-500/10 blur-[150px]" />
        <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-lime-500/5 blur-[120px]" />
        <div className="absolute left-1/2 top-1/3 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-lime-500/5 blur-[100px]" />
        <div className="absolute right-1/4 top-1/4 h-72 w-72 rounded-full bg-sky-500/5 blur-[80px]" />
      </div>

      {/* Sidebar */}
      <ParkingSidebar />

      {/* Main Content */}
      <main className="relative flex-1 overflow-auto p-5 sm:p-8 lg:p-10">
        {/* Hero Section */}
        <div className="relative mb-12 overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-zinc-900/90 via-zinc-900/70 to-zinc-800/50 p-10 backdrop-blur-3xl lg:p-12">
          {/* Decorative glows */}
          <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-lime-500/20 blur-[100px]" />
          <div className="absolute -bottom-10 left-1/4 h-60 w-60 rounded-full bg-lime-500/10 blur-[80px]" />

          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-5 lg:max-w-xl">
              {/* Status badges */}
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2.5 rounded-full border border-lime-500/40 bg-lime-500/15 px-5 py-2.5 text-sm font-semibold text-lime-400 shadow-xl shadow-lime-500/20">
                  <Sparkles className="h-4 w-4" />
                  AI-Powered ANPR
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-sky-500/40 bg-sky-500/15 px-5 py-2.5 text-sm font-semibold text-sky-400 shadow-xl shadow-sky-500/20">
                  <Activity className="h-4 w-4" />
                  System Ready
                </span>
              </div>

              <div>
                <h1 className="bg-gradient-to-r from-white via-zinc-100 to-zinc-300 bg-clip-text text-4xl font-bold tracking-tight text-transparent lg:text-5xl">
                  Vehicle Upload
                </h1>
                <h2 className="mt-1 bg-gradient-to-r from-lime-400 to-lime-300 bg-clip-text text-4xl font-bold tracking-tight text-transparent lg:text-5xl">
                  & Recognition
                </h2>
              </div>

              <p className="max-w-lg text-lg leading-relaxed text-zinc-400">
                Upload vehicle images for instant license plate recognition. Our AI-powered system detects, validates, and assigns parking slots automatically.
              </p>
            </div>

            {/* Camera Preview Placeholder */}
            <div className="relative w-full max-w-sm lg:w-80">
              <div className="group relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-zinc-900/80 p-1 shadow-2xl backdrop-blur-xl transition-all duration-500 hover:border-lime-500/30 hover:shadow-lime-500/10">
                <div className="relative aspect-video overflow-hidden rounded-[1.25rem] bg-zinc-800">
                  {/* Scan lines effect */}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-lime-500/5 to-transparent opacity-50" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4">
                    <div className="relative">
                      <Camera className="h-12 w-12 text-zinc-600" />
                      <div className="absolute -bottom-1 -right-1 h-3 w-3 animate-pulse rounded-full bg-lime-500" />
                    </div>
                    <span className="text-sm font-medium text-zinc-500">Live Camera Feed</span>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-lime-500/30 bg-lime-500/10 px-3 py-1 text-xs font-medium text-lime-400">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-lime-400 opacity-75" />
                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-lime-400" />
                      </span>
                      Live
                    </span>
                  </div>
                  {/* Corner brackets */}
                  <div className="absolute left-3 top-3 h-6 w-6 border-l-2 border-t-2 border-lime-500/50" />
                  <div className="absolute right-3 top-3 h-6 w-6 border-r-2 border-t-2 border-lime-500/50" />
                  <div className="absolute bottom-3 left-3 h-6 w-6 border-b-2 border-l-2 border-lime-500/50" />
                  <div className="absolute bottom-3 right-3 h-6 w-6 border-b-2 border-r-2 border-lime-500/50" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Upload and Results Grid */}
        <div className="mb-12 grid gap-8 lg:grid-cols-2">
          {/* Upload Area */}
          <div className="group relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-zinc-900/60 p-8 shadow-2xl backdrop-blur-3xl transition-all duration-500 hover:border-lime-500/20 hover:shadow-lime-500/5">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-lime-500/10 blur-[60px] transition-all duration-500 group-hover:bg-lime-500/15" />

            <div className="relative">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="flex items-center gap-3 text-xl font-semibold text-white">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime-500/15">
                    <Upload className="h-5 w-5 text-lime-400" />
                  </div>
                  Upload Vehicle Image
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

              {/* Error Message */}
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
                    ? "border-lime-500 bg-lime-500/10"
                    : uploadedImage
                      ? "border-lime-500/30 bg-zinc-800/50"
                      : "border-zinc-700 bg-zinc-800/30 hover:border-lime-500/50 hover:bg-zinc-800/50"
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
                    {/* Upload success animation */}
                    {uploadSuccess && processingState === "idle" && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center rounded-xl bg-zinc-900/80 backdrop-blur-sm">
                        <div className="relative">
                          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-lime-500/20">
                            <CheckCircle2 className="h-12 w-12 text-lime-400 animate-bounce" />
                          </div>
                          <div className="absolute inset-0 animate-ping rounded-full bg-lime-500/20" />
                        </div>
                        <span className="mt-4 text-lg font-medium text-white">Image Uploaded!</span>
                        <span className="mt-2 text-sm text-zinc-400">Ready for detection</span>
                      </div>
                    )}
                    {/* Processing overlay */}
                    {processingState !== "complete" && processingState !== "idle" && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center rounded-xl bg-zinc-900/80 backdrop-blur-sm">
                        {processingState === "uploading" && (
                          <>
                            <Loader2 className="h-12 w-12 animate-spin text-lime-400" />
                            <span className="mt-4 text-lg font-medium text-white">Preparing image...</span>
                          </>
                        )}
                        {processingState === "processing" && (
                          <div className="flex flex-col items-center gap-4 px-8">
                            <div className="relative">
                              <ScanLine className="h-16 w-16 animate-pulse text-lime-400" />
                              <div className="absolute inset-0 animate-ping">
                                <ScanLine className="h-16 w-16 text-lime-400/30" />
                              </div>
                            </div>
                            <span className="text-lg font-medium text-white">Running OCR...</span>
                            <span className="text-sm text-zinc-400">{ocrStatus || "Processing image..."}</span>
                            
                            {/* Progress bar */}
                            <div className="w-full max-w-xs">
                              <div className="mb-2 flex items-center justify-between text-xs">
                                <span className="text-zinc-500">Progress</span>
                                <span className="font-mono text-lime-400">{ocrProgress}%</span>
                              </div>
                              <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-700">
                                <div 
                                  className="h-full bg-gradient-to-r from-lime-500 to-lime-400 transition-all duration-300"
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
                          <span className="font-medium">Detection Complete</span>
                          <span className="ml-auto text-sm">{vehicleDetails?.confidence}% Confidence</span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <label className="flex cursor-pointer flex-col items-center gap-4 p-8">
                    <div className="relative">
                      <div className={`flex h-20 w-20 items-center justify-center rounded-2xl transition-all duration-300 ${
                        fileError ? "bg-red-500/20" : "bg-zinc-700/50 group-hover:bg-lime-500/20"
                      }`}>
                        {fileError ? (
                          <FileWarning className="h-10 w-10 text-red-400" />
                        ) : (
                          <ImageIcon className="h-10 w-10 text-zinc-400 transition-colors group-hover:text-lime-400" />
                        )}
                      </div>
                      <div className={`absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-lg shadow-lg ${
                        fileError ? "bg-red-500 shadow-red-500/30" : "bg-lime-500 shadow-lime-500/30"
                      }`}>
                        <Upload className="h-4 w-4 text-zinc-900" />
                      </div>
                    </div>
                    <div className="text-center">
                      <p className={`text-lg font-medium ${fileError ? "text-red-300" : "text-zinc-300"}`}>
                        {isDragOver ? "Drop your image here" : "Drop vehicle image here"}
                      </p>
                      <p className="mt-1 text-sm text-zinc-500">or click to browse files</p>
                    </div>
                    <span className="mt-2 rounded-full border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm text-zinc-400">
                      Supports JPG, JPEG, PNG only
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
                  <label className="group/btn flex flex-1 cursor-pointer items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-lime-500 to-lime-400 px-8 py-4 text-lg font-semibold text-zinc-900 shadow-xl shadow-lime-500/25 transition-all duration-300 hover:shadow-lime-500/40 hover:brightness-110">
                    <Upload className="h-5 w-5" />
                    Select Image to Upload
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>
                ) : processingState === "idle" && !uploadSuccess ? (
                  <button
                    onClick={handleDetectVehicle}
                    disabled={!selectedFile}
                    className={`group/btn flex flex-1 items-center justify-center gap-3 rounded-2xl px-8 py-4 text-lg font-semibold transition-all duration-300 ${
                      selectedFile
                        ? "bg-gradient-to-r from-lime-500 to-lime-400 text-zinc-900 shadow-xl shadow-lime-500/25 hover:shadow-lime-500/40 hover:brightness-110"
                        : "cursor-not-allowed bg-zinc-700 text-zinc-400"
                    }`}
                  >
                    <ScanLine className="h-5 w-5" />
                    Detect Vehicle
                  </button>
                ) : processingState === "complete" ? (
                  <button
                    onClick={resetUpload}
                    className="group/btn flex flex-1 items-center justify-center gap-3 rounded-2xl border border-lime-500/30 bg-lime-500/10 px-8 py-4 text-lg font-semibold text-lime-400 transition-all duration-300 hover:bg-lime-500/20"
                  >
                    <Upload className="h-5 w-5" />
                    Upload Another Image
                  </button>
                ) : null}
              </div>

              {/* File info */}
              {selectedFile && processingState === "idle" && (
                <div className="mt-4 flex items-center justify-between rounded-xl border border-zinc-700/50 bg-zinc-800/30 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <ImageIcon className="h-5 w-5 text-zinc-400" />
                    <div>
                      <p className="text-sm font-medium text-zinc-300">{selectedFile.name}</p>
                      <p className="text-xs text-zinc-500">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-lime-500/10 px-3 py-1 text-xs font-medium text-lime-400">
                    Ready
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* OCR Result & Vehicle Details */}
          <div className="flex flex-col gap-8">
            {/* OCR Result Card */}
            <div className="group relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-zinc-900/60 p-8 shadow-2xl backdrop-blur-3xl transition-all duration-500 hover:border-lime-500/20 hover:shadow-lime-500/5">
              <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-lime-500/10 blur-[60px]" />

              <div className="relative">
                <h3 className="mb-6 flex items-center gap-3 text-xl font-semibold text-white">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime-500/15">
                    <ScanLine className="h-5 w-5 text-lime-400" />
                  </div>
                  OCR Detection Result
                  {ocrResult && (
                    <span className={`ml-auto flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${
                      ocrResult.usedFallback 
                        ? "border-amber-500/30 bg-amber-500/10 text-amber-400"
                        : "border-lime-500/30 bg-lime-500/10 text-lime-400"
                    }`}>
                      <Zap className="h-3.5 w-3.5" />
                      {ocrResult.usedFallback ? "Fallback Used" : `${Math.round(ocrResult.confidence)}% Confidence`}
                    </span>
                  )}
                </h3>

                <div className="space-y-4">
                  {/* Detected Plate Number */}
                  <div className="flex flex-col items-center justify-center rounded-2xl border border-zinc-700/50 bg-zinc-800/50 p-6">
                    {processingState === "complete" && vehicleDetails ? (
                      <div className="w-full text-center">
                        <div className="mb-4 inline-flex items-center gap-2 rounded-xl bg-lime-500/10 px-6 py-4">
                          <Car className="h-8 w-8 text-lime-400" />
                          <span className="text-3xl font-bold tracking-widest text-white">
                            {vehicleDetails.vehicleNo}
                          </span>
                        </div>
                        <p className="text-sm text-zinc-400">
                          {ocrResult?.usedFallback 
                            ? "Generated plate (OCR did not detect a valid pattern)"
                            : "License Plate Detected Successfully"}
                        </p>
                      </div>
                    ) : processingState === "processing" ? (
                      <div className="flex flex-col items-center gap-4 py-4">
                        <div className="relative h-16 w-32 overflow-hidden rounded-lg border border-lime-500/30 bg-zinc-900">
                          <div className="animate-scan absolute inset-0 bg-gradient-to-b from-lime-500/30 via-lime-500/50 to-lime-500/30" />
                        </div>
                        <span className="text-zinc-400">{ocrStatus || "Scanning license plate..."}</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-3 py-4 text-zinc-500">
                        <Eye className="h-12 w-12 opacity-50" />
                        <span>Awaiting vehicle image</span>
                      </div>
                    )}
                  </div>

                  {/* Raw OCR Text (shown after processing) */}
                  {ocrResult && processingState === "complete" && (
                    <div className="rounded-xl border border-zinc-700/50 bg-zinc-800/30 p-4">
                      <div className="mb-3 flex items-center gap-2">
                        <FileText className="h-4 w-4 text-zinc-400" />
                        <span className="text-sm font-medium text-zinc-400">Raw OCR Output</span>
                        <span className="ml-auto rounded bg-zinc-700 px-2 py-0.5 text-xs text-zinc-400">
                          Tesseract.js
                        </span>
                      </div>
                      <div className="max-h-24 overflow-y-auto rounded-lg bg-zinc-900/50 p-3">
                        <pre className="whitespace-pre-wrap break-all font-mono text-xs text-zinc-300">
                          {ocrResult.rawText.trim() || "(No text detected)"}
                        </pre>
                      </div>
                      
                      {/* Pattern Match Status */}
                      <div className="mt-3 flex items-center gap-2">
                        <Search className="h-4 w-4 text-zinc-500" />
                        <span className="text-xs text-zinc-500">Pattern Match:</span>
                        {ocrResult.usedFallback ? (
                          <span className="flex items-center gap-1 text-xs text-amber-400">
                            <AlertTriangle className="h-3 w-3" />
                            No valid plate pattern found - using fallback data
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs text-lime-400">
                            <CheckCircle2 className="h-3 w-3" />
                            Valid Indian plate pattern detected
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Vehicle Details Card */}
            <div
              className={`group relative overflow-hidden rounded-[1.75rem] border bg-zinc-900/60 p-8 shadow-2xl backdrop-blur-3xl transition-all duration-500 hover:shadow-lime-500/5 ${
vehicleDetails?.status === "blacklisted"
  ? "border-red-500/30 hover:border-red-500/40"
: vehicleDetails?.status === "unauthorized"
  ? "border-red-500/30 hover:border-red-500/40"
  : "border-white/10 hover:border-lime-500/20"
              }`}
            >
              {/* Conditional glow based on status */}
              {vehicleDetails && (
                <div
                  className={`absolute -right-10 -top-10 h-40 w-40 rounded-full blur-[60px] ${
                    statusConfig[vehicleDetails.status!]?.glowColor || "bg-lime-500/10"
                  }`}
                />
              )}

              <div className="relative">
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="flex items-center gap-3 text-xl font-semibold text-white">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime-500/15">
                      <Shield className="h-5 w-5 text-lime-400" />
                    </div>
                    Vehicle Details
                  </h3>
                  {vehicleDetails && <StatusBadge status={vehicleDetails.status} />}
                </div>

                {processingState === "complete" && vehicleDetails ? (
                  <>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="flex items-center gap-4 rounded-xl border border-zinc-700/50 bg-zinc-800/50 p-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-700/50">
                          <User className="h-6 w-6 text-zinc-400" />
                        </div>
                        <div>
                          <p className="text-sm text-zinc-500">Owner Name</p>
                          <p className="font-semibold text-white">{vehicleDetails.owner}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 rounded-xl border border-zinc-700/50 bg-zinc-800/50 p-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-700/50">
                          <Car className="h-6 w-6 text-zinc-400" />
                        </div>
                        <div>
                          <p className="text-sm text-zinc-500">Vehicle Type</p>
                          <p className="font-semibold text-white">{vehicleDetails.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 rounded-xl border border-zinc-700/50 bg-zinc-800/50 p-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-700/50">
                          <ParkingCircle className="h-6 w-6 text-zinc-400" />
                        </div>
                        <div>
                          <p className="text-sm text-zinc-500">Assigned Slot</p>
                          <p className={`font-semibold ${vehicleDetails.slot ? "text-lime-400" : "text-red-400"}`}>
                            {vehicleDetails.slot ? `${vehicleDetails.slot}${vehicleDetails.zone ? ` (Zone ${vehicleDetails.zone})` : ""}` : "No Slot Assigned"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 rounded-xl border border-zinc-700/50 bg-zinc-800/50 p-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-700/50">
                          <Clock className="h-6 w-6 text-zinc-400" />
                        </div>
                        <div>
                          <p className="text-sm text-zinc-500">Entry Time</p>
                          <p className="font-semibold text-white">{vehicleDetails.entryTime}</p>
                        </div>
                      </div>
                    </div>

                    {/* Status Message */}
                    {vehicleDetails.message && (
                      <div className={`mt-4 rounded-xl border p-4 ${
                        vehicleDetails.status === "authorized" 
                          ? "border-lime-500/30 bg-lime-500/10 text-lime-400" 
                          : "border-red-500/30 bg-red-500/10 text-red-400"
                      }`}>
                        <div className="flex items-center gap-2">
                          {vehicleDetails.status === "authorized" ? (
                            <CheckCircle2 className="h-5 w-5" />
                          ) : (
                            <AlertTriangle className="h-5 w-5" />
                          )}
                          <span className="font-medium">{vehicleDetails.message}</span>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-2xl border border-zinc-700/50 bg-zinc-800/30 py-12 text-zinc-500">
                    <Shield className="mb-3 h-12 w-12 opacity-50" />
                    <span>Vehicle details will appear here</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Scanned Vehicles */}
        <div className="group relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-zinc-900/60 p-8 shadow-2xl backdrop-blur-3xl transition-all duration-500 hover:border-lime-500/20 hover:shadow-lime-500/5">
          <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-lime-500/10 blur-[80px]" />

          <div className="relative">
            <div className="mb-8 flex items-center justify-between">
              <h3 className="flex items-center gap-3 text-xl font-semibold text-white">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime-500/15">
                  <Clock className="h-5 w-5 text-lime-400" />
                </div>
                Recent Scanned Vehicles
              </h3>
              <span className="inline-flex items-center gap-2 rounded-full border border-lime-500/30 bg-lime-500/10 px-4 py-2 text-sm font-medium text-lime-400">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-lime-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-lime-400" />
                </span>
                Live Updates
              </span>
            </div>

            <div className="overflow-hidden rounded-2xl border border-zinc-700/50">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-700/50 bg-zinc-800/50">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-400">Vehicle No.</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-400">Owner</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-400">Type</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-400">Time</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-400">Confidence</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-400">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentScans.map((scan, index) => {
                    const config = statusConfig[scan.status!]
                    const Icon = config.icon

                    return (
                      <tr
                        key={index}
                        className="border-b border-zinc-700/30 transition-colors hover:bg-zinc-800/30"
                      >
                        <td className="px-6 py-4">
                          <span className="font-mono font-semibold text-white">{scan.vehicleNo}</span>
                        </td>
                        <td className="px-6 py-4 text-zinc-300">{scan.owner}</td>
                        <td className="px-6 py-4 text-zinc-400">{scan.type}</td>
                        <td className="px-6 py-4 text-zinc-400">{scan.time}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-lime-500/10 px-3 py-1 text-sm font-medium text-lime-400">
                            {scan.confidence}%
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium ${config.bgColor} ${config.borderColor} ${config.textColor}`}
                          >
                            <Icon className="h-3.5 w-3.5" />
                            {config.label}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
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
