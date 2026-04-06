"use client"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  ParkingCircle,
  Car,
  Bell,
  BarChart3,
  LogOut,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface MenuItem {
  id: string
  icon: LucideIcon
  label: string
  href: string
}

const menuItems: MenuItem[] = [
  { id: "dashboard", icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { id: "parking", icon: ParkingCircle, label: "Parking Layout", href: "/parking-layout" },
  { id: "vehicle", icon: Car, label: "Vehicle Upload", href: "/vehicle-upload" },
  { id: "alerts", icon: Bell, label: "Alerts", href: "/alerts" },
  { id: "analytics", icon: BarChart3, label: "Analytics", href: "/analytics" },
]

export function ParkingSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = () => {
    router.push("/login")
  }

  return (
    <aside className="flex h-screen w-20 flex-col items-center justify-between py-6 md:w-24">
      {/* Glassmorphism container */}
      <div className="flex h-full w-16 flex-col items-center rounded-2xl border border-white/10 bg-zinc-900/60 py-6 shadow-2xl backdrop-blur-xl md:w-20">
        {/* Logo */}
        <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-lime-400 to-lime-500 shadow-lg shadow-lime-500/30">
          <ParkingCircle className="h-7 w-7 text-zinc-900" strokeWidth={2.5} />
        </div>

        {/* Menu Items */}
        <nav className="flex flex-1 flex-col items-center gap-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <Link
                key={item.id}
                href={item.href}
                className={cn(
                  "group relative flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-300 ease-out",
                  isActive
                    ? "bg-lime-400/15 text-lime-400"
                    : "text-zinc-500 hover:bg-white/5 hover:text-zinc-300"
                )}
                aria-label={item.label}
              >
                {/* Active glow effect */}
                {isActive && (
                  <div className="absolute inset-0 rounded-xl bg-lime-400/20 blur-md" />
                )}
                
                {/* Active indicator bar */}
                <div
                  className={cn(
                    "absolute -left-3 h-6 w-1 rounded-r-full transition-all duration-300",
                    isActive
                      ? "bg-lime-400 shadow-lg shadow-lime-400/50"
                      : "scale-0 bg-transparent"
                  )}
                />

                {/* Icon */}
                <Icon
                  className={cn(
                    "relative z-10 h-5 w-5 transition-transform duration-300",
                    isActive && "drop-shadow-[0_0_8px_rgba(163,230,53,0.6)]",
                    "group-hover:scale-110"
                  )}
                  strokeWidth={isActive ? 2.5 : 2}
                />

                {/* Tooltip */}
                <span className="pointer-events-none absolute left-full ml-4 whitespace-nowrap rounded-lg bg-zinc-800 px-3 py-2 text-xs font-medium text-zinc-100 opacity-0 shadow-lg transition-all duration-200 group-hover:opacity-100">
                  {item.label}
                  <span className="absolute -left-1 top-1/2 h-2 w-2 -translate-y-1/2 rotate-45 bg-zinc-800" />
                </span>
              </Link>
            )
          })}
        </nav>

        {/* Divider */}
        <div className="my-4 h-px w-8 bg-gradient-to-r from-transparent via-zinc-600 to-transparent" />

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="group relative flex h-12 w-12 items-center justify-center rounded-xl text-zinc-500 transition-all duration-300 hover:bg-red-500/10 hover:text-red-400"
          aria-label="Logout"
        >
          <LogOut className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" strokeWidth={2} />
          
          {/* Tooltip */}
          <span className="pointer-events-none absolute left-full ml-4 whitespace-nowrap rounded-lg bg-zinc-800 px-3 py-2 text-xs font-medium text-zinc-100 opacity-0 shadow-lg transition-all duration-200 group-hover:opacity-100">
            Logout
            <span className="absolute -left-1 top-1/2 h-2 w-2 -translate-y-1/2 rotate-45 bg-zinc-800" />
          </span>
        </button>
      </div>
    </aside>
  )
}
