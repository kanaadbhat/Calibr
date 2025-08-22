"use client"
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react'

export default function Page() {
 const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const handleInputChange = () => {
    setIsLoading(true)
    setFormData({email : "" , password : ""})
  }
  const handleLogin = () => {

  }

  return (
  <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#0A0A18] to-[#0D0D20]">
    <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-10 shadow-2xl w-full max-w-[960px] flex justify-between gap-24">
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/5 rounded-3xl"></div>

      {/* Left side - Illustration */}
      <div className="relative z-10 hidden lg:flex lg:w-1/2 items-center justify-center">
        <div className="w-full h-auto max-w-[400px] flex items-center justify-center">
              <Image 
                  src="/login.png" 
                  alt="Illustration" 
                  width={600}
                  height={600}
                  className="rounded-4xl h-max" 
                  priority
              />
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="relative z-10 w-full lg:w-1/2">
        <div className="text-center mb-8">
          <h1 className="text-white text-4xl font-bold mb-2">
            <span className="bg-gradient-to-r from-indigo-300 to-rose-300 bg-clip-text text-transparent">
              Log In
            </span>
          </h1>
          <p className="text-white/70 text-sm">Access your Calibr account</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <Input
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="text-white h-14 placeholder:text-white/50 text-lg w-full border-white/30 bg-white/10 rounded-xl backdrop-blur-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
            placeholder="Email"
            type="email"
            required
          />
          <Input
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            className="text-white h-14 placeholder:text-white/50 text-lg w-full border-white/30 bg-white/10 rounded-xl backdrop-blur-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
            placeholder="Password"
            type="password"
            required
          />
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-14 bg-gradient-to-r from-indigo-500 to-rose-500 hover:from-indigo-600 hover:to-rose-600 text-white font-semibold text-lg rounded-xl transition-all duration-300 shadow-lg hover:shadow-indigo-500/30 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Logging In...
              </div>
            ) : (
              "Log In"
            )}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-white/70 text-sm">
            Don`t have an account? 
            <Link
              href="/sign-up"
              className="text-indigo-300 hover:text-indigo-200 font-semibold hover:underline transition-colors duration-300"
            >
              Sign up
            </Link>
          </p>
        </div>

        {/* Social Login Options */}
        <div className="mt-8">
          <div className="relative flex items-center">
            <div className="flex-grow border-t border-white/20"></div>
            <span className="flex-shrink mx-4 text-white/50 text-sm">or continue with</span>
            <div className="flex-grow border-t border-white/20"></div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-6">
            <Button
              type="button"
              className="w-full h-12 bg-white/10 border border-white/20 text-white font-medium rounded-xl hover:bg-white/20 transition-all duration-300"
            >
              Google
            </Button>
            <Button
              type="button"
              className="w-full h-12 bg-white/10 border border-white/20 text-white font-medium rounded-xl hover:bg-white/20 transition-all duration-300"
            >
              LinkedIn
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
);
}
