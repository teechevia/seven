"use client"

import { useState, useEffect } from "react"
import { ParkingSidebar } from "@/components/parking-sidebar"
import {
  Car,
  ParkingCircle,
  CircleCheck,
  ShieldAlert,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  TrendingUp,
  Zap,
  MapPin,
  Activity,
  User,
  Eye,
  Loader2,
} from "lucide-react"
import Image from "next/image"
import type { VehicleEntry, Alert, ParkingSlot, VehicleType, ZoneCapacity, HourlyUsage, DashboardStats } from "@/lib/fake-data"

const slotColors: Record<string, string> = {
  available: "bg-lime-500 shadow-lime-500/50 shadow-lg",
  occupied: "bg-zinc-600/80",
  reserved: "bg-amber-500 shadow-amber-500/50 shadow-lg",
  faculty: "bg-sky-500 shadow-sky-500/50 shadow-lg",
}

const slotLabels = [
  { type: "available", label: "Available", color: "bg-lime-500", textColor: "text-lime-400" },
  { type: "occupied", label: "Occupied", color: "bg-zinc-600", textColor: "text-zinc-400" },
  { type: "reserved", label: "Reserved", color: "bg-amber-500", textColor: "text-amber-400" },
  { type: "faculty", label: "Faculty", color: "bg-sky-500", textColor: "text-sky-400" },
]

