"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import Image from "next/image";
import React, { FormEvent, useState } from "react";
import { toast } from "sonner";
import { createUser } from "../actions";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: ""
  });

  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");

  const handleInputChange = (e: FormEvent<HTMLInputElement>) => {
    const { name, value } = e.currentTarget;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    if (!selectedRole) {
      toast.error("Please select a role");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }
    
    setIsLoading(true);
    try {
      const signupData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        role: selectedRole as 'employer' | 'candidate',
      };

      console.log("Attempting to create user:", signupData);
      
      const result = await createUser(signupData);
      
      if (result!.success) {
        toast.success("Account created successfully!");
        
        // Redirect based on role
        if (selectedRole === 'candidate') {
          router.push('/dashboard/candidate');
        } else {
          router.push('/dashboard/employer');
        }
      } else {
        toast.error(result!.message || "Failed to create account");
        console.error("Signup failed:", result!.message);
      }
      
    } catch (err) {
      console.error("Signup error:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    if (!selectedRole) {
      toast.error("Please select a role before continuing with social login");
      return;
    }

    console.log(`Social signup with ${provider}`, {
      firstName: formData.firstName,
      lastName: formData.lastName,
      role: selectedRole,
    });
    toast.info(`${provider} login will be implemented soon!`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#0A0A18] to-[#0D0D20]">
      <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-10 shadow-2xl w-full max-w-[960px] flex justify-between gap-24 mt-10">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/5 rounded-3xl"></div>

        {/* Left side - Illustration */}
        <div className="relative z-10 hidden lg:flex lg:w-1/2 items-center justify-center">
          <div className="w-full h-auto max-w-[400px] flex items-center justify-center">
            <Image
              src="/login.png"
              alt="Signup Illustration"
              width={600}
              height={600}
              className="rounded-4xl h-max"
              priority
            />
          </div>
        </div>

        {/* Right side - Form */}
        <div className="relative z-10 w-full lg:w-1/2 max-w-[480px]">
        <div className="text-center mb-8">
          <h1 className="text-white text-4xl font-bold mb-2">
            <span className="bg-gradient-to-r from-indigo-300 to-rose-300 bg-clip-text text-transparent">
              Create Account
            </span>
          </h1>
          <p className="text-white/70 text-sm">
            Join Calibr as an employer or candidate
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div 
            className={`cursor-pointer p-4 rounded-xl border-2 transition-all duration-300 ${
              selectedRole === "employer" 
                ? "border-indigo-500 bg-indigo-500/10" 
                : "border-white/20 bg-white/5 hover:border-white/40"
            }`}
            onClick={() => setSelectedRole("employer")}
          >
            <div className="text-center">
              <div className="text-2xl mb-2">🏢</div>
              <h3 className="text-white font-semibold text-sm">Employer</h3>
            </div>
          </div>
          
          <div 
            className={`cursor-pointer p-4 rounded-xl border-2 transition-all duration-300 ${
              selectedRole === "candidate" 
                ? "border-rose-500 bg-rose-500/10" 
                : "border-white/20 bg-white/5 hover:border-white/40"
            }`}
            onClick={() => setSelectedRole("candidate")}
          >
            <div className="text-center">
              <div className="text-2xl mb-2">👤</div>
              <h3 className="text-white font-semibold text-sm">Candidate</h3>
            </div>
          </div>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSignUp} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              className="text-white h-12 placeholder:text-white/50 text-md border-white/30 bg-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
              placeholder="First Name"
              required
            />
            <Input
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              className="text-white h-12 placeholder:text-white/50 text-md border-white/30 bg-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
              placeholder="Last Name"
              required
            />
          </div>
          <Input
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="text-white h-12 placeholder:text-white/50 text-md border-white/30 bg-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
            placeholder="Email"
            type="email"
            required
          />
          <Input
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            className="text-white h-12 placeholder:text-white/50 text-md border-white/30 bg-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
            placeholder="Password (min 6 characters)"
            type="password"
            required
            minLength={6}
          />
          <Input
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            className="text-white h-12 placeholder:text-white/50 text-md border-white/30 bg-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
            placeholder="Confirm Password"
            type="password"
            required
          />
          <Button
            type="submit"
            disabled={isLoading || !selectedRole}
            className="w-full h-12 bg-gradient-to-r from-indigo-500 to-rose-500 hover:from-indigo-600 hover:to-rose-600 text-white font-semibold text-md rounded-xl transition-all duration-300 shadow-lg hover:shadow-indigo-500/30 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Creating Account...
              </div>
            ) : (
              "Create Account"
            )}
          </Button>
        </form>

        {/* Login Redirect */}
        <div className="mt-6 text-center">
          <p className="text-white/70 text-sm">
            Already have an account?
            <Link
              href="/login"
              className="text-indigo-300 hover:text-indigo-200 font-semibold hover:underline transition-colors duration-300 ml-1"
            >
              Log in
            </Link>
          </p>
        </div>

        {/* Social Login */}
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
              disabled={!selectedRole}
              className="w-full h-12 bg-white/10 border border-white/20 text-white font-medium rounded-xl hover:bg-white/20 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => handleSocialLogin("Google")}
            >
              <svg
                viewBox="0 0 24 24"
                className="w-5 h-5"
                fill="currentColor"
              >
                <path d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27 3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10 5.35 0 9.25-3.67 9.25-9.09 0-1.15-.15-1.81-.15-1.81z" />
              </svg>
              Google
            </Button>
            <Button
              type="button"
              disabled={!selectedRole}
              className="w-full h-12 bg-white/10 border border-white/20 text-white font-medium rounded-xl hover:bg-white/20 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => handleSocialLogin("GitHub")}
            >
              <svg
                viewBox="0 0 24 24"
                className="w-5 h-5"
                fill="currentColor"
              >
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              GitHub
            </Button>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}