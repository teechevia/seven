/**
 * MongoDB Schema for Vehicles
 * 
 * This file defines the TypeScript interfaces and MongoDB schema
 * for vehicle records in the Smart Parking System.
 * 
 * To use with MongoDB/Mongoose, install: npm install mongoose
 */

// TypeScript Interface
export interface IVehicle {
  _id?: string
  vehicleNo: string
  owner: string
  type: VehicleType
  permitType: PermitType
  permitExpiry?: Date
  registeredAt: Date
  updatedAt: Date
  status: VehicleStatus
  contact?: {
    phone?: string
    email?: string
  }
  metadata?: {
    department?: string
    employeeId?: string
    designation?: string
  }
}

export type VehicleType = "Sedan" | "SUV" | "Hatchback" | "Two Wheeler" | "Truck/Van" | "Other"
export type PermitType = "standard" | "faculty" | "vip" | "visitor" | "temporary"
export type VehicleStatus = "active" | "suspended" | "expired" | "blacklisted"

// MongoDB Schema Definition (for use with Mongoose)
export const vehicleSchemaDefinition = {
  vehicleNo: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
    index: true,
    // Indian vehicle number plate format validation
    match: /^[A-Z]{2}\s?\d{1,2}\s?[A-Z]{1,3}\s?\d{1,4}$/,
  },
  owner: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  type: {
    type: String,
    required: true,
    enum: ["Sedan", "SUV", "Hatchback", "Two Wheeler", "Truck/Van", "Other"],
    default: "Sedan",
  },
  permitType: {
    type: String,
    required: true,
    enum: ["standard", "faculty", "vip", "visitor", "temporary"],
    default: "standard",
  },
  permitExpiry: {
    type: Date,
    default: null,
  },
  registeredAt: {
    type: Date,
    default: Date.now,
    immutable: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    required: true,
    enum: ["active", "suspended", "expired", "blacklisted"],
    default: "active",
    index: true,
  },
  contact: {
    phone: {
      type: String,
      trim: true,
      match: /^[+]?[\d\s-]{10,15}$/,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
  },
  metadata: {
    department: {
      type: String,
      trim: true,
    },
    employeeId: {
      type: String,
      trim: true,
    },
    designation: {
      type: String,
      trim: true,
    },
  },
}

// Collection options
export const vehicleCollectionOptions = {
  collection: "vehicles",
  timestamps: true,
  versionKey: false,
}

// Indexes for optimized queries
export const vehicleIndexes = [
  { vehicleNo: 1 },
  { status: 1 },
  { permitType: 1 },
  { "metadata.department": 1 },
  { registeredAt: -1 },
]

/**
 * Example Mongoose Model Setup:
 * 
 * import mongoose from 'mongoose';
 * import { vehicleSchemaDefinition, vehicleCollectionOptions } from './vehicle';
 * 
 * const VehicleSchema = new mongoose.Schema(vehicleSchemaDefinition, vehicleCollectionOptions);
 * 
 * // Add middleware for auto-updating `updatedAt`
 * VehicleSchema.pre('save', function(next) {
 *   this.updatedAt = new Date();
 *   next();
 * });
 * 
 * export const Vehicle = mongoose.model('Vehicle', VehicleSchema);
 */
