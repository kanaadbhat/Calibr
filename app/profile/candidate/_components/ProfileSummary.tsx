"use client";

import React from "react";

interface ProfileSummaryProps {
  summary?: string;
}

export default function ProfileSummary({ summary }: ProfileSummaryProps) {
  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
      <h3 className="text-xl font-semibold text-white mb-4">Summary</h3>
      <p className="text-white/80 leading-relaxed">
        {summary || "No summary provided yet."}
      </p>
    </div>
  );
}