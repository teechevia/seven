import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Vehicle from "@/lib/models/Vehicle"
import ParkingSlot from "@/lib/models/ParkingSlot"
import EntryLog from "@/lib/models/EntryLog"
import ExitLog from "@/lib/models/ExitLog"
import Alert from "@/lib/models/Alert"

// ============================================================================
// CONFIGURATION
// ============================================================================

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/jpg", "image/png"]
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

// ============================================================================
// IMAGE PROCESSING PLACEHOLDER
// ============================================================================

async function processImageOCR(
  imageBuffer: Buffer,
  mimeType: string
): Promise<{ vehicleNo: string; confidence: number }> {
  console.log(`[OCR] Processing image: ${mimeType}, size: ${imageBuffer.length} bytes`)

  // FAKE OCR RESULT FOR DEMONSTRATION
  const fakeVehicles = [
    "KA 05 MX 7892",
    "MH 14 AB 3456",
    "DL 22 CD 7890",
    "TN 66 QQ 5678",
    "GJ 09 EF 1234",
  ]
  
  const vehicleNo = fakeVehicles[Math.floor(Math.random() * fakeVehicles.length)]
  const confidence = 92 + Math.random() * 7

  await new Promise((resolve) => setTimeout(resolve, 500))

  return { vehicleNo, confidence }
}

