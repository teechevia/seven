import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import ParkingSlot from "@/lib/models/ParkingSlot"

export async function GET() {
  try {
    await connectDB()

    const [zones, summary] = await Promise.all([
      ParkingSlot.getByZone(),
      ParkingSlot.getSummary(),
    ])

    // Transform zones data to match expected format
    const transformedZones: Record<string, Array<{
      id: string
      status: string
      vehicle?: {
        number: string
        owner: string
        type: string
        entryTime: string
      }
    }>> = {}

    for (const [zone, slots] of Object.entries(zones)) {
      transformedZones[zone] = slots.map((slot) => ({
        id: slot.slotId,
        status: slot.status,
        vehicle: slot.vehicle
          ? {
              number: slot.vehicle.vehicleNo,
              owner: slot.vehicle.owner,
              type: slot.vehicle.type,
              entryTime: slot.vehicle.entryTime
                ? new Date(slot.vehicle.entryTime).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "N/A",
            }
          : undefined,
      }))
    }

    return NextResponse.json({
      success: true,
      data: {
        zones: transformedZones,
        summary: {
          total: summary.total,
          available: summary.available,
          occupied: summary.occupied,
          reserved: summary.reserved,
          faculty: summary.faculty,
          occupancyRate: summary.occupancyRate,
        },
      },
    })
  } catch (error) {
    console.error("[parking-slots] Error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch parking slots" },
      { status: 500 }
    )
  }
}
