import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import EntryLog from "@/lib/models/EntryLog"

export async function GET(request: Request) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "50")
    const status = searchParams.get("status")

    // Build query
    const query: Record<string, unknown> = {}
    if (status) {
      query.status = status
    }

    // Fetch logs
    const logs = await EntryLog.find(query)
      .sort({ entryTime: -1 })
      .limit(limit)
      .lean()

    // Get summary
    const summary = await EntryLog.getSummary()

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
      assignedSlot: log.assignedSlot,
      status: log.status,
      confidence: log.confidence,
      gate: log.gate,
      isActive: log.isActive,
    }))

    return NextResponse.json({
      success: true,
      data: {
        entries: transformedLogs,
        summary,
        pagination: {
          total: await EntryLog.countDocuments(query),
          limit,
          returned: transformedLogs.length,
        },
        lastUpdated: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("[entry-logs] Error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch entry logs" },
      { status: 500 }
    )
  }
}
