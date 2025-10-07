"use client";
import { useEffect, useRef, useState } from "react";
import * as tf from "@tensorflow/tfjs";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import * as faceLandmarksDetection from "@tensorflow-models/face-landmarks-detection";
import { Button } from "@/components/ui/button";
import { AlertCircle, Camera as CameraIcon } from "lucide-react";

// Declare global MediaPipe types
declare global {
  interface Window {
    Holistic: any;
    Camera: any;
  }
}

export default function VideoProcessing() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraStatus, setCameraStatus] = useState<"idle" | "requesting" | "granted" | "denied">("idle");
  const [error, setError] = useState<string>("");
  const [mediapipeLoaded, setMediapipeLoaded] = useState(false);
  const [detectionLogs, setDetectionLogs] = useState<any[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    // Load MediaPipe scripts from CDN
    const loadMediaPipeScripts = () => {
      if (typeof window !== 'undefined' && !window.Holistic) {
        // Load Holistic
        const holisticScript = document.createElement('script');
        holisticScript.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/holistic/holistic.js';
        holisticScript.crossOrigin = 'anonymous';
        
        // Load Camera Utils
        const cameraScript = document.createElement('script');
        cameraScript.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js';
        cameraScript.crossOrigin = 'anonymous';

        cameraScript.onload = () => {
          console.log("✅ MediaPipe scripts loaded");
          setMediapipeLoaded(true);
        };

        document.body.appendChild(holisticScript);
        document.body.appendChild(cameraScript);
      } else if (window.Holistic) {
        setMediapipeLoaded(true);
      }
    };

    loadMediaPipeScripts();

    // Cleanup function
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleStartDetection = async () => {
    setCameraStatus("requesting");
    setError("");

    try {
      console.log("🎬 Starting detection...");
      
      // Request camera access first
      console.log("📷 Requesting camera access...");
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream; // Store stream reference for cleanup
      console.log("✅ Camera access granted");
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        console.log("📹 Video stream attached");
        
        // Wait for video to actually start playing
        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error("Video metadata load timeout"));
          }, 5000);
          
          videoRef.current!.onloadedmetadata = async () => {
            clearTimeout(timeout);
            console.log("📊 Video metadata loaded");
            try {
              await videoRef.current!.play();
              console.log("▶️ Video playing, readyState:", videoRef.current!.readyState);
              // Give it a moment to stabilize
              setTimeout(resolve, 500);
            } catch (err) {
              console.error("❌ Video play error:", err);
              reject(err);
            }
          };
        });
      } else {
        throw new Error("Video ref is null");
      }

      console.log("🔄 Initializing TensorFlow...");
      // Initialize TensorFlow.js backend
      await tf.ready();
      console.log("✅ TensorFlow backend initialized:", tf.getBackend());

      // Initialize variables for detection
      let objectModel: cocoSsd.ObjectDetection;
      let emotionModel: faceLandmarksDetection.FaceLandmarksDetector;
      let holistic: any = null;

      // Track last state for "on-change" logging
      let lastMood: string | null = null;
      let lastGesture: string | null = null;
      let lastGaze: string | null = null;
      let lastObjects: string[] = [];
      let lastLogTime = 0; // Track last log timestamp

      // Load AI models
      const loadModels = async () => {
        objectModel = await cocoSsd.load();
        emotionModel = await faceLandmarksDetection.createDetector(
          faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh,
          { runtime: "tfjs", refineLandmarks: true }
        );
        console.log("✅ Models loaded");
      };

      // Setup MediaPipe Holistic
      const setupHolistic = async () => {
        // Wait for MediaPipe to be available
        if (!window.Holistic || !window.Camera) {
          throw new Error("MediaPipe scripts not loaded yet");
        }

        console.log("🔧 Initializing MediaPipe Holistic...");
        
        // Setup MediaPipe Holistic using global window objects
        holistic = new window.Holistic({
          locateFile: (file: string) => {
            const url = `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`;
            console.log(`📦 Loading: ${file}`);
            return url;
          },
        });

        console.log("⚙️ Configuring Holistic options...");
        holistic.setOptions({
          modelComplexity: 1,
          smoothLandmarks: true,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        console.log("📊 Setting up results callback...");
        holistic.onResults(async (results: any) => {
          console.log("📹 Frame received from MediaPipe");
          
          if (!canvasRef.current) {
            console.error("❌ Canvas ref is null!");
            return;
          }
          
          const canvas = canvasRef.current;
          const ctx = canvas.getContext("2d");
          
          if (!ctx) {
            console.error("❌ Could not get canvas context!");
            return;
          }
          
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          if (results.image) {
            ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);
          } else {
            console.warn("⚠️ No image in results");
          }

          let detectedMood: string | null = null;
          let detectedGesture: string | null = null;
          let detectedGaze: string | null = null;
          let detectedObjects: string[] = [];

          // ---------------- MOOD DETECTION (FIXED - Use results.image) ----------------
          try {
            if (emotionModel && results.image) {
              const faces = await emotionModel.estimateFaces(results.image);
              
              if (faces.length > 0) {
                const face = faces[0];
                const mouthTop = face.keypoints.find((p: any) => p.name === "lipsUpperInner");
                const mouthBottom = face.keypoints.find((p: any) => p.name === "lipsLowerInner");
                
                if (mouthTop && mouthBottom) {
                  const mouthGap = Math.abs(mouthTop.y - mouthBottom.y);
                  
                  // Adjusted threshold and check mouth corners for better smile detection
                  const leftMouthCorner = face.keypoints.find((p: any) => p.name === "leftMouthCorner");
                  const rightMouthCorner = face.keypoints.find((p: any) => p.name === "rightMouthCorner");
                  
                  // Check if mouth is open (gap > 15) OR mouth corners are raised (smile)
                  const isSmiling = mouthGap > 15;
                  let isMouthCornersRaised = false;
                  
                  if (leftMouthCorner && rightMouthCorner && mouthTop) {
                    const avgCornerY = (leftMouthCorner.y + rightMouthCorner.y) / 2;
                    isMouthCornersRaised = mouthTop.y > avgCornerY + 5;
                  }
                  
                  detectedMood = (isSmiling || isMouthCornersRaised) ? "happy" : "neutral";
                }
              }
            }
          } catch (err) {
            console.error("❌ Mood detection error:", err);
          }

          // ---------------- GESTURE DETECTION ----------------
          if (results.faceLandmarks) {
            const nose = results.faceLandmarks[1]; // nose tip
            if (nose.x < 0.3 || nose.x > 0.7) {
              detectedGesture = "looking_away";
            } else {
              detectedGesture = "looking_forward";
            }
          }

          // ---------------- GAZE DETECTION ----------------
          if (results.faceLandmarks) {
            const leftEyeInner = results.faceLandmarks[133];
            const leftEyeOuter = results.faceLandmarks[33];
            const leftEyeTop = results.faceLandmarks[159];
            const leftEyeBottom = results.faceLandmarks[145];

            if (leftEyeInner && leftEyeOuter && leftEyeTop && leftEyeBottom) {
              const eyeCenterX = (leftEyeInner.x + leftEyeOuter.x) / 2;
              const eyeCenterY = (leftEyeTop.y + leftEyeBottom.y) / 2;

              if (eyeCenterX < 0.45) detectedGaze = "looking_left";
              else if (eyeCenterX > 0.55) detectedGaze = "looking_right";
              else if (eyeCenterY < 0.45) detectedGaze = "looking_up";
              else if (eyeCenterY > 0.55) detectedGaze = "looking_down";
              else detectedGaze = "looking_center";
            }
          }

          // ---------------- OBJECT DETECTION (FIXED - Use results.image) ----------------
          try {
            if (objectModel && results.image) {
              const preds = await objectModel.detect(results.image);
              detectedObjects = preds.map((p: any) => p.class);
            }
          } catch (err) {
            console.error("❌ Object detection error:", err);
          }

          // ---------------- ON CHANGE LOGGING (Throttled to 1Hz - once per second) ----------------
          const moodChanged = detectedMood !== lastMood;
          const gestureChanged = detectedGesture !== lastGesture;
          const gazeChanged = detectedGaze !== lastGaze;
          const objectsChanged =
            detectedObjects.sort().join(",") !== lastObjects.sort().join(",");

          const now = Date.now();
          const timeSinceLastLog = now - lastLogTime;

          // Log only if something changed AND at least 1000ms (1 second) have passed
          if ((moodChanged || gestureChanged || gazeChanged || objectsChanged) && timeSinceLastLog >= 1000) {
            const eventLog = {
              time: new Date().toLocaleTimeString(),
              timestamp: new Date().toISOString(),
              mood: detectedMood,
              gesture: detectedGesture,
              gaze: detectedGaze,
              objects: detectedObjects,
            };
            console.log("📊 Event:", eventLog);
            
            // Add to logs state
            setDetectionLogs(prev => [...prev, eventLog]);

            // Update last known states
            lastMood = detectedMood;
            lastGesture = detectedGesture;
            lastGaze = detectedGaze;
            lastObjects = detectedObjects;
            lastLogTime = now;
          }
        });

        // Start sending frames to holistic manually
        console.log("🎥 Starting frame capture...");
        
        // Initialize holistic first
        await holistic.initialize();
        console.log("✅ Holistic initialized");
        
        // Wait for video to be fully ready
        console.log("⏳ Waiting for video to be ready...");
        await new Promise<void>((resolve) => {
          const checkReady = () => {
            if (videoRef.current && videoRef.current.readyState >= 3) {
              console.log("✅ Video is ready! readyState:", videoRef.current.readyState);
              resolve();
            } else {
              console.log("⏳ Video readyState:", videoRef.current?.readyState);
              setTimeout(checkReady, 100);
            }
          };
          checkReady();
        });
        
        let frameCount = 0;
        const sendFrame = async () => {
          if (videoRef.current && videoRef.current.readyState >= 3) {
            frameCount++;
            if (frameCount % 60 === 0) {
              console.log(`📤 Sent ${frameCount} frames to holistic`);
            }
            try {
              await holistic.send({ image: videoRef.current });
            } catch (err) {
              console.error("❌ Frame send error:", err);
            }
          }
          animationFrameRef.current = requestAnimationFrame(sendFrame);
        };
        
        sendFrame();
        console.log("✅ Frame capture started");
      };

      // Start the detection pipeline
      console.log("📦 Loading AI models...");
      await loadModels();
      console.log("🔧 Setting up MediaPipe Holistic...");
      await setupHolistic();

      // Everything is ready, update status
      setCameraStatus("granted");
      console.log("🎉 Detection started successfully - updating UI to show video");

    } catch (err: any) {
      console.error("❌ FATAL ERROR in handleStartDetection:", err);
      console.error("Error name:", err.name);
      console.error("Error message:", err.message);
      console.error("Stack trace:", err.stack);
      
      setCameraStatus("denied");
      if (err.name === "NotAllowedError") {
        setError("Camera permission denied. Please allow camera access.");
      } else if (err.name === "NotFoundError") {
        setError("No camera found on your device.");
      } else {
        setError(`Error: ${err.message || "Unknown error occurred"}`);
      }
    }
  };

  const handleStopCamera = () => {
    console.log("🛑 Stopping camera...");
    
    // Stop video stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        console.log("🔴 Stopped track:", track.kind);
      });
      streamRef.current = null;
    }
    
    // Cancel animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    // Clear video source
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    // Clear canvas
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
    
    setCameraStatus("idle");
    console.log("✅ Camera stopped");
  };

  const downloadLogs = () => {
    const dataStr = JSON.stringify(detectionLogs, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `detection-logs-${new Date().toISOString().replace(/:/g, '-')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    console.log(`📥 Downloaded ${detectionLogs.length} detection events`);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Always render video and canvas, but hide them until ready */}
      <div className={`relative ${cameraStatus === "granted" ? "" : "hidden"}`}>
        <video 
          ref={videoRef} 
          autoPlay 
          muted 
          playsInline 
          width="640" 
          height="480" 
          className="rounded-lg hidden"
        />
        <canvas 
          ref={canvasRef} 
          width="640" 
          height="480" 
          className="rounded-lg border border-white/20"
        />
      </div>

      {/* Control buttons when camera is active */}
      {cameraStatus === "granted" && (
        <div className="flex gap-3">
          <Button
            onClick={handleStopCamera}
            variant="destructive"
            className="bg-red-600 hover:bg-red-700"
          >
            Stop Camera
          </Button>
          <Button
            onClick={downloadLogs}
            variant="outline"
            className="border-violet-500/30 text-violet-300 hover:bg-violet-600/20"
            disabled={detectionLogs.length === 0}
          >
            Download Logs ({detectionLogs.length})
          </Button>
        </div>
      )}

      {!mediapipeLoaded && (
        <div className="text-center space-y-4 p-8 bg-yellow-600/10 rounded-lg border border-yellow-500/30">
          <div className="animate-spin h-12 w-12 mx-auto border-4 border-yellow-500 border-t-transparent rounded-full" />
          <p className="text-yellow-300">Loading MediaPipe libraries...</p>
        </div>
      )}

      {mediapipeLoaded && cameraStatus === "idle" && (
        <div className="text-center space-y-4 p-8 bg-white/5 rounded-lg border border-white/10">
          <CameraIcon className="h-16 w-16 mx-auto text-violet-400" />
          <div>
            <h3 className="text-white font-semibold mb-2">Camera Access Required</h3>
            <p className="text-white/70 text-sm mb-4">
              Click the button below to start video detection
            </p>
          </div>
          <Button
            onClick={handleStartDetection}
            className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
          >
            <CameraIcon className="h-4 w-4 mr-2" />
            Start Camera
          </Button>
        </div>
      )}

      {cameraStatus === "requesting" && (
        <div className="text-center space-y-4 p-8 bg-blue-600/10 rounded-lg border border-blue-500/30">
          <div className="animate-spin h-12 w-12 mx-auto border-4 border-blue-500 border-t-transparent rounded-full" />
          <p className="text-blue-300">Requesting camera access...</p>
        </div>
      )}

      {cameraStatus === "denied" && (
        <div className="text-center space-y-4 p-8 bg-red-600/10 rounded-lg border border-red-500/30">
          <AlertCircle className="h-16 w-16 mx-auto text-red-400" />
          <div>
            <h3 className="text-red-300 font-semibold mb-2">Camera Access Denied</h3>
            <p className="text-red-200/70 text-sm mb-4">{error}</p>
            <p className="text-red-200/70 text-xs">
              Please enable camera permissions in your browser settings and refresh the page.
            </p>
          </div>
          <Button
            onClick={handleStartDetection}
            variant="outline"
            className="border-red-500/30 text-red-300 hover:bg-red-600/20"
          >
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
}
