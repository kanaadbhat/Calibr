"use client";

import VideoProcessing from "@/lib/video-processing";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Camera, Eye, Smile, Hand, Box } from "lucide-react";

export default function VideoDetectionTestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0A18] to-[#0D0D20] py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-violet-300 to-purple-300 bg-clip-text text-transparent mb-4">
            AI Video Detection Test
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Testing real-time detection of mood, gestures, gaze direction, and objects using AI models
          </p>
        </div>

        {/* Warning Alert */}
        <Card className="bg-yellow-600/10 border-yellow-500/30 mb-8">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-400 mt-0.5" />
              <div>
                <p className="text-yellow-300 font-medium">Camera Permission Required</p>
                <p className="text-yellow-200/70 text-sm mt-1">
                  This test requires camera access. Please allow camera permissions when prompted.
                  Open the browser console (F12) to see detection events logged in real-time.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Video Processing Component */}
          <div className="lg:col-span-2">
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

          {/* Detection Info Panel */}
          <div className="space-y-4">
            {/* Mood Detection */}
            <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white text-sm">
                  <Smile className="h-4 w-4 text-green-400" />
                  Mood Detection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-white/60 text-sm">Status:</span>
                  <Badge className="bg-green-600/20 text-green-300 border-green-500/30">
                    Active
                  </Badge>
                </div>
                <p className="text-xs text-white/50">
                  Analyzes facial expressions to detect happiness, neutrality, or other emotions based on mouth movement.
                </p>
              </CardContent>
            </Card>

            {/* Gesture Detection */}
            <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white text-sm">
                  <Hand className="h-4 w-4 text-blue-400" />
                  Gesture Detection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-white/60 text-sm">Status:</span>
                  <Badge className="bg-blue-600/20 text-blue-300 border-blue-500/30">
                    Active
                  </Badge>
                </div>
                <p className="text-xs text-white/50">
                  Tracks head orientation using nose position to detect if looking forward or away.
                </p>
              </CardContent>
            </Card>

            {/* Gaze Detection */}
            <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white text-sm">
                  <Eye className="h-4 w-4 text-purple-400" />
                  Gaze Detection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-white/60 text-sm">Status:</span>
                  <Badge className="bg-purple-600/20 text-purple-300 border-purple-500/30">
                    Active
                  </Badge>
                </div>
                <p className="text-xs text-white/50">
                  Tracks eye position to detect gaze direction: left, right, up, down, or center.
                </p>
              </CardContent>
            </Card>

            {/* Object Detection */}
            <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white text-sm">
                  <Box className="h-4 w-4 text-orange-400" />
                  Object Detection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-white/60 text-sm">Status:</span>
                  <Badge className="bg-orange-600/20 text-orange-300 border-orange-500/30">
                    Active
                  </Badge>
                </div>
                <p className="text-xs text-white/50">
                  Detects 80+ common objects in the frame like phones, books, laptops, etc.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Instructions */}
        <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Testing Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <Smile className="h-4 w-4 text-green-400" />
                  Test Mood Detection
                </h3>
                <ul className="space-y-2 text-white/70 text-sm">
                  <li>• <strong>Happy:</strong> Smile widely (open mouth &gt; 10px)</li>
                  <li>• <strong>Neutral:</strong> Keep a straight face</li>
                  <li>• Check console for: <code className="bg-white/10 px-1 rounded">mood: &quot;happy&quot;</code></li>
                </ul>
              </div>

              <div>
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <Hand className="h-4 w-4 text-blue-400" />
                  Test Gesture Detection
                </h3>
                <ul className="space-y-2 text-white/70 text-sm">
                  <li>• <strong>Looking Forward:</strong> Face the camera directly</li>
                  <li>• <strong>Looking Away:</strong> Turn your head left or right</li>
                  <li>• Check console for: <code className="bg-white/10 px-1 rounded">gesture: &quot;looking_away&quot;</code></li>
                </ul>
              </div>

              <div>
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <Eye className="h-4 w-4 text-purple-400" />
                  Test Gaze Detection
                </h3>
                <ul className="space-y-2 text-white/70 text-sm">
                  <li>• <strong>Left/Right:</strong> Move only your eyes (not head)</li>
                  <li>• <strong>Up/Down:</strong> Look up or down</li>
                  <li>• <strong>Center:</strong> Look straight at camera</li>
                  <li>• Check console for: <code className="bg-white/10 px-1 rounded">gaze: &quot;looking_left&quot;</code></li>
                </ul>
              </div>

              <div>
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <Box className="h-4 w-4 text-orange-400" />
                  Test Object Detection
                </h3>
                <ul className="space-y-2 text-white/70 text-sm">
                  <li>• Hold up your phone in frame</li>
                  <li>• Show a book or laptop</li>
                  <li>• Check console for: <code className="bg-white/10 px-1 rounded">objects: [&quot;cell phone&quot;]</code></li>
                </ul>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-600/10 border border-blue-500/30 rounded-lg">
              <p className="text-blue-300 text-sm">
                <strong>💡 Pro Tip:</strong> Open the browser console (F12 → Console tab) to see real-time event logs. 
                Events are only logged when state changes, so try different expressions, head positions, eye movements, and objects!
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Event Log Example */}
        <Card className="bg-white/5 backdrop-blur-xl border border-white/10 mt-6">
          <CardHeader>
            <CardTitle className="text-white">Example Console Output</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-black/80 rounded-lg p-4 font-mono text-sm">
              <div className="text-green-400">✅ Models loaded</div>
              <div className="text-cyan-400 mt-2">
                📊 Event: {"{"}
              </div>
              <div className="text-white/70 ml-4">
                time: &quot;14:32:15&quot;,
              </div>
              <div className="text-white/70 ml-4">
                mood: &quot;happy&quot;,
              </div>
              <div className="text-white/70 ml-4">
                gesture: &quot;looking_forward&quot;,
              </div>
              <div className="text-white/70 ml-4">
                gaze: &quot;looking_center&quot;,
              </div>
              <div className="text-white/70 ml-4">
                objects: [&quot;cell phone&quot;, &quot;person&quot;]
              </div>
              <div className="text-cyan-400">{"}"}</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
