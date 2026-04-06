"use client"

import { useState, useEffect } from "react"
import { ParkingSidebar } from "@/components/parking-sidebar"
import {
  Car,
  ParkingCircle,
  CircleCheck,
  ShieldAlert,
  MapPin,
  Clock,
  User,
  Layers,
  ChevronRight,
  Bookmark,
  GraduationCap,
  X,
  ArrowUpRight,
} from "lucide-react"

type SlotStatus = "available" | "occupied" | "reserved" | "faculty"

interface ParkingSlot {
  id: string
  status: SlotStatus
  vehicle?: {
    number: string
    owner: string
    type: string
    entryTime: string
  }
}

interface ZoneData {
  [key: string]: ParkingSlot[]
}

interface SlotSummary {
  total: number
  available: number
  occupied: number
  reserved: number
  faculty: number
}

const slotStyles: Record<SlotStatus, { bg: string; border: string; shadow: string; text: string; icon: string }> = {
  available: {
    bg: "bg-lime-500/20",
    border: "border-lime-500/50 hover:border-lime-400",
    shadow: "hover:shadow-lime-500/30",
    text: "text-lime-400",
    icon: "text-lime-400",
  },
  occupied: {
    bg: "bg-zinc-700/50",
    border: "border-zinc-600/50 hover:border-zinc-500",
    shadow: "hover:shadow-zinc-500/20",
    text: "text-zinc-400",
    icon: "text-zinc-400",
  },
  reserved: {
    bg: "bg-amber-500/20",
    border: "border-amber-500/50 hover:border-amber-400",
    shadow: "hover:shadow-amber-500/30",
    text: "text-amber-400",
    icon: "text-amber-400",
  },
  faculty: {
    bg: "bg-sky-500/20",
    border: "border-sky-500/50 hover:border-sky-400",
    shadow: "hover:shadow-sky-500/30",
    text: "text-sky-400",
    icon: "text-sky-400",
  },
}

const slotLabels = [
  { status: "available" as SlotStatus, label: "Available", color: "bg-lime-500", textColor: "text-lime-400" },
  { status: "occupied" as SlotStatus, label: "Occupied", color: "bg-zinc-600", textColor: "text-zinc-400" },
  { status: "reserved" as SlotStatus, label: "Reserved", color: "bg-amber-500", textColor: "text-amber-400" },
  { status: "faculty" as SlotStatus, label: "Faculty", color: "bg-sky-500", textColor: "text-sky-400" },
]

