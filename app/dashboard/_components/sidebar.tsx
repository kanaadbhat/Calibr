"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";

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

export const NAV_ITEMS = items;

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("sidebar:collapsed");
    if (stored) setCollapsed(stored === "1");
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        window.localStorage.setItem("sidebar:collapsed", next ? "1" : "0");
      }
      return next;
    });
  };

  return (
    <aside
      className={cn(
        "hidden md:flex shrink-0 flex-col bg-[#0d0d1f] text-zinc-100 border-r border-zinc-800 transition-[width] duration-200",
        collapsed ? "md:w-16 lg:w-20" : "md:w-60 lg:w-64"
      )}
      aria-label="Primary"
      aria-expanded={!collapsed}>
      <div className="h-14 flex items-center px-4 border-b border-zinc-800">
        <span
          className={cn(
            "text-2xl font-bold bg-gradient-to-r from-indigo-300 to-rose-300 bg-clip-text text-transparent",
            collapsed && "sr-only"
          )}>
          Calibr
        </span>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "ml-auto hover:bg-[#171726]",
            collapsed ? "mx-auto" : ""
          )}
          onClick={toggleCollapsed}
          aria-label="Toggle sidebar"
          aria-pressed={collapsed}>
          {collapsed ? (
            <ChevronRight className="h-4 w-4 text-white" />
          ) : (
            <ChevronLeft className="h-4 w-4 text-white" />
          )}
        </Button>
      </div>

      {!collapsed && (
        <div className="px-2 py-2 border-b border-zinc-800">
          <label htmlFor="sidebar-search" className="sr-only">
            Search
          </label>
          <div className="relative">
            <Input
              id="sidebar-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search candidates, jobs, interviews..."
              className="pl-8 bg-[#171726] border-zinc-800 text-zinc-100 placeholder:text-zinc-500"
            />
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500">
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

      <TooltipProvider delayDuration={200}>
        <nav className="flex-1 py-2">
          <ul className="flex flex-col">
            {items.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Tooltip open={collapsed ? undefined : false}>
                    <TooltipTrigger asChild>
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2.5 text-sm transition-colors",
                          collapsed ? "justify-center" : "justify-start",
                          "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800",
                          active
                            ? "bg-zinc-800 text-zinc-100 font-medium"
                            : "bg-transparent"
                        )}
                        aria-current={active ? "page" : undefined}>
                        <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                        <span className={cn(collapsed && "sr-only")}>
                          {item.label}
                        </span>
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
    </aside>
  );
}
