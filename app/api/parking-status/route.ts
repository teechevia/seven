import { NextResponse } from "next/server"
import { getParkingStatus, getMutableParkingZones } from "@/lib/fake-data"

export async function GET() {
  // Simulate processing delay
  await new Promise((resolve) => setTimeout(resolve, 50))

  const status = getParkingStatus()
  const zones = getMutableParkingZones()

  // Calculate zone-specific stats
  const zoneStats = Object.entries(zones).map(([zoneName, slots]) => {
    const occupied = slots.filter((s) => s.status === "occupied").length
    const available = slots.filter((s) => s.status === "available").length
    const reserved = slots.filter((s) => s.status === "reserved").length
    const faculty = slots.filter((s) => s.status === "faculty").length

    return {
      zone: zoneName,
      name: `Zone ${zoneName}`,
      total: slots.length,
      occupied,
      available,
      reserved,
      faculty,
      occupancyRate: slots.length > 0 ? Math.round((occupied / slots.length) * 100) : 0,
    }
  })

  return NextResponse.json({
    success: true,
    data: {
      summary: {
        totalSlots: status.totalSlots,
        occupiedSlots: status.occupiedSlots,
        freeSlots: status.freeSlots,
        reservedSlots: status.reservedSlots,
        facultySlots: status.facultySlots,
        occupancyRate: status.occupancyRate,
      },
      zones: zoneStats,
      lastUpdated: new Date().toISOString(),
    },
  })
}
