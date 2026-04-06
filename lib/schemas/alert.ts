/**
 * MongoDB Schema for Alerts
 * 
 * This file defines the TypeScript interfaces and MongoDB schema
 * for system alert records in the Smart Parking System.
 * 
 * To use with MongoDB/Mongoose, install: npm install mongoose
 */

// TypeScript Interface
export interface IAlert {
  _id?: string
  title: string
  description: string
  severity: AlertSeverity
  type: AlertType
  status: AlertStatus
  vehicleNo?: string
  location?: string
  gate?: string
  slotId?: string
  zone?: string
  assignedTo?: string
  resolvedBy?: string
  resolvedAt?: Date
  resolution?: string
  metadata?: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
}

export type AlertSeverity = "critical" | "warning" | "info"
export type AlertType = "unauthorized" | "overstay" | "sensor" | "security" | "maintenance" | "blacklisted" | "system"
export type AlertStatus = "active" | "acknowledged" | "resolved" | "escalated" | "dismissed"

// MongoDB Schema Definition (for use with Mongoose)
export const alertSchemaDefinition = {
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000,
  },
  severity: {
    type: String,
    required: true,
    enum: ["critical", "warning", "info"],
    default: "info",
    index: true,
  },
  type: {
    type: String,
    required: true,
    enum: ["unauthorized", "overstay", "sensor", "security", "maintenance", "blacklisted", "system"],
    index: true,
  },
  status: {
    type: String,
    required: true,
    enum: ["active", "acknowledged", "resolved", "escalated", "dismissed"],
    default: "active",
    index: true,
  },
  vehicleNo: {
    type: String,
    uppercase: true,
    trim: true,
    index: true,
  },
  location: {
    type: String,
    trim: true,
  },
  gate: {
    type: String,
    trim: true,
  },
  slotId: {
    type: String,
    uppercase: true,
    trim: true,
  },
  zone: {
    type: String,
    uppercase: true,
    trim: true,
  },
  assignedTo: {
    type: String,
    trim: true,
  },
  resolvedBy: {
    type: String,
    trim: true,
  },
  resolvedAt: {
    type: Date,
    default: null,
  },
  resolution: {
    type: String,
    trim: true,
    maxlength: 500,
  },
  metadata: {
    type: Object,
    default: {},
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true,
    index: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}

// Collection options
export const alertCollectionOptions = {
  collection: "alerts",
  timestamps: true,
  versionKey: false,
}

// Indexes for optimized queries
export const alertIndexes = [
  { status: 1, severity: 1 },
  { createdAt: -1 },
  { type: 1 },
  { vehicleNo: 1 },
  { status: 1, createdAt: -1 },
  // Compound index for dashboard queries
  { status: 1, severity: 1, createdAt: -1 },
]

// Severity priority for sorting
export const severityPriority: Record<AlertSeverity, number> = {
  critical: 1,
  warning: 2,
  info: 3,
}

// Alert templates for common scenarios
export const alertTemplates = {
  unauthorizedEntry: (vehicleNo: string, gate: string) => ({
    title: "Unauthorized Vehicle Detected",
    description: `Unregistered vehicle ${vehicleNo} detected at ${gate}. No valid parking permit found in database.`,
    severity: "critical" as AlertSeverity,
    type: "unauthorized" as AlertType,
    vehicleNo,
    gate,
  }),

  blacklistedEntry: (vehicleNo: string, gate: string) => ({
    title: "Blacklisted Vehicle Entry Attempt",
    description: `Vehicle ${vehicleNo} attempted entry at ${gate} - access denied. This vehicle is on the blacklist.`,
    severity: "critical" as AlertSeverity,
    type: "blacklisted" as AlertType,
    vehicleNo,
    gate,
  }),

  overstay: (vehicleNo: string, slotId: string, duration: string) => ({
    title: "Overstay Warning",
    description: `Vehicle ${vehicleNo} in slot ${slotId} has exceeded the maximum parking duration (${duration}).`,
    severity: "warning" as AlertSeverity,
    type: "overstay" as AlertType,
    vehicleNo,
    slotId,
  }),

  sensorMalfunction: (sensorId: string, slotId: string) => ({
    title: "Sensor Malfunction",
    description: `Ground proximity sensor ${sensorId} at slot ${slotId} is offline or reporting errors.`,
    severity: "critical" as AlertSeverity,
    type: "sensor" as AlertType,
    slotId,
    metadata: { sensorId },
  }),

  parkingFull: (zone?: string) => ({
    title: "Parking Capacity Alert",
    description: zone
      ? `Zone ${zone} has reached maximum capacity. New vehicles being redirected.`
      : "Parking facility has reached maximum capacity.",
    severity: "warning" as AlertSeverity,
    type: "maintenance" as AlertType,
    zone,
  }),

  securityBreach: (location: string, details: string) => ({
    title: "Security Breach Attempt",
    description: `Security incident detected at ${location}. ${details}`,
    severity: "critical" as AlertSeverity,
    type: "security" as AlertType,
    location,
  }),
}

/**
 * Example Mongoose Model Setup:
 * 
 * import mongoose from 'mongoose';
 * import { alertSchemaDefinition, alertCollectionOptions, severityPriority } from './alert';
 * 
 * const AlertSchema = new mongoose.Schema(alertSchemaDefinition, alertCollectionOptions);
 * 
 * // Pre-save middleware to update timestamp
 * AlertSchema.pre('save', function(next) {
 *   this.updatedAt = new Date();
 *   next();
 * });
 * 
 * // Method to resolve an alert
 * AlertSchema.methods.resolve = function(resolvedBy, resolution) {
 *   this.status = 'resolved';
 *   this.resolvedBy = resolvedBy;
 *   this.resolvedAt = new Date();
 *   this.resolution = resolution;
 *   return this.save();
 * };
 * 
 * // Static method to get active alerts sorted by severity
 * AlertSchema.statics.getActiveAlerts = function(limit = 50) {
 *   return this.aggregate([
 *     { $match: { status: 'active' } },
 *     { $addFields: {
 *       severityOrder: {
 *         $switch: {
 *           branches: [
 *             { case: { $eq: ['$severity', 'critical'] }, then: 1 },
 *             { case: { $eq: ['$severity', 'warning'] }, then: 2 },
 *             { case: { $eq: ['$severity', 'info'] }, then: 3 },
 *           ],
 *           default: 4
 *         }
 *       }
 *     }},
 *     { $sort: { severityOrder: 1, createdAt: -1 } },
 *     { $limit: limit }
 *   ]);
 * };
 * 
 * export const Alert = mongoose.model('Alert', AlertSchema);
 */
