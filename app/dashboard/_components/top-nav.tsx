"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { CreateJobDialog } from "../_components/CreateJob";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { NAV_ITEMS } from "../_components/sidebar";
import { Menu } from "lucide-react";

export function TopNav({ className }: { className?: string }) {
  const [query, setQuery] = useState("");

  return (
    <header
      className={cn(
        "h-14 border-b border-zinc-800 bg-[#0d0d1f] text-zinc-100",
        "flex items-center gap-3 px-4",
        className
      )}
      role="banner">
      {/* Mobile menu */}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-zinc-100 hover:bg-zinc-800"
            aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="p-0 w-80 bg-[#0d0d1f] text-zinc-100 border-r border-zinc-800">
          <div className="h-14 flex items-center px-4 border-b border-zinc-800">
            <span className="text-2xl font-bold bg-gradient-to-r from-indigo-300 to-rose-300 bg-clip-text text-transparent">
              Calibr
            </span>
          </div>
          <div className="p-3 border-b border-zinc-800">
            <label className="sr-only" htmlFor="mobile-search">
              Search
            </label>
            <div className="relative">
              <Input
                id="mobile-search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search candidates, jobs, interviews..."
                className="pl-8 bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-500"
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
          <nav className="py-2">
            <ul>
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800">
                      <Icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>
        </SheetContent>
      </Sheet>

      <div className="flex-1" />

      {/* Actions */}
      <div className="flex items-center gap-2">
        <CreateJobDialog>
          <Button className="bg-purple-500 text-white font-semibold hover:bg-purple-700">
            Create Job
          </Button>
        </CreateJobDialog>
        <Button className="bg-purple-500 text-white font-semibold hover:bg-purple-700">
          Schedule Interview
        </Button>
      </div>

      <div aria-label="Current user" className="text-sm text-zinc-400">
        John Doe (Company)
      </div>
    </header>
  );
}
