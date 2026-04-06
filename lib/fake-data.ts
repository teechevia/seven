// Smart Parking Dashboard Fake Data
// Comprehensive parking system data for all dashboard components

export type SlotStatus = "available" | "occupied" | "reserved" | "faculty"
export type AuthStatus = "authorized" | "unauthorized" | "blacklisted"
export type AlertSeverity = "critical" | "warning" | "info"
export type AlertStatus = "active" | "resolved"

export interface ParkingSlot {
  id: string
  status: SlotStatus
  vehicle?: {
    number: string
    owner: string
    type: string
    entryTime: string
  }
}

export interface VehicleEntry {
  id: string
  vehicleNo: string
  owner: string
  type: string
  time: string
  slot: string
  status: "active" | "exited"
  image?: string
}

export interface Alert {
  id: number
  title: string
  description: string
  time: string
  severity: AlertSeverity
  type: "unauthorized" | "overstay" | "sensor" | "security" | "maintenance"
  vehicleNo?: string
  location?: string
  status: AlertStatus
}

export interface VehicleScan {
  id: string
  vehicleNo: string
  timestamp: string
  gate: string
  action: "entry" | "exit"
  confidence: number
  image?: string
  owner: string
  status: AuthStatus
  type: string
}

export interface UnauthorizedVehicle {
  id: string
  vehicleNo: string
  detectedAt: string
  location: string
  image?: string
  reason: string
  status: "pending" | "resolved" | "escalated"
}

export interface BlacklistedVehicle {
  id: string
  vehicleNo: string
  owner: string
  reason: string
  addedOn: string
  addedBy: string
  status: "active" | "removed"
}

export interface DashboardStats {
  totalSlots: number
  occupiedSlots: number
  freeSlots: number
  reservedSlots: number
  facultySlots: number
  unauthorizedCount: number
  todayEntries: number
  todayExits: number
  occupancyRate: number
  trend: string
}

export interface HourlyUsage {
  hour: string
  usage: number
  entries: number
  exits: number
  percentage: number
}

export interface VehicleType {
  type: string
  count: number
  color: string
  percentage: number
}

export interface ZoneCapacity {
  id: string
  name: string
  capacity: number
  occupied: number
  available: number
  usage: number
}

export interface WeeklyTrend {
  day: string
  occupancy: number
  revenue: number
}

export interface PeakTrafficTime {
  time: string
  label: string
  intensity: number
}

export interface FrequentVehicle {
  rank: number
  vehicleNo: string
  owner: string
  visits: number
  avgDuration: string
  type: string
}

export interface AnalyticsStat {
  label: string
  value: string
  icon: string
  trend?: string
  trendUp?: boolean
  subtext?: string
  color: "lime" | "sky" | "amber" | "red"
  badge?: { text: string; color: string } | null
}

// Dashboard Statistics
export const dashboardStats: DashboardStats = {
  totalSlots: 248,
  occupiedSlots: 186,
  freeSlots: 54,
  reservedSlots: 24,
  facultySlots: 32,
  unauthorizedCount: 8,
  todayEntries: 342,
  todayExits: 298,
  occupancyRate: 75,
  trend: "+18%",
}

export const statsCards = [
  {
    label: "Total Slots",
    value: "248",
    icon: "ParkingCircle",
    trend: null,
    color: "lime",
    badge: null,
  },
  {
    label: "Occupied Slots",
    value: "186",
    icon: "Car",
    trend: "+12",
    color: "lime",
    badge: { text: "Live", color: "lime" },
  },
  {
    label: "Free Slots",
    value: "54",
    icon: "CircleCheck",
    trend: "-8",
    color: "lime",
    badge: null,
  },
  {
    label: "Unauthorized",
    value: "8",
    icon: "ShieldAlert",
    trend: "+2",
    color: "red",
    badge: { text: "Alert", color: "red" },
  },
]

