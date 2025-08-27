'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, BarChart3, FileText, Target, User, Briefcase, Settings } from 'lucide-react';

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed = false, onToggle }) => {
  const pathname = usePathname();

  const navItems = [
    { icon: BarChart3, label: 'Dashboard', href: '/dashboard/candidate' },
    { icon: FileText, label: 'Assessments', href: '/dashboard/candidate/assessments' },
    { icon: Target, label: 'Interviews', href: '/dashboard/candidate/interviews' },
    { icon: User, label: 'Profile', href: '/dashboard/candidate/profile' },
    { icon: Briefcase, label: 'Job Matches', href: '/dashboard/candidate/jobs' },
    { icon: Settings, label: 'Settings', href: '/dashboard/candidate/settings' },
  ];

  return (
    <div className={`bg-white/5 backdrop-blur-sm border-r border-white/10 p-6 pt-20 h-full flex flex-col transition-all duration-300 relative ${collapsed ? 'w-16' : 'w-64'}`}>
      {/* Toggle Button */}
      {onToggle && (
        <button
          onClick={onToggle}
          className="absolute -right-4 top-24 bg-gradient-to-r from-indigo-500 to-rose-500 hover:from-indigo-600 hover:to-rose-600 rounded-full p-2.5 text-white shadow-lg hover:shadow-xl transition-all duration-200 z-50 border-2 border-white/20"
          title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      )}

      {!collapsed && (
        <h2 className="text-white text-xl font-bold pb-4 border-b border-white/10 mb-6">
          Candidate Portal
        </h2>
      )}
      <nav className="flex flex-col space-y-2">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center ${collapsed ? 'justify-center px-2' : 'space-x-3 px-4'} py-3 rounded-lg transition-all duration-200 ${
                pathname === item.href
                  ? 'bg-gradient-to-r from-indigo-500/20 to-rose-500/20 text-white border border-indigo-500/30'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <IconComponent className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="font-medium">{item.label}</span>}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;
