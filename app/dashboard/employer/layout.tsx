import type React from "react";
import type { Metadata } from "next";
import { Toaster } from "sonner";
// import { GeistSans } from "geist/font/sans";
// import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
// import "./globals.css";
import { Sidebar}  from "./_components/sidebar";
import Header from "@/components/Header";
import { Suspense } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

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
      <SidebarProvider defaultOpen={true}>
        <div className="min-h-dvh w-full flex bg-[#0d0d1f]">
          <Suspense fallback={<div>Loading...</div>}>
            <Sidebar />
            <SidebarInset className="flex-1 flex flex-col bg-[#0d0d1f] text-white">
              <Header />
              <main className="flex-1 p-4 lg:p-6 bg-[#0d0d1f]">{children}</main>
            </SidebarInset>
          </Suspense>
        </div>
      </SidebarProvider>
      <Analytics />
      <Toaster 
        position="bottom-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "white",         
            color: "#7C3AED",         
            border: "1px solid #E9D5FF", 
          },
          classNames: {
            icon: "text-violet-600",   
            title: "text-violet-600",   
            description: "text-violet-600", 
            closeButton: "text-violet-600 hover:text-violet-800",
          },
        }}
      />
    </main>
  );
}
