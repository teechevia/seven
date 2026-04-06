import mongoose, { Schema, Document, Model } from "mongoose"

export type PermitType = "standard" | "faculty" | "vip" | "visitor"
export type VehicleStatus = "active" | "suspended" | "expired" | "blacklisted"

export interface IVehicle extends Document {
  vehicleNo: string
  owner: string
  email?: string
  phone?: string
  type: string
  permitType: PermitType
  status: VehicleStatus
  registeredOn: Date
  expiresOn?: Date
  blacklistReason?: string
  blacklistedOn?: Date
  blacklistedBy?: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}

const VehicleSchema = new Schema<IVehicle>(
  {
    vehicleNo: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    owner: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["Sedan", "SUV", "Hatchback", "Two Wheeler", "Truck/Van", "Unknown"],
      default: "Unknown",
    },
    permitType: {
      type: String,
      required: true,
      enum: ["standard", "faculty", "vip", "visitor"],
      default: "standard",
    },
    status: {
      type: String,
      required: true,
      enum: ["active", "suspended", "expired", "blacklisted"],
      default: "active",
      index: true,
    },
    registeredOn: {
      type: Date,
      default: Date.now,
    },
    expiresOn: {
      type: Date,
    },
    blacklistReason: {
      type: String,
    },
    blacklistedOn: {
      type: Date,
    },
    blacklistedBy: {
      type: String,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
)

// Static method to check vehicle authorization status
VehicleSchema.statics.checkStatus = async function (vehicleNo: string) {
  const vehicle = await this.findOne({ vehicleNo: vehicleNo.toUpperCase().trim() })
  
  if (!vehicle) {
    return {
      status: "unauthorized" as const,
      owner: "Unknown",
      type: "Unknown",
    }
  }
  
  if (vehicle.status === "blacklisted") {
    return {
      status: "blacklisted" as const,
      owner: vehicle.owner,
      type: vehicle.type,
      blacklistReason: vehicle.blacklistReason,
    }
  }
  
  if (vehicle.status === "suspended" || vehicle.status === "expired") {
    return {
      status: "unauthorized" as const,
      owner: vehicle.owner,
      type: vehicle.type,
      reason: `Permit ${vehicle.status}`,
    }
  }
  
  return {
    status: "authorized" as const,
    owner: vehicle.owner,
    type: vehicle.type,
    permitType: vehicle.permitType,
  }
}

export interface VehicleModel extends Model<IVehicle> {
  checkStatus(vehicleNo: string): Promise<{
    status: "authorized" | "unauthorized" | "blacklisted"
    owner: string
    type: string
    permitType?: PermitType
    blacklistReason?: string
    reason?: string
  }>
}

export default (mongoose.models.Vehicle as VehicleModel) ||
  mongoose.model<IVehicle, VehicleModel>("Vehicle", VehicleSchema)