// Parking Zones Data
export const parkingZones: Record<string, ParkingSlot[]> = {
  A: [
    { id: "A1", status: "occupied", vehicle: { number: "KA 01 AB 1234", owner: "John Doe", type: "Sedan", entryTime: "09:45 AM" } },
    { id: "A2", status: "available" },
    { id: "A3", status: "occupied", vehicle: { number: "MH 02 CD 5678", owner: "Sarah Wilson", type: "SUV", entryTime: "09:38 AM" } },
    { id: "A4", status: "reserved", vehicle: { number: "Reserved", owner: "VIP Guest", type: "N/A", entryTime: "N/A" } },
    { id: "A5", status: "available" },
    { id: "A6", status: "faculty", vehicle: { number: "DL 03 EF 9012", owner: "Dr. Mike Chen", type: "Sedan", entryTime: "08:00 AM" } },
    { id: "A7", status: "occupied", vehicle: { number: "TN 04 GH 3456", owner: "Emily Brown", type: "Hatchback", entryTime: "09:15 AM" } },
    { id: "A8", status: "available" },
  ],
  B: [
    { id: "B1", status: "available" },
    { id: "B2", status: "occupied", vehicle: { number: "GJ 05 IJ 7890", owner: "David Park", type: "SUV", entryTime: "09:02 AM" } },
    { id: "B3", status: "occupied", vehicle: { number: "RJ 06 KL 2345", owner: "Lisa Turner", type: "Sedan", entryTime: "08:55 AM" } },
    { id: "B4", status: "available" },
    { id: "B5", status: "reserved", vehicle: { number: "Reserved", owner: "Management", type: "N/A", entryTime: "N/A" } },
    { id: "B6", status: "occupied", vehicle: { number: "UP 07 MN 6789", owner: "James Lee", type: "Hatchback", entryTime: "08:48 AM" } },
    { id: "B7", status: "faculty", vehicle: { number: "HR 08 OP 0123", owner: "Prof. Anna White", type: "Sedan", entryTime: "07:45 AM" } },
    { id: "B8", status: "available" },
  ],
  C: [
    { id: "C1", status: "faculty", vehicle: { number: "MP 09 QR 4567", owner: "Dr. Robert Kim", type: "SUV", entryTime: "07:30 AM" } },
    { id: "C2", status: "occupied", vehicle: { number: "WB 10 ST 8901", owner: "Chris Johnson", type: "Sedan", entryTime: "08:30 AM" } },
    { id: "C3", status: "available" },
    { id: "C4", status: "occupied", vehicle: { number: "AP 11 UV 2345", owner: "Nancy Davis", type: "Hatchback", entryTime: "08:22 AM" } },
    { id: "C5", status: "occupied", vehicle: { number: "KL 12 WX 6789", owner: "Mark Wilson", type: "SUV", entryTime: "08:15 AM" } },
    { id: "C6", status: "reserved", vehicle: { number: "Reserved", owner: "Executive", type: "N/A", entryTime: "N/A" } },
    { id: "C7", status: "available" },
    { id: "C8", status: "occupied", vehicle: { number: "PB 13 YZ 0123", owner: "Kate Miller", type: "Sedan", entryTime: "08:05 AM" } },
  ],
  D: [
    { id: "D1", status: "available" },
    { id: "D2", status: "available" },
    { id: "D3", status: "occupied", vehicle: { number: "CH 14 AB 4567", owner: "Tom Harris", type: "SUV", entryTime: "07:55 AM" } },
    { id: "D4", status: "faculty", vehicle: { number: "JK 15 CD 8901", owner: "Dr. Sam Clark", type: "Sedan", entryTime: "07:20 AM" } },
    { id: "D5", status: "available" },
    { id: "D6", status: "occupied", vehicle: { number: "GA 16 EF 2345", owner: "Rachel Green", type: "Hatchback", entryTime: "07:40 AM" } },
    { id: "D7", status: "available" },
    { id: "D8", status: "reserved", vehicle: { number: "Reserved", owner: "Visitor Bay", type: "N/A", entryTime: "N/A" } },
  ],
}

// Recent Vehicle Entries
export const recentEntries: VehicleEntry[] = [
  { id: "entry-001", vehicleNo: "KA 01 AB 1234", owner: "John Doe", type: "Sedan", time: "09:45 AM", slot: "A1", status: "active" },
  { id: "entry-002", vehicleNo: "MH 02 CD 5678", owner: "Sarah Wilson", type: "SUV", time: "09:38 AM", slot: "A3", status: "active" },
  { id: "entry-003", vehicleNo: "DL 03 EF 9012", owner: "Mike Chen", type: "Hatchback", time: "09:22 AM", slot: "B6", status: "active" },
  { id: "entry-004", vehicleNo: "TN 04 GH 3456", owner: "Emily Brown", type: "Sedan", time: "09:15 AM", slot: "A7", status: "active" },
  { id: "entry-005", vehicleNo: "GJ 05 IJ 7890", owner: "David Park", type: "SUV", time: "09:02 AM", slot: "B2", status: "active" },
  { id: "entry-006", vehicleNo: "RJ 06 KL 2345", owner: "Lisa Turner", type: "Sedan", time: "08:55 AM", slot: "B3", status: "active" },
  { id: "entry-007", vehicleNo: "UP 07 MN 6789", owner: "James Lee", type: "Hatchback", time: "08:48 AM", slot: "C4", status: "active" },
  { id: "entry-008", vehicleNo: "WB 10 ST 8901", owner: "Chris Johnson", type: "Sedan", time: "08:30 AM", slot: "C2", status: "active" },
]

