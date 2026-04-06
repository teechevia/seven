/**
 * MongoDB Schemas Index
 * 
 * Central export file for all MongoDB schemas used in the Smart Parking System.
 * Import schemas from this file for consistent usage across the application.
 * 
 * To use with MongoDB, install: npm install mongoose
 * 
 * Example usage:
 * ```typescript
 * import { 
 *   IVehicle, 
 *   vehicleSchemaDefinition,
 *   IParkingSlot,
 *   IEntryLog,
 *   IExitLog,
 *   IAlert
 * } from '@/lib/schemas';
 * ```
 */

// Vehicle Schema
export {
  type IVehicle,
  type VehicleType,
  type PermitType,
  type VehicleStatus,
  vehicleSchemaDefinition,
  vehicleCollectionOptions,
  vehicleIndexes,
} from "./vehicle"

// Parking Slot Schema
export {
  type IParkingSlot,
  type SlotStatus,
  type SlotType,
  type SlotFeature,
  parkingSlotSchemaDefinition,
  parkingSlotCollectionOptions,
  parkingSlotIndexes,
  slotStatusPriority,
} from "./parking-slot"

// Entry Log Schema
export {
  type IEntryLog,
  type EntryStatus,
  type CaptureMethod,
  entryLogSchemaDefinition,
  entryLogCollectionOptions,
  entryLogIndexes,
  entryLogAggregations,
} from "./entry-log"

// Exit Log Schema
export {
  type IExitLog,
  type PaymentStatus,
  type PaymentMethod,
  exitLogSchemaDefinition,
  exitLogCollectionOptions,
  exitLogIndexes,
  exitLogAggregations,
  formatDuration,
  calculateDurationMinutes,
} from "./exit-log"

// Alert Schema
export {
  type IAlert,
  type AlertSeverity,
  type AlertType,
  type AlertStatus,
  alertSchemaDefinition,
  alertCollectionOptions,
  alertIndexes,
  severityPriority,
  alertTemplates,
} from "./alert"

/**
 * Database Connection Example:
 * 
 * ```typescript
 * import mongoose from 'mongoose';
 * 
 * const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-parking';
 * 
 * export async function connectDB() {
 *   try {
 *     await mongoose.connect(MONGODB_URI);
 *     console.log('Connected to MongoDB');
 *   } catch (error) {
 *     console.error('MongoDB connection error:', error);
 *     process.exit(1);
 *   }
 * }
 * ```
 * 
 * Model Registration Example:
 * 
 * ```typescript
 * import mongoose from 'mongoose';
 * import { 
 *   vehicleSchemaDefinition, 
 *   vehicleCollectionOptions,
 *   parkingSlotSchemaDefinition,
 *   parkingSlotCollectionOptions,
 *   entryLogSchemaDefinition,
 *   entryLogCollectionOptions,
 *   exitLogSchemaDefinition,
 *   exitLogCollectionOptions,
 *   alertSchemaDefinition,
 *   alertCollectionOptions,
 * } from '@/lib/schemas';
 * 
 * // Create schemas
 * const VehicleSchema = new mongoose.Schema(vehicleSchemaDefinition, vehicleCollectionOptions);
 * const ParkingSlotSchema = new mongoose.Schema(parkingSlotSchemaDefinition, parkingSlotCollectionOptions);
 * const EntryLogSchema = new mongoose.Schema(entryLogSchemaDefinition, entryLogCollectionOptions);
 * const ExitLogSchema = new mongoose.Schema(exitLogSchemaDefinition, exitLogCollectionOptions);
 * const AlertSchema = new mongoose.Schema(alertSchemaDefinition, alertCollectionOptions);
 * 
 * // Register models
 * export const Vehicle = mongoose.models.Vehicle || mongoose.model('Vehicle', VehicleSchema);
 * export const ParkingSlot = mongoose.models.ParkingSlot || mongoose.model('ParkingSlot', ParkingSlotSchema);
 * export const EntryLog = mongoose.models.EntryLog || mongoose.model('EntryLog', EntryLogSchema);
 * export const ExitLog = mongoose.models.ExitLog || mongoose.model('ExitLog', ExitLogSchema);
 * export const Alert = mongoose.models.Alert || mongoose.model('Alert', AlertSchema);
 * ```
 */
