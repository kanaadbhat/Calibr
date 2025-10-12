"use client";

import VideoProcessing from "@/lib/video-processing";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera } from "lucide-react";

export default function VideoDetectionTestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0A18] to-[#0D0D20] py-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Video Processing Component */}
        <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Camera className="h-5 w-5" />
              Live Video Feed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-black/50 rounded-lg overflow-hidden">
              <VideoProcessing />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
