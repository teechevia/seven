import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Vehicle from "@/lib/models/Vehicle"
import ParkingSlot from "@/lib/models/ParkingSlot"
import Alert from "@/lib/models/Alert"
import EntryLog from "@/lib/models/EntryLog"
import { vehiclesSeedData, parkingSlotsSeedData, alertsSeedData, entryLogsSeedData } from "@/lib/seed-data"

export async function POST() {
  try {
    await connectDB()

    // Clear existing data
    await Promise.all([
      Vehicle.deleteMany({}),
      ParkingSlot.deleteMany({}),
      Alert.deleteMany({}),
      EntryLog.deleteMany({}),
    ])

    // Seed vehicles
    const vehicles = await Vehicle.insertMany(
      vehiclesSeedData.map((v) => ({
        ...v,
        registeredOn: new Date(),
        blacklistedOn: v.status === "blacklisted" ? new Date() : undefined,
      }))
    )

    // Seed parking slots with entry times
    const parkingSlots = await ParkingSlot.insertMany(
      parkingSlotsSeedData.map((slot) => ({
        ...slot,
        vehicle: slot.vehicle
          ? {
              ...slot.vehicle,
              entryTime: new Date(Date.now() - Math.random() * 4 * 60 * 60 * 1000), // Random entry time in last 4 hours
            }
          : undefined,
      }))
    )

    // Seed alerts
    const alerts = await Alert.insertMany(
      alertsSeedData.map((alert) => ({
        ...alert,
        createdAt: new Date(Date.now() - Math.random() * 60 * 60 * 1000), // Random time in last hour
      }))
    )

    // Seed entry logs
    const entryLogs = await EntryLog.insertMany(
      entryLogsSeedData.map((log) => ({
        ...log,
        entryTime: new Date(Date.now() - Math.random() * 4 * 60 * 60 * 1000), // Random entry time in last 4 hours
        isActive: true,
      }))
    )

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully",
      data: {
        vehicles: vehicles.length,
        parkingSlots: parkingSlots.length,
        alerts: alerts.length,
        entryLogs: entryLogs.length,
      },
    })
  } catch (error) {
    console.error("[seed] Error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to seed database" },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Use POST request to seed the database",
    warning: "This will clear all existing data!",
  })
}