export default function ParkingLayoutPage() {
  const [selectedSlot, setSelectedSlot] = useState<ParkingSlot | null>(null)
  const [selectedZone, setSelectedZone] = useState<string>("all")
  const [parkingZones, setParkingZones] = useState<ZoneData>({})
  const [summary, setSummary] = useState<SlotSummary>({ total: 0, available: 0, occupied: 0, reserved: 0, faculty: 0 })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchParkingSlots = async () => {
      try {
        const response = await fetch("/api/parking-slots")
        const result = await response.json()
        if (result.success) {
          setParkingZones(result.data.zones)
          setSummary(result.data.summary)
        }
      } catch (error) {
        console.error("Error fetching parking slots:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchParkingSlots()
  }, [])

  const filteredZones = selectedZone === "all" ? parkingZones : { [selectedZone]: parkingZones[selectedZone] }

  const stats = [
    { label: "Total Slots", value: summary.total, icon: ParkingCircle, color: "lime" },
    { label: "Available", value: summary.available, icon: CircleCheck, color: "lime" },
    { label: "Occupied", value: summary.occupied, icon: Car, color: "zinc" },
    { label: "Reserved", value: summary.reserved, icon: Bookmark, color: "amber" },
    { label: "Faculty", value: summary.faculty, icon: GraduationCap, color: "sky" },
  ]

  const totalSlots = summary.total
  const slotCounts = {
    available: summary.available,
    occupied: summary.occupied,
    reserved: summary.reserved,
    faculty: summary.faculty,
  }

  return (
    <div className="flex min-h-screen bg-zinc-950">
      {/* Ambient background effects */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full bg-lime-500/10 blur-[150px]" />
        <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-lime-500/5 blur-[120px]" />
        <div className="absolute left-1/2 top-1/3 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-sky-500/5 blur-[100px]" />
        <div className="absolute right-1/4 top-2/3 h-72 w-72 rounded-full bg-amber-500/5 blur-[80px]" />
      </div>

      {/* Sidebar */}
      <ParkingSidebar />

      {/* Main Content */}
      <main className="relative flex-1 overflow-auto p-5 sm:p-8 lg:p-10">
        {/* Header Section */}
        <div className="mb-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-lime-500/40 bg-lime-500/15 px-4 py-2 text-sm font-semibold text-lime-400 shadow-lg shadow-lime-500/20">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-lime-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-lime-400" />
                  </span>
                  Live View
                </span>
                <span className="rounded-full border border-zinc-700 bg-zinc-800/60 px-4 py-2 text-sm font-medium text-zinc-400">
                  Level B2
                </span>
              </div>
              <h1 className="bg-gradient-to-r from-white via-zinc-100 to-zinc-300 bg-clip-text text-4xl font-bold tracking-tight text-transparent lg:text-5xl">
                Parking Layout
              </h1>
              <p className="mt-2 text-lg text-zinc-500">Interactive floor map with real-time slot availability</p>
            </div>

            {/* Zone Filter */}
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedZone("all")}
                className={`rounded-2xl border px-5 py-2.5 text-sm font-semibold transition-all duration-300 ${
                  selectedZone === "all"
                    ? "border-lime-500/50 bg-lime-500/20 text-lime-400 shadow-lg shadow-lime-500/20"
                    : "border-zinc-700 bg-zinc-800/60 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300"
                }`}
              >
                All Zones
              </button>
              {Object.keys(parkingZones).map((zone) => (
                <button
                  key={zone}
                  onClick={() => setSelectedZone(zone)}
                  className={`rounded-2xl border px-5 py-2.5 text-sm font-semibold transition-all duration-300 ${
                    selectedZone === zone
                      ? "border-lime-500/50 bg-lime-500/20 text-lime-400 shadow-lg shadow-lime-500/20"
                      : "border-zinc-700 bg-zinc-800/60 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300"
                  }`}
                >
                  Zone {zone}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Occupancy Summary Cards */}
        <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {stats.map((stat) => {
            const Icon = stat.icon
            const colorMap: Record<string, string> = {
              lime: "from-lime-500/20 to-lime-500/5 border-lime-500/30 shadow-lime-500/10",
              zinc: "from-zinc-600/20 to-zinc-600/5 border-zinc-600/30 shadow-zinc-500/10",
              amber: "from-amber-500/20 to-amber-500/5 border-amber-500/30 shadow-amber-500/10",
              sky: "from-sky-500/20 to-sky-500/5 border-sky-500/30 shadow-sky-500/10",
            }
            const iconColorMap: Record<string, string> = {
              lime: "bg-lime-500/20 text-lime-400 shadow-lime-500/30",
              zinc: "bg-zinc-600/30 text-zinc-400 shadow-zinc-500/20",
              amber: "bg-amber-500/20 text-amber-400 shadow-amber-500/30",
              sky: "bg-sky-500/20 text-sky-400 shadow-sky-500/30",
            }
            const textColorMap: Record<string, string> = {
              lime: "text-lime-400",
              zinc: "text-zinc-300",
              amber: "text-amber-400",
              sky: "text-sky-400",
            }

            return (
              <div
                key={stat.label}
                className={`group relative overflow-hidden rounded-[1.5rem] border bg-gradient-to-br p-5 backdrop-blur-3xl transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl ${colorMap[stat.color]}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl shadow-xl ${iconColorMap[stat.color]}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <div className={`text-3xl font-bold ${textColorMap[stat.color]}`}>{stat.value}</div>
                    <div className="text-sm font-medium text-zinc-500">{stat.label}</div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
          {/* Parking Grid */}
          <div className="xl:col-span-2">
            <div className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-900/60 p-8 backdrop-blur-3xl transition-all duration-500 hover:border-white/15 hover:shadow-2xl hover:shadow-lime-500/5">
              {/* Glow effect */}
              <div className="absolute -left-20 -top-20 h-60 w-60 rounded-full bg-lime-500/15 blur-[100px] transition-all duration-500 group-hover:scale-125" />

              <div className="relative mb-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-lime-500/20 shadow-xl shadow-lime-500/30">
                    <Layers className="h-7 w-7 text-lime-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Interactive Floor Map</h2>
                    <p className="text-sm text-zinc-500">Click on a slot to view details</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-full border border-lime-500/40 bg-lime-500/15 px-4 py-2 text-sm font-semibold text-lime-400 shadow-lg shadow-lime-500/20">
                  <MapPin className="h-4 w-4" />
                  Floor B2
                </div>
              </div>

              {/* Parking Grid */}
              <div className="relative space-y-6">
                {Object.entries(filteredZones).map(([zone, slots]) => (
                  <div key={zone} className="relative">
                    <div className="mb-3 flex items-center gap-3">
                      <span className="rounded-lg bg-zinc-800 px-3 py-1.5 text-sm font-bold text-lime-400">
                        Zone {zone}
                      </span>
                      <div className="h-px flex-1 bg-gradient-to-r from-zinc-700 to-transparent" />
                    </div>
                    <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
                      {slots.map((slot) => {
                        const styles = slotStyles[slot.status]
                        const isSelected = selectedSlot?.id === slot.id

                        return (
                          <button
                            key={slot.id}
                            onClick={() => setSelectedSlot(slot)}
                            className={`group/slot relative flex h-20 flex-col items-center justify-center rounded-2xl border-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${styles.bg} ${styles.border} ${styles.shadow} ${
                              isSelected ? "ring-2 ring-lime-400 ring-offset-2 ring-offset-zinc-900" : ""
                            }`}
                          >
                            {/* Slot ID */}
                            <span className={`text-lg font-bold ${styles.text}`}>{slot.id}</span>
                            {/* Status indicator */}
                            <span className={`mt-1 text-xs font-medium capitalize ${styles.text} opacity-70`}>
                              {slot.status === "available" ? "Free" : slot.status.slice(0, 3)}
                            </span>
                            {/* Car icon for occupied */}
                            {slot.status === "occupied" && (
                              <Car className={`absolute right-1.5 top-1.5 h-4 w-4 ${styles.icon} opacity-50`} />
                            )}
                            {slot.status === "reserved" && (
                              <Bookmark className={`absolute right-1.5 top-1.5 h-4 w-4 ${styles.icon} opacity-50`} />
                            )}
                            {slot.status === "faculty" && (
                              <GraduationCap className={`absolute right-1.5 top-1.5 h-4 w-4 ${styles.icon} opacity-50`} />
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}

                {/* Driveway */}
                <div className="mt-8 flex items-center gap-4">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-zinc-600 to-transparent" />
                  <span className="rounded-full border border-zinc-700 bg-zinc-800/80 px-6 py-2 text-sm font-medium text-zinc-500">
                    Main Driveway
                  </span>
                  <ChevronRight className="h-5 w-5 text-zinc-600" />
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-zinc-600 to-transparent" />
                </div>
              </div>

              {/* Legend */}
              <div className="mt-8 flex flex-wrap items-center gap-6 rounded-2xl border border-zinc-800 bg-zinc-800/40 p-4">
                {slotLabels.map((item) => (
                  <div key={item.status} className="flex items-center gap-2.5">
                    <div className={`h-4 w-4 rounded-md ${item.color}`} />
                    <span className={`text-sm font-medium ${item.textColor}`}>{item.label}</span>
                    <span className="rounded-full bg-zinc-700/50 px-2 py-0.5 text-xs font-semibold text-zinc-400">
                      {summary[item.status]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Slot Details Card */}
          <div className="xl:col-span-1">
            <div className="sticky top-10">
              <div className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-900/60 p-8 backdrop-blur-3xl transition-all duration-500 hover:border-white/15 hover:shadow-2xl hover:shadow-lime-500/5">
                {/* Glow effect */}
                <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-lime-500/15 blur-[80px] transition-all duration-500 group-hover:scale-125" />

                <div className="relative">
                  <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white">Slot Details</h2>
                    {selectedSlot && (
                      <button
                        onClick={() => setSelectedSlot(null)}
                        className="rounded-xl p-2 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-300"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    )}
                  </div>

                  {selectedSlot ? (
                    <div className="space-y-6">
                      {/* Slot ID Badge */}
                      <div className="flex items-center gap-4">
                        <div
                          className={`flex h-20 w-20 items-center justify-center rounded-2xl ${slotStyles[selectedSlot.status].bg} border-2 ${slotStyles[selectedSlot.status].border}`}
                        >
                          <span className={`text-3xl font-bold ${slotStyles[selectedSlot.status].text}`}>
                            {selectedSlot.id}
                          </span>
                        </div>
                        <div>
                          <div
                            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold capitalize ${slotStyles[selectedSlot.status].bg} ${slotStyles[selectedSlot.status].text}`}
                          >
                            <span className="relative flex h-2 w-2">
                              <span
                                className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${
                                  selectedSlot.status === "available"
                                    ? "bg-lime-400"
                                    : selectedSlot.status === "reserved"
                                      ? "bg-amber-400"
                                      : selectedSlot.status === "faculty"
                                        ? "bg-sky-400"
                                        : "bg-zinc-400"
                                }`}
                              />
                              <span
                                className={`relative inline-flex h-2 w-2 rounded-full ${
                                  selectedSlot.status === "available"
                                    ? "bg-lime-400"
                                    : selectedSlot.status === "reserved"
                                      ? "bg-amber-400"
                                      : selectedSlot.status === "faculty"
                                        ? "bg-sky-400"
                                        : "bg-zinc-400"
                                }`}
                              />
                            </span>
                            {selectedSlot.status}
                          </div>
                          <p className="mt-1 text-sm text-zinc-500">Zone {selectedSlot.id.charAt(0)} - Ground Floor</p>
                        </div>
                      </div>

                      {/* Vehicle Info */}
                      {selectedSlot.vehicle && selectedSlot.status !== "available" && (
                        <div className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-800/40 p-5">
                          <div className="flex items-center gap-3">
                            <Car className={`h-5 w-5 ${slotStyles[selectedSlot.status].icon}`} />
                            <span className="text-sm font-medium text-zinc-400">Vehicle Information</span>
                          </div>

                          <div className="space-y-3">
                            <div className="flex items-center justify-between rounded-xl bg-zinc-800/60 px-4 py-3">
                              <span className="text-sm text-zinc-500">Vehicle No.</span>
                              <span className="font-mono text-sm font-bold text-white">{selectedSlot.vehicle.number}</span>
                            </div>
                            <div className="flex items-center justify-between rounded-xl bg-zinc-800/60 px-4 py-3">
                              <span className="flex items-center gap-2 text-sm text-zinc-500">
                                <User className="h-4 w-4" /> Owner
                              </span>
                              <span className="text-sm font-semibold text-white">{selectedSlot.vehicle.owner}</span>
                            </div>
                            <div className="flex items-center justify-between rounded-xl bg-zinc-800/60 px-4 py-3">
                              <span className="text-sm text-zinc-500">Type</span>
                              <span className="text-sm font-semibold text-white">{selectedSlot.vehicle.type}</span>
                            </div>
                            <div className="flex items-center justify-between rounded-xl bg-zinc-800/60 px-4 py-3">
                              <span className="flex items-center gap-2 text-sm text-zinc-500">
                                <Clock className="h-4 w-4" /> Entry Time
                              </span>
                              <span className="text-sm font-semibold text-lime-400">{selectedSlot.vehicle.entryTime}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        {selectedSlot.status === "available" && (
                          <button className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-lime-500 to-lime-400 px-6 py-4 text-sm font-bold text-zinc-900 shadow-xl shadow-lime-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-lime-500/50">
                            Reserve Slot
                            <ArrowUpRight className="h-4 w-4" />
                          </button>
                        )}
                        {selectedSlot.status === "occupied" && (
                          <button className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-red-500/50 bg-red-500/20 px-6 py-4 text-sm font-bold text-red-400 transition-all duration-300 hover:-translate-y-1 hover:bg-red-500/30 hover:shadow-xl hover:shadow-red-500/20">
                            <ShieldAlert className="h-4 w-4" />
                            Report Issue
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl border border-dashed border-zinc-700 bg-zinc-800/40">
                        <MapPin className="h-10 w-10 text-zinc-600" />
                      </div>
                      <p className="text-lg font-medium text-zinc-400">No slot selected</p>
                      <p className="mt-1 text-sm text-zinc-600">Click on a parking slot to view its details</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="group relative overflow-hidden rounded-2xl border border-lime-500/30 bg-lime-500/10 p-5 backdrop-blur-3xl transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-lime-500/20">
                  <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-lime-500/20 blur-[40px] transition-all duration-500 group-hover:scale-150" />
                  <div className="relative">
                    <div className="text-3xl font-bold text-lime-400">
                      {Math.round((slotCounts.available / totalSlots) * 100)}%
                    </div>
                    <div className="text-sm font-medium text-lime-400/70">Availability</div>
                  </div>
                </div>
                <div className="group relative overflow-hidden rounded-2xl border border-sky-500/30 bg-sky-500/10 p-5 backdrop-blur-3xl transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-sky-500/20">
                  <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-sky-500/20 blur-[40px] transition-all duration-500 group-hover:scale-150" />
                  <div className="relative">
                    <div className="text-3xl font-bold text-sky-400">
                      {Math.round((slotCounts.occupied / totalSlots) * 100)}%
                    </div>
                    <div className="text-sm font-medium text-sky-400/70">Occupancy</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
