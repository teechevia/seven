"use client"

import { useState, useEffect } from "react"
import { ParkingSidebar } from "@/components/parking-sidebar"
import {
  Bell,
  ShieldAlert,
  ShieldX,
  CarFront,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  AlertOctagon,
  Info,
  Activity,
  Eye,
  MoreHorizontal,
  RefreshCw,
  Filter,
  Loader2,
} from "lucide-react"

interface AlertItem {
  id: number
  vehicleNo: string
  alertType: string
  time: string
  severity: "critical" | "warning" | "info"
  status: string
  location: string
}

interface TimelineEvent {
  id: number
  event: string
  time: string
  type: string
}

interface BlacklistedVehicle {
  id: number
  vehicleNo: string
  owner: string
  reason: string
  addedDate: string
  status: string
}

interface SummaryStat {
  label: string
  value: string
  icon: typeof Bell
  trend: string
  color: string
  badge: { text: string; color: string } | null
}

const severityConfig = {
  critical: {
    bg: "bg-red-500/15",
    border: "border-red-500/30",
    text: "text-red-400",
    glow: "shadow-red-500/20",
    icon: AlertOctagon,
    badge: "bg-red-500/20 text-red-400 border-red-500/40",
  },
  warning: {
    bg: "bg-amber-500/15",
    border: "border-amber-500/30",
    text: "text-amber-400",
    glow: "shadow-amber-500/20",
    icon: AlertTriangle,
    badge: "bg-amber-500/20 text-amber-400 border-amber-500/40",
  },
  info: {
    bg: "bg-sky-500/15",
    border: "border-sky-500/30",
    text: "text-sky-400",
    glow: "shadow-sky-500/20",
    icon: Info,
    badge: "bg-sky-500/20 text-sky-400 border-sky-500/40",
  },
}

const statusConfig = {
  active: {
    bg: "bg-red-500/20",
    text: "text-red-400",
    border: "border-red-500/40",
    dot: "bg-red-500",
  },
  resolved: {
    bg: "bg-lime-500/20",
    text: "text-lime-400",
    border: "border-lime-500/40",
    dot: "bg-lime-500",
  },
}

