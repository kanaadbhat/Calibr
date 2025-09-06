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

      <main className="flex-1 overflow-auto h-screen">
        <div className="p-4 sm:p-6 lg:p-8 xl:p-12 pt-16 md:pt-20">
          {children}
        </div>
      </main>
    </div>
  );
}
