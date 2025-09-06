// Sidebar navigation for the dashboard
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sidebar as ShadcnSidebar, useSidebar } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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
  Plus,
  Calendar,
} from "lucide-react";
import { CreateJobDialog } from "./CreateJob";

const items = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Job Postings", href: "/jobs", icon: Briefcase },
  { label: "Candidates", href: "/candidates", icon: Users },
  { label: "Interviews", href: "/interviews", icon: CalendarClock },
  { label: "Live Monitoring", href: "/monitoring", icon: ActivitySquare },
  { label: "Analytics", href: "/analytics", icon: LineChart },
  { label: "Team", href: "/team", icon: UsersRound },
  { label: "Settings", href: "/settings", icon: SettingsIcon },
];

// Export items so TopNav can render them inside the mobile sheet
export const NAV_ITEMS = items;

export function Sidebar() {
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const { state, toggleSidebar } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <ShadcnSidebar
      collapsible="icon"
      className={cn(
        "h-screen shrink-0 flex-col transition-all duration-300 overflow-hidden",
        "sticky top-0 z-50",
        "border-r border-white/10 p-4 sm:p-6 pt-16 sm:pt-20",
        "bg-[#0d0d1f] text-white",
        "[&_.bg-sidebar]:!bg-[#0d0d1f] [&_.bg-background]:!bg-[#0d0d1f] [&_.text-sidebar-foreground]:!text-white [&_.text-foreground]:!text-white"
      )}
      style={{ backgroundColor: "#0d0d1f" }}
      aria-label="Primary"
      aria-expanded={!collapsed}
    >
      {!collapsed && (
        <div className="mb-4">
          <label htmlFor="sidebar-search" className="sr-only">
            Search
          </label>
          <div className="relative">
            <Input
              id="sidebar-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search candidates, jobs, interviews..."
              className="pl-8 bg-white/5 border-white/10 text-white placeholder:text-white/60"
            />
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60"
            >
              <path
                d="M21 21l-4.3-4.3m1.3-4.7a7 7 0 11-14 0 7 7 0 0114 0z"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      )}

      {/* Action Buttons Section */}
      <div className={cn("mb-6 space-y-3", collapsed && "flex flex-col items-center")}> 
        <CreateJobDialog>
          <Button
            className={cn(
              "bg-purple-500 text-white font-semibold hover:bg-purple-700 transition-all",
              collapsed
                ? "h-9 w-9 p-0 flex items-center justify-center rounded-xl" 
                : "w-full flex items-center justify-center gap-2 rounded-md px-4 py-2"
            )}
            aria-label="Create Job"
            title={collapsed ? "Create Job" : undefined}
          >
            <TooltipProvider delayDuration={200}>
              <Tooltip open={collapsed ? undefined : false}>
                <TooltipTrigger asChild>
                  <span className="flex items-center justify-center w-full h-full">
                    <Plus className="w-4 h-4" />
                    {!collapsed && <span>Create Job</span>}
                  </span>
                </TooltipTrigger>
                {collapsed && (
                  <TooltipContent side="right">Create Job</TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </Button>
        </CreateJobDialog>

        <TooltipProvider delayDuration={200}>
          <Tooltip open={collapsed ? undefined : false}>
            <TooltipTrigger asChild>
              <Button
                className={cn(
                  "bg-indigo-500 text-white font-semibold hover:bg-indigo-700 transition-all",
                  collapsed
                    ? "h-9 w-9 p-0 flex items-center justify-center rounded-xl"
                    : "w-full flex items-center justify-center gap-2 rounded-md px-4 py-2"
                )}
                aria-label="Schedule Interview"
                title={collapsed ? "Schedule Interview" : undefined}
              >
                <Calendar className="w-4 h-4" />
                {!collapsed && <span>Schedule Interview</span>}
              </Button>
            </TooltipTrigger>
            {collapsed && (
              <TooltipContent side="right">Schedule Interview</TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>

      <TooltipProvider delayDuration={200}>
        <nav className="flex-1">
          <ul className="flex flex-col">
            {items.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;

              let baseClass = "flex items-center transition-all duration-200";
              if (collapsed) {
                baseClass +=
                  " justify-center h-12 sm:h-14 my-1 rounded-xl w-full";
              } else {
                baseClass +=
                  " space-x-2 sm:space-x-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg";
              }
              if (active) {
                if (collapsed) {
                  baseClass +=
                    " text-white bg-gradient-to-r from-indigo-500/20 to-rose-500/20";
                } else {
                  baseClass +=
                    " bg-gradient-to-r from-indigo-500/20 to-rose-500/20 text-white border border-indigo-500/30";
                }
              } else {
                baseClass +=
                  " text-white/60 hover:text-white hover:bg-gradient-to-r hover:from-indigo-500/20 hover:to-rose-500/20";
              }

              return (
                <li key={item.href}>
                  <Tooltip open={collapsed ? undefined : false}>
                    <TooltipTrigger asChild>
                      <Link
                        href={item.href}
                        className={baseClass}
                        aria-current={active ? "page" : undefined}
                        title={collapsed ? item.label : undefined}
                      >
                        <Icon
                          className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0"
                          aria-hidden="true"
                        />
                        {!collapsed && (
                          <span className="font-medium text-sm sm:text-base">
                            {item.label}
                          </span>
                        )}
                      </Link>
                    </TooltipTrigger>
                    {collapsed && (
                      <TooltipContent side="right">{item.label}</TooltipContent>
                    )}
                  </Tooltip>
                </li>
              );
            })}
          </ul>
        </nav>
      </TooltipProvider>

      <div className="mt-auto pt-4 sticky bottom-4 flex items-center justify-center">
        <button
          onClick={toggleSidebar}
          className={cn(
            "flex items-center justify-center rounded-full text-white shadow-lg hover:shadow-xl transition-all duration-200 border-2 border-white/20",
            "bg-gradient-to-r from-indigo-500 to-rose-500 hover:from-indigo-600 hover:to-rose-600",
            "h-9 w-9"
          )}
          title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          aria-label="Toggle sidebar"
          aria-pressed={collapsed}
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      </div>
    </ShadcnSidebar>
  );
}