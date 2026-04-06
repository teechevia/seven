import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Alert from "@/lib/models/Alert"
import Vehicle from "@/lib/models/Vehicle"

export async function GET() {
  try {
    await connectDB()

    // Fetch all alerts (most recent first)
    const alerts = await Alert.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .lean()

    // Get active alerts for timeline
    const activeAlerts = await Alert.getActive()

    // Get blacklisted vehicles
    const blacklistedVehicles = await Vehicle.find({ status: "blacklisted" })
      .sort({ blacklistedOn: -1 })
      .lean()

    // Get summary
    const summary = await Alert.getSummary()

    // Transform alerts to match expected format
    const transformedAlerts = alerts.map((alert) => ({
      id: alert._id.toString(),
      title: alert.title,
      description: alert.description,
      time: getRelativeTime(new Date(alert.createdAt)),
      severity: alert.severity,
      type: alert.type,
      vehicleNo: alert.vehicleNo || "System",
      location: alert.location || "N/A",
      status: alert.status,
    }))

    // Transform timeline events
    const timeline = activeAlerts.slice(0, 10).map((alert) => ({
      id: alert._id.toString(),
      event: alert.title,
      time: new Date(alert.createdAt).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      type: alert.severity === "critical" ? "critical" : alert.status === "resolved" ? "resolved" : "warning",
    }))

    // Transform blacklisted vehicles
    const blacklisted = blacklistedVehicles.map((v) => ({
      id: v._id.toString(),
      vehicleNo: v.vehicleNo,
      owner: v.owner,
      reason: v.blacklistReason || "Unknown reason",
      addedOn: v.blacklistedOn
        ? new Date(v.blacklistedOn).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })
        : "Unknown",
      addedBy: v.blacklistedBy || "System",
      status: "active",
    }))

    // Summary stats for UI
    const summaryStats = [
      {
        label: "Total Alerts",
        value: summary.total.toString(),
        icon: "Bell",
        trend: `+${summary.active} active`,
        color: "lime",
        badge: { text: "Live", color: "lime" },
      },
      {
        label: "Unauthorized Vehicles",
        value: summary.unauthorized.toString(),
        icon: "ShieldAlert",
        trend: `+${summary.unauthorized} today`,
        color: "red",
        badge: { text: "Critical", color: "red" },
      },
      {
        label: "Blacklisted Vehicles",
        value: blacklisted.length.toString(),
        icon: "ShieldX",
        trend: `${blacklisted.length} active`,
        color: "red",
        badge: null,
      },
      {
        label: "Security Alerts",
        value: summary.security.toString(),
        icon: "CarFront",
        trend: `+${summary.security} today`,
        color: "amber",
        badge: { text: "Warning", color: "amber" },
      },
    ]

    return NextResponse.json({
      success: true,
      data: {
        alerts: transformedAlerts,
        timeline,
        blacklisted,
        summary: summaryStats,
      },
    })
  } catch (error) {
    console.error("[alerts] Error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch alerts" },
      { status: 500 }
    )
  }
}

// Helper function to get relative time
function getRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMinutes = Math.floor(diffMs / (1000 * 60))

  if (diffMinutes < 1) return "Just now"
  if (diffMinutes < 60) return `${diffMinutes} min ago`

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`

  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`
}
