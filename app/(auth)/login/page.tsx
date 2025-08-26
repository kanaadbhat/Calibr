"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import Link from "next/link";
import React, { FormEvent, useState } from "react";
import { toast } from "sonner";
import { OAuthStrategy } from "@clerk/types";
import { useSignUp } from "@clerk/nextjs";

export default function Page() {
  const { signUp } = useSignUp();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: FormEvent<HTMLInputElement>) => {
    const { name, value } = e.currentTarget;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      //implement
    } catch (err) {
      toast.error(err as string);
    } finally {
      setIsLoading(false);
    }
  };

  const signUpWith = async (strategy: OAuthStrategy) => {
    try {
      if (!signUp) return null;
      await signUp.authenticateWithRedirect({
        strategy,
        redirectUrl: "/signup",
        redirectUrlComplete: "/signup",
      });
  
      
    } catch (err: any) {
      console.log(err.errors);
      console.error(err, null, 2);
    }
  };

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
              className="w-full h-14 bg-gradient-to-r from-indigo-500 to-rose-500 hover:from-indigo-600 hover:to-rose-600 text-white font-semibold text-lg rounded-xl transition-all duration-300 shadow-lg hover:shadow-indigo-500/30 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
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
                className="text-indigo-300 hover:text-indigo-200 font-semibold hover:underline transition-colors duration-300">
                Sign up
              </Link>
            </p>
          </div>

          {/* Social Login Options */}
          <div className="mt-8">
            <div className="relative flex items-center">
              <div className="flex-grow border-t border-white/20"></div>
              <span className="flex-shrink mx-4 text-white/50 text-sm">
                or continue with
              </span>
              <div className="flex-grow border-t border-white/20"></div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <Button
                type="button"
                className="w-full h-12 bg-white/10 border border-white/20 text-white font-medium rounded-xl hover:bg-white/20 transition-all duration-300 flex items-center justify-center gap-2"
                onClick={() => signUpWith("oauth_google")}>
                <svg
                  viewBox="0 0 24 24"
                  className="w-5 h-5"
                  fill="currentColor">
                  <path d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27 3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10 5.35 0 9.25-3.67 9.25-9.09 0-1.15-.15-1.81-.15-1.81z" />
                </svg>
                Google
              </Button>
              <div>
              <div id="clerk-captcha"></div>
              <Button
                type="button"
                className="w-full h-12 bg-white/10 border border-white/20 text-white font-medium rounded-xl hover:bg-white/20 transition-all duration-300 flex items-center justify-center gap-2"
                onClick={() => signUpWith("oauth_linkedin_oidc")}>
                <svg
                  viewBox="0 0 24 24"
                  className="w-5 h-5"
                  fill="currentColor">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                </svg>
                LinkedIn
              </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
