"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";

export default function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0A18] to-[#0D0D20]">
      <div className="max-w-7xl mx-auto pt-16 pb-16 px-4 sm:px-6 lg:px-8">
        <main className="py-8">
          <div className="max-w-7xl mx-auto">
            <div className="h-10 w-48 bg-gray-700 rounded mb-8 animate-pulse" />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Sidebar Skeleton */}
              <div className="lg:col-span-1 space-y-6">
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex justify-center mb-4">
                      <div className="w-32 h-32 bg-gray-700 rounded-full animate-pulse" />
                    </div>
                    <div className="space-y-3">
                      <div className="h-6 bg-gray-700 rounded animate-pulse mx-auto w-3/4" />
                      <div className="h-4 bg-gray-700 rounded animate-pulse mx-auto w-1/2" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Main Content Skeleton */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="h-6 bg-gray-700 rounded animate-pulse w-1/4" />
                      <div className="h-4 bg-gray-700 rounded animate-pulse w-full" />
                      <div className="h-4 bg-gray-700 rounded animate-pulse w-3/4" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
