"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useState } from "react";
import CreateJob from "./CreateJob";

export function TopNav({ className }: { className?: string }) {
  const [query, setQuery] = useState("");

  return (
    <header
      className={cn(
        "h-14 bg-[#171726]",
        "flex items-center gap-3 px-4",
        className
      )}
      role="banner">
      <div className="flex-1">
        <label className="sr-only" htmlFor="global-search">
          Search
        </label>
        <div className="relative w-full max-w-xl">
          <Input
            id="global-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search candidates, jobs, or interviews..."
            className="pl-9 text-neutral-100"
          />
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground">
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

      <div className="flex items-center gap-2">
        <CreateJob>
          <Button className="bg-purple-500 text-white font-semibold hover:bg-purple-700">Create Job</Button>
        </CreateJob>
        <Button className="bg-purple-500 text-white font-semibold hover:bg-purple-700">Schedule Interview</Button>
      </div>

      <div aria-label="Current user" className="text-sm text-neutral-100">
        John Doe (Company)
      </div>
    </header>
  );
}
