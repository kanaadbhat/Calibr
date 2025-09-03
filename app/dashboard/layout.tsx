import type React from "react";
import type { Metadata } from "next";
// import { GeistSans } from "geist/font/sans";
// import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
// import "./globals.css";
import { Sidebar } from "./_components/sidebar";
import Header from "./_components/Header";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Calibr Dashboard",
  description: "Dashboard UI scaffold",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className={`font-sans bg-[#0d0d1f]`}>
      <div className="min-h-dvh w-full md:flex">
        <Suspense fallback={<div>Loading...</div>}>
          <Sidebar />
          <div className="flex-1 flex flex-col">
            <Header />
            <main className="flex-1 p-4 lg:p-6">{children}</main>
          </div>
        </Suspense>
      </div>
      <Analytics />
    </main>
  );
}