// System Alerts
export const alerts: Alert[] = [
  { id: 1, title: "Unauthorized Vehicle Detected", description: "Slot B-07 - Vehicle without valid permit detected by AI camera", time: "Just now", severity: "critical", type: "unauthorized", vehicleNo: "KA 05 MX 9821", location: "Zone B - Slot B7", status: "active" },
  { id: 2, title: "Overstay Warning", description: "Slot A-15 - Vehicle exceeded maximum 4-hour parking limit", time: "5 min ago", severity: "warning", type: "overstay", vehicleNo: "TN 22 EF 1234", location: "Zone A - Slot A15", status: "active" },
  { id: 3, title: "Sensor Malfunction", description: "Slot C-22 - Ground proximity sensor offline since 8:45 AM", time: "12 min ago", severity: "critical", type: "sensor", vehicleNo: "System", location: "Zone C - Slot C22", status: "active" },
  { id: 4, title: "Security Breach Attempt", description: "Gate 2 - Multiple failed access attempts detected", time: "18 min ago", severity: "critical", type: "security", vehicleNo: "MH 12 AB 3456", location: "Zone A - Entry Gate", status: "active" },
  { id: 5, title: "Battery Low", description: "Zone D sensor array battery below 15%", time: "25 min ago", severity: "warning", type: "maintenance", vehicleNo: "System", location: "Zone D", status: "active" },
  { id: 6, title: "Double Parking Alert", description: "Slot D-03 - Vehicle partially blocking adjacent slot D-04", time: "32 min ago", severity: "warning", type: "unauthorized", vehicleNo: "DL 08 CD 7890", location: "Zone C - Slot C12", status: "active" },
  { id: 7, title: "Blacklisted Vehicle Entry", description: "Gate 1 - Vehicle MH 12 XY 9999 attempted entry, access denied", time: "45 min ago", severity: "critical", type: "security", vehicleNo: "GJ 01 GH 5678", location: "Zone D - Slot D3", status: "resolved" },
  { id: 8, title: "Maintenance Required", description: "Slot A-08 - Ground marking needs repainting", time: "1 hour ago", severity: "info", type: "maintenance", vehicleNo: "System", location: "Zone B - Slot B22", status: "resolved" },
]

// Vehicle Scan History
export const vehicleScanHistory: VehicleScan[] = [
  { id: "scan-001", vehicleNo: "KA 01 AB 1234", timestamp: "09:45:23 AM", gate: "Gate 1 - Main Entry", action: "entry", confidence: 98.5, owner: "John Doe", status: "authorized", type: "Sedan" },
  { id: "scan-002", vehicleNo: "MH 02 CD 5678", timestamp: "09:38:15 AM", gate: "Gate 1 - Main Entry", action: "entry", confidence: 97.2, owner: "Sarah Wilson", status: "authorized", type: "SUV" },
  { id: "scan-003", vehicleNo: "TN 99 ZZ 0000", timestamp: "09:32:45 AM", gate: "Gate 2 - West Entry", action: "entry", confidence: 94.8, owner: "Unknown", status: "unauthorized", type: "Sedan" },
  { id: "scan-004", vehicleNo: "DL 03 EF 9012", timestamp: "09:22:10 AM", gate: "Gate 1 - Main Entry", action: "entry", confidence: 99.1, owner: "Mike Chen", status: "authorized", type: "Hatchback" },
  { id: "scan-005", vehicleNo: "AP 55 HH 4444", timestamp: "09:15:30 AM", gate: "Gate 2 - West Entry", action: "exit", confidence: 96.7, owner: "Robert Kim", status: "authorized", type: "Sedan" },
  { id: "scan-006", vehicleNo: "MH 12 XY 9999", timestamp: "09:10:05 AM", gate: "Gate 1 - Main Entry", action: "entry", confidence: 99.8, owner: "Blocked User", status: "blacklisted", type: "SUV" },
  { id: "scan-007", vehicleNo: "GJ 05 IJ 7890", timestamp: "09:02:18 AM", gate: "Gate 1 - Main Entry", action: "entry", confidence: 97.9, owner: "David Park", status: "authorized", type: "SUV" },
  { id: "scan-008", vehicleNo: "RJ 06 KL 2345", timestamp: "08:55:42 AM", gate: "Gate 2 - West Entry", action: "entry", confidence: 98.3, owner: "Lisa Turner", status: "authorized", type: "Sedan" },
  { id: "scan-009", vehicleNo: "KA 22 BB 7777", timestamp: "08:48:15 AM", gate: "Gate 1 - Main Entry", action: "exit", confidence: 96.1, owner: "Alex Murphy", status: "authorized", type: "Hatchback" },
  { id: "scan-010", vehicleNo: "UP 07 MN 6789", timestamp: "08:40:33 AM", gate: "Gate 1 - Main Entry", action: "entry", confidence: 98.7, owner: "James Lee", status: "authorized", type: "Hatchback" },
]

