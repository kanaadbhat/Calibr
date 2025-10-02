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

export default function Home() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const toastMessage = searchParams.get("toast");
    if (toastMessage) {
      // map toast keys to messages
      switch (toastMessage) {
        case "login_required":
          toast.error("Please log in to continue");
          break;
        case "candidate_cannot_access":
          toast.error("Candidates cannot access this page");
          break;
        case "employer_cannot_access":
          toast.error("Employers cannot access this page");
          break;
        default:
          toast.error(toastMessage.replaceAll("_", " "));
      }
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
