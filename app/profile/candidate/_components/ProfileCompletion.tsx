"use client";

import React from "react";

interface ProfileCompletionProps {
  profileCompletion: number;
}

export default function ProfileCompletion({ profileCompletion }: ProfileCompletionProps) {
  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative w-16 h-16">
            {/* Circular Progress Bar */}
            <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
                className="text-white/20"
              />
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 28}`}
                strokeDashoffset={`${
                  2 * Math.PI * 28 * (1 - profileCompletion / 100)
                }`}
                className="text-violet-500 transition-all duration-500"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold text-white">
                {profileCompletion}%
              </span>
            </div>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white">
              Complete your profile now
            </h3>
            <p className="text-white/70">
              Your profile is {profileCompletion}% complete
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}