"use client";

import { Hero } from "./_components/Hero";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

const HowItWorks = dynamic(() => import("./_components/HowItWorks"), {
  loading: () => <div className="h-screen flex items-center justify-center">Loading...</div>,
});
const Features = dynamic(() => import("./_components/Features"), {
  loading: () => <div className="h-screen flex items-center justify-center">Loading...</div>,
});
const Benefits = dynamic(() => import("./_components/Benifits"), {
  loading: () => <div className="h-screen flex items-center justify-center">Loading...</div>,
});
const Testimonials = dynamic(() => import("./_components/Testimonials"), {
  loading: () => <div className="h-screen flex items-center justify-center">Loading...</div>,
});
const CallToAction = dynamic(() => import("./_components/CallToAction"), {
  loading: () => <div className="h-screen flex items-center justify-center">Loading...</div>,
});

const toastMessages: Record<string, string> = {
  login_required: "You must log in to continue.",
  access_only_for_candidate: "Access denied for Employer.",
  access_only_for_employer: "Access denied for Candidate.",
  // add more mappings as needed
};
export default function Home() {
  const searchParams = useSearchParams();
  useEffect(() => {
    const toastKey = searchParams.get("toast");
    if (toastKey) {
      const message = toastMessages[toastKey] || toastKey.replaceAll("_", " ");
      toast.error(message);
    }
  }, [searchParams]);



  return (
    <div>
      <Hero />
      <HowItWorks />
      <Features />
      <Benefits />
      <Testimonials />
      <CallToAction />
    </div>
  );
}
