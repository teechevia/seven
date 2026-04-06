// MongoDB Models for Smart Parking System
// =========================================

export { default as Vehicle, type IVehicle, type PermitType, type VehicleStatus } from "./Vehicle"
export { default as ParkingSlot, type IParkingSlot, type SlotStatus, type IOccupyingVehicle } from "./ParkingSlot"
export { default as EntryLog, type IEntryLog, type AuthStatus } from "./EntryLog"
export { default as ExitLog, type IExitLog } from "./ExitLog"
export { default as Alert, type IAlert, type AlertSeverity, type AlertStatus, type AlertType } from "./Alert"
