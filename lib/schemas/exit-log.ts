/**
 * MongoDB Schema for Exit Logs
 * 
 * This file defines the TypeScript interfaces and MongoDB schema
 * for vehicle exit log records in the Smart Parking System.
 * 
 * To use with MongoDB/Mongoose, install: npm install mongoose
 */

// TypeScript Interface
export interface IExitLog {
  _id?: string
  vehicleNo: string
  owner: string
  type: string
  entryTime: Date
  exitTime: Date
  duration: string
  durationMinutes: number
  slot: string
  zone?: string
  gate: string
  parkingFee?: number
  paymentStatus?: PaymentStatus
  paymentMethod?: PaymentMethod
  imageUrl?: string
  createdAt: Date
}

export type PaymentStatus = "paid" | "pending" | "waived" | "free"
export type PaymentMethod = "cash" | "card" | "upi" | "wallet" | "subscription" | "free"

// MongoDB Schema Definition (for use with Mongoose)
export const exitLogSchemaDefinition = {
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
  },
  exitTime: {
    type: Date,
    required: true,
    default: Date.now,
    index: true,
  },
  duration: {
    type: String,
    required: true,
    trim: true,
  },
  durationMinutes: {
    type: Number,
    required: true,
    min: 0,
    index: true,
  },
  slot: {
    type: String,
    required: true,
    uppercase: true,
    trim: true,
  },
  zone: {
    type: String,
    uppercase: true,
    trim: true,
  },
  gate: {
    type: String,
    required: true,
    trim: true,
    default: "Gate 1 - Main Exit",
  },
  parkingFee: {
    type: Number,
    min: 0,
    default: 0,
  },
  paymentStatus: {
    type: String,
    enum: ["paid", "pending", "waived", "free"],
    default: "free",
  },
  paymentMethod: {
    type: String,
    enum: ["cash", "card", "upi", "wallet", "subscription", "free"],
    default: "free",
  },
  imageUrl: {
    type: String,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true,
    index: true,
  },
}

// Collection options
export const exitLogCollectionOptions = {
  collection: "exitLogs",
  timestamps: false,
  versionKey: false,
  // TTL index to auto-delete old logs after 90 days
  expireAfterSeconds: 90 * 24 * 60 * 60,
}

// Indexes for optimized queries
export const exitLogIndexes = [
  { vehicleNo: 1 },
  { exitTime: -1 },
  { slot: 1 },
  { durationMinutes: 1 },
  { createdAt: -1 },
  // Compound index for analytics queries
  { exitTime: -1, zone: 1 },
  { vehicleNo: 1, exitTime: -1 },
]

// Utility function to calculate duration string from minutes
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  
  if (hours === 0) return `${mins}m`
  if (mins === 0) return `${hours}h`
  return `${hours}h ${mins}m`
}

// Utility function to calculate duration in minutes from entry/exit times
export function calculateDurationMinutes(entryTime: Date, exitTime: Date): number {
  const diff = exitTime.getTime() - entryTime.getTime()
  return Math.max(0, Math.floor(diff / (1000 * 60)))
}

// Aggregation helpers
export const exitLogAggregations = {
  // Get average parking duration for a date range
  averageDuration: (startDate: Date, endDate: Date) => [
    {
      $match: {
        exitTime: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: null,
        avgDuration: { $avg: "$durationMinutes" },
        maxDuration: { $max: "$durationMinutes" },
        minDuration: { $min: "$durationMinutes" },
        totalExits: { $sum: 1 },
      },
    },
  ],

  // Get daily exit counts for the last N days
  dailyExitCounts: (days: number) => {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    startDate.setHours(0, 0, 0, 0)

    return [
      {
        $match: {
          exitTime: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$exitTime" },
          },
          count: { $sum: 1 },
          avgDuration: { $avg: "$durationMinutes" },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]
  },

  // Get zone usage statistics
  zoneUsage: (startDate: Date, endDate: Date) => [
    {
      $match: {
        exitTime: { $gte: startDate, $lte: endDate },
        zone: { $exists: true, $ne: null },
      },
    },
    {
      $group: {
        _id: "$zone",
        totalExits: { $sum: 1 },
        avgDuration: { $avg: "$durationMinutes" },
        totalRevenue: { $sum: "$parkingFee" },
      },
    },
    {
      $sort: { totalExits: -1 },
    },
  ],
}

/**
 * Example Mongoose Model Setup:
 * 
 * import mongoose from 'mongoose';
 * import { 
 *   exitLogSchemaDefinition, 
 *   exitLogCollectionOptions,
 *   formatDuration,
 *   calculateDurationMinutes 
 * } from './exit-log';
 * 
 * const ExitLogSchema = new mongoose.Schema(exitLogSchemaDefinition, exitLogCollectionOptions);
 * 
 * // Static method to record a vehicle exit
 * ExitLogSchema.statics.recordExit = async function(entryLog, exitGate = 'Gate 1 - Main Exit') {
 *   const exitTime = new Date();
 *   const durationMinutes = calculateDurationMinutes(entryLog.entryTime, exitTime);
 *   
 *   return this.create({
 *     vehicleNo: entryLog.vehicleNo,
 *     owner: entryLog.owner,
 *     type: entryLog.type,
 *     entryTime: entryLog.entryTime,
 *     exitTime,
 *     duration: formatDuration(durationMinutes),
 *     durationMinutes,
 *     slot: entryLog.assignedSlot,
 *     zone: entryLog.zone,
 *     gate: exitGate,
 *   });
 * };
 * 
 * // Static method to get today's exit statistics
 * ExitLogSchema.statics.getTodayStats = function() {
 *   const startOfDay = new Date();
 *   startOfDay.setHours(0, 0, 0, 0);
 *   
 *   return this.aggregate([
 *     { $match: { exitTime: { $gte: startOfDay } } },
 *     { $group: {
 *       _id: null,
 *       totalExits: { $sum: 1 },
 *       avgDuration: { $avg: '$durationMinutes' },
 *       totalRevenue: { $sum: '$parkingFee' }
 *     }}
 *   ]);
 * };
 * 
 * export const ExitLog = mongoose.model('ExitLog', ExitLogSchema);
 */
