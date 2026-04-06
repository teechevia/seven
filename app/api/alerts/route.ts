import { NextResponse } from "next/server"
import { alerts, alertTimelineEvents, blacklistedVehicles, alertsSummaryStats } from "@/lib/fake-data"

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      alerts,
      timeline: alertTimelineEvents,
      blacklisted: blacklistedVehicles,
      summary: alertsSummaryStats,
    },
  })
}
