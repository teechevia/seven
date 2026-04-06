import { NextResponse } from "next/server"
import { getMutableParkingZones, getParkingStatus } from "@/lib/fake-data"

export async function GET() {
  const zones = getMutableParkingZones()
  const status = getParkingStatus()
  
  return NextResponse.json({
    success: true,
    data: {
      zones,
      summary: {
        total: status.totalSlots,
        available: status.freeSlots,
        occupied: status.occupiedSlots,
        reserved: status.reservedSlots,
        faculty: status.facultySlots,
        occupancyRate: status.occupancyRate,
      },
    },
  })
}
