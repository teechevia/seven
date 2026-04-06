import mongoose, { Schema, Document, Model } from "mongoose"

export interface IExitLog extends Document {
  vehicleNo: string
  owner: string
  type: string
  entryTime: Date
  exitTime: Date
  slot: string
  durationMinutes: number
  durationFormatted: string
  gate: string
  fee?: number
  paymentStatus?: "paid" | "pending" | "waived"
  createdAt: Date
  updatedAt: Date
}

const ExitLogSchema = new Schema<IExitLog>(
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
    },
    exitTime: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
    slot: {
      type: String,
      required: true,
    },
    durationMinutes: {
      type: Number,
      required: true,
    },
    durationFormatted: {
      type: String,
      required: true,
    },
    gate: {
      type: String,
      required: true,
      default: "Gate 1 - Main Exit",
    },
    fee: {
      type: Number,
      default: 0,
    },
    paymentStatus: {
      type: String,
      enum: ["paid", "pending", "waived"],
      default: "waived",
    },
  },
  {
    timestamps: true,
  }
)

// Static helper to calculate duration
ExitLogSchema.statics.calculateDuration = function (
  entryTime: Date,
  exitTime: Date
): { minutes: number; formatted: string } {
  const diffMs = exitTime.getTime() - entryTime.getTime()
  const diffMinutes = Math.round(diffMs / (1000 * 60))
  
  const hours = Math.floor(diffMinutes / 60)
  const minutes = diffMinutes % 60
  
  let formatted: string
  if (hours === 0) {
    formatted = `${minutes}m`
  } else if (minutes === 0) {
    formatted = `${hours}h`
  } else {
    formatted = `${hours}h ${minutes}m`
  }
  
  return { minutes: diffMinutes, formatted }
}

// Static method to get summary
ExitLogSchema.statics.getSummary = async function () {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [total, todayExits, avgDuration] = await Promise.all([
    this.countDocuments(),
    this.countDocuments({ exitTime: { $gte: today } }),
    this.aggregate([
      { $match: { exitTime: { $gte: today } } },
      { $group: { _id: null, avgDuration: { $avg: "$durationMinutes" } } },
    ]),
  ])

  const avgMinutes = avgDuration[0]?.avgDuration || 0
  const hours = Math.floor(avgMinutes / 60)
  const minutes = Math.round(avgMinutes % 60)
  const averageDuration = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`

  return {
    total,
    todayExits,
    averageDuration,
  }
}

export interface ExitLogModel extends Model<IExitLog> {
  calculateDuration(entryTime: Date, exitTime: Date): { minutes: number; formatted: string }
  getSummary(): Promise<{
    total: number
    todayExits: number
    averageDuration: string
  }>
}

export default (mongoose.models.ExitLog as ExitLogModel) ||
  mongoose.model<IExitLog, ExitLogModel>("ExitLog", ExitLogSchema)
