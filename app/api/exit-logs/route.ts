import { NextResponse } from "next/server"
import { getExitLogs } from "@/lib/fake-data"

export async function GET(request: Request) {
  // Simulate processing delay
  await new Promise((resolve) => setTimeout(resolve, 50))

  const { searchParams } = new URL(request.url)
  const limit = parseInt(searchParams.get("limit") || "50")

  const logs = getExitLogs()
  const limitedLogs = logs.slice(0, limit)

  // Calculate average duration
  const calculateAvgDuration = () => {
    if (logs.length === 0) return "0m"
    
    let totalMinutes = 0
    logs.forEach((log) => {
      const match = log.duration.match(/(\d+)h?\s*(\d+)?m?/)
      if (match) {
        const hours = match[1] && log.duration.includes("h") ? parseInt(match[1]) : 0
        const minutes = match[2] ? parseInt(match[2]) : (log.duration.includes("m") ? parseInt(match[1]) : 0)
        totalMinutes += hours * 60 + minutes
      }
    })
    
    const avgMinutes = Math.round(totalMinutes / logs.length)
    const hours = Math.floor(avgMinutes / 60)
    const minutes = avgMinutes % 60
    
    if (hours === 0) return `${minutes}m`
    if (minutes === 0) return `${hours}h`
    return `${hours}h ${minutes}m`
  }

  return NextResponse.json({
    success: true,
    data: {
      exits: limitedLogs,
      summary: {
        total: logs.length,
        averageDuration: calculateAvgDuration(),
      },
      pagination: {
        total: logs.length,
        limit,
        returned: limitedLogs.length,
      },
      lastUpdated: new Date().toISOString(),
    },
  })
}
