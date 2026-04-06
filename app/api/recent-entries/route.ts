import { NextResponse } from "next/server"
import {
  getEntryLogs,
  getExitLogs,
  getParkingStatus,
  getActiveAlerts,
  vehicleTypesData,
  hourlyUsageData,
  zoneCapacityData,
  type VehicleEntry,
} from "@/lib/fake-data"

export async function GET() {
  const entryLogs = getEntryLogs()
  const exitLogs = getExitLogs()
  const parkingStatus = getParkingStatus()
  const activeAlerts = getActiveAlerts()

  // Transform entry logs to VehicleEntry format for dashboard compatibility
  const entries: VehicleEntry[] = entryLogs
    .filter((log) => log.status === "authorized" && log.assignedSlot)
    .slice(0, 10)
    .map((log) => ({
      id: log.id,
      vehicleNo: log.vehicleNo,
      owner: log.owner,
      type: log.type,
      time: log.entryTime,
      slot: log.assignedSlot || "N/A",
      status: "active" as const,
    }))

  // Calculate dynamic stats
  const stats = {
    totalSlots: parkingStatus.totalSlots,
    occupiedSlots: parkingStatus.occupiedSlots,
    freeSlots: parkingStatus.freeSlots,
    reservedSlots: parkingStatus.reservedSlots,
    facultySlots: parkingStatus.facultySlots,
    unauthorizedCount: activeAlerts.filter((a) => a.type === "unauthorized").length,
    todayEntries: entryLogs.length,
    todayExits: exitLogs.length,
    occupancyRate: parkingStatus.occupancyRate,
    trend: "+18%",
  }

  return NextResponse.json({
    success: true,
    data: {
      entries,
      stats,
      vehicleTypes: vehicleTypesData,
      hourlyUsage: hourlyUsageData,
      zoneCapacity: zoneCapacityData,
    },
  })
}
