"use client";
import React, { useState } from "react";
import { Menu, X, ArrowRight } from "lucide-react";
import { Button } from "./ui/button";
import { usePathname } from "next/navigation";

const Header: React.FC = () => {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isDashboardEmployeerPage = pathname?.startsWith("/dashboard/employeer");

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
              <Button
                variant="ghost"
                className="text-white/70 hover:text-white hover:bg-white/5">
                Sign In
              </Button>
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
                  <Button
                    variant="ghost"
                    className="text-white/70 hover:text-white hover:bg-white/5 justify-start">
                    Sign In
                  </Button>
                  <Button className="bg-gradient-to-r from-indigo-500 to-rose-500 text-white hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-300">
                    Get Started <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>
    );
};

export default Header;
