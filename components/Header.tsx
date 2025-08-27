"use client";
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Check if we're on a dashboard page
  const isDashboardPage = pathname?.startsWith('/dashboard');

  // Close menu when clicking outside for dashboard pages
  useEffect(() => {
    if (!isDashboardPage || !isMenuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDashboardPage, isMenuOpen]);

  return (
    <header className="fixed top-0 left-0 right-0 bg-[#0A0A18]/90 backdrop-blur-xl border-b border-white/10 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-indigo-300 to-rose-300 bg-clip-text text-transparent cursor-pointer">
              Calibr
            </Link>
          </div>

          {/* Desktop Navigation */}
          {!isDashboardPage && (
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-white/70 hover:text-white transition-colors">Features</a>
              <a href="#benefits" className="text-white/70 hover:text-white transition-colors">Benefits</a>
              <a href="#testimonials" className="text-white/70 hover:text-white transition-colors">Testimonials</a>
              <a href="#pricing" className="text-white/70 hover:text-white transition-colors">Pricing</a>
            </nav>
          )}

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center space-x-4">
            {isDashboardPage ? (
              <Button variant="ghost" className="text-white/70 hover:text-white hover:bg-white/5">
                Sign Out
              </Button>
            ) : (
              <Button variant="ghost" className="text-white/70 hover:text-white hover:bg-white/5">
                Sign In
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-white/70 hover:text-white transition-colors"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <>
            {isDashboardPage ? (
              // Dashboard Mobile Menu - Right-aligned with auto width
              <div ref={menuRef} className="md:hidden fixed top-16 right-0 z-40 bg-[#0A0A18]/95 backdrop-blur-xl border border-white/10 rounded-l-lg shadow-xl">
                <div className="flex flex-col py-4 min-w-[200px] max-w-[280px]">
                  <div className="px-4 pb-3 border-b border-white/10">
                    <h3 className="text-white font-semibold text-lg">Candidate Portal</h3>
                  </div>
                  <div className="flex flex-col space-y-1 p-2">
                    <Link href="/dashboard/candidate" className="flex items-center space-x-3 px-3 py-2.5 rounded-md text-white/70 hover:text-white hover:bg-white/10 transition-colors">
                      <span className="text-base">📊</span>
                      <span className="font-medium">Dashboard</span>
                    </Link>
                    <Link href="/dashboard/candidate/assessments" className="flex items-center space-x-3 px-3 py-2.5 rounded-md text-white/70 hover:text-white hover:bg-white/10 transition-colors">
                      <span className="text-base">📝</span>
                      <span className="font-medium">Assessments</span>
                    </Link>
                    <Link href="/dashboard/candidate/interviews" className="flex items-center space-x-3 px-3 py-2.5 rounded-md text-white/70 hover:text-white hover:bg-white/10 transition-colors">
                      <span className="text-base">🎯</span>
                      <span className="font-medium">Interviews</span>
                    </Link>
                    <Link href="/dashboard/candidate/profile" className="flex items-center space-x-3 px-3 py-2.5 rounded-md text-white/70 hover:text-white hover:bg-white/10 transition-colors">
                      <span className="text-base">👤</span>
                      <span className="font-medium">Profile</span>
                    </Link>
                    <Link href="/dashboard/candidate/jobs" className="flex items-center space-x-3 px-3 py-2.5 rounded-md text-white/70 hover:text-white hover:bg-white/10 transition-colors">
                      <span className="text-base">💼</span>
                      <span className="font-medium">Job Matches</span>
                    </Link>
                    <Link href="/dashboard/candidate/settings" className="flex items-center space-x-3 px-3 py-2.5 rounded-md text-white/70 hover:text-white hover:bg-white/10 transition-colors">
                      <span className="text-base">⚙️</span>
                      <span className="font-medium">Settings</span>
                    </Link>
                  </div>
                  <div className="pt-2 mt-2 border-t border-white/10 px-2">
                    <Button variant="ghost" className="text-white/70 hover:text-white hover:bg-white/10 justify-start w-full">
                      Sign Out
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              // Landing Page Mobile Menu - Full width
              <div className="md:hidden py-4 border-t border-white/10 bg-[#0A0A18]">
                <div className="flex flex-col space-y-4">
                  <div className="flex flex-row flex-wrap gap-4 justify-center">
                    <a href="#features" className="text-white/70 hover:text-white transition-colors py-2">Features</a>
                    <a href="#benefits" className="text-white/70 hover:text-white transition-colors py-2">Benefits</a>
                    <a href="#testimonials" className="text-white/70 hover:text-white transition-colors py-2">Testimonials</a>
                    <a href="#pricing" className="text-white/70 hover:text-white transition-colors py-2">Pricing</a>
                  </div>
                  <div className="pt-4 border-t border-white/10 flex flex-col space-y-3">
                    <Button variant="ghost" className="text-white/70 hover:text-white hover:bg-white/5 justify-start">
                      Sign In
                    </Button>
                    <Button className="bg-gradient-to-r from-indigo-500 to-rose-500 text-white hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-300">
                      Get Started <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </header>
  );
};

export default Header;