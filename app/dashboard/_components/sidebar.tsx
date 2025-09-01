// Collapsible dark themed Sidebar
"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Briefcase,
  Users,
  CalendarClock,
  ActivitySquare,
  LineChart,
  UsersRound,
  SettingsIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const items = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Job Postings", href: "/jobs", icon: Briefcase },
  { label: "Candidates", href: "/candidates", icon: Users },
  { label: "Interviews", href: "/interviews", icon: CalendarClock },
  { label: "Live Monitoring", href: "/monitoring", icon: ActivitySquare },
  { label: "Analytics", href: "/analytics", icon: LineChart },
  { label: "Team", href: "/team", icon: UsersRound },
  { label: "Settings", href: "/settings", icon: SettingsIcon },
]

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return
    const stored = window.localStorage.getItem("sidebar:collapsed")
    if (stored) setCollapsed(stored === "1")
  }, [])

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev
      if (typeof window !== "undefined") {
        window.localStorage.setItem("sidebar:collapsed", next ? "1" : "0")
      }
      return next
    })
  }

  return (
    <aside
      className={cn(
        "hidden md:flex shrink-0 flex-col transition-[width] duration-200 bg-[#0d0d1f] text-zinc-100 border-r border-zinc-800",
        collapsed ? "md:w-16 lg:w-20" : "md:w-60 lg:w-64",
      )}
      aria-label="Primary"
      aria-expanded={!collapsed}
    >
      <div className="h-14 flex items-center px-2 border-b border-zinc-800">
        <span className={cn("font-semibold text-lg tracking-tight px-2", collapsed && "sr-only")}>Calibr</span>
        <Button
          variant="ghost"
          size="icon"
          className={cn("ml-auto hover:bg-[#171726]", collapsed ? "mx-auto" : "")}
          onClick={toggleCollapsed}
          aria-label="Toggle sidebar"
          aria-pressed={collapsed}
        >
          {collapsed ? <ChevronRight className="h-4 w-4 text-neutral-100" /> : <ChevronLeft className="h-4 w-4 text-neutral-100" />}
        </Button>
      </div>

      <TooltipProvider delayDuration={200}>
        <nav className="flex-1 py-2">
          <ul className="flex flex-col">
            {items.map((item) => {
              const active = pathname === item.href
              const Icon = item.icon
              return (
                <li key={item.href}>
                  <Tooltip open={collapsed ? undefined : false}>
                    <TooltipTrigger asChild>
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2.5 text-sm rounded-none transition-colors",
                          collapsed ? "justify-center" : "justify-start",
                          "text-zinc-400 hover:text-zinc-100",
                          "hover:bg-zinc-800 focus:bg-zinc-800 focus:outline-none",
                          active
                            ? "bg-zinc-800 text-zinc-100 font-medium " +
                              (collapsed ? "ring-1 ring-zinc-700" : "border-l-2 border-purple-500")
                            : "bg-transparent",
                        )}
                        aria-current={active ? "page" : undefined}
                      >
                        <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                        <span className={cn(collapsed && "sr-only")}>{item.label}</span>
                      </Link>
                    </TooltipTrigger>
                    {collapsed && <TooltipContent side="right">{item.label}</TooltipContent>}
                  </Tooltip>
                </li>
              )
            })}
          </ul>
        </nav>
      </TooltipProvider>
    </aside>
  )
}
