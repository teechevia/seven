import mongoose, { Schema, Document, Model } from "mongoose"

export type AuthStatus = "authorized" | "unauthorized" | "blacklisted"

export interface IEntryLog extends Document {
  vehicleNo: string
  owner: string
  type: string
  entryTime: Date
  assignedSlot: string | null
  status: AuthStatus
  confidence: number
  gate: string
  captureMethod?: "webcam" | "upload" | "manual"
  rawOcrText?: string
  usedFallback?: boolean
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const EntryLogSchema = new Schema<IEntryLog>(
  {
    vehicleNo: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    owner: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      default: "Unknown",
    },
    entryTime: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
    assignedSlot: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      required: true,
      enum: ["authorized", "unauthorized", "blacklisted"],
      index: true,
    },
    confidence: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    gate: {
      type: String,
      required: true,
      default: "Gate 1 - Main Entry",
    },
    captureMethod: {
      type: String,
      enum: ["webcam", "upload", "manual"],
      default: "upload",
    },
    rawOcrText: {
      type: String,
    },
    usedFallback: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
)

// Static method to get entry log by vehicle number
EntryLogSchema.statics.findByVehicle = async function (vehicleNo: string) {
  return this.findOne({
    vehicleNo: vehicleNo.toUpperCase().trim(),
    isActive: true,
  }).sort({ entryTime: -1 })
}

// Static method to mark entry as exited
EntryLogSchema.statics.markExited = async function (vehicleNo: string) {
  const entry = await this.findOne({
    vehicleNo: vehicleNo.toUpperCase().trim(),
    isActive: true,
  })
  
  if (!entry) return null
  
  entry.isActive = false
  await entry.save()
  return entry
}

// Static method to get summary statistics
EntryLogSchema.statics.getSummary = async function () {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [total, todayEntries, statusCounts] = await Promise.all([
    this.countDocuments(),
    this.countDocuments({ entryTime: { $gte: today } }),
    this.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
  ])

  const summary: Record<string, number> = {
    total,
    todayEntries,
    authorized: 0,
    unauthorized: 0,
    blacklisted: 0,
  }

  statusCounts.forEach((s: { _id: string; count: number }) => {
    summary[s._id] = s.count
  })

  return summary
}

export interface EntryLogModel extends Model<IEntryLog> {
  findByVehicle(vehicleNo: string): Promise<IEntryLog | null>
  markExited(vehicleNo: string): Promise<IEntryLog | null>
  getSummary(): Promise<{
    total: number
    todayEntries: number
    authorized: number
    unauthorized: number
    blacklisted: number
  }>
}

export default (mongoose.models.EntryLog as EntryLogModel) ||
  mongoose.model<IEntryLog, EntryLogModel>("EntryLog", EntryLogSchema)