// Unauthorized Vehicles
export const unauthorizedVehicles: UnauthorizedVehicle[] = [
  { id: "unauth-001", vehicleNo: "TN 99 ZZ 0000", detectedAt: "09:32 AM", location: "Slot B-07", reason: "No valid parking permit found in database", status: "pending" },
  { id: "unauth-002", vehicleNo: "KA 88 XX 1111", detectedAt: "09:05 AM", location: "Slot C-15", reason: "Expired visitor pass (expired 2 days ago)", status: "escalated" },
  { id: "unauth-003", vehicleNo: "DL 44 YY 2222", detectedAt: "08:45 AM", location: "Gate 2 - Attempted Entry", reason: "Vehicle not registered in system", status: "pending" },
  { id: "unauth-004", vehicleNo: "MH 55 WW 3333", detectedAt: "08:22 AM", location: "Slot A-12", reason: "Wrong parking zone - registered for Zone D only", status: "resolved" },
  { id: "unauth-005", vehicleNo: "GJ 66 VV 4444", detectedAt: "07:58 AM", location: "Faculty Zone C-01", reason: "Non-faculty vehicle in faculty parking", status: "pending" },
  { id: "unauth-006", vehicleNo: "RJ 77 UU 5555", detectedAt: "07:35 AM", location: "Reserved Slot A-04", reason: "Parked in VIP reserved slot", status: "escalated" },
  { id: "unauth-007", vehicleNo: "WB 33 TT 6666", detectedAt: "07:12 AM", location: "Slot D-08", reason: "Permit suspended for outstanding fees", status: "pending" },
  { id: "unauth-008", vehicleNo: "PB 22 SS 7777", detectedAt: "06:48 AM", location: "Gate 1 - Attempted Entry", reason: "Forged/invalid parking permit detected", status: "escalated" },
]

// Blacklisted Vehicles
export const blacklistedVehicles: BlacklistedVehicle[] = [
  { id: "black-001", vehicleNo: "MH 12 XY 9999", owner: "Anonymous", reason: "Multiple hit-and-run incidents in parking lot", addedOn: "March 15, 2026", addedBy: "Security Admin", status: "active" },
  { id: "black-002", vehicleNo: "KA 44 AB 0000", owner: "Former Employee", reason: "Employment terminated - access revoked", addedOn: "March 10, 2026", addedBy: "HR Department", status: "active" },
  { id: "black-003", vehicleNo: "DL 88 ZZ 1234", owner: "Unknown", reason: "Repeated unauthorized parking violations (5+ times)", addedOn: "March 5, 2026", addedBy: "Security Admin", status: "active" },
  { id: "black-004", vehicleNo: "TN 66 QQ 5678", owner: "John Smith", reason: "Property damage to parking infrastructure", addedOn: "February 28, 2026", addedBy: "Facility Manager", status: "active" },
  { id: "black-005", vehicleNo: "GJ 11 PP 9012", owner: "Jane Doe", reason: "Outstanding parking fees - $500+", addedOn: "February 20, 2026", addedBy: "Finance Department", status: "removed" },
  { id: "black-006", vehicleNo: "AP 99 OO 3456", owner: "Unknown", reason: "Suspected theft attempt in parking area", addedOn: "February 15, 2026", addedBy: "Security Admin", status: "active" },
  { id: "black-007", vehicleNo: "UP 55 NN 7890", owner: "Mike Johnson", reason: "Aggressive behavior towards security staff", addedOn: "February 8, 2026", addedBy: "Security Admin", status: "active" },
  { id: "black-008", vehicleNo: "HR 33 MM 2345", owner: "Lisa Brown", reason: "Permit fraud - using duplicate/forged permits", addedOn: "January 30, 2026", addedBy: "Security Admin", status: "active" },
]

// Hourly Usage Data for Charts
export const hourlyUsageData: HourlyUsage[] = [
  { hour: "6 AM", usage: 20, entries: 15, exits: 5, percentage: 12 },
  { hour: "7 AM", usage: 35, entries: 42, exits: 12, percentage: 34 },
  { hour: "8 AM", usage: 65, entries: 68, exits: 18, percentage: 68 },
  { hour: "9 AM", usage: 78, entries: 45, exits: 22, percentage: 89 },
  { hour: "10 AM", usage: 85, entries: 28, exits: 15, percentage: 92 },
  { hour: "11 AM", usage: 88, entries: 22, exits: 18, percentage: 98 },
  { hour: "12 PM", usage: 92, entries: 35, exits: 28, percentage: 100 },
  { hour: "1 PM", usage: 90, entries: 18, exits: 22, percentage: 96 },
  { hour: "2 PM", usage: 88, entries: 25, exits: 30, percentage: 88 },
  { hour: "3 PM", usage: 82, entries: 15, exits: 25, percentage: 82 },
  { hour: "4 PM", usage: 78, entries: 20, exits: 35, percentage: 75 },
  { hour: "5 PM", usage: 65, entries: 12, exits: 48, percentage: 68 },
  { hour: "6 PM", usage: 45, entries: 8, exits: 42, percentage: 52 },
  { hour: "7 PM", usage: 32, entries: 5, exits: 28, percentage: 38 },
  { hour: "8 PM", usage: 25, entries: 3, exits: 18, percentage: 24 },
  { hour: "9 PM", usage: 18, entries: 2, exits: 12, percentage: 15 },
]

