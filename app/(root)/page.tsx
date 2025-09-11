"use client"
import HowItWorks from "./_components/HowItWorks";
import Features from "./_components/Features";
import Benefits from "./_components/Benifits";
import Testimonials from "./_components/Testimonials";
import CallToAction from "./_components/CallToAction";
import { Hero } from "./_components/Hero";
import { useSession } from "next-auth/react";

export default function Home() {
  const { data } = useSession();
  console.log(data);
  return (
   <div>
    <Hero/>
    <HowItWorks/>
    <Features/>
    <Benefits/>
    <Testimonials/>
    <CallToAction/>
   </div>
  );
}

