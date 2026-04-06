"use client"

import { useState } from "react"
import { ParkingSidebar } from "@/components/parking-sidebar"
import {
  Car,
  Clock,
  TrendingUp,
  ShieldAlert,
  Activity,
  CalendarDays,
  BarChart3,
  PieChart,
  Flame,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
} from "lucide-react"
import {
  analyticsSummaryStats,
  hourlyUsageData as rawHourlyData,
  vehicleTypesData,
  occupancyData,
  zoneCapacityData,
  frequentVehicles,
  peakTrafficTimes,
  trendData,
} from "@/lib/fake-data"

// Transform data for analytics charts
const summaryStats = analyticsSummaryStats.map(stat => ({
  ...stat,
  icon: stat.icon === "Car" ? Car : stat.icon === "Clock" ? Clock : stat.icon === "TrendingUp" ? TrendingUp : ShieldAlert,
}))

const hourlyUsageData = rawHourlyData

const vehicleTypeData = vehicleTypesData

const zoneHeatmapData = zoneCapacityData.map(z => ({
  zone: z.id,
  name: z.name,
  usage: z.usage,
  vehicles: z.occupied,
}))

export default function AnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<"daily" | "weekly" | "monthly">("daily")

  const occupancyPercentage = Math.round((occupancyData.occupied / occupancyData.total) * 100)
  const circumference = 2 * Math.PI * 70

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

      {/* Main Content */}
      <main className="relative flex-1 overflow-auto p-5 sm:p-8 lg:p-10">
        {/* Page Header */}
        <div className="mb-10">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="inline-flex items-center gap-2.5 rounded-full border border-lime-500/40 bg-lime-500/15 px-5 py-2.5 text-sm font-semibold text-lime-400 shadow-xl shadow-lime-500/20">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-lime-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-lime-400" />
              </span>
              Real-time Analytics
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-sky-500/40 bg-sky-500/15 px-5 py-2.5 text-sm font-semibold text-sky-400 shadow-xl shadow-sky-500/20">
              <BarChart3 className="h-4 w-4" />
              Premium Insights
            </span>
          </div>
          <h1 className="bg-gradient-to-r from-white via-zinc-100 to-zinc-300 bg-clip-text text-4xl font-bold tracking-tight text-transparent lg:text-5xl">
            Analytics Dashboard
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-zinc-400">
            Deep insights into parking patterns, vehicle distribution, and usage trends
          </p>
        </div>

        {/* Summary Stats */}
        <div className="mb-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {summaryStats.map((stat) => {
            const Icon = stat.icon
            const colorClasses: Record<string, { bg: string; text: string; glow: string; badgeBg: string; badgeText: string }> = {
              lime: { bg: "bg-lime-500/15", text: "text-lime-400", glow: "shadow-lime-500/20", badgeBg: "bg-lime-500/20 border-lime-500/40", badgeText: "text-lime-400" },
              sky: { bg: "bg-sky-500/15", text: "text-sky-400", glow: "shadow-sky-500/20", badgeBg: "bg-sky-500/20 border-sky-500/40", badgeText: "text-sky-400" },
              amber: { bg: "bg-amber-500/15", text: "text-amber-400", glow: "shadow-amber-500/20", badgeBg: "bg-amber-500/20 border-amber-500/40", badgeText: "text-amber-400" },
              red: { bg: "bg-red-500/15", text: "text-red-400", glow: "shadow-red-500/20", badgeBg: "bg-red-500/20 border-red-500/40", badgeText: "text-red-400" },
            }
            const colors = colorClasses[stat.color]

            return (
              <div
                key={stat.label}
                className={`group relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-zinc-900/70 p-6 backdrop-blur-3xl transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-2xl ${colors.glow}`}
              >
                {/* Card glow */}
                <div className={`absolute -right-10 -top-10 h-32 w-32 rounded-full ${colors.bg} blur-3xl opacity-50 transition-opacity group-hover:opacity-80`} />
                
                <div className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${colors.bg} shadow-lg ${colors.glow}`}>
                      <Icon className={`h-7 w-7 ${colors.text}`} strokeWidth={2} />
                    </div>
                    {stat.badge && (
                      <span className={`inline-flex items-center gap-1.5 rounded-full border ${colors.badgeBg} px-3 py-1.5 text-xs font-semibold ${colors.badgeText}`}>
                        <span className="relative flex h-1.5 w-1.5">
                          <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${colors.text.replace('text', 'bg')} opacity-75`} />
                          <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${colors.text.replace('text', 'bg')}`} />
                        </span>
                        {stat.badge.text}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm font-medium text-zinc-400 mb-1">{stat.label}</p>
                  <p className={`text-3xl font-bold ${colors.text}`}>{stat.value}</p>
                  
                  {stat.trend && (
                    <div className={`mt-2 flex items-center gap-1 text-sm font-medium ${stat.trendUp ? "text-lime-400" : "text-red-400"}`}>
                      {stat.trendUp ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                      {stat.trend} vs last period
                    </div>
                  )}
                  {stat.subtext && (
                    <p className="mt-2 text-sm text-zinc-500">{stat.subtext}</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Charts Row */}
        <div className="mb-10 grid gap-6 lg:grid-cols-3">
          {/* Parking Usage Line Chart */}
          <div className="lg:col-span-2 group relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-zinc-900/70 p-7 backdrop-blur-3xl transition-all duration-300 hover:border-white/20 hover:shadow-2xl hover:shadow-lime-500/10">
            <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-lime-500/10 blur-3xl opacity-50 transition-opacity group-hover:opacity-80" />
            
            <div className="relative">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Activity className="h-5 w-5 text-lime-400" />
                    <h3 className="text-lg font-semibold text-white">Parking Usage by Hour</h3>
                  </div>
                  <p className="text-sm text-zinc-500">Vehicles parked throughout the day</p>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-lime-500/40 bg-lime-500/15 px-3 py-1.5 text-xs font-semibold text-lime-400">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-lime-400 opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-lime-400" />
                  </span>
                  Live
                </span>
              </div>

              {/* Line Chart */}
              <div className="relative h-64">
                <svg className="w-full h-full" viewBox="0 0 800 200" preserveAspectRatio="none">
                  {/* Grid lines */}
                  {[0, 25, 50, 75, 100].map((percent) => (
                    <line
                      key={percent}
                      x1="0"
                      y1={200 - percent * 2}
                      x2="800"
                      y2={200 - percent * 2}
                      stroke="rgba(255,255,255,0.05)"
                      strokeWidth="1"
                    />
                  ))}
                  
                  {/* Area fill */}
                  <defs>
                    <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#84cc16" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#84cc16" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d={`M 0 ${200 - hourlyUsageData[0].percentage * 2} ${hourlyUsageData.map((d, i) => `L ${(i / (hourlyUsageData.length - 1)) * 800} ${200 - d.percentage * 2}`).join(' ')} L 800 200 L 0 200 Z`}
                    fill="url(#areaGradient)"
                  />
                  
                  {/* Line */}
                  <path
                    d={`M ${hourlyUsageData.map((d, i) => `${(i / (hourlyUsageData.length - 1)) * 800} ${200 - d.percentage * 2}`).join(' L ')}`}
                    fill="none"
                    stroke="#84cc16"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  
                  {/* Data points */}
                  {hourlyUsageData.map((d, i) => (
                    <circle
                      key={i}
                      cx={(i / (hourlyUsageData.length - 1)) * 800}
                      cy={200 - d.percentage * 2}
                      r="4"
                      fill="#84cc16"
                      className="drop-shadow-[0_0_6px_rgba(132,204,22,0.8)]"
                    />
                  ))}
                </svg>
                
                {/* X-axis labels */}
                <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-zinc-500 -mb-6">
                  {hourlyUsageData.filter((_, i) => i % 2 === 0).map((d) => (
                    <span key={d.hour}>{d.hour}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Occupancy Donut Chart */}
          <div className="group relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-zinc-900/70 p-7 backdrop-blur-3xl transition-all duration-300 hover:border-white/20 hover:shadow-2xl hover:shadow-lime-500/10">
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-lime-500/10 blur-3xl opacity-50 transition-opacity group-hover:opacity-80" />
            
            <div className="relative">
              <div className="flex items-center gap-2 mb-1">
                <PieChart className="h-5 w-5 text-lime-400" />
                <h3 className="text-lg font-semibold text-white">Slot Occupancy</h3>
              </div>
              <p className="text-sm text-zinc-500 mb-6">Occupied vs Available</p>

              {/* Donut Chart */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <svg width="180" height="180" viewBox="0 0 180 180">
                    {/* Background circle */}
                    <circle
                      cx="90"
                      cy="90"
                      r="70"
                      fill="none"
                      stroke="rgba(255,255,255,0.1)"
                      strokeWidth="16"
                    />
                    {/* Occupied segment */}
                    <circle
                      cx="90"
                      cy="90"
                      r="70"
                      fill="none"
                      stroke="#84cc16"
                      strokeWidth="16"
                      strokeDasharray={`${(occupancyPercentage / 100) * circumference} ${circumference}`}
                      strokeDashoffset={circumference / 4}
                      strokeLinecap="round"
                      className="drop-shadow-[0_0_10px_rgba(132,204,22,0.5)]"
                    />
                    {/* Free segment */}
                    <circle
                      cx="90"
                      cy="90"
                      r="70"
                      fill="none"
                      stroke="#3f3f46"
                      strokeWidth="16"
                      strokeDasharray={`${((100 - occupancyPercentage) / 100) * circumference} ${circumference}`}
                      strokeDashoffset={circumference / 4 - (occupancyPercentage / 100) * circumference}
                      strokeLinecap="round"
                    />
                  </svg>
                  {/* Center text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold text-lime-400">{occupancyPercentage}%</span>
                    <span className="text-sm text-zinc-400">Occupied</span>
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-lime-500 shadow-lg shadow-lime-500/50" />
                    <span className="text-sm text-zinc-300">Occupied</span>
                  </div>
                  <span className="text-sm font-semibold text-white">{occupancyData.occupied} slots</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-zinc-600" />
                    <span className="text-sm text-zinc-300">Available</span>
                  </div>
                  <span className="text-sm font-semibold text-white">{occupancyData.free} slots</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Second Charts Row */}
        <div className="mb-10 grid gap-6 lg:grid-cols-2">
          {/* Vehicle Type Distribution */}
          <div className="group relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-zinc-900/70 p-7 backdrop-blur-3xl transition-all duration-300 hover:border-white/20 hover:shadow-2xl hover:shadow-sky-500/10">
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-sky-500/10 blur-3xl opacity-50 transition-opacity group-hover:opacity-80" />
            
            <div className="relative">
              <div className="flex items-center gap-2 mb-1">
                <Car className="h-5 w-5 text-sky-400" />
                <h3 className="text-lg font-semibold text-white">Vehicle Type Distribution</h3>
              </div>
              <p className="text-sm text-zinc-500 mb-6">Breakdown by vehicle category</p>

              {/* Bar Chart */}
              <div className="space-y-4">
                {vehicleTypeData.map((item) => (
                  <div key={item.type} className="group/bar">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-zinc-300">{item.type}</span>
                      <span className="text-sm font-semibold text-white">{item.count} <span className="text-zinc-500">({item.percentage}%)</span></span>
                    </div>
                    <div className="relative h-3 w-full overflow-hidden rounded-full bg-zinc-800">
                      <div
                        className="h-full rounded-full transition-all duration-500 group-hover/bar:brightness-110"
                        style={{
                          width: `${item.percentage}%`,
                          backgroundColor: item.color,
                          boxShadow: `0 0 20px ${item.color}40`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Zone Heatmap */}
          <div className="group relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-zinc-900/70 p-7 backdrop-blur-3xl transition-all duration-300 hover:border-white/20 hover:shadow-2xl hover:shadow-amber-500/10">
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-amber-500/10 blur-3xl opacity-50 transition-opacity group-hover:opacity-80" />
            
            <div className="relative">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Flame className="h-5 w-5 text-amber-400" />
                    <h3 className="text-lg font-semibold text-white">Zone Usage Heatmap</h3>
                  </div>
                  <p className="text-sm text-zinc-500">Most used parking areas</p>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/15 px-3 py-1.5 text-xs font-semibold text-amber-400">
                  <Zap className="h-3 w-3" />
                  Hot Zones
                </span>
              </div>

              {/* Heatmap Grid */}
              <div className="grid grid-cols-2 gap-3">
                {zoneHeatmapData.map((zone) => {
                  const heatColor = zone.usage >= 90 ? "from-red-500/30 to-red-500/10 border-red-500/40" :
                                    zone.usage >= 75 ? "from-amber-500/30 to-amber-500/10 border-amber-500/40" :
                                    zone.usage >= 50 ? "from-lime-500/30 to-lime-500/10 border-lime-500/40" :
                                    "from-sky-500/30 to-sky-500/10 border-sky-500/40"
                  const textColor = zone.usage >= 90 ? "text-red-400" :
                                    zone.usage >= 75 ? "text-amber-400" :
                                    zone.usage >= 50 ? "text-lime-400" :
                                    "text-sky-400"

                  return (
                    <div
                      key={zone.zone}
                      className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br p-4 transition-all duration-300 hover:scale-[1.02] ${heatColor}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl font-bold text-white">{zone.zone}</span>
                        <span className={`text-xl font-bold ${textColor}`}>{zone.usage}%</span>
                      </div>
                      <p className="text-xs text-zinc-400 truncate">{zone.name}</p>
                      <p className="text-xs text-zinc-500 mt-1">{zone.vehicles} vehicles</p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Third Row */}
        <div className="mb-10 grid gap-6 lg:grid-cols-3">
          {/* Peak Traffic Times */}
          <div className="group relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-zinc-900/70 p-7 backdrop-blur-3xl transition-all duration-300 hover:border-white/20 hover:shadow-2xl hover:shadow-lime-500/10">
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-lime-500/10 blur-3xl opacity-50 transition-opacity group-hover:opacity-80" />
            
            <div className="relative">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-5 w-5 text-lime-400" />
                <h3 className="text-lg font-semibold text-white">Peak Traffic Times</h3>
              </div>
              <p className="text-sm text-zinc-500 mb-6">Busiest periods of the day</p>

              <div className="space-y-4">
                {peakTrafficTimes.map((peak, index) => (
                  <div
                    key={index}
                    className="relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-800/50 p-4 transition-all duration-300 hover:bg-zinc-800/70"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-white">{peak.label}</span>
                      <span className="text-sm font-bold text-lime-400">{peak.intensity}%</span>
                    </div>
                    <p className="text-xs text-zinc-400 mb-3">{peak.time}</p>
                    <div className="relative h-2 w-full overflow-hidden rounded-full bg-zinc-700">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-lime-500 to-lime-400"
                        style={{ width: `${peak.intensity}%`, boxShadow: "0 0 15px rgba(132,204,22,0.5)" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Trends Card */}
          <div className="group relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-zinc-900/70 p-7 backdrop-blur-3xl transition-all duration-300 hover:border-white/20 hover:shadow-2xl hover:shadow-sky-500/10">
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-sky-500/10 blur-3xl opacity-50 transition-opacity group-hover:opacity-80" />
            
            <div className="relative">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-5 w-5 text-sky-400" />
                <h3 className="text-lg font-semibold text-white">Traffic Trends</h3>
              </div>
              <p className="text-sm text-zinc-500 mb-6">Daily, Weekly, Monthly</p>

              {/* Period Selector */}
              <div className="flex gap-2 mb-6">
                {(["daily", "weekly", "monthly"] as const).map((period) => (
                  <button
                    key={period}
                    onClick={() => setSelectedPeriod(period)}
                    className={`flex-1 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-300 ${
                      selectedPeriod === period
                        ? "bg-sky-500/20 text-sky-400 border border-sky-500/40"
                        : "bg-zinc-800/50 text-zinc-400 border border-transparent hover:bg-zinc-800 hover:text-zinc-300"
                    }`}
                  >
                    {period.charAt(0).toUpperCase() + period.slice(1)}
                  </button>
                ))}
              </div>

              {/* Trend Display */}
              <div className="text-center py-6 px-4 rounded-2xl border border-white/10 bg-zinc-800/30">
                <p className="text-sm text-zinc-400 mb-2">Total Vehicles</p>
                <p className="text-4xl font-bold text-white mb-2">{trendData[selectedPeriod].value}</p>
                <div className="flex items-center justify-center gap-1 text-lime-400">
                  <ArrowUpRight className="h-4 w-4" />
                  <span className="text-sm font-semibold">{trendData[selectedPeriod].change} vs previous</span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl bg-zinc-800/30 p-3">
                  <p className="text-xs text-zinc-500">Daily Avg</p>
                  <p className="text-lg font-bold text-white">1.2K</p>
                </div>
                <div className="rounded-xl bg-zinc-800/30 p-3">
                  <p className="text-xs text-zinc-500">Weekly Avg</p>
                  <p className="text-lg font-bold text-white">8.4K</p>
                </div>
                <div className="rounded-xl bg-zinc-800/30 p-3">
                  <p className="text-xs text-zinc-500">Monthly Avg</p>
                  <p className="text-lg font-bold text-white">34K</p>
                </div>
              </div>
            </div>
          </div>

          {/* Mini Stats */}
          <div className="flex flex-col gap-5">
            <div className="group relative flex-1 overflow-hidden rounded-[1.75rem] border border-white/10 bg-zinc-900/70 p-6 backdrop-blur-3xl transition-all duration-300 hover:border-white/20 hover:shadow-2xl hover:shadow-lime-500/10">
              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-lime-500/10 blur-3xl opacity-50 transition-opacity group-hover:opacity-80" />
              <div className="relative flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-lime-500/15">
                  <CalendarDays className="h-7 w-7 text-lime-400" />
                </div>
                <div>
                  <p className="text-sm text-zinc-400">Busiest Day</p>
                  <p className="text-xl font-bold text-white">Wednesday</p>
                  <p className="text-xs text-lime-400">+23% vs avg</p>
                </div>
              </div>
            </div>

            <div className="group relative flex-1 overflow-hidden rounded-[1.75rem] border border-white/10 bg-zinc-900/70 p-6 backdrop-blur-3xl transition-all duration-300 hover:border-white/20 hover:shadow-2xl hover:shadow-sky-500/10">
              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-sky-500/10 blur-3xl opacity-50 transition-opacity group-hover:opacity-80" />
              <div className="relative flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-500/15">
                  <Users className="h-7 w-7 text-sky-400" />
                </div>
                <div>
                  <p className="text-sm text-zinc-400">Regular Users</p>
                  <p className="text-xl font-bold text-white">847</p>
                  <p className="text-xs text-sky-400">Active permits</p>
                </div>
              </div>
            </div>

            <div className="group relative flex-1 overflow-hidden rounded-[1.75rem] border border-white/10 bg-zinc-900/70 p-6 backdrop-blur-3xl transition-all duration-300 hover:border-white/20 hover:shadow-2xl hover:shadow-amber-500/10">
              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-amber-500/10 blur-3xl opacity-50 transition-opacity group-hover:opacity-80" />
              <div className="relative flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/15">
                  <Clock className="h-7 w-7 text-amber-400" />
                </div>
                <div>
                  <p className="text-sm text-zinc-400">Avg. Duration</p>
                  <p className="text-xl font-bold text-white">4.2 hrs</p>
                  <p className="text-xs text-amber-400">Per vehicle</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Frequent Vehicles Table */}
        <div className="group relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-zinc-900/70 p-7 backdrop-blur-3xl transition-all duration-300 hover:border-white/20 hover:shadow-2xl hover:shadow-lime-500/10">
          <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-lime-500/10 blur-3xl opacity-50 transition-opacity group-hover:opacity-80" />
          
          <div className="relative">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Users className="h-5 w-5 text-lime-400" />
                  <h3 className="text-lg font-semibold text-white">Most Frequent Vehicles</h3>
                </div>
                <p className="text-sm text-zinc-500">Top visitors this month</p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-lime-500/40 bg-lime-500/15 px-3 py-1.5 text-xs font-semibold text-lime-400">
                <TrendingUp className="h-3 w-3" />
                Top 5
              </span>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="pb-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Rank</th>
                    <th className="pb-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Vehicle No.</th>
                    <th className="pb-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Owner</th>
                    <th className="pb-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Type</th>
                    <th className="pb-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Visits</th>
                    <th className="pb-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Avg Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {frequentVehicles.map((vehicle) => (
                    <tr key={vehicle.rank} className="group/row transition-colors hover:bg-white/5">
                      <td className="py-4">
                        <span className={`inline-flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold ${
                          vehicle.rank === 1 ? "bg-amber-500/20 text-amber-400" :
                          vehicle.rank === 2 ? "bg-zinc-400/20 text-zinc-300" :
                          vehicle.rank === 3 ? "bg-amber-700/20 text-amber-600" :
                          "bg-zinc-800 text-zinc-400"
                        }`}>
                          {vehicle.rank}
                        </span>
                      </td>
                      <td className="py-4">
                        <span className="font-mono text-sm font-semibold text-white">{vehicle.vehicleNo}</span>
                      </td>
                      <td className="py-4">
                        <span className="text-sm text-zinc-300">{vehicle.owner}</span>
                      </td>
                      <td className="py-4">
                        <span className="rounded-full bg-sky-500/15 px-3 py-1 text-xs font-medium text-sky-400">
                          {vehicle.type}
                        </span>
                      </td>
                      <td className="py-4">
                        <span className="text-sm font-semibold text-lime-400">{vehicle.visits}</span>
                      </td>
                      <td className="py-4">
                        <span className="text-sm text-zinc-400">{vehicle.avgDuration}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