// Vehicle Types Distribution
export const vehicleTypesData: VehicleType[] = [
  { type: "Sedan", count: 486, color: "#84cc16", percentage: 39 },
  { type: "SUV", count: 362, color: "#38bdf8", percentage: 29 },
  { type: "Hatchback", count: 224, color: "#fbbf24", percentage: 18 },
  { type: "Two Wheeler", count: 112, color: "#a78bfa", percentage: 9 },
  { type: "Truck/Van", count: 63, color: "#f87171", percentage: 5 },
]

// Zone Capacity Data
export const zoneCapacityData: ZoneCapacity[] = [
  { id: "A", name: "Zone A - Main Entry", capacity: 62, occupied: 48, available: 14, usage: 94 },
  { id: "B", name: "Zone B - East Wing", capacity: 62, occupied: 56, available: 6, usage: 87 },
  { id: "C", name: "Zone C - West Wing", capacity: 62, occupied: 42, available: 20, usage: 72 },
  { id: "D", name: "Zone D - Basement", capacity: 62, occupied: 40, available: 22, usage: 65 },
  { id: "E", name: "Zone E - Rooftop", capacity: 62, occupied: 30, available: 32, usage: 48 },
  { id: "F", name: "Zone F - VIP Section", capacity: 62, occupied: 28, available: 34, usage: 82 },
]

// Weekly Trends
export const weeklyTrends: WeeklyTrend[] = [
  { day: "Mon", occupancy: 72, revenue: 2450 },
  { day: "Tue", occupancy: 78, revenue: 2680 },
  { day: "Wed", occupancy: 85, revenue: 2920 },
  { day: "Thu", occupancy: 82, revenue: 2810 },
  { day: "Fri", occupancy: 88, revenue: 3050 },
  { day: "Sat", occupancy: 45, revenue: 1550 },
  { day: "Sun", occupancy: 32, revenue: 1100 },
]

// Monthly Revenue Data
export const monthlyRevenueData = [
  { month: "Jan", revenue: 78500, target: 75000 },
  { month: "Feb", revenue: 82300, target: 80000 },
  { month: "Mar", revenue: 91200, target: 85000 },
  { month: "Apr", revenue: 88700, target: 85000 },
]

// Peak Traffic Times
export const peakTrafficTimes: PeakTrafficTime[] = [
  { time: "08:30 - 09:30 AM", label: "Morning Rush", intensity: 95 },
  { time: "12:00 - 01:00 PM", label: "Lunch Peak", intensity: 100 },
  { time: "05:00 - 06:00 PM", label: "Evening Exit", intensity: 88 },
]

// Frequent Vehicles
export const frequentVehicles: FrequentVehicle[] = [
  { rank: 1, vehicleNo: "KA 01 AB 1234", owner: "John Doe", visits: 156, avgDuration: "4.2h", type: "Sedan" },
  { rank: 2, vehicleNo: "MH 02 CD 5678", owner: "Sarah Wilson", visits: 142, avgDuration: "6.8h", type: "SUV" },
  { rank: 3, vehicleNo: "DL 03 EF 9012", owner: "Mike Chen", visits: 128, avgDuration: "3.5h", type: "Hatchback" },
  { rank: 4, vehicleNo: "TN 04 GH 3456", owner: "Emily Brown", visits: 115, avgDuration: "5.1h", type: "Sedan" },
  { rank: 5, vehicleNo: "GJ 05 IJ 7890", owner: "David Park", visits: 98, avgDuration: "7.2h", type: "SUV" },
]

// Analytics Summary Stats
export const analyticsSummaryStats: AnalyticsStat[] = [
  { label: "Total Vehicles Today", value: "1,247", icon: "Car", trend: "+18%", trendUp: true, color: "lime", badge: { text: "Live", color: "lime" } },
  { label: "Peak Hour", value: "12:00 PM", icon: "Clock", subtext: "1,890 vehicles", color: "sky", badge: null },
  { label: "Average Occupancy", value: "78.4%", icon: "TrendingUp", trend: "+5.2%", trendUp: true, color: "amber", badge: { text: "High", color: "amber" } },
  { label: "Unauthorized Attempts", value: "23", icon: "ShieldAlert", trend: "-12%", trendUp: false, color: "red", badge: { text: "Alert", color: "red" } },
]

