"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const items = [
  { label: "Dashboard", href: "/" },
  { label: "Job Postings", href: "/jobs" },
  { label: "Candidates", href: "/candidates" },
  { label: "Interviews", href: "/interviews" },
  { label: "Live Monitoring", href: "/monitoring" },
  { label: "Analytics", href: "/analytics" },
  { label: "Team", href: "/team" },
  { label: "Settings", href: "/settings" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="hidden md:flex md:w-60 lg:w-64 shrink-0 flex-col bg-zinc-900 text-zinc-100"
      aria-label="Primary">
      <div className="h-14 flex items-center px-4 border-b border-zinc-800">
        <span className="font-semibold text-lg tracking-tight">Calibr</span>
      </div>

      <nav className="flex-1 py-2">
        <ul className="flex flex-col">
          {items.map((item) => {
            const active = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "block px-4 py-2.5 text-sm",
                    "hover:bg-zinc-800 focus:bg-zinc-800 focus:outline-none",
                    active ? "bg-zinc-800" : "bg-transparent"
                  )}
                  aria-current={active ? "page" : undefined}>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
