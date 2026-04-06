"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  ParkingCircle,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ChevronDown,
  Shield,
  User,
  Briefcase,
  Sparkles,
  Zap,
  Activity,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"

const roles = [
  { id: "admin", label: "Admin", icon: Shield },
  { id: "security", label: "Security Guard", icon: User },
  { id: "staff", label: "Staff", icon: Briefcase },
]

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState(roles[0])
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isRoleOpen, setIsRoleOpen] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // Simulate a brief loading state then navigate to dashboard
    setTimeout(() => {
      router.push("/")
    }, 500)
  }

  return (
    <div className="relative flex min-h-screen bg-zinc-950">
      {/* Ambient background effects */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[700px] w-[700px] rounded-full bg-lime-500/10 blur-[180px]" />
        <div className="absolute -bottom-40 -right-40 h-[600px] w-[600px] rounded-full bg-lime-500/8 blur-[150px]" />
        <div className="absolute left-1/3 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-lime-500/5 blur-[120px]" />
        <div className="absolute right-1/4 top-1/4 h-80 w-80 rounded-full bg-sky-500/5 blur-[100px]" />
        <div className="absolute bottom-1/3 left-1/4 h-72 w-72 rounded-full bg-amber-500/5 blur-[80px]" />
      </div>

      {/* Left Side - Image Section */}
      <div className="relative hidden w-1/2 lg:block">
        {/* Full image background */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=1200&h=1600&fit=crop"
            alt="Modern parking facility"
            fill
            className="object-cover opacity-60"
            priority
          />
          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/40 via-transparent to-zinc-950" />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-zinc-950/40" />
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/60 via-transparent to-transparent" />
        </div>

        {/* Content overlay */}
        <div className="relative flex h-full flex-col justify-between p-12">
          {/* Top - Logo and branding */}
          <div>
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-lime-400 to-lime-500 shadow-2xl shadow-lime-500/40">
                <ParkingCircle className="h-8 w-8 text-zinc-900" strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">ParkVision</h2>
                <p className="text-sm text-zinc-400">AI-Powered Parking</p>
              </div>
            </div>
          </div>

          {/* Middle - Feature highlights */}
          <div className="space-y-8">
            <div className="max-w-lg space-y-6">
              <h1 className="text-5xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-white via-zinc-100 to-zinc-300 bg-clip-text text-transparent">
                  The Future of
                </span>
                <br />
                <span className="bg-gradient-to-r from-lime-400 to-lime-300 bg-clip-text text-transparent">
                  Smart Parking
                </span>
              </h1>
              <p className="text-lg leading-relaxed text-zinc-400">
                Experience next-generation parking management with real-time monitoring, 
                AI-powered vehicle detection, and intelligent space optimization.
              </p>
            </div>

            {/* Feature cards */}
            <div className="flex gap-4">
              <div className="group rounded-2xl border border-white/10 bg-zinc-900/60 px-5 py-4 backdrop-blur-2xl transition-all duration-500 hover:-translate-y-1 hover:border-lime-500/30 hover:shadow-2xl hover:shadow-lime-500/10">
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-lime-500/20">
                  <Zap className="h-5 w-5 text-lime-400" />
                </div>
                <div className="text-sm font-semibold text-white">Real-time</div>
                <div className="text-xs text-zinc-500">Monitoring</div>
              </div>
              <div className="group rounded-2xl border border-white/10 bg-zinc-900/60 px-5 py-4 backdrop-blur-2xl transition-all duration-500 hover:-translate-y-1 hover:border-sky-500/30 hover:shadow-2xl hover:shadow-sky-500/10">
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/20">
                  <Sparkles className="h-5 w-5 text-sky-400" />
                </div>
                <div className="text-sm font-semibold text-white">AI-Powered</div>
                <div className="text-xs text-zinc-500">Detection</div>
              </div>
              <div className="group rounded-2xl border border-white/10 bg-zinc-900/60 px-5 py-4 backdrop-blur-2xl transition-all duration-500 hover:-translate-y-1 hover:border-amber-500/30 hover:shadow-2xl hover:shadow-amber-500/10">
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20">
                  <Activity className="h-5 w-5 text-amber-400" />
                </div>
                <div className="text-sm font-semibold text-white">Smart</div>
                <div className="text-xs text-zinc-500">Analytics</div>
              </div>
            </div>
          </div>

          {/* Bottom - Stats */}
          <div className="flex items-center gap-8">
            <div>
              <div className="text-3xl font-bold text-white">99.9%</div>
              <div className="text-sm text-zinc-500">Uptime</div>
            </div>
            <div className="h-10 w-px bg-zinc-700" />
            <div>
              <div className="text-3xl font-bold text-white">50K+</div>
              <div className="text-sm text-zinc-500">Vehicles Tracked</div>
            </div>
            <div className="h-10 w-px bg-zinc-700" />
            <div>
              <div className="text-3xl font-bold text-white">200+</div>
              <div className="text-sm text-zinc-500">Parking Lots</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="relative flex w-full items-center justify-center p-6 lg:w-1/2 lg:p-12">
        {/* Decorative glow */}
        <div className="absolute right-1/4 top-1/4 h-80 w-80 rounded-full bg-lime-500/10 blur-[120px]" />

        {/* Mobile logo */}
        <div className="absolute left-6 top-6 flex items-center gap-3 lg:hidden">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-lime-400 to-lime-500 shadow-lg shadow-lime-500/30">
            <ParkingCircle className="h-5 w-5 text-zinc-900" strokeWidth={2.5} />
          </div>
          <span className="text-lg font-bold text-white">ParkVision</span>
        </div>

        {/* Login Card */}
        <div
          className="relative w-full max-w-md"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          {/* Card glow effect */}
          <div
            className={`absolute -inset-1 rounded-[2rem] bg-gradient-to-r from-lime-500/20 via-lime-400/10 to-lime-500/20 blur-xl transition-all duration-700 ${
              isHovering ? "opacity-100" : "opacity-50"
            }`}
          />

          {/* Main card */}
          <div className="relative rounded-[1.875rem] border border-white/10 bg-zinc-900/70 p-8 shadow-2xl backdrop-blur-3xl lg:p-10">
            {/* Status badge */}
            <div className="mb-8 flex items-center justify-between">
              <span className="inline-flex items-center gap-2 rounded-full border border-lime-500/30 bg-lime-500/10 px-4 py-2 text-sm font-medium text-lime-400">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-lime-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-lime-400" />
                </span>
                Secure Login
              </span>
              <span className="text-xs text-zinc-600">v2.4.1</span>
            </div>

            {/* Header */}
            <div className="mb-8 space-y-3">
              <h1 className="text-4xl font-bold tracking-tight">
                <span className="bg-gradient-to-r from-white via-zinc-100 to-zinc-300 bg-clip-text text-transparent">
                  Welcome Back
                </span>
              </h1>
              <p className="text-base text-zinc-400">
                Sign in to access your AI-powered parking management dashboard
              </p>
            </div>

            {/* Form */}
            <form className="space-y-5" onSubmit={handleLogin}>
              {/* Email Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Email Address</label>
                <div className="group relative">
                  <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">
                    <Mail className="h-5 w-5 text-zinc-500 transition-colors group-focus-within:text-lime-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@parkvision.ai"
                    className="w-full rounded-2xl border border-white/10 bg-zinc-800/50 py-4 pl-12 pr-4 text-white placeholder-zinc-500 outline-none transition-all duration-300 focus:border-lime-500/50 focus:bg-zinc-800/80 focus:ring-2 focus:ring-lime-500/20"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Password</label>
                <div className="group relative">
                  <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">
                    <Lock className="h-5 w-5 text-zinc-500 transition-colors group-focus-within:text-lime-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full rounded-2xl border border-white/10 bg-zinc-800/50 py-4 pl-12 pr-12 text-white placeholder-zinc-500 outline-none transition-all duration-300 focus:border-lime-500/50 focus:bg-zinc-800/80 focus:ring-2 focus:ring-lime-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 transition-colors hover:text-zinc-300"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Role Dropdown */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Role</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsRoleOpen(!isRoleOpen)}
                    className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-zinc-800/50 px-4 py-4 text-white outline-none transition-all duration-300 hover:border-white/20 focus:border-lime-500/50 focus:ring-2 focus:ring-lime-500/20"
                  >
                    <div className="flex items-center gap-3">
                      <role.icon className="h-5 w-5 text-lime-400" />
                      <span>{role.label}</span>
                    </div>
                    <ChevronDown
                      className={`h-5 w-5 text-zinc-500 transition-transform duration-300 ${
                        isRoleOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Dropdown menu */}
                  {isRoleOpen && (
                    <div className="absolute top-full z-10 mt-2 w-full overflow-hidden rounded-2xl border border-white/10 bg-zinc-800/95 shadow-2xl backdrop-blur-2xl">
                      {roles.map((r) => (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => {
                            setRole(r)
                            setIsRoleOpen(false)
                          }}
                          className={`flex w-full items-center gap-3 px-4 py-3.5 text-left transition-all duration-200 ${
                            role.id === r.id
                              ? "bg-lime-500/10 text-lime-400"
                              : "text-zinc-300 hover:bg-white/5"
                          }`}
                        >
                          <r.icon className="h-5 w-5" />
                          <span>{r.label}</span>
                          {role.id === r.id && (
                            <div className="ml-auto h-2 w-2 rounded-full bg-lime-400" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Remember me & Forgot password */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex cursor-pointer items-center gap-3">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="peer sr-only"
                    />
                    <div className="h-5 w-5 rounded-lg border border-white/20 bg-zinc-800/50 transition-all peer-checked:border-lime-500 peer-checked:bg-lime-500/20" />
                    <div className="absolute inset-0 flex items-center justify-center text-lime-400 opacity-0 transition-opacity peer-checked:opacity-100">
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <span className="text-sm text-zinc-400">Remember me</span>
                </label>
                <Link
                  href="#"
                  className="text-sm font-medium text-lime-400 transition-colors hover:text-lime-300"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="group relative mt-6 w-full overflow-hidden rounded-2xl bg-gradient-to-r from-lime-500 to-lime-400 py-4 text-lg font-semibold text-zinc-900 shadow-xl shadow-lime-500/30 transition-all duration-500 hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-lime-500/40 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {/* Button glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-lime-400 to-lime-300 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <span className="relative flex items-center justify-center gap-2">
                  {isLoading ? (
                    <>
                      <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Signing In...
                    </>
                  ) : (
                    <>
                      Sign In to Dashboard
                      <svg
                        className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </>
                  )}
                </span>
              </button>
            </form>

            {/* Divider */}
            <div className="my-8 flex items-center gap-4">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-zinc-700 to-transparent" />
              <span className="text-xs font-medium uppercase tracking-wider text-zinc-600">
                Secured by
              </span>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-zinc-700 to-transparent" />
            </div>

            {/* Security badges */}
            <div className="flex items-center justify-center gap-6">
              <div className="flex items-center gap-2 text-zinc-500">
                <Shield className="h-4 w-4" />
                <span className="text-xs">256-bit SSL</span>
              </div>
              <div className="h-4 w-px bg-zinc-700" />
              <div className="flex items-center gap-2 text-zinc-500">
                <Lock className="h-4 w-4" />
                <span className="text-xs">2FA Ready</span>
              </div>
              <div className="h-4 w-px bg-zinc-700" />
              <div className="flex items-center gap-2 text-zinc-500">
                <Activity className="h-4 w-4" />
                <span className="text-xs">SOC 2</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-6 left-0 right-0 text-center">
          <p className="text-sm text-zinc-600">
            &copy; 2026 ParkVision Technologies. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}
