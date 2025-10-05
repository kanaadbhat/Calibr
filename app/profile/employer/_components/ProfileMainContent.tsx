"use client";

import React from "react";

interface ProfileMainContentProps {
  children: React.ReactNode;
}

export default function ProfileMainContent({ children }: ProfileMainContentProps) {
  return (
    <div className="lg:col-span-2 space-y-6">
      {children}
    </div>
  );
}