export default function Page() {
  const [isLoading, setIsLoading] = useState(true)
  const [recentEntries, setRecentEntries] = useState<VehicleEntry[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null)
  const [vehicleTypesData, setVehicleTypesData] = useState<VehicleType[]>([])
  const [hourlyUsageData, setHourlyUsageData] = useState<HourlyUsage[]>([])
  const [zoneCapacityData, setZoneCapacityData] = useState<ZoneCapacity[]>([])
  const [parkingZones, setParkingZones] = useState<Record<string, ParkingSlot[]>>({})

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch recent entries, stats, and other data
        const [entriesRes, alertsRes, slotsRes] = await Promise.all([
          fetch("/api/recent-entries"),
          fetch("/api/alerts"),
          fetch("/api/parking-slots"),
        ])

        const entriesData = await entriesRes.json()
        const alertsData = await alertsRes.json()
        const slotsData = await slotsRes.json()

        if (entriesData.success) {
          setRecentEntries(entriesData.data.entries)
          setDashboardStats(entriesData.data.stats)
          setVehicleTypesData(entriesData.data.vehicleTypes)
          setHourlyUsageData(entriesData.data.hourlyUsage)
          setZoneCapacityData(entriesData.data.zoneCapacity)
        }

        if (alertsData.success) {
          setAlerts(alertsData.data.alerts.slice(0, 3))
        }

        if (slotsData.success) {
          setParkingZones(slotsData.data.zones)
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  // Derive computed values from state
  const stats = dashboardStats ? [
    {
      label: "Total Slots",
      value: dashboardStats.totalSlots.toString(),
      icon: ParkingCircle,
      trend: null,
      color: "lime",
      badge: null,
    },
    {
      label: "Occupied Slots",
      value: dashboardStats.occupiedSlots.toString(),
      icon: Car,
      trend: "+12",
      color: "lime",
      badge: { text: "Live", color: "lime" },
    },
    {
      label: "Free Slots",
      value: dashboardStats.freeSlots.toString(),
      icon: CircleCheck,
      trend: "-8",
      color: "lime",
      badge: null,
    },
    {
      label: "Unauthorized",
      value: dashboardStats.unauthorizedCount.toString(),
      icon: ShieldAlert,
      trend: "+2",
      color: "red",
      badge: { text: "Alert", color: "red" },
    },
  ] : []

  // Use first 3 zones for preview
  const parkingSlots = {
    A: parkingZones.A?.slice(0, 6) || [],
    B: parkingZones.B?.slice(0, 6) || [],
    C: parkingZones.C?.slice(0, 6) || [],
  }

  // Transform hourly usage data for chart
  const usageData = hourlyUsageData.filter((_, i) => i % 2 === 0).map(d => ({ hour: d.hour.replace(" ", ""), usage: d.usage }))

  const vehicleTypes = vehicleTypesData.slice(0, 4)

  const liveMapZones = zoneCapacityData.slice(0, 4).map(z => ({
    id: z.id,
    name: z.name,
    capacity: z.capacity,
    occupied: z.occupied,
  }))

  const maxUsage = usageData.length > 0 ? Math.max(...usageData.map((d) => d.usage)) : 100
  const totalVehicles = vehicleTypes.reduce((acc, v) => acc + v.count, 0)
  const occupancyRate = dashboardStats?.occupancyRate || 75

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-lime-400" />
          <span className="text-zinc-400">Loading dashboard...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-zinc-950">
      {/* Ambient background effects */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full bg-lime-500/10 blur-[150px]" />
        <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-lime-500/5 blur-[120px]" />
        <div className="absolute left-1/2 top-1/3 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-lime-500/5 blur-[100px]" />
        <div className="absolute right-1/4 top-1/4 h-72 w-72 rounded-full bg-sky-500/5 blur-[80px]" />
        <div className="absolute bottom-1/4 left-1/4 h-64 w-64 rounded-full bg-amber-500/5 blur-[60px]" />
      </div>

      {/* Sidebar */}
      <ParkingSidebar />

      {/* Main Content Area */}
      <main className="relative flex-1 overflow-auto p-5 sm:p-8 lg:p-10">
        {/* Hero Section - Larger and More Premium */}
        <div className="relative mb-12 overflow-hidden rounded-[2.25rem] border border-white/10 bg-gradient-to-br from-zinc-900/90 via-zinc-900/70 to-zinc-800/50 p-10 backdrop-blur-3xl lg:p-14">
          {/* Decorative glow behind hero */}
          <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-lime-500/20 blur-[100px]" />
          <div className="absolute -bottom-10 left-1/4 h-60 w-60 rounded-full bg-lime-500/10 blur-[80px]" />

          <div className="relative flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
            {/* Left Content */}
            <div className="space-y-6 lg:max-w-xl">
              {/* Status badges */}
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2.5 rounded-full border border-lime-500/40 bg-lime-500/15 px-5 py-2.5 text-sm font-semibold text-lime-400 shadow-xl shadow-lime-500/20">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-lime-400 opacity-75" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-lime-400" />
                  </span>
                  Live Monitoring
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-sky-500/40 bg-sky-500/15 px-5 py-2.5 text-sm font-semibold text-sky-400 shadow-xl shadow-sky-500/20">
                  <Activity className="h-4 w-4" />
                  System Online
                </span>
              </div>

              {/* Title */}
              <div>
                <h1 className="bg-gradient-to-r from-white via-zinc-100 to-zinc-300 bg-clip-text text-5xl font-bold tracking-tight text-transparent lg:text-6xl">
                  Smart Parking
                </h1>
                <h2 className="mt-2 bg-gradient-to-r from-lime-400 to-lime-300 bg-clip-text text-5xl font-bold tracking-tight text-transparent lg:text-6xl">
                  Dashboard
                </h2>
              </div>

              <p className="max-w-lg text-lg leading-relaxed text-zinc-400">
                Real-time parking management powered by AI. Track vehicles, optimize space utilization, and receive intelligent alerts instantly.
              </p>

              {/* Quick Stats Row */}
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-zinc-800/60 px-6 py-4 backdrop-blur-2xl transition-all duration-500 hover:-translate-y-1 hover:border-lime-500/30 hover:shadow-2xl hover:shadow-lime-500/10">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-lime-500/20 shadow-xl shadow-lime-500/30">
                    <Zap className="h-7 w-7 text-lime-400" />
                  </div>
                  <div>
                    <div className="text-4xl font-bold text-white">{occupancyRate}%</div>
                    <div className="text-sm font-medium text-zinc-500">Current Occupancy</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-zinc-800/60 px-6 py-4 backdrop-blur-2xl transition-all duration-500 hover:-translate-y-1 hover:border-sky-500/30 hover:shadow-2xl hover:shadow-sky-500/10">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-500/20 shadow-xl shadow-sky-500/30">
                    <TrendingUp className="h-7 w-7 text-sky-400" />
                  </div>
                  <div>
                    <div className="text-4xl font-bold text-white">+18%</div>
                    <div className="text-sm font-medium text-zinc-500">vs Last Week</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Parking Image */}
            <div className="relative flex-shrink-0 lg:w-[420px]">
              <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-zinc-800/40 shadow-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?w=800&h=600&fit=crop"
                  alt="Modern parking facility"
                  width={800}
                  height={600}
                  className="h-72 w-full object-cover opacity-80 transition-all duration-700 hover:scale-105 hover:opacity-100 lg:h-80"
                />
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/80 via-transparent to-transparent" />
                {/* Overlay badge */}
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                  <span className="rounded-full bg-zinc-900/80 px-4 py-2 text-sm font-medium text-white backdrop-blur-xl">
                    Level B2 - Main Entrance
                  </span>
                  <span className="flex items-center gap-2 rounded-full border border-lime-500/40 bg-lime-500/20 px-4 py-2 text-sm font-semibold text-lime-400 backdrop-blur-xl shadow-lg shadow-lime-500/20">
                    <Eye className="h-4 w-4" />
                    Live Feed
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mb-12 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon
            const isRed = stat.color === "red"
            return (
              <div
                key={stat.label}
                className="group relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-zinc-900/60 p-8 backdrop-blur-3xl transition-all duration-500 hover:-translate-y-2 hover:border-white/20 hover:bg-zinc-900/80 hover:shadow-2xl hover:shadow-lime-500/10"
              >
                {/* Glow effect */}
                <div
                  className={`absolute -right-12 -top-12 h-40 w-40 rounded-full blur-[60px] transition-all duration-500 group-hover:scale-150 ${
                    isRed ? "bg-red-500/25" : "bg-lime-500/25"
                  }`}
                />

                <div className="relative">
                  <div className="mb-6 flex items-center justify-between">
                    <div
                      className={`flex h-16 w-16 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110 ${
                        isRed
                          ? "bg-red-500/15 text-red-400 shadow-xl shadow-red-500/30"
                          : "bg-lime-500/15 text-lime-400 shadow-xl shadow-lime-500/30"
                      }`}
                    >
                      <Icon className="h-8 w-8" />
                    </div>
                    <div className="flex items-center gap-2">
                      {stat.badge && (
                        <span
                          className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold ${
                            stat.badge.color === "lime"
                              ? "border border-lime-500/40 bg-lime-500/20 text-lime-400 shadow-lg shadow-lime-500/20"
                              : "border border-red-500/40 bg-red-500/20 text-red-400 shadow-lg shadow-red-500/20"
                          }`}
                        >
                          <span className="relative flex h-2 w-2">
                            <span
                              className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${
                                stat.badge.color === "lime" ? "bg-lime-400" : "bg-red-400"
                              }`}
                            />
                            <span
                              className={`relative inline-flex h-2 w-2 rounded-full ${
                                stat.badge.color === "lime" ? "bg-lime-400" : "bg-red-400"
                              }`}
                            />
                          </span>
                          {stat.badge.text}
                        </span>
                      )}
                      {stat.trend && (
                        <span
                          className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold ${
                            stat.trend.startsWith("+")
                              ? isRed
                                ? "bg-red-500/15 text-red-400"
                                : "bg-lime-500/15 text-lime-400"
                              : "bg-zinc-700/50 text-zinc-400"
                          }`}
                        >
                          {stat.trend}
                          <ArrowUpRight
                            className={`h-3 w-3 ${stat.trend.startsWith("-") ? "rotate-90" : ""}`}
                          />
                        </span>
                      )}
                    </div>
                  </div>
                  <div
                    className={`text-6xl font-bold tracking-tight ${isRed ? "text-red-400" : "text-white"}`}
                  >
                    {stat.value}
                  </div>
                  <div className="mt-2 text-base font-medium text-zinc-500">{stat.label}</div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Charts and Live Slot Preview Row */}
        <div className="mb-12 grid grid-cols-1 gap-8 xl:grid-cols-3">
          {/* Parking Usage Chart */}
          <div className="group relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-zinc-900/60 p-8 backdrop-blur-3xl transition-all duration-500 hover:border-white/20 hover:shadow-2xl hover:shadow-lime-500/10 xl:col-span-2">
            <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-lime-500/15 blur-[80px] transition-all duration-500 group-hover:scale-125" />

            <div className="relative mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Parking Usage Today</h2>
                <p className="mt-1 text-sm text-zinc-500">Hourly occupancy breakdown</p>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full border border-lime-500/40 bg-lime-500/15 px-4 py-2 text-sm font-semibold text-lime-400 shadow-lg shadow-lime-500/20">
                <TrendingUp className="h-4 w-4" />
                Peak at 12PM
              </span>
            </div>
            <div className="relative flex h-64 items-end gap-4">
              {usageData.map((data, index) => (
                <div key={index} className="group/bar flex flex-1 flex-col items-center gap-3">
                  <span className="text-sm font-bold text-lime-400 opacity-0 transition-all duration-300 group-hover/bar:opacity-100">
                    {data.usage}%
                  </span>
                  <div
                    className="w-full rounded-2xl bg-gradient-to-t from-lime-600 to-lime-400 shadow-xl shadow-lime-500/30 transition-all duration-500 group-hover/bar:-translate-y-2 group-hover/bar:shadow-lime-500/50"
                    style={{ height: `${(data.usage / maxUsage) * 100}%` }}
                  />
                  <span className="text-sm font-medium text-zinc-500">{data.hour}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Live Parking Slot Preview */}
          <div className="group relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-zinc-900/60 p-8 backdrop-blur-3xl transition-all duration-500 hover:border-white/20 hover:shadow-2xl hover:shadow-lime-500/10">
            <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-lime-500/20 blur-[60px] transition-all duration-500 group-hover:scale-125" />

            <div className="relative mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Live Slot Preview</h2>
                <p className="mt-1 text-sm text-zinc-500">Zone A - Ground Floor</p>
              </div>
              <span className="flex items-center gap-2 rounded-full border border-lime-500/40 bg-lime-500/20 px-4 py-2 text-xs font-bold text-lime-400 shadow-lg shadow-lime-500/20">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-lime-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-lime-400" />
                </span>
                Live
              </span>
            </div>

            {/* Slot Grid */}
            <div className="relative space-y-4">
              {Object.entries(parkingSlots).map(([row, slots]) => (
                <div key={row} className="flex items-center gap-3">
                  <span className="w-6 text-center text-sm font-bold text-zinc-500">{row}</span>
                  <div className="flex flex-1 gap-2">
                    {slots.map((slot) => (
                      <div
                        key={slot.id}
                        className={`group/slot relative h-12 flex-1 cursor-pointer rounded-xl transition-all duration-300 hover:-translate-y-1 hover:scale-105 ${slotColors[slot.status]}`}
                        title={`${slot.id} - ${slot.status.charAt(0).toUpperCase() + slot.status.slice(1)}`}
                      >
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className={`text-xs font-bold ${slot.status === "occupied" ? "text-zinc-500" : "text-zinc-900/70"}`}>
                            {slot.id}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="mt-6 flex flex-wrap gap-3">
              {slotLabels.map((item) => (
                <div key={item.type} className="flex items-center gap-2">
                  <div className={`h-3 w-3 rounded-md ${item.color}`} />
                  <span className="text-xs text-zinc-500">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Entries Table and Alerts Row */}
        <div className="mb-12 grid grid-cols-1 gap-8 xl:grid-cols-2">
          {/* Recent Entries Table */}
          <div className="group relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-zinc-900/60 p-8 backdrop-blur-3xl transition-all duration-500 hover:border-white/20 hover:shadow-2xl hover:shadow-lime-500/10">
            <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-lime-500/15 blur-[80px] transition-all duration-500 group-hover:scale-125" />

            <div className="relative mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Recent Vehicle Entries</h2>
                <p className="mt-1 text-sm text-zinc-500">Latest check-ins today</p>
              </div>
              <button className="flex items-center gap-2 rounded-full border border-lime-500/40 bg-lime-500/15 px-5 py-2.5 text-sm font-semibold text-lime-400 transition-all duration-300 hover:bg-lime-500/25 hover:shadow-lg hover:shadow-lime-500/20">
                View All
                <ArrowUpRight className="h-4 w-4" />
              </button>
            </div>

            {/* Table */}
            <div className="relative overflow-hidden rounded-2xl border border-white/5">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5 bg-zinc-800/50">
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Vehicle</th>
                    <th className="hidden px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 sm:table-cell">Owner</th>
                    <th className="hidden px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 md:table-cell">Type</th>
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Time</th>
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Slot</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {recentEntries.map((entry, index) => (
                    <tr
                      key={index}
                      className="group/row transition-all duration-300 hover:bg-zinc-800/50"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime-500/15 text-lime-400 transition-transform duration-300 group-hover/row:scale-110">
                            <Car className="h-5 w-5" />
                          </div>
                          <span className="font-semibold text-white">{entry.vehicleNo}</span>
                        </div>
                      </td>
                      <td className="hidden px-5 py-4 sm:table-cell">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-zinc-500" />
                          <span className="text-zinc-400">{entry.owner}</span>
                        </div>
                      </td>
                      <td className="hidden px-5 py-4 md:table-cell">
                        <span className="rounded-full bg-zinc-800 px-3 py-1 text-sm text-zinc-400">
                          {entry.type}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 text-zinc-400">
                          <Clock className="h-4 w-4" />
                          {entry.time}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="rounded-lg border border-lime-500/30 bg-lime-500/15 px-3 py-1.5 text-sm font-bold text-lime-400 shadow-md shadow-lime-500/10">
                          {entry.slot}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Latest Alerts */}
          <div className="group relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-zinc-900/60 p-8 backdrop-blur-3xl transition-all duration-500 hover:border-white/20 hover:shadow-2xl hover:shadow-lime-500/10">
            <div className="absolute -left-16 -top-16 h-48 w-48 rounded-full bg-red-500/15 blur-[80px] transition-all duration-500 group-hover:scale-125" />

            <div className="relative mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Latest Alerts</h2>
                <p className="mt-1 text-sm text-zinc-500">Requires immediate attention</p>
              </div>
              <span className="flex items-center gap-2 rounded-full border border-red-500/40 bg-red-500/20 px-4 py-2 text-sm font-bold text-red-400 shadow-lg shadow-red-500/20">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-red-400" />
                </span>
                {alerts.length} Active
              </span>
            </div>

            <div className="relative space-y-5">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="group/alert relative overflow-hidden rounded-2xl border border-red-500/30 bg-gradient-to-br from-red-500/10 to-red-500/5 p-6 transition-all duration-500 hover:-translate-y-1 hover:border-red-500/50 hover:shadow-2xl hover:shadow-red-500/20"
                >
                  {/* Red glow */}
                  <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-red-500/30 blur-[50px]" />

                  <div className="relative flex items-start gap-4">
                    <div
                      className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl transition-transform duration-300 group-hover/alert:scale-110 ${
                        alert.severity === "critical"
                          ? "bg-red-500/25 text-red-400 shadow-xl shadow-red-500/30"
                          : "bg-amber-500/25 text-amber-400 shadow-xl shadow-amber-500/30"
                      }`}
                    >
                      <AlertTriangle className="h-7 w-7" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-white">{alert.title}</span>
                        {alert.severity === "critical" && (
                          <span className="flex items-center gap-1.5 rounded-full border border-red-500/40 bg-red-500/20 px-3 py-1 text-xs font-bold text-red-400 shadow-md shadow-red-500/20">
                            <span className="relative flex h-1.5 w-1.5">
                              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-red-400" />
                            </span>
                            Critical
                          </span>
                        )}
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                        {alert.description}
                      </p>
                      <div className="mt-3 flex items-center gap-2 text-sm text-zinc-500">
                        <Clock className="h-4 w-4" />
                        {alert.time}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Row - Occupancy Progress, Vehicle Type Chart, Mini Live Map */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Parking Occupancy Progress Ring */}
          <div className="group relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-zinc-900/60 p-8 backdrop-blur-3xl transition-all duration-500 hover:border-white/20 hover:shadow-2xl hover:shadow-lime-500/10">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-lime-500/20 blur-[60px] transition-all duration-500 group-hover:scale-125" />

            <div className="relative mb-6">
              <h2 className="text-xl font-bold text-white">Occupancy Rate</h2>
              <p className="mt-1 text-sm text-zinc-500">Real-time facility usage</p>
            </div>

            {/* Progress Ring */}
            <div className="relative mx-auto mb-8 h-52 w-52">
              <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                {/* Background circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="#27272a"
                  strokeWidth="8"
                />
                {/* Progress circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="url(#occupancyGradient)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${occupancyRate * 2.64} 264`}
                  className="transition-all duration-1000"
                  style={{ filter: "drop-shadow(0 0 12px #84cc16)" }}
                />
                <defs>
                  <linearGradient id="occupancyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#84cc16" />
                    <stop offset="100%" stopColor="#a3e635" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-bold text-white">{occupancyRate}%</span>
                <span className="mt-1 text-sm text-zinc-500">Occupied</span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-white/5 bg-zinc-800/40 p-4 text-center transition-all duration-300 hover:border-lime-500/20 hover:bg-zinc-800/60">
                <div className="text-2xl font-bold text-lime-400">186</div>
                <div className="text-xs text-zinc-500">In Use</div>
              </div>
              <div className="rounded-2xl border border-white/5 bg-zinc-800/40 p-4 text-center transition-all duration-300 hover:border-lime-500/20 hover:bg-zinc-800/60">
                <div className="text-2xl font-bold text-zinc-400">62</div>
                <div className="text-xs text-zinc-500">Available</div>
              </div>
            </div>
          </div>

          {/* Vehicle Type Chart */}
          <div className="group relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-zinc-900/60 p-8 backdrop-blur-3xl transition-all duration-500 hover:border-white/20 hover:shadow-2xl hover:shadow-lime-500/10">
            <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-sky-500/15 blur-[60px] transition-all duration-500 group-hover:scale-125" />

            <div className="relative mb-6">
              <h2 className="text-xl font-bold text-white">Vehicle Distribution</h2>
              <p className="mt-1 text-sm text-zinc-500">By category</p>
            </div>

            {/* Donut Chart */}
            <div className="relative mx-auto mb-6 h-44 w-44">
              <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                {(() => {
                  let offset = 0
                  return vehicleTypes.map((vehicle) => {
                    const circumference = 2 * Math.PI * 35
                    const strokeDash = (vehicle.percentage / 100) * circumference
                    const strokeOffset = offset
                    offset += strokeDash
                    return (
                      <circle
                        key={vehicle.type}
                        cx="50"
                        cy="50"
                        r="35"
                        fill="none"
                        stroke={vehicle.color}
                        strokeWidth="12"
                        strokeDasharray={`${strokeDash} ${circumference}`}
                        strokeDashoffset={-strokeOffset}
                        className="transition-all duration-500 hover:opacity-80"
                        style={{ filter: `drop-shadow(0 0 8px ${vehicle.color}50)` }}
                      />
                    )
                  })
                })()}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-white">{totalVehicles}</span>
                <span className="text-xs text-zinc-500">Total</span>
              </div>
            </div>

            {/* Legend */}
            <div className="space-y-3">
              {vehicleTypes.map((vehicle) => (
                <div
                  key={vehicle.type}
                  className="flex items-center justify-between rounded-xl border border-white/5 bg-zinc-800/40 px-4 py-3 transition-all duration-300 hover:border-white/10 hover:bg-zinc-800/60"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="h-3 w-3 rounded-full shadow-lg"
                      style={{ backgroundColor: vehicle.color, boxShadow: `0 0 8px ${vehicle.color}50` }}
                    />
                    <span className="text-sm text-zinc-300">{vehicle.type}</span>
                  </div>
                  <span className="text-sm font-bold text-white">{vehicle.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Mini Live Map */}
          <div className="group relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-zinc-900/60 p-8 backdrop-blur-3xl transition-all duration-500 hover:border-white/20 hover:shadow-2xl hover:shadow-lime-500/10">
            <div className="absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-amber-500/15 blur-[60px] transition-all duration-500 group-hover:scale-125" />

            <div className="relative mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Live Zone Map</h2>
                <p className="mt-1 text-sm text-zinc-500">Floor B2 Overview</p>
              </div>
              <span className="flex items-center gap-2 rounded-full border border-lime-500/40 bg-lime-500/20 px-3 py-1.5 text-xs font-bold text-lime-400 shadow-lg shadow-lime-500/20">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-lime-400 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-lime-400" />
                </span>
                Live
              </span>
            </div>

            {/* Map Grid */}
            <div className="relative mb-6 grid grid-cols-2 gap-4">
              {liveMapZones.map((zone) => {
                const percentage = (zone.occupied / zone.capacity) * 100
                const isHigh = percentage > 80
                const isMedium = percentage > 60 && percentage <= 80
                return (
                  <div
                    key={zone.id}
                    className={`group/zone relative flex flex-col items-center justify-center rounded-2xl border p-5 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl ${
                      isHigh
                        ? "border-red-500/30 bg-red-500/10 hover:border-red-500/50 hover:shadow-red-500/20"
                        : isMedium
                          ? "border-amber-500/30 bg-amber-500/10 hover:border-amber-500/50 hover:shadow-amber-500/20"
                          : "border-lime-500/30 bg-lime-500/10 hover:border-lime-500/50 hover:shadow-lime-500/20"
                    }`}
                  >
                    <div
                      className={`mb-2 flex h-10 w-10 items-center justify-center rounded-xl ${
                        isHigh ? "bg-red-500/25" : isMedium ? "bg-amber-500/25" : "bg-lime-500/25"
                      }`}
                    >
                      <MapPin
                        className={`h-5 w-5 ${
                          isHigh ? "text-red-400" : isMedium ? "text-amber-400" : "text-lime-400"
                        }`}
                      />
                    </div>
                    <span className="text-lg font-bold text-white">Zone {zone.id}</span>
                    <span className="text-sm text-zinc-500">
                      {zone.occupied}/{zone.capacity}
                    </span>
                    {/* Mini progress bar */}
                    <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-zinc-700">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isHigh ? "bg-red-500" : isMedium ? "bg-amber-500" : "bg-lime-500"
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-5">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-lime-500 shadow-lg shadow-lime-500/40" />
                <span className="text-xs text-zinc-400">{"< 60%"}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-amber-500 shadow-lg shadow-amber-500/40" />
                <span className="text-xs text-zinc-400">60-80%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-red-500 shadow-lg shadow-red-500/40" />
                <span className="text-xs text-zinc-400">{"> 80%"}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