// Alerts Summary Stats
export const alertsSummaryStats = [
  { label: "Total Alerts", value: "47", icon: "Bell", trend: "+8 today", color: "lime", badge: { text: "Live", color: "lime" } },
  { label: "Unauthorized Vehicles", value: "12", icon: "ShieldAlert", trend: "+3 today", color: "red", badge: { text: "Critical", color: "red" } },
  { label: "Blacklisted Vehicles", value: "5", icon: "ShieldX", trend: "2 active", color: "red", badge: null },
  { label: "Reserved Violations", value: "8", icon: "CarFront", trend: "+2 today", color: "amber", badge: { text: "Warning", color: "amber" } },
]

// Alert Timeline Events
export const alertTimelineEvents = [
  { id: 1, event: "Unauthorized vehicle detected in Zone B", time: "09:45 AM", type: "critical" },
  { id: 2, event: "Blacklisted vehicle KA 05 MX 9821 attempted entry", time: "09:42 AM", type: "critical" },
  { id: 3, event: "Reserved slot violation resolved - Zone C", time: "09:38 AM", type: "resolved" },
  { id: 4, event: "New overstay warning issued for Slot A15", time: "09:30 AM", type: "warning" },
  { id: 5, event: "Sensor malfunction detected in Zone B", time: "09:22 AM", type: "info" },
  { id: 6, event: "Faculty slot violation detected - Zone D", time: "09:15 AM", type: "warning" },
]

// Occupancy Data
export const occupancyData = {
  occupied: 186,
  free: 62,
  total: 248,
}

// Trend Data
export const trendData = {
  daily: { value: "1,247", change: "+8%", direction: "up" },
  weekly: { value: "8,432", change: "+12%", direction: "up" },
  monthly: { value: "34,567", change: "+15%", direction: "up" },
}

// Fake OCR Results for vehicle upload simulation
export const fakeOCRResults = [
  { vehicleNo: "KA 05 MX 7892", owner: "Alex Thompson", type: "Sedan", status: "authorized" as AuthStatus, slot: "A-12", confidence: 97 },
  { vehicleNo: "MH 14 AB 3456", owner: "Unknown", type: "SUV", status: "unauthorized" as AuthStatus, slot: null, confidence: 94 },
  { vehicleNo: "DL 22 CD 7890", owner: "Jennifer Lee", type: "Hatchback", status: "authorized" as AuthStatus, slot: "B-08", confidence: 98 },
  { vehicleNo: "TN 66 QQ 5678", owner: "John Smith", type: "Sedan", status: "blacklisted" as AuthStatus, slot: null, confidence: 99 },
  { vehicleNo: "GJ 09 EF 1234", owner: "Maria Garcia", type: "SUV", status: "authorized" as AuthStatus, slot: "C-15", confidence: 96 },
]

// Utility functions
export function getSlotsByStatus(status: SlotStatus): ParkingSlot[] {
  const slots: ParkingSlot[] = []
  Object.values(parkingZones).forEach((zone) => {
    zone.forEach((slot) => {
      if (slot.status === status) {
        slots.push(slot)
      }
    })
  })
  return slots
}

export function countSlotsByStatus(): Record<SlotStatus, number> {
  const counts: Record<SlotStatus, number> = { available: 0, occupied: 0, reserved: 0, faculty: 0 }
  Object.values(parkingZones).forEach((zone) => {
    zone.forEach((slot) => {
      counts[slot.status]++
    })
  })
  return counts
}

export function getTotalSlots(): number {
  let total = 0
  Object.values(parkingZones).forEach((zone) => {
    total += zone.length
  })
  return total
}

export function getAlertsByPriority(severity: AlertSeverity): Alert[] {
  return alerts.filter((alert) => alert.severity === severity)
}

export function getUnauthorizedByStatus(status: "pending" | "resolved" | "escalated"): UnauthorizedVehicle[] {
  return unauthorizedVehicles.filter((vehicle) => vehicle.status === status)
}

export function getActiveBlacklistedVehicles(): BlacklistedVehicle[] {
  return blacklistedVehicles.filter((vehicle) => vehicle.status === "active")
}

export function getRandomOCRResult() {
  return fakeOCRResults[Math.floor(Math.random() * fakeOCRResults.length)]
}

// ========================================
// MUTABLE STATE MANAGEMENT FOR BACKEND
// ========================================

// Entry/Exit Log Types
export interface EntryLog {
  id: string
  vehicleNo: string
  owner: string
  type: string
  entryTime: string
  assignedSlot: string | null
  status: AuthStatus
  confidence: number
  gate: string
}

export interface ExitLog {
  id: string
  vehicleNo: string
  owner: string
  type: string
  entryTime: string
  exitTime: string
  slot: string
  duration: string
  gate: string
}

