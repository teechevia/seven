import mongoose, { Schema, Document, Model } from "mongoose"

export type AlertSeverity = "critical" | "warning" | "info"
export type AlertStatus = "active" | "resolved" | "dismissed"
export type AlertType = "unauthorized" | "overstay" | "sensor" | "security" | "maintenance"

export interface IAlert extends Document {
  title: string
  description: string
  severity: AlertSeverity
  type: AlertType
  status: AlertStatus
  vehicleNo?: string
  location?: string
  resolvedAt?: Date
  resolvedBy?: string
  createdAt: Date
  updatedAt: Date
}

const AlertSchema = new Schema<IAlert>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    severity: {
      type: String,
      required: true,
      enum: ["critical", "warning", "info"],
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["unauthorized", "overstay", "sensor", "security", "maintenance"],
      index: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["active", "resolved", "dismissed"],
      default: "active",
      index: true,
    },
    vehicleNo: {
      type: String,
      uppercase: true,
      trim: true,
    },
    location: {
      type: String,
    },
    resolvedAt: {
      type: Date,
    },
    resolvedBy: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
)

// Static method to create alert
AlertSchema.statics.createAlert = async function (alertData: {
  title: string
  description: string
  severity: AlertSeverity
  type: AlertType
  vehicleNo?: string
  location?: string
}) {
  const alert = new this({
    ...alertData,
    status: "active",
  })
  await alert.save()
  return alert
}

// Static method to get active alerts
AlertSchema.statics.getActive = async function () {
  return this.find({ status: "active" }).sort({ createdAt: -1 })
}

// Static method to get summary
AlertSchema.statics.getSummary = async function () {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [total, activeCount, severityCounts, typeCounts] = await Promise.all([
    this.countDocuments(),
    this.countDocuments({ status: "active" }),
    this.aggregate([
      { $match: { status: "active" } },
      { $group: { _id: "$severity", count: { $sum: 1 } } },
    ]),
    this.aggregate([
      { $match: { status: "active" } },
      { $group: { _id: "$type", count: { $sum: 1 } } },
    ]),
  ])

  const summary = {
    total,
    active: activeCount,
    critical: 0,
    warning: 0,
    info: 0,
    unauthorized: 0,
    overstay: 0,
    sensor: 0,
    security: 0,
    maintenance: 0,
  }

  severityCounts.forEach((s: { _id: string; count: number }) => {
    summary[s._id as keyof typeof summary] = s.count
  })

  typeCounts.forEach((t: { _id: string; count: number }) => {
    summary[t._id as keyof typeof summary] = t.count
  })

  return summary
}

// Static method to resolve alert
AlertSchema.statics.resolveAlert = async function (alertId: string, resolvedBy?: string) {
  const alert = await this.findById(alertId)
  if (!alert) return null

  alert.status = "resolved"
  alert.resolvedAt = new Date()
  alert.resolvedBy = resolvedBy
  await alert.save()
  return alert
}

export interface AlertModel extends Model<IAlert> {
  createAlert(alertData: {
    title: string
    description: string
    severity: AlertSeverity
    type: AlertType
    vehicleNo?: string
    location?: string
  }): Promise<IAlert>
  getActive(): Promise<IAlert[]>
  getSummary(): Promise<{
    total: number
    active: number
    critical: number
    warning: number
    info: number
    unauthorized: number
    overstay: number
    sensor: number
    security: number
    maintenance: number
  }>
  resolveAlert(alertId: string, resolvedBy?: string): Promise<IAlert | null>
}

export default (mongoose.models.Alert as AlertModel) ||
  mongoose.model<IAlert, AlertModel>("Alert", AlertSchema)
