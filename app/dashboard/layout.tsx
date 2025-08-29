import type React from "react";
import type { Metadata } from "next";
// import { GeistSans } from "geist/font/sans";
// import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
// import "./globals.css";
import { Sidebar } from "./_components/sidebar";
import { TopNav } from "./_components/top-nav";
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
    <html lang="en" className="antialiased">
      {/* <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}> */}
      <body className={`font-sans`}>
        <div className="min-h-dvh w-full md:flex">
          <Suspense fallback={<div>Loading...</div>}>
            <Sidebar />
            <div className="flex-1 flex flex-col">
              <TopNav />
              <main className="flex-1 p-4 lg:p-6">{children}</main>
            </div>
          </Suspense>
        </div>
        <Analytics />
      </body>
    </html>
  );
}
