/**
 * MongoDB Schema for Entry Logs
 * 
 * This file defines the TypeScript interfaces and MongoDB schema
 * for vehicle entry log records in the Smart Parking System.
 * 
 * To use with MongoDB/Mongoose, install: npm install mongoose
 */

// TypeScript Interface
export interface IEntryLog {
  _id?: string
  vehicleNo: string
  owner: string
  type: string
  entryTime: Date
  assignedSlot: string | null
  zone?: string
  status: EntryStatus
  confidence: number
  gate: string
  captureMethod: CaptureMethod
  imageUrl?: string
  ocrData?: {
    rawText: string
    usedFallback: boolean
    processingTime: number
  }
  createdAt: Date
}

export type EntryStatus = "authorized" | "unauthorized" | "blacklisted"
export type CaptureMethod = "webcam" | "upload" | "automatic" | "manual"

// MongoDB Schema Definition (for use with Mongoose)
export const entryLogSchemaDefinition = {
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
    default: "Unknown",
  },
  type: {
    type: String,
    required: true,
    trim: true,
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
    uppercase: true,
    trim: true,
    default: null,
    index: true,
  },
  zone: {
    type: String,
    uppercase: true,
    trim: true,
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
    default: 0,
  },
  gate: {
    type: String,
    required: true,
    trim: true,
    default: "Gate 1 - Main Entry",
  },
  captureMethod: {
    type: String,
    required: true,
    enum: ["webcam", "upload", "automatic", "manual"],
    default: "upload",
  },
  imageUrl: {
    type: String,
    trim: true,
  },
  ocrData: {
    rawText: {
      type: String,
      trim: true,
    },
    usedFallback: {
      type: Boolean,
      default: false,
    },
    processingTime: {
      type: Number,
      min: 0,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true,
    index: true,
  },
}

// Collection options
export const entryLogCollectionOptions = {
  collection: "entryLogs",
  timestamps: false,
  versionKey: false,
  // TTL index to auto-delete old logs after 90 days
  expireAfterSeconds: 90 * 24 * 60 * 60,
}

// Indexes for optimized queries
export const entryLogIndexes = [
  { vehicleNo: 1 },
  { entryTime: -1 },
  { status: 1 },
  { assignedSlot: 1 },
  { createdAt: -1 },
  { gate: 1, entryTime: -1 },
  // Compound index for common queries
  { vehicleNo: 1, entryTime: -1 },
  { status: 1, entryTime: -1 },
]

// Aggregation helpers
export const entryLogAggregations = {
  // Get entry counts by status for a date range
  countByStatus: (startDate: Date, endDate: Date) => [
    {
      $match: {
        entryTime: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ],

  // Get hourly entry counts for a specific date
  hourlyDistribution: (date: Date) => {
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    return [
      {
        $match: {
          entryTime: { $gte: startOfDay, $lte: endOfDay },
        },
      },
      {
        $group: {
          _id: { $hour: "$entryTime" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]
  },
}

/**
 * Example Mongoose Model Setup:
 * 
 * import mongoose from 'mongoose';
 * import { entryLogSchemaDefinition, entryLogCollectionOptions } from './entry-log';
 * 
 * const EntryLogSchema = new mongoose.Schema(entryLogSchemaDefinition, entryLogCollectionOptions);
 * 
 * // Static method to get recent entries
 * EntryLogSchema.statics.getRecentEntries = function(limit = 10) {
 *   return this.find()
 *     .sort({ entryTime: -1 })
 *     .limit(limit)
 *     .lean();
 * };
 * 
 * // Static method to find active entry for a vehicle
 * EntryLogSchema.statics.findActiveEntry = function(vehicleNo) {
 *   return this.findOne({
 *     vehicleNo: vehicleNo.toUpperCase(),
 *     status: 'authorized',
 *     assignedSlot: { $ne: null }
 *   }).sort({ entryTime: -1 });
 * };
 * 
 * export const EntryLog = mongoose.model('EntryLog', EntryLogSchema);
 */