// Generate random vehicle number
function generateVehicleNo(): string {
  const states = ["KA", "MH", "DL", "TN", "GJ", "RJ", "UP", "WB", "AP", "HR"]
  const state = states[Math.floor(Math.random() * states.length)]
  const district = String(Math.floor(Math.random() * 99) + 1).padStart(2, "0")
  const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ"
  const series = letters[Math.floor(Math.random() * letters.length)] + letters[Math.floor(Math.random() * letters.length)]
  const number = String(Math.floor(Math.random() * 9999) + 1).padStart(4, "0")
  return `${state} ${district} ${series} ${number}`
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function validateImageFile(
  file: File
): { valid: true } | { valid: false; error: string } {
  if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
    return {
      valid: false,
      error: `Invalid file type: ${file.type}. Allowed types: JPG, JPEG, PNG`,
    }
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Maximum: 10MB`,
    }
  }

  return { valid: true }
}

// ============================================================================
// API ROUTE HANDLER
// ============================================================================

export async function POST(request: Request) {
  try {
    // Connect to MongoDB
    await connectDB()

    const contentType = request.headers.get("content-type") || ""

    let vehicleNo: string
    let confidence: number
    let action = "entry"
    let rawOcrText: string = ""
    let usedFallback: boolean = false

    // ========================================================================
    // HANDLE FORMDATA (Image Upload)
    // ========================================================================
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData()
      const imageFile = formData.get("image") as File | null
      action = (formData.get("action") as string) || "entry"
      
      const clientVehicleNo = formData.get("vehicleNo") as string | null
      const clientOcrConfidence = formData.get("ocrConfidence") as string | null
      const clientRawOcrText = formData.get("rawOcrText") as string | null

      if (!imageFile) {
        return NextResponse.json(
          { success: false, error: "No image file provided" },
          { status: 400 }
        )
      }

      const validation = validateImageFile(imageFile)
      if (!validation.valid) {
        return NextResponse.json(
          { success: false, error: validation.error },
          { status: 400 }
        )
      }

      const arrayBuffer = await imageFile.arrayBuffer()
      const imageBuffer = Buffer.from(arrayBuffer)

      if (clientVehicleNo && clientVehicleNo.trim() !== "") {
        vehicleNo = clientVehicleNo.replace(/\s+/g, " ").toUpperCase().trim()
        confidence = clientOcrConfidence ? parseFloat(clientOcrConfidence) : 95
        rawOcrText = clientRawOcrText || "(Client-side OCR)"
        usedFallback = false
      } else {
        const ocrResult = await processImageOCR(imageBuffer, imageFile.type)
        vehicleNo = ocrResult.vehicleNo
        confidence = ocrResult.confidence
        rawOcrText = clientRawOcrText || `[Server OCR]`
        usedFallback = true
      }
    }
    // ========================================================================
    // HANDLE JSON
    // ========================================================================
    else if (contentType.includes("application/json")) {
      const body = await request.json()
      action = body.action || "entry"
      
      if (body.vehicleNo) {
        vehicleNo = body.vehicleNo.toUpperCase().trim()
        confidence = body.ocrConfidence || 95
      } else {
        vehicleNo = generateVehicleNo()
        confidence = 95
      }
    }
    // ========================================================================
    // UNSUPPORTED CONTENT TYPE
    // ========================================================================
    else {
      return NextResponse.json(
        { success: false, error: "Unsupported content type" },
        { status: 400 }
      )
    }

    const currentTime = new Date()

    // ========================================================================
    // HANDLE EXIT ACTION
    // ========================================================================
    if (action === "exit") {
      // Find active entry log
      const entryLog = await EntryLog.findByVehicle(vehicleNo)

      if (!entryLog) {
        return NextResponse.json({
          success: false,
          error: "No entry record found for this vehicle",
          data: {
            vehicleNo,
            action: "exit",
            status: "not_found",
          },
        })
      }

      // Release the parking slot
      const releaseResult = await ParkingSlot.releaseByVehicle(vehicleNo)

      // Mark entry as exited
      const exitedEntry = await EntryLog.markExited(vehicleNo)

      if (exitedEntry && releaseResult) {
        // Calculate duration
        const { minutes, formatted } = ExitLog.calculateDuration(entryLog.entryTime, currentTime)

        // Create exit log
        const exitLog = new ExitLog({
          vehicleNo: exitedEntry.vehicleNo,
          owner: exitedEntry.owner,
          type: exitedEntry.type,
          entryTime: exitedEntry.entryTime,
          exitTime: currentTime,
          slot: exitedEntry.assignedSlot || "N/A",
          durationMinutes: minutes,
          durationFormatted: formatted,
          gate: "Gate 1 - Main Exit",
        })
        await exitLog.save()

        return NextResponse.json({
          success: true,
          data: {
            vehicleNo: exitLog.vehicleNo,
            owner: exitLog.owner,
            type: exitLog.type,
            action: "exit",
            entryTime: exitLog.entryTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
            exitTime: exitLog.exitTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
            duration: exitLog.durationFormatted,
            releasedSlot: releaseResult.slotId,
            gate: exitLog.gate,
            confidence: Math.round(confidence * 10) / 10,
          },
        })
      }

      return NextResponse.json(
        { success: false, error: "Failed to process vehicle exit" },
        { status: 500 }
      )
    }

    // ========================================================================
    // HANDLE ENTRY ACTION
    // ========================================================================
    
    // Check vehicle status in database
    const vehicleCheck = await Vehicle.checkStatus(vehicleNo)

    // Handle BLACKLISTED vehicle
    if (vehicleCheck.status === "blacklisted") {
      await Alert.createAlert({
        title: "Blacklisted Vehicle Entry Attempt",
        description: `Vehicle ${vehicleNo} attempted entry - access denied. This vehicle is on the blacklist.`,
        severity: "critical",
        type: "security",
        vehicleNo,
        location: "Gate 1 - Main Entry",
      })

      const entryLog = new EntryLog({
        vehicleNo,
        owner: vehicleCheck.owner,
        type: vehicleCheck.type,
        entryTime: currentTime,
        assignedSlot: null,
        status: "blacklisted",
        confidence,
        gate: "Gate 1 - Main Entry",
        rawOcrText,
        usedFallback,
        isActive: false,
      })
      await entryLog.save()

      return NextResponse.json({
        success: true,
        data: {
          vehicleNo,
          owner: vehicleCheck.owner,
          type: vehicleCheck.type,
          status: "blacklisted",
          slot: null,
          confidence: Math.round(confidence * 10) / 10,
          detectedAt: currentTime.toISOString(),
          message: "Access denied - Vehicle is blacklisted",
          alert: {
            severity: "critical",
            type: "security",
            message: "Blacklisted vehicle attempted entry",
          },
          rawOcrText,
          usedFallback,
        },
      })
    }

    // Handle UNAUTHORIZED vehicle
    if (vehicleCheck.status === "unauthorized") {
      await Alert.createAlert({
        title: "Unauthorized Vehicle Detected",
        description: `Unregistered vehicle ${vehicleNo} detected at entry gate. No valid parking permit found in database.`,
        severity: "critical",
        type: "unauthorized",
        vehicleNo,
        location: "Gate 1 - Main Entry",
      })

      const entryLog = new EntryLog({
        vehicleNo,
        owner: vehicleCheck.owner,
        type: vehicleCheck.type,
        entryTime: currentTime,
        assignedSlot: null,
        status: "unauthorized",
        confidence,
        gate: "Gate 1 - Main Entry",
        rawOcrText,
        usedFallback,
        isActive: false,
      })
      await entryLog.save()

      return NextResponse.json({
        success: true,
        data: {
          vehicleNo,
          owner: vehicleCheck.owner,
          type: vehicleCheck.type,
          status: "unauthorized",
          slot: null,
          confidence: Math.round(confidence * 10) / 10,
          detectedAt: currentTime.toISOString(),
          message: "Access denied - Vehicle not registered in system",
          alert: {
            severity: "critical",
            type: "unauthorized",
            message: "Unauthorized vehicle attempted entry",
          },
          rawOcrText,
          usedFallback,
        },
      })
    }

    // Handle AUTHORIZED vehicle - Find available slot
    const availableSlot = await ParkingSlot.findFirstAvailable()

    if (!availableSlot) {
      await Alert.createAlert({
        title: "Parking Full - Vehicle Waiting",
        description: `Authorized vehicle ${vehicleNo} arrived but no parking slots available.`,
        severity: "warning",
        type: "maintenance",
        vehicleNo,
        location: "Gate 1 - Main Entry",
      })

      return NextResponse.json({
        success: true,
        data: {
          vehicleNo,
          owner: vehicleCheck.owner,
          type: vehicleCheck.type,
          status: "authorized",
          slot: null,
          confidence: Math.round(confidence * 10) / 10,
          detectedAt: currentTime.toISOString(),
          message: "No parking slots available",
          alert: {
            severity: "warning",
            type: "maintenance",
            message: "Parking lot is full",
          },
          rawOcrText,
          usedFallback,
        },
      })
    }

    // Assign the slot to the vehicle
    const assignedSlot = await ParkingSlot.assignVehicle(availableSlot.slotId, {
      vehicleNo,
      owner: vehicleCheck.owner,
      type: vehicleCheck.type,
    })

    if (assignedSlot) {
      const entryLog = new EntryLog({
        vehicleNo,
        owner: vehicleCheck.owner,
        type: vehicleCheck.type,
        entryTime: currentTime,
        assignedSlot: assignedSlot.slotId,
        status: "authorized",
        confidence,
        gate: "Gate 1 - Main Entry",
        rawOcrText,
        usedFallback,
        isActive: true,
      })
      await entryLog.save()

      return NextResponse.json({
        success: true,
        data: {
          vehicleNo,
          owner: vehicleCheck.owner,
          type: vehicleCheck.type,
          status: "authorized",
          slot: assignedSlot.slotId,
          zone: assignedSlot.zone,
          confidence: Math.round(confidence * 10) / 10,
          detectedAt: currentTime.toISOString(),
          message: `Welcome! Assigned to slot ${assignedSlot.slotId}`,
          entryLog: {
            id: entryLog._id,
            entryTime: currentTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
            gate: entryLog.gate,
          },
          rawOcrText,
          usedFallback,
        },
      })
    }

    return NextResponse.json(
      { success: false, error: "Failed to assign parking slot" },
      { status: 500 }
    )
  } catch (error) {
    console.error("[detect-vehicle] Error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to process request" },
      { status: 400 }
    )
  }
}
