import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import ExitLog from "@/lib/models/ExitLog"

export async function GET(request: Request) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "50")

    // Fetch logs
    const logs = await ExitLog.find()
      .sort({ exitTime: -1 })
      .limit(limit)
      .lean()

    // Get summary
    const summary = await ExitLog.getSummary()

    // Transform logs to match expected format
    const transformedLogs = logs.map((log) => ({
      id: log._id.toString(),
      vehicleNo: log.vehicleNo,
      owner: log.owner,
      type: log.type,
      entryTime: new Date(log.entryTime).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      exitTime: new Date(log.exitTime).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      slot: log.slot,
      duration: log.durationFormatted,
      gate: log.gate,
    }))

    return NextResponse.json({
      success: true,
      data: {
        exits: transformedLogs,
        summary: {
          total: summary.total,
          averageDuration: summary.averageDuration,
        },
        pagination: {
          total: await ExitLog.countDocuments(),
          limit,
          returned: transformedLogs.length,
        },
        lastUpdated: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("[exit-logs] Error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch exit logs" },
      { status: 500 }
    )
  }
}
