'use client';
import { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import { Button } from "@/components/ui/button";
import { AlertCircle, Camera as CameraIcon } from "lucide-react";

export default function VideoProcessing() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const workerRef = useRef<Worker | null>(null);
  const cameraRef = useRef<any>(null);
  const holisticRef = useRef<any>(null);

  const [detectionLogs, setDetectionLogs] = useState<any[]>([]);
  const [cameraStatus, setCameraStatus] = useState<"idle" | "requesting" | "granted" | "denied">("idle");
  const [error, setError] = useState<string>("");
  const [mediapipeLoaded, setMediapipeLoaded] = useState(false);

  // Histories for smoothing
  const moodHistory = useRef<string[]>([]);
  const gazeHistory = useRef<string[]>([]);
  const gestureHistory = useRef<string[]>([]);
  const objectsHistory = useRef<string[][]>([]);

  // Last logged values
  const lastMood = useRef<string | null>(null);
  const lastGesture = useRef<string | null>(null);
  const lastGaze = useRef<string | null>(null);
  const lastObjects = useRef<string[]>([]);
  const lastLogTime = useRef<number>(0);

  // Counters for throttling
  const frameCount = useRef<number>(0);
  const lastFaceCheck = useRef<number>(0);

  /** Utility: load external scripts safely */
  const loadScript = (src: string) =>
    new Promise<void>((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) return resolve();
      const s = document.createElement('script');
      s.src = src;
      s.crossOrigin = 'anonymous';
      s.onload = () => resolve();
      s.onerror = () => reject(new Error(`Failed to load ${src}`));
      document.body.appendChild(s);
    });

  /** Smooth detection outputs */
  const smoothDetection = (newValue: string | string[], historyRef: any, maxLength = 5) => {
    const history = historyRef.current;
    history.push(newValue);
    if (history.length > maxLength) history.shift();

    if (Array.isArray(newValue)) {
      // Objects: majority vote
      const flat = history.flat();
      const count: Record<string, number> = {};
      flat.forEach((obj: string) => (count[obj] = (count[obj] || 0) + 1));
      return Object.keys(count).filter((key) => count[key] >= Math.floor(maxLength / 2));
    } else {
      // Mood/Gaze/Gesture: most frequent
      const count: Record<string, number> = {};
      history.forEach((v: string) => (count[v] = (count[v] || 0) + 1));
      return Object.keys(count).reduce((a, b) => (count[a] > count[b] ? a : b));
    }
  };

  /** Compare arrays safely */
  const arraysEqual = (a: string[] = [], b: string[] = []) =>
    [...a].sort().join(',') === [...b].sort().join(',');

  /** Log updates if changed */
  const updateLog = (updates: any) => {
    const now = Date.now();
    const changed =
      (updates.mood && updates.mood !== lastMood.current) ||
      (updates.gesture && updates.gesture !== lastGesture.current) ||
      (updates.gaze && updates.gaze !== lastGaze.current) ||
      (updates.objects && !arraysEqual(updates.objects, lastObjects.current));

    if (changed && now - lastLogTime.current > 1000) {
      const log = {
        time: new Date().toLocaleTimeString(),
        timestamp: new Date().toISOString(),
        mood: updates.mood ?? lastMood.current,
        gesture: updates.gesture ?? lastGesture.current,
        gaze: updates.gaze ?? lastGaze.current,
        objects: updates.objects ?? lastObjects.current,
      };
      console.log('📊 Event:', log);

      setDetectionLogs((prev) => {
        const next = [...prev, log];
        if (next.length > 500) next.shift(); // cap at 500 logs
        return next;
      });

      lastMood.current = log.mood;
      lastGesture.current = log.gesture;
      lastGaze.current = log.gaze;
      lastObjects.current = log.objects;
      lastLogTime.current = now;
    }
  };

  /** Load models + scripts once */
  useEffect(() => {
    const init = async () => {
      try {
        // Load face-api.js models
        await faceapi.nets.tinyFaceDetector.loadFromUri('/face-api/');
        await faceapi.nets.faceExpressionNet.loadFromUri('/face-api/');
        console.log('✅ face-api.js models loaded');

        // Load MediaPipe scripts (removed deprecated iris.js)
        const scripts = [
          'https://cdn.jsdelivr.net/npm/@mediapipe/holistic/holistic.js',
          'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js',
        ];
        await Promise.all(scripts.map(loadScript));
        console.log('✅ MediaPipe scripts loaded');
        setMediapipeLoaded(true);

        // Init YOLO worker
        workerRef.current = new Worker(new URL('../workers/yolo.worker.js', import.meta.url));
        workerRef.current.onmessage = (e) => {
          if (e.data.type === 'result') {
            updateLog({ objects: smoothDetection(e.data.objects, objectsHistory) });
          }
        };
        workerRef.current.postMessage({ type: 'load' });
      } catch (err) {
        console.error('❌ Initialization failed', err);
      }
    };
    init();

    return () => {
      workerRef.current?.terminate();
      cameraRef.current?.stop?.();
      holisticRef.current?.close?.();
      const tracks = (videoRef.current?.srcObject as MediaStream)?.getTracks();
      tracks?.forEach((track) => track.stop());
    };
  }, []);

  /** Start detection */
  const startDetection = async () => {
    if (!videoRef.current) return;
    
    setCameraStatus("requesting");
    setError("");

    try {
      console.log("🎬 Starting detection...");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
      });
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      console.log("✅ Camera access granted");
    } catch (err: any) {
      console.error('❌ Camera access denied', err);
      setCameraStatus("denied");
      if (err.name === "NotAllowedError") {
        setError("Camera permission denied. Please allow camera access.");
      } else if (err.name === "NotFoundError") {
        setError("No camera found on your device.");
      } else {
        setError(`Error: ${err.message || "Unknown error occurred"}`);
      }
      return;
    }

    try {
      holisticRef.current = new (window as any).Holistic({
        locateFile: (file: string) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`,
      });
      holisticRef.current.setOptions({ modelComplexity: 1, smoothLandmarks: true });

      holisticRef.current.onResults(async (results: any) => {
        frameCount.current++;
        const now = Date.now();
        
        // Draw frame to canvas
        if (canvasRef.current && results.image) {
          const ctx = canvasRef.current.getContext("2d");
          if (ctx) {
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            ctx.drawImage(results.image, 0, 0, canvasRef.current.width, canvasRef.current.height);
          }
        }

        /** Mood (every 1s) */
        let mood: string | null = null;
        if (now - lastFaceCheck.current > 1000) {
          lastFaceCheck.current = now;
          try {
            const detections = await faceapi
              .detectSingleFace(videoRef.current!, new faceapi.TinyFaceDetectorOptions())
              .withFaceExpressions();
            const rawMood = detections?.expressions
              ? Object.entries(detections.expressions).sort((a, b) => b[1] - a[1])[0][0]
              : null;
            if (rawMood) mood = smoothDetection(rawMood, moodHistory) as string;
          } catch (err) {
            console.error('face-api detection error', err);
          }
        }

        /** Gesture */
        let gesture: string | null = null;
        if (results.poseLandmarks) {
          const leftShoulder = results.poseLandmarks[11];
          const rightShoulder = results.poseLandmarks[12];
          const nose = results.faceLandmarks?.[1];
          if (nose && leftShoulder && rightShoulder) {
            const midX = (leftShoulder.x + rightShoulder.x) / 2;
            const rawGesture =
              nose.x < midX - 0.05
                ? 'turned_left'
                : nose.x > midX + 0.05
                ? 'turned_right'
                : 'facing_forward';
            gesture = smoothDetection(rawGesture, gestureHistory) as string;
          }
        }

        /** Gaze */
        let gaze: string | null = null;
        if (results.faceLandmarks) {
          const leftEye = results.faceLandmarks[133];
          const rightEye = results.faceLandmarks[362];
          if (leftEye && rightEye) {
            const avgX = (leftEye.x + rightEye.x) / 2;
            const rawGaze =
              avgX < 0.45
                ? 'looking_left'
                : avgX > 0.55
                ? 'looking_right'
                : 'looking_center';
            gaze = smoothDetection(rawGaze, gazeHistory) as string;
          }
        }

        updateLog({ mood, gesture, gaze });

        /** Objects every 10 frames */
        if (workerRef.current && videoRef.current && frameCount.current % 10 === 0) {
          try {
            const bitmap = await createImageBitmap(videoRef.current);
            workerRef.current.postMessage({ type: 'detect', imageBitmap: bitmap }, [bitmap]);
          } catch (err) {
            console.error('bitmap error', err);
          }
        }
      });

      cameraRef.current = new (window as any).Camera(videoRef.current, {
        onFrame: async () => {
          await holisticRef.current.send({ image: videoRef.current });
        },
      });
      cameraRef.current.start();
      
      // Everything is ready
      setCameraStatus("granted");
      console.log("🎉 Detection started successfully");
    } catch (err: any) {
      console.error('❌ Error starting MediaPipe holistic', err);
      setCameraStatus("denied");
      setError(`Error: ${err.message || "Unknown error occurred"}`);
    }
  };
  
  const handleStopCamera = () => {
    console.log("🛑 Stopping camera...");
    
    // Stop camera
    cameraRef.current?.stop?.();
    
    // Stop video stream
    const tracks = (videoRef.current?.srcObject as MediaStream)?.getTracks();
    tracks?.forEach(track => track.stop());
    
    // Clear video and canvas
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
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
            onClick={startDetection}
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
            onClick={startDetection}
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
