"use client";

import React from "react";

interface ProfileSidebarProps {
  children: React.ReactNode;
}

export default function ProfileSidebar({ children }: ProfileSidebarProps) {
  return (
    <div className="lg:col-span-1 space-y-6">
      {children}
    </div>
  );
}