export default function AlertsPage() {
  const [alertsList, setAlertsList] = useState<AlertItem[]>([])
  const [recentTimeline, setRecentTimeline] = useState<TimelineEvent[]>([])
  const [blacklistedVehicles, setBlacklistedVehicles] = useState<BlacklistedVehicle[]>([])
  const [summaryStats, setSummaryStats] = useState<SummaryStat[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const response = await fetch("/api/alerts")
        const result = await response.json()
        if (result.success) {
          // Transform alerts for the list
          const transformedAlerts = result.data.alerts.map((alert: { id: number; vehicleNo?: string; title: string; time: string; severity: string; status: string; location?: string }) => ({
            id: alert.id,
            vehicleNo: alert.vehicleNo || "System",
            alertType: alert.title,
            time: alert.time,
            severity: alert.severity === "critical" ? "critical" : alert.severity === "warning" ? "warning" : "info",
            status: alert.status,
            location: alert.location || "Unknown",
          }))
          setAlertsList(transformedAlerts)
          setRecentTimeline(result.data.timeline)
          
          // Transform blacklisted vehicles
          const transformedBlacklisted = result.data.blacklisted.slice(0, 5).map((v: { vehicleNo: string; owner: string; reason: string; addedOn: string; status: string }, i: number) => ({
            id: i + 1,
            vehicleNo: v.vehicleNo,
            owner: v.owner,
            reason: v.reason.split(" ").slice(0, 3).join(" "),
            addedDate: v.addedOn,
            status: v.status === "active" ? "active" : "inactive",
          }))
          setBlacklistedVehicles(transformedBlacklisted)
          
          // Transform summary stats
          const transformedStats = result.data.summary.map((stat: { label: string; value: string; icon: string; trend: string; color: string; badge: { text: string; color: string } | null }) => ({
            ...stat,
            icon: stat.icon === "Bell" ? Bell : stat.icon === "ShieldAlert" ? ShieldAlert : stat.icon === "ShieldX" ? ShieldX : CarFront,
          }))
          setSummaryStats(transformedStats)
        }
      } catch (error) {
        console.error("Error fetching alerts:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchAlerts()
  }, [])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-lime-400" />
          <span className="text-zinc-400">Loading alerts...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-zinc-950">
      {/* Ambient background effects */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 top-0 h-[500px] w-[500px] rounded-full bg-lime-500/5 blur-[120px]" />
        <div className="absolute -right-40 top-1/3 h-[400px] w-[400px] rounded-full bg-red-500/5 blur-[100px]" />
        <div className="absolute bottom-0 left-1/3 h-[300px] w-[300px] rounded-full bg-amber-500/5 blur-[80px]" />
      </div>

      {/* Sidebar */}
      <ParkingSidebar />

      {/* Main Content */}
      <main className="relative flex-1 overflow-auto p-6 lg:p-10">
        <div className="mx-auto max-w-[1600px] space-y-10">
          {/* Header */}
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-4xl font-bold tracking-tight text-white lg:text-5xl">
                  Security{" "}
                  <span className="bg-gradient-to-r from-red-400 to-red-500 bg-clip-text text-transparent">
                    Alerts
                  </span>
                </h1>
                <span className="flex items-center gap-1.5 rounded-full border border-red-500/40 bg-red-500/20 px-3 py-1 text-xs font-medium text-red-400">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
                  12 Active
                </span>
              </div>
              <p className="text-lg text-zinc-400">
                Real-time security monitoring and alert management
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 rounded-2xl border border-white/10 bg-zinc-900/60 px-5 py-3 text-sm font-medium text-zinc-300 backdrop-blur-xl transition-all duration-300 hover:border-white/20 hover:bg-zinc-800/60">
                <Filter className="h-4 w-4" />
                Filter
              </button>
              <button className="flex items-center gap-2 rounded-2xl border border-lime-500/40 bg-lime-500/20 px-5 py-3 text-sm font-medium text-lime-400 backdrop-blur-xl transition-all duration-300 hover:bg-lime-500/30">
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {summaryStats.map((stat, index) => {
              const Icon = stat.icon
              const isRed = stat.color === "red"
              const isAmber = stat.color === "amber"

              return (
                <div
                  key={index}
                  className={`group relative overflow-hidden rounded-[1.75rem] border bg-zinc-900/60 p-6 backdrop-blur-3xl transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl ${
                    isRed
                      ? "border-red-500/20 hover:border-red-500/40 hover:shadow-red-500/10"
                      : isAmber
                        ? "border-amber-500/20 hover:border-amber-500/40 hover:shadow-amber-500/10"
                        : "border-white/10 hover:border-lime-500/30 hover:shadow-lime-500/10"
                  }`}
                >
                  {/* Glow effect */}
                  <div
                    className={`absolute -right-8 -top-8 h-32 w-32 rounded-full blur-3xl transition-opacity duration-500 group-hover:opacity-100 ${
                      isRed
                        ? "bg-red-500/10 opacity-50"
                        : isAmber
                          ? "bg-amber-500/10 opacity-50"
                          : "bg-lime-500/10 opacity-0"
                    }`}
                  />

                  <div className="relative flex items-start justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-zinc-400">{stat.label}</p>
                        {stat.badge && (
                          <span
                            className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                              stat.badge.color === "red"
                                ? "border border-red-500/40 bg-red-500/20 text-red-400"
                                : stat.badge.color === "amber"
                                  ? "border border-amber-500/40 bg-amber-500/20 text-amber-400"
                                  : "border border-lime-500/40 bg-lime-500/20 text-lime-400"
                            }`}
                          >
                            <span
                              className={`h-1 w-1 animate-pulse rounded-full ${
                                stat.badge.color === "red"
                                  ? "bg-red-500"
                                  : stat.badge.color === "amber"
                                    ? "bg-amber-500"
                                    : "bg-lime-500"
                              }`}
                            />
                            {stat.badge.text}
                          </span>
                        )}
                      </div>
                      <p
                        className={`text-4xl font-bold tracking-tight ${
                          isRed ? "text-red-400" : isAmber ? "text-amber-400" : "text-white"
                        }`}
                      >
                        {stat.value}
                      </p>
                      <p className="text-xs text-zinc-500">{stat.trend}</p>
                    </div>
                    <div
                      className={`flex h-14 w-14 items-center justify-center rounded-2xl ${
                        isRed
                          ? "bg-red-500/15 text-red-400"
                          : isAmber
                            ? "bg-amber-500/15 text-amber-400"
                            : "bg-lime-500/15 text-lime-400"
                      }`}
                    >
                      <Icon className="h-7 w-7" />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
            {/* Alerts List - 2 columns */}
            <div className="xl:col-span-2">
              <div className="group relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-zinc-900/60 backdrop-blur-3xl transition-all duration-500 hover:border-white/20 hover:shadow-2xl hover:shadow-lime-500/5">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/10 p-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime-500/15">
                      <Bell className="h-5 w-5 text-lime-400" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-white">Alert History</h2>
                      <p className="text-sm text-zinc-500">Recent security events</p>
                    </div>
                  </div>
                  <button className="rounded-xl p-2 text-zinc-400 transition-colors hover:bg-white/5 hover:text-white">
                    <MoreHorizontal className="h-5 w-5" />
                  </button>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/5 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                        <th className="px-6 py-4">Vehicle</th>
                        <th className="px-6 py-4">Alert Type</th>
                        <th className="px-6 py-4">Location</th>
                        <th className="px-6 py-4">Time</th>
                        <th className="px-6 py-4">Severity</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {alertsList.map((alert) => {
                        const severity =
                          severityConfig[alert.severity as keyof typeof severityConfig]
                        const status = statusConfig[alert.status as keyof typeof statusConfig]
                        const SeverityIcon = severity.icon

                        return (
                          <tr
                            key={alert.id}
                            className="group/row border-b border-white/5 transition-colors hover:bg-white/5"
                          >
                            <td className="px-6 py-4">
                              <span className="font-mono text-sm font-medium text-white">
                                {alert.vehicleNo}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <SeverityIcon className={`h-4 w-4 ${severity.text}`} />
                                <span className="text-sm text-zinc-300">{alert.alertType}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm text-zinc-400">{alert.location}</span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-1.5 text-sm text-zinc-400">
                                <Clock className="h-3.5 w-3.5" />
                                {alert.time}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${severity.badge}`}
                              >
                                {alert.severity}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${status.bg} ${status.text} ${status.border}`}
                              >
                                <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                                {alert.status}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <button className="rounded-lg p-1.5 text-zinc-500 opacity-0 transition-all hover:bg-white/10 hover:text-white group-hover/row:opacity-100">
                                <Eye className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-8">
              {/* Recent Timeline */}
              <div className="group relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-zinc-900/60 p-6 backdrop-blur-3xl transition-all duration-500 hover:border-white/20 hover:shadow-2xl hover:shadow-lime-500/5">
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime-500/15">
                      <Activity className="h-5 w-5 text-lime-400" />
                    </div>
                    <h2 className="text-lg font-semibold text-white">Alert Timeline</h2>
                  </div>
                  <span className="flex items-center gap-1.5 rounded-full border border-lime-500/40 bg-lime-500/20 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-lime-400">
                    <span className="h-1 w-1 animate-pulse rounded-full bg-lime-500" />
                    Live
                  </span>
                </div>

                <div className="space-y-1">
                  {recentTimeline.map((event, index) => {
                    const isLast = index === recentTimeline.length - 1
                    const typeConfig = {
                      critical: {
                        dot: "bg-red-500",
                        line: "bg-red-500/30",
                        text: "text-red-400",
                      },
                      warning: {
                        dot: "bg-amber-500",
                        line: "bg-amber-500/30",
                        text: "text-amber-400",
                      },
                      info: {
                        dot: "bg-sky-500",
                        line: "bg-sky-500/30",
                        text: "text-sky-400",
                      },
                      resolved: {
                        dot: "bg-lime-500",
                        line: "bg-lime-500/30",
                        text: "text-lime-400",
                      },
                    }
                    const config = typeConfig[event.type as keyof typeof typeConfig]

                    return (
                      <div key={event.id} className="group/item relative flex gap-4 py-3">
                        {/* Timeline connector */}
                        <div className="flex flex-col items-center">
                          <div
                            className={`h-2.5 w-2.5 rounded-full ${config.dot} shadow-lg shadow-current`}
                          />
                          {!isLast && (
                            <div className={`h-full w-0.5 ${config.line}`} />
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 pb-2">
                          <p className="text-sm text-zinc-300 transition-colors group-hover/item:text-white">
                            {event.event}
                          </p>
                          <p className={`mt-1 text-xs ${config.text}`}>{event.time}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Blacklisted Vehicles */}
              <div className="group relative overflow-hidden rounded-[1.75rem] border border-red-500/20 bg-zinc-900/60 p-6 backdrop-blur-3xl transition-all duration-500 hover:border-red-500/40 hover:shadow-2xl hover:shadow-red-500/10">
                {/* Glow */}
                <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-red-500/10 blur-3xl" />

                <div className="relative mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/15">
                      <ShieldX className="h-5 w-5 text-red-400" />
                    </div>
                    <h2 className="text-lg font-semibold text-white">Blacklisted Vehicles</h2>
                  </div>
                  <span className="flex items-center gap-1.5 rounded-full border border-red-500/40 bg-red-500/20 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-red-400">
                    5 Total
                  </span>
                </div>

                <div className="relative space-y-3">
                  {blacklistedVehicles.slice(0, 4).map((vehicle) => (
                    <div
                      key={vehicle.id}
                      className="group/item flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 p-4 transition-all hover:border-red-500/30 hover:bg-red-500/5"
                    >
                      <div className="space-y-1">
                        <p className="font-mono text-sm font-semibold text-white">
                          {vehicle.vehicleNo}
                        </p>
                        <p className="text-xs text-zinc-500">{vehicle.reason}</p>
                      </div>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                          vehicle.status === "active"
                            ? "border border-red-500/40 bg-red-500/20 text-red-400"
                            : "border border-zinc-600 bg-zinc-700/50 text-zinc-400"
                        }`}
                      >
                        {vehicle.status}
                      </span>
                    </div>
                  ))}
                </div>

                <button className="mt-4 w-full rounded-xl border border-white/10 py-2.5 text-sm font-medium text-zinc-400 transition-all hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400">
                  View All Blacklisted
                </button>
              </div>
            </div>
          </div>

          {/* Critical Alerts Banner */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {alertsList
              .filter((a) => a.severity === "critical" && a.status === "active")
              .slice(0, 3)
              .map((alert) => (
                <div
                  key={alert.id}
                  className="group relative overflow-hidden rounded-[1.75rem] border border-red-500/30 bg-gradient-to-br from-red-500/10 to-red-600/5 p-6 backdrop-blur-3xl transition-all duration-500 hover:-translate-y-1 hover:border-red-500/50 hover:shadow-2xl hover:shadow-red-500/20"
                >
                  {/* Glow effect */}
                  <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-red-500/20 blur-2xl transition-all duration-500 group-hover:h-32 group-hover:w-32 group-hover:bg-red-500/30" />

                  <div className="relative">
                    <div className="mb-4 flex items-start justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/20">
                        <AlertOctagon className="h-6 w-6 text-red-400" />
                      </div>
                      <span className="flex items-center gap-1.5 rounded-full border border-red-500/40 bg-red-500/20 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-red-400">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
                        Critical
                      </span>
                    </div>

                    <h3 className="mb-2 text-lg font-semibold text-white">{alert.alertType}</h3>
                    <p className="mb-4 font-mono text-sm text-red-300">{alert.vehicleNo}</p>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-zinc-500">{alert.location}</span>
                      <span className="flex items-center gap-1 text-xs text-red-400">
                        <Clock className="h-3 w-3" />
                        {alert.time}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </main>
    </div>
  )
}