// In-memory state (simulates database)
let entryLogsState: EntryLog[] = []
let exitLogsState: ExitLog[] = []
let alertIdCounter = alerts.length + 1

// Deep clone of parking zones to make it mutable
let mutableParkingZones: Record<string, ParkingSlot[]> = JSON.parse(JSON.stringify(parkingZones))

// Initialize entry logs from existing recentEntries
recentEntries.forEach((entry, index) => {
  entryLogsState.push({
    id: `entry-init-${index + 1}`,
    vehicleNo: entry.vehicleNo,
    owner: entry.owner,
    type: entry.type,
    entryTime: entry.time,
    assignedSlot: entry.slot,
    status: "authorized",
    confidence: 95 + Math.random() * 5,
    gate: "Gate 1 - Main Entry",
  })
})

// ========================================
// PARKING SLOT MANAGEMENT
// ========================================

export function getFirstAvailableSlot(): { zone: string; slot: ParkingSlot } | null {
  for (const [zoneName, slots] of Object.entries(mutableParkingZones)) {
    for (const slot of slots) {
      if (slot.status === "available") {
        return { zone: zoneName, slot }
      }
    }
  }
  return null
}

export function assignSlotToVehicle(
  slotId: string,
  vehicle: { number: string; owner: string; type: string }
): boolean {
  for (const [, slots] of Object.entries(mutableParkingZones)) {
    const slot = slots.find((s) => s.id === slotId)
    if (slot && slot.status === "available") {
      slot.status = "occupied"
      slot.vehicle = {
        number: vehicle.number,
        owner: vehicle.owner,
        type: vehicle.type,
        entryTime: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      }
      return true
    }
  }
  return false
}

export function releaseSlot(vehicleNo: string): { success: boolean; slotId: string | null } {
  for (const [, slots] of Object.entries(mutableParkingZones)) {
    const slot = slots.find((s) => s.vehicle?.number === vehicleNo)
    if (slot) {
      const slotId = slot.id
      slot.status = "available"
      slot.vehicle = undefined
      return { success: true, slotId }
    }
  }
  return { success: false, slotId: null }
}

export function getMutableParkingZones(): Record<string, ParkingSlot[]> {
  return mutableParkingZones
}

// ========================================
// ENTRY LOG MANAGEMENT
// ========================================

export function addEntryLog(log: EntryLog): void {
  entryLogsState.unshift(log) // Add to beginning (most recent first)
  if (entryLogsState.length > 100) {
    entryLogsState = entryLogsState.slice(0, 100) // Keep last 100 entries
  }
}

export function getEntryLogs(): EntryLog[] {
  return [...entryLogsState]
}

export function getEntryLogByVehicle(vehicleNo: string): EntryLog | undefined {
  return entryLogsState.find((log) => log.vehicleNo === vehicleNo)
}

// ========================================
// EXIT LOG MANAGEMENT
// ========================================

export function addExitLog(log: ExitLog): void {
  exitLogsState.unshift(log)
  if (exitLogsState.length > 100) {
    exitLogsState = exitLogsState.slice(0, 100)
  }
}

export function getExitLogs(): ExitLog[] {
  return [...exitLogsState]
}

export function removeEntryLog(vehicleNo: string): EntryLog | undefined {
  const index = entryLogsState.findIndex((log) => log.vehicleNo === vehicleNo)
  if (index !== -1) {
    const [removed] = entryLogsState.splice(index, 1)
    return removed
  }
  return undefined
}

// ========================================
// ALERT MANAGEMENT
// ========================================

export function addAlert(alertData: Omit<Alert, "id">): Alert {
  const newAlert: Alert = {
    id: alertIdCounter++,
    ...alertData,
  }
  alerts.unshift(newAlert)
  return newAlert
}

export function getActiveAlerts(): Alert[] {
  return alerts.filter((alert) => alert.status === "active")
}

// ========================================
// PARKING STATUS CALCULATIONS
// ========================================

export function getParkingStatus(): {
  totalSlots: number
  occupiedSlots: number
  freeSlots: number
  reservedSlots: number
  facultySlots: number
  occupancyRate: number
} {
  let total = 0
  let occupied = 0
  let free = 0
  let reserved = 0
  let faculty = 0

  Object.values(mutableParkingZones).forEach((zone) => {
    zone.forEach((slot) => {
      total++
      switch (slot.status) {
        case "occupied":
          occupied++
          break
        case "available":
          free++
          break
        case "reserved":
          reserved++
          break
        case "faculty":
          faculty++
          break
      }
    })
  })

  return {
    totalSlots: total,
    occupiedSlots: occupied,
    freeSlots: free,
    reservedSlots: reserved,
    facultySlots: faculty,
    occupancyRate: total > 0 ? Math.round((occupied / total) * 100) : 0,
  }
}

