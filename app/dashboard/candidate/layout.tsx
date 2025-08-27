"use client";
import React, { useState } from 'react';
import Sidebar from './_components/Sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-gradient-to-br from-[#0A0A18] to-[#0D0D20]">
      {/* Sidebar for desktop only */}
      <div className={`hidden md:block transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-64'}`}>
        <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      </div>

    <main className="flex-1 p-6 pt-16 md:px-36 px-4 overflow-auto h-screen">
        {children}
      </main>
    </div>
  );
}
