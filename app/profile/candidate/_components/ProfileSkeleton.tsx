"use client";

import React from "react";

// Define a local Skeleton component to avoid import issues
const Skeleton = ({ className, ...props }: React.ComponentProps<"div">) => {
  return (
    <div
      className={`bg-white/10 animate-pulse rounded-md ${className}`}
      {...props}
    />
  );
};

export default function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0A18] to-[#0D0D20]">
      <div className="max-w-7xl mx-auto pt-16 pb-16 px-4 sm:px-6 lg:px-8">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="h-10 w-48 bg-gradient-to-r from-violet-300/20 to-purple-300/20 rounded-md animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar skeleton */}
          <div className="lg:col-span-1">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <div className="flex flex-col items-center">
                {/* Avatar skeleton */}
                <div className="relative">
                  <div className="w-32 h-32 rounded-full overflow-hidden mb-4">
                    <div className="w-full h-full">
                      <Skeleton className="w-full h-full" />
                    </div>
                  </div>
                </div>
                {/* Name skeleton */}
                <Skeleton className="h-8 w-48 mb-2" />
                {/* Tagline skeleton */}
                <Skeleton className="h-6 w-64 mb-4" />
                {/* Completion bar skeleton */}
                <Skeleton className="h-4 w-full mb-2" />
                {/* Social links skeleton */}
                <div className="flex space-x-4 mt-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <Skeleton className="h-10 w-10 rounded-full" />
                </div>
              </div>
            </div>
          </div>

          {/* Main content skeleton */}
          <div className="lg:col-span-2">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-6">
              {/* Summary skeleton */}
              <Skeleton className="h-6 w-32 mb-4" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>

            {/* Tabs skeleton */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <div className="flex mb-6 space-x-2">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-24" />
              </div>

              {/* Tab content skeleton */}
              <div className="space-y-6">
                <div>
                  <Skeleton className="h-6 w-32 mb-4" />
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}