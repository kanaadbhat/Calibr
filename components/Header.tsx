"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Menu,
  X,
  ArrowRight,
  User,
  LogOut,
  LayoutDashboard,
  UserCircle,
} from "lucide-react";
import { Button } from "./ui/button";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Header: React.FC = () => {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { data: session, status } = useSession();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Routes where header should be hidden
  // Add any route pattern here to hide the header
  const hiddenHeaderRoutes = [
    '/assessment/coding',      // All coding assessment pages
    '/assessment/aptitude',    // All aptitude assessment pages
    '/assessment/technical',   // All technical assessment pages
    '/assessment/hr',          // All HR assessment pages
    '/assessment/precheck',    // System check page
    '/assessment/process'      // Assessment process page
  ];

  // Check if current route should hide header
  const shouldHideHeader = () => {
    if (!pathname) return false;
    return hiddenHeaderRoutes.some(route => pathname.startsWith(route));
  };

  const handleSignOut = async () => {
    await signOut({ redirect: true, callbackUrl: "/" });
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Get user role from session
  const userRole = (session as any)?.user?.role || (session as any)?.role;

  // Generate role-based routes
  const getDashboardRoute = () => {
    if (userRole === "employer") return "/dashboard/employer";
    if (userRole === "candidate") return "/dashboard/candidate";
    return "/dashboard";
  };

  const getProfileRoute = () => {
    if (userRole === "employer") return "/profile/employer";
    if (userRole === "candidate") return "/profile/candidate";
    return "/profile";
  };

  const isDashboardEmployeerPage = pathname?.startsWith("/dashboard/employer");

  // Hide header for assessment routes
  if (shouldHideHeader()) {
    return null;
  }

  // Dashboard header - just logo and profile
  if (isDashboardEmployeerPage) {
    return (
      <header className="fixed top-0 left-0 right-0 bg-[#0A0A18]/90 backdrop-blur-xl border-b border-white/10 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <Link href="/">
                <span className="text-2xl font-bold bg-gradient-to-r from-indigo-300 to-rose-300 bg-clip-text text-transparent cursor-pointer">
                  Calibr
                </span>
              </Link>
            </div>

            {/* Profile Section */}
            <div className="flex items-center space-x-4">
              {status === "authenticated" ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-white/5 transition-colors">
                    {session.user?.image ? (
                      <Image
                        src={session.user.image}
                        alt="User Avatar"
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-rose-500 flex items-center justify-center">
                        <User className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </button>

                  {/* Dropdown Menu */}
                  {isDropdownOpen && (
                    <div className="absolute right-0 top-12 mt-1 w-48 bg-[#0A0A18] border border-white/20 rounded-lg shadow-lg backdrop-blur-xl py-2 z-50">
                      <div className="px-4 py-2 border-b border-white/10">
                        <p className="text-white text-sm font-medium">
                          {session.user?.name}
                        </p>
                        <p className="text-white/60 text-xs">
                          {session.user?.email}
                        </p>
                      </div>

                      <Link
                        href={getDashboardRoute()}
                        className="flex items-center px-4 py-2 text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                        onClick={() => setIsDropdownOpen(false)}>
                        <LayoutDashboard className="h-4 w-4 mr-2" />
                        Dashboard
                      </Link>

                      <Link
                        href={getProfileRoute()}
                        className="flex items-center px-4 py-2 text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                        onClick={() => setIsDropdownOpen(false)}>
                        <UserCircle className="h-4 w-4 mr-2" />
                        Profile
                      </Link>

                      <div className="border-t border-white/10 my-1"></div>

                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          handleSignOut();
                        }}
                        className="flex items-center w-full px-4 py-2 text-white/70 hover:text-white hover:bg-white/5 transition-colors">
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link href="/login">
                  <Button
                    variant="outline"
                    className="bg-[#0A0A18]/90 text-white">
                    Sign In
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>
    );
  }

  // Landing page header - full navigation
  if (!isDashboardEmployeerPage)
    return (
      <header className="fixed top-0 left-0 right-0 bg-[#0A0A18]/90 backdrop-blur-xl border-b border-white/10 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-300 to-rose-300 bg-clip-text text-transparent">
                Calibr
              </span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a
                href="#features"
                className="text-white/70 hover:text-white transition-colors">
                Features
              </a>
              <a
                href="#benefits"
                className="text-white/70 hover:text-white transition-colors">
                Benefits
              </a>
              <a
                href="#testimonials"
                className="text-white/70 hover:text-white transition-colors">
                Testimonials
              </a>
              <a
                href="#pricing"
                className="text-white/70 hover:text-white transition-colors">
                Pricing
              </a>
            </nav>
            {/* Desktop CTA */}
            <div className="hidden md:flex items-center space-x-4">
              {status === "authenticated" ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-white/5 transition-colors">
                    {session.user?.image ? (
                      <Image
                        src={session.user.image}
                        alt="User Avatar"
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-rose-500 flex items-center justify-center">
                        <User className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </button>

                  {/* Dropdown Menu */}
                  {isDropdownOpen && (
                    <div className="absolute right-0 top-12 mt-1 w-48 bg-[#0A0A18] border border-white/20 rounded-lg shadow-lg backdrop-blur-xl py-2 z-50">
                      <div className="px-4 py-2 border-b border-white/10">
                        <p className="text-white text-sm font-medium">
                          {session.user?.name}
                        </p>
                        <p className="text-white/60 text-xs">
                          {session.user?.email}
                        </p>
                      </div>

                      <Link
                        href={getDashboardRoute()}
                        className="flex items-center px-4 py-2 text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                        onClick={() => setIsDropdownOpen(false)}>
                        <LayoutDashboard className="h-4 w-4 mr-2" />
                        Dashboard
                      </Link>

                      <Link
                        href={getProfileRoute()}
                        className="flex items-center px-4 py-2 text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                        onClick={() => setIsDropdownOpen(false)}>
                        <UserCircle className="h-4 w-4 mr-2" />
                        Profile
                      </Link>

                      <div className="border-t border-white/10 my-1"></div>

                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          handleSignOut();
                        }}
                        className="flex items-center w-full px-4 py-2 text-white/70 hover:text-white hover:bg-white/5 transition-colors">
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link href="/login">
                    <Button
                      variant="outline"
                      className="bg-[#0A0A18]/90 text-white">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button className="bg-gradient-to-r from-indigo-500 to-rose-500 text-white hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-300">
                      Get Started <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-white/70 hover:text-white transition-colors">
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-white/10 bg-[#0A0A18]">
              <div className="flex flex-col space-y-4">
                <a
                  href="#features"
                  className="text-white/70 hover:text-white transition-colors py-2">
                  Features
                </a>
                <a
                  href="#benefits"
                  className="text-white/70 hover:text-white transition-colors py-2">
                  Benefits
                </a>
                <a
                  href="#testimonials"
                  className="text-white/70 hover:text-white transition-colors py-2">
                  Testimonials
                </a>
                <a
                  href="#pricing"
                  className="text-white/70 hover:text-white transition-colors py-2">
                  Pricing
                </a>
                <div className="pt-4 border-t border-white/10 flex flex-col space-y-3">
                  <Link href="/login">
                    <Button
                      variant="ghost"
                      className="text-white/70 hover:text-white hover:bg-white/5 justify-start">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button className="bg-gradient-to-r from-indigo-500 to-rose-500 text-white hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 w-full">
                      Get started <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>
    );
};

export default Header;
