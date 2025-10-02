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
    <div className={`bg-white/5 backdrop-blur-sm border-r border-white/10 p-4 sm:p-6 pt-16 sm:pt-20 h-screen flex flex-col transition-all duration-300 overflow-hidden ${collapsed ? 'w-16' : 'w-64'}`}>
      <nav className="flex flex-col space-y-2">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          // Build className for nav item
          let baseClass = 'flex items-center transition-all duration-200';
          if (collapsed) {
            baseClass += ' justify-center h-12 sm:h-14 my-1 rounded-xl w-full'; // Centered square with auto margin
          } else {
            baseClass += ' space-x-2 sm:space-x-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg';
          }
          if (pathname === item.href) {
            if (collapsed) {
              // When collapsed, only show background, no border
              baseClass += ' text-white bg-gradient-to-r from-indigo-500/20 to-rose-500/20';
            } else {
              // When expanded, show background and border
              baseClass += ' bg-gradient-to-r from-indigo-500/20 to-rose-500/20 text-white border border-indigo-500/30';
            }
          } else {
            baseClass += ' text-white/60 hover:text-white hover:bg-white/5';
          }
          return (
            <Link
              key={item.href}
              href={item.href}
              className={baseClass}
              title={collapsed ? item.label : undefined}
            >
              <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
              {!collapsed && <span className="font-medium text-sm sm:text-base">{item.label}</span>}
            </Link>
          );
        })}
      </nav>
      {/* Persistent Toggle Button at Bottom */}
      {onToggle && (
        <div className="mt-4 mb-2 flex items-center justify-center">
          <button
            onClick={onToggle}
            className="flex items-center justify-center bg-gradient-to-r from-indigo-500 to-rose-500 hover:from-indigo-600 hover:to-rose-600 rounded-full p-2 text-white shadow-lg hover:shadow-xl transition-all duration-200 border-2 border-white/20"
            title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            ) : (
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
