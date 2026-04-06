/**
 * MongoDB Schema for Parking Slots
 * 
 * This file defines the TypeScript interfaces and MongoDB schema
 * for parking slot records in the Smart Parking System.
 * 
 * To use with MongoDB/Mongoose, install: npm install mongoose
 */

// TypeScript Interface
export interface IParkingSlot {
  _id?: string
  slotId: string
  zone: string
  floor?: number
  status: SlotStatus
  type: SlotType
  vehicle?: {
    vehicleNo: string
    owner: string
    vehicleType: string
    entryTime: Date
  } | null
  sensor?: {
    sensorId: string
    lastPing: Date
    batteryLevel: number
    isOnline: boolean
  }
  position?: {
    row: number
    column: number
    coordinates?: {
      x: number
      y: number
    }
  }
  features?: SlotFeature[]
  createdAt: Date
  updatedAt: Date
}

export type SlotStatus = "available" | "occupied" | "reserved" | "faculty" | "maintenance" | "disabled"
export type SlotType = "standard" | "compact" | "handicapped" | "ev-charging" | "vip" | "motorcycle"
export type SlotFeature = "covered" | "ev-charging" | "near-exit" | "near-elevator" | "security-camera"

// MongoDB Schema Definition (for use with Mongoose)
export const parkingSlotSchemaDefinition = {
  slotId: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
    index: true,
    // Format: Zone letter + number (e.g., A1, B12, C5)
    match: /^[A-Z]\d{1,3}$/,
  },
  zone: {
    type: String,
    required: true,
    uppercase: true,
    trim: true,
    index: true,
    // Single letter zone identifier
    match: /^[A-Z]$/,
  },
  floor: {
    type: Number,
    default: 0,
    min: -5,
    max: 20,
  },
  status: {
    type: String,
    required: true,
    enum: ["available", "occupied", "reserved", "faculty", "maintenance", "disabled"],
    default: "available",
    index: true,
  },
  type: {
    type: String,
    required: true,
    enum: ["standard", "compact", "handicapped", "ev-charging", "vip", "motorcycle"],
    default: "standard",
  },
  vehicle: {
    vehicleNo: {
      type: String,
      uppercase: true,
      trim: true,
      index: true,
    },
    owner: {
      type: String,
      trim: true,
    },
    vehicleType: {
      type: String,
      trim: true,
    },
    entryTime: {
      type: Date,
    },
  },
  sensor: {
    sensorId: {
      type: String,
      trim: true,
    },
    lastPing: {
      type: Date,
      default: Date.now,
    },
    batteryLevel: {
      type: Number,
      min: 0,
      max: 100,
      default: 100,
    },
    isOnline: {
      type: Boolean,
      default: true,
    },
  },
  position: {
    row: {
      type: Number,
      min: 1,
    },
    column: {
      type: Number,
      min: 1,
    },
    coordinates: {
      x: Number,
      y: Number,
    },
  },
  features: {
    type: [String],
    enum: ["covered", "ev-charging", "near-exit", "near-elevator", "security-camera"],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}

// Collection options
export const parkingSlotCollectionOptions = {
  collection: "parkingSlots",
  timestamps: true,
  versionKey: false,
}

// Indexes for optimized queries
export const parkingSlotIndexes = [
  { slotId: 1 },
  { zone: 1, status: 1 },
  { status: 1 },
  { "vehicle.vehicleNo": 1 },
  { type: 1 },
  { zone: 1, floor: 1 },
]

// Utility functions for slot management
export const slotStatusPriority: Record<SlotStatus, number> = {
  available: 1,
  reserved: 2,
  faculty: 3,
  occupied: 4,
  maintenance: 5,
  disabled: 6,
}

/**
 * Example Mongoose Model Setup:
 * 
 * import mongoose from 'mongoose';
 * import { parkingSlotSchemaDefinition, parkingSlotCollectionOptions } from './parking-slot';
 * 
 * const ParkingSlotSchema = new mongoose.Schema(parkingSlotSchemaDefinition, parkingSlotCollectionOptions);
 * 
 * // Add methods for slot operations
 * ParkingSlotSchema.methods.occupy = function(vehicleData) {
 *   this.status = 'occupied';
 *   this.vehicle = vehicleData;
 *   this.updatedAt = new Date();
 *   return this.save();
 * };
 * 
 * ParkingSlotSchema.methods.release = function() {
 *   this.status = 'available';
 *   this.vehicle = null;
 *   this.updatedAt = new Date();
 *   return this.save();
 * };
 * 
 * export const ParkingSlot = mongoose.model('ParkingSlot', ParkingSlotSchema);
 */