// ========================================
// VEHICLE DATABASE CHECK
// ========================================

// Simulated registered vehicles database
const registeredVehicles: Record<string, { owner: string; type: string; permitType: "standard" | "faculty" | "vip" }> = {
  "KA 05 MX 7892": { owner: "Alex Thompson", type: "Sedan", permitType: "standard" },
  "DL 22 CD 7890": { owner: "Jennifer Lee", type: "Hatchback", permitType: "standard" },
  "GJ 09 EF 1234": { owner: "Maria Garcia", type: "SUV", permitType: "standard" },
  "KA 01 AB 1234": { owner: "John Doe", type: "Sedan", permitType: "standard" },
  "MH 02 CD 5678": { owner: "Sarah Wilson", type: "SUV", permitType: "standard" },
  "DL 03 EF 9012": { owner: "Dr. Mike Chen", type: "Sedan", permitType: "faculty" },
  "TN 04 GH 3456": { owner: "Emily Brown", type: "Hatchback", permitType: "standard" },
  "GJ 05 IJ 7890": { owner: "David Park", type: "SUV", permitType: "standard" },
  "RJ 06 KL 2345": { owner: "Lisa Turner", type: "Sedan", permitType: "standard" },
  "UP 07 MN 6789": { owner: "James Lee", type: "Hatchback", permitType: "standard" },
  "HR 08 OP 0123": { owner: "Prof. Anna White", type: "Sedan", permitType: "faculty" },
  "MP 09 QR 4567": { owner: "Dr. Robert Kim", type: "SUV", permitType: "faculty" },
  "WB 10 ST 8901": { owner: "Chris Johnson", type: "Sedan", permitType: "standard" },
  "AP 11 UV 2345": { owner: "Nancy Davis", type: "Hatchback", permitType: "standard" },
  "KL 12 WX 6789": { owner: "Mark Wilson", type: "SUV", permitType: "standard" },
  "PB 13 YZ 0123": { owner: "Kate Miller", type: "Sedan", permitType: "standard" },
  "CH 14 AB 4567": { owner: "Tom Harris", type: "SUV", permitType: "standard" },
  "JK 15 CD 8901": { owner: "Dr. Sam Clark", type: "Sedan", permitType: "faculty" },
  "GA 16 EF 2345": { owner: "Rachel Green", type: "Hatchback", permitType: "standard" },
}

// Blacklisted vehicle numbers (from blacklistedVehicles)
const blacklistedNumbers = blacklistedVehicles
  .filter((v) => v.status === "active")
  .map((v) => v.vehicleNo)

export function checkVehicleStatus(vehicleNo: string): {
  status: AuthStatus
  owner: string
  type: string
  permitType?: string
} {
  // Check if blacklisted
  if (blacklistedNumbers.includes(vehicleNo)) {
    return { status: "blacklisted", owner: "Blocked User", type: "Unknown" }
  }

  // Check if registered
  const registered = registeredVehicles[vehicleNo]
  if (registered) {
    return {
      status: "authorized",
      owner: registered.owner,
      type: registered.type,
      permitType: registered.permitType,
    }
  }

  // Unknown vehicle
  return { status: "unauthorized", owner: "Unknown", type: "Unknown" }
}

export function generateVehicleNo(): string {
  const states = ["KA", "MH", "DL", "TN", "GJ", "RJ", "UP", "WB", "AP", "HR"]
  const state = states[Math.floor(Math.random() * states.length)]
  const district = String(Math.floor(Math.random() * 99) + 1).padStart(2, "0")
  const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ"
  const series = letters[Math.floor(Math.random() * letters.length)] + letters[Math.floor(Math.random() * letters.length)]
  const number = String(Math.floor(Math.random() * 9999) + 1).padStart(4, "0")
  return `${state} ${district} ${series} ${number}`
}

export function calculateDuration(entryTime: string, exitTime: string): string {
  // Simple duration calculation for demo (assuming same day)
  const parseTime = (timeStr: string) => {
    const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i)
    if (!match) return 0
    let hours = parseInt(match[1])
    const minutes = parseInt(match[2])
    const period = match[3].toUpperCase()
    if (period === "PM" && hours !== 12) hours += 12
    if (period === "AM" && hours === 12) hours = 0
    return hours * 60 + minutes
  }

  const entryMinutes = parseTime(entryTime)
  const exitMinutes = parseTime(exitTime)
  let diff = exitMinutes - entryMinutes
  if (diff < 0) diff += 24 * 60 // Handle overnight

  const hours = Math.floor(diff / 60)
  const minutes = diff % 60

  if (hours === 0) return `${minutes}m`
  if (minutes === 0) return `${hours}h`
  return `${hours}h ${minutes}m`
}
