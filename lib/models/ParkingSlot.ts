import mongoose, { Schema, Document, Model } from "mongoose"

export type SlotStatus = "available" | "occupied" | "reserved" | "faculty" | "maintenance"

export interface IOccupyingVehicle {
  vehicleNo: string
  owner: string
  type: string
  entryTime: Date
}

export interface IParkingSlot extends Document {
  slotId: string
  zone: string
  status: SlotStatus
  vehicle?: IOccupyingVehicle
  reservedFor?: string
  reservedUntil?: Date
  isEV?: boolean
  isHandicap?: boolean
  floor?: number
  createdAt: Date
  updatedAt: Date
}

const ParkingSlotSchema = new Schema<IParkingSlot>(
  {
    slotId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    zone: {
      type: String,
      required: true,
      uppercase: true,
      index: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["available", "occupied", "reserved", "faculty", "maintenance"],
      default: "available",
      index: true,
    },
    vehicle: {
      vehicleNo: { type: String },
      owner: { type: String },
      type: { type: String },
      entryTime: { type: Date },
    },
    reservedFor: {
      type: String,
    },
    reservedUntil: {
      type: Date,
    },
    isEV: {
      type: Boolean,
      default: false,
    },
    isHandicap: {
      type: Boolean,
      default: false,
    },
    floor: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
)

// Static method to find first available slot
ParkingSlotSchema.statics.findFirstAvailable = async function () {
  return this.findOne({ status: "available" }).sort({ zone: 1, slotId: 1 })
}

// Static method to assign vehicle to slot
ParkingSlotSchema.statics.assignVehicle = async function (
  slotId: string,
  vehicle: { vehicleNo: string; owner: string; type: string }
) {
  const slot = await this.findOne({ slotId, status: "available" })
  if (!slot) return null

  slot.status = "occupied"
  slot.vehicle = {
    vehicleNo: vehicle.vehicleNo,
    owner: vehicle.owner,
    type: vehicle.type,
    entryTime: new Date(),
  }
  await slot.save()
  return slot
}

// Static method to release slot by vehicle number
ParkingSlotSchema.statics.releaseByVehicle = async function (vehicleNo: string) {
  const slot = await this.findOne({ "vehicle.vehicleNo": vehicleNo })
  if (!slot) return null

  const releasedSlotId = slot.slotId
  slot.status = "available"
  slot.vehicle = undefined
  await slot.save()
  return { success: true, slotId: releasedSlotId }
}

// Static method to get parking summary
ParkingSlotSchema.statics.getSummary = async function () {
  const stats = await this.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ])

  const total = await this.countDocuments()
  const summary: Record<string, number> = {
    total,
    available: 0,
    occupied: 0,
    reserved: 0,
    faculty: 0,
    maintenance: 0,
  }

  stats.forEach((s: { _id: string; count: number }) => {
    summary[s._id] = s.count
  })

  summary.occupancyRate = total > 0 ? Math.round((summary.occupied / total) * 100) : 0

  return summary
}

// Static method to get slots grouped by zone
ParkingSlotSchema.statics.getByZone = async function () {
  const slots = await this.find().sort({ zone: 1, slotId: 1 })
  const zones: Record<string, IParkingSlot[]> = {}

  slots.forEach((slot: IParkingSlot) => {
    if (!zones[slot.zone]) {
      zones[slot.zone] = []
    }
    zones[slot.zone].push(slot)
  })

  return zones
}

export interface ParkingSlotModel extends Model<IParkingSlot> {
  findFirstAvailable(): Promise<IParkingSlot | null>
  assignVehicle(
    slotId: string,
    vehicle: { vehicleNo: string; owner: string; type: string }
  ): Promise<IParkingSlot | null>
  releaseByVehicle(vehicleNo: string): Promise<{ success: boolean; slotId: string } | null>
  getSummary(): Promise<{
    total: number
    available: number
    occupied: number
    reserved: number
    faculty: number
    maintenance: number
    occupancyRate: number
  }>
  getByZone(): Promise<Record<string, IParkingSlot[]>>
}

export default (mongoose.models.ParkingSlot as ParkingSlotModel) ||
  mongoose.model<IParkingSlot, ParkingSlotModel>("ParkingSlot", ParkingSlotSchema)
