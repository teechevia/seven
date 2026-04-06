import { NextResponse } from "next/server"
import { getEntryLogs } from "@/lib/fake-data"

export async function GET(request: Request) {
  // Simulate processing delay
  await new Promise((resolve) => setTimeout(resolve, 50))

  const { searchParams } = new URL(request.url)
  const limit = parseInt(searchParams.get("limit") || "50")
  const status = searchParams.get("status") // "authorized" | "unauthorized" | "blacklisted" | null (all)

  let logs = getEntryLogs()

  // Filter by status if provided
  if (status) {
    logs = logs.filter((log) => log.status === status)
  }

  // Limit results
  const limitedLogs = logs.slice(0, limit)

  // Calculate summary stats
  const allLogs = getEntryLogs()
  const summary = {
    total: allLogs.length,
    authorized: allLogs.filter((l) => l.status === "authorized").length,
    unauthorized: allLogs.filter((l) => l.status === "unauthorized").length,
    blacklisted: allLogs.filter((l) => l.status === "blacklisted").length,
  }

  return NextResponse.json({
    success: true,
    data: {
      entries: limitedLogs,
      summary,
      pagination: {
        total: logs.length,
        limit,
        returned: limitedLogs.length,
      },
      lastUpdated: new Date().toISOString(),
    },
  })
}
