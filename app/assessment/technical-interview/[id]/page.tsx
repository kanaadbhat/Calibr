"use client";
import React from "react";
/// <reference types="node" />

import { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Brain, 
  Bot, 
  User, 
  Play, 
  Send, 
  CheckCircle, 
  RefreshCw,
  List,
  GraduationCap,
  Zap,
  FileText,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Settings,
  Clock,
  Languages
} from "lucide-react";
import { getInterviewConfig, generateQuestions, analyzeAnswer } from "../actions";
import VideoProcessing from "@/lib/video-processing";

// Minimal typings for Web Speech API (not included in default TS DOM lib)
declare global {
  interface Window {
    webkitSpeechRecognition?: new () => SpeechRecognition;
  }
}

interface SpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: any) => void) | null;
  onerror: ((event: any) => void) | null;
  start: () => void;
  stop: () => void;
}

interface Question {
  id: string;
  question: string;
  category: "technical" | "non-technical" | "followup";
  difficulty?: "medium" | "hard";
  answer?: string;
  parentQuestion?: string;
}

interface Conversation {
  role: "assistant" | "user";
  content: string;
  question?: Question | null;
  timestamp?: Date;
}

interface InterviewConfig {
  duration: number;
  mode: 'live' | 'async';
  language: string;
  difficulty: 'junior' | 'mid' | 'senior';
  topics: string[];
  aiPrompt?: string;
  maxFollowUpsPerTopic?: number;
  recordingEnabled: boolean;
  consentRequired: boolean;
  proctoring: {
    cameraRequired: boolean;
    micRequired: boolean;
    screenShareRequired: boolean;
  };
  questionStyle: 'structured' | 'conversational';
  initialWarmupMinutes?: number;
  maxSilenceSeconds?: number;
  allowInterruptions: boolean;
  rubric: {
    passThreshold?: number;
    categories: { key: string; label: string; weight: number }[];
  };
  scheduledDate?: Date;
  startTime?: string;
  endTime?: string;
  status: 'inactive' | 'active' | 'completed';
}

export default function VoiceInterviewPage() {
  const params = useParams();
  const interviewId = params.id as string;
  
  const [currentScreen, setCurrentScreen] = useState<"setup" | "loading" | "interview" | "complete">("setup");
  const [resumeData, setResumeData] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userAnswer, setUserAnswer] = useState("");
  const [conversation, setConversation] = useState<Conversation[]>([]);
  const [queues, setQueues] = useState<{
    queue1: Question[];
    queue2: Question[];
    queue3: Question[];
  }>({ queue1: [], queue2: [], queue3: [] });
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [stats, setStats] = useState({
    questionsAsked: 0,
    queue1Size: 0,
    queue2Size: 0,
    queue3Size: 0,
  });

  // Voice and media states
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [interviewConfig, setInterviewConfig] = useState<InterviewConfig | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [hasConsent, setHasConsent] = useState(false);

  // Refs
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const speechRecognitionRef = useRef<SpeechRecognition | null>(null);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  // Camera preview is handled by VideoProcessing component
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch interview configuration on component mount
  useEffect(() => {
    const fetchInterviewConfig = async () => {
      try {
        const result = await getInterviewConfig(interviewId);
        if (result.success && result.config) {
          setInterviewConfig(result.config);
          setTimeRemaining(result.config.duration * 60); // Convert minutes to seconds
        } else {
          console.error('Interview configuration not found:', result.error);
        }
      } catch (error) {
        console.error('Error fetching interview config:', error);
      }
    };

    if (interviewId) {
      fetchInterviewConfig();
    }
  }, [interviewId]);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = interviewConfig?.language || 'en-US';
      
      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setUserAnswer(prev => prev + finalTranscript);
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
      };

      speechRecognitionRef.current = recognition;
    }
  }, [interviewConfig?.language]);

  // Timer effect
  useEffect(() => {
    if (currentScreen === "interview" && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            endInterview();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [currentScreen, timeRemaining]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [conversation]);

  const displayMessage = (content: string, isBot: boolean) => {
    setConversation(prev => [...prev, {
      role: isBot ? "assistant" : "user",
      content,
      question: isBot ? currentQuestion : undefined,
      timestamp: new Date()
    }]);
  };

  // Voice and media functions
  const stopAudioPlayback = () => {
    try {
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current.src = "";
        audioElementRef.current = null;
      }
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
        audioUrlRef.current = null;
      }
    } catch {
      // Ignore errors during cleanup
    }
    setIsSpeaking(false);
  };

  const speakText = async (text: string) => {
    // Stop any ongoing playback
    stopAudioPlayback();

    try {
      setIsSpeaking(true);
      const res = await fetch('/api/generate-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      if (!res.ok) throw new Error('TTS request failed');
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      audioUrlRef.current = objectUrl;
      const audio = new Audio(objectUrl);
      audioElementRef.current = audio;
      audio.onended = () => {
        setIsSpeaking(false);
        // cleanup URL after end
        if (audioUrlRef.current) {
          URL.revokeObjectURL(audioUrlRef.current);
          audioUrlRef.current = null;
        }
        audioElementRef.current = null;
      };
      await audio.play();
    } catch (e) {
      console.error('Audio playback error:', e);
      setIsSpeaking(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true,
        video: false
      });
      
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        // Here you would typically send the audio to a speech-to-text service
        console.log('Audio recorded:', audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Start speech recognition
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.start();
      }
    } catch (error) {
      console.error('Error accessing media devices:', error);
      alert('Please allow microphone and camera access to continue with the interview.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }

    if (speechRecognitionRef.current) {
      speechRecognitionRef.current.stop();
    }
  };

  const toggleMute = () => {
    if (streamRef.current) {
      const audioTracks = streamRef.current.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = isMuted;
      });
      setIsMuted(!isMuted);
    }
  };

  const stopScreenShare = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startInterview = async () => {
    if (!resumeData.trim()) {
      alert("Please paste resume data first!");
      return;
    }

    if (interviewConfig?.consentRequired && !hasConsent) {
      alert("Please provide consent to continue with the interview.");
      return;
    }

    setIsLoading(true);
    setCurrentScreen("loading");

    try {
      // Start media recording if required
      if (interviewConfig?.proctoring.micRequired || interviewConfig?.proctoring.cameraRequired) {
        await startRecording();
      }

      const result = await generateQuestions(resumeData);
      
      if (result.success && result.queues) {
        setQueues(result.queues);
        setStats(prev => ({
          ...prev,
          queue1Size: result.queues!.queue1.length,
          queue2Size: result.queues!.queue2.length,
          queue3Size: result.queues!.queue3.length,
        }));
        
        setCurrentScreen("interview");
        askNextQuestion(result.queues);
      } else {
        alert("Failed to generate questions. Please try again.");
        setCurrentScreen("setup");
      }
    } catch (error) {
      console.error("Error starting interview:", error);
      alert("An error occurred. Please try again.");
      setCurrentScreen("setup");
    } finally {
      setIsLoading(false);
    }
  };

  const askNextQuestion = (currentQueues = queues) => {
    let nextQuestion: Question | null = null;
    let queueType: keyof typeof currentQueues = "queue1";

    if (currentQueues.queue3.length > 0) {
      nextQuestion = currentQueues.queue3[0];
      queueType = "queue3";
    } else if (currentQueues.queue1.length > 0) {
      nextQuestion = currentQueues.queue1[0];
      queueType = "queue1";
    }

    if (!nextQuestion) {
      endInterview();
      return;
    }

    setCurrentQuestion(nextQuestion);
    setStats(prev => ({
      ...prev,
      questionsAsked: prev.questionsAsked + 1,
      [queueType + "Size"]: currentQueues[queueType].length - 1
    }));

    // Remove question from queue
    setQueues(prev => ({
      ...prev,
      [queueType]: prev[queueType].slice(1)
    }));

    displayMessage(nextQuestion.question, true);
    
    // Speak the question if voice is enabled
    if (interviewConfig?.mode === 'live') {
      speakText(nextQuestion.question);
    }
  };

  const submitAnswer = async () => {
    if (!userAnswer.trim() || !currentQuestion) return;

    const answer = userAnswer.trim();
    setUserAnswer("");
    displayMessage(answer, false);

    try {
      if (currentQuestion.category === "technical" && currentQuestion.answer) {
        const analysis = await analyzeAnswer(
          currentQuestion.question,
          currentQuestion.answer,
          answer,
          queues,
          currentQuestion
        );

        if (analysis.updatedQueues) {
          setQueues(analysis.updatedQueues);
          setStats(prev => ({
            ...prev,
            queue1Size: analysis.updatedQueues!.queue1.length,
            queue2Size: analysis.updatedQueues!.queue2.length,
            queue3Size: analysis.updatedQueues!.queue3.length,
          }));
        }
      }

      // Wait a bit before asking next question
      setTimeout(() => askNextQuestion(), 1000);
    } catch (error) {
      console.error("Error submitting answer:", error);
      // Continue with next question even if analysis fails
      setTimeout(() => askNextQuestion(), 1000);
    }
  };

  const endInterview = () => {
    // Stop all media streams
    stopRecording();
    stopScreenShare();
    
    // Stop any speech/audio playback
    if (speechSynthesisRef.current) {
      speechSynthesis.cancel();
    }
    stopAudioPlayback();
    
    // Clear timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    setCurrentScreen("complete");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submitAnswer();
    }
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case "medium": return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
      case "hard": return "bg-red-500/20 text-red-300 border-red-500/30";
      default: return "bg-blue-500/20 text-blue-300 border-blue-500/30";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0A18] to-[#0D0D20] p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <h1 className="text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-indigo-300 to-rose-300 bg-clip-text text-transparent">
              Voice-Based Technical Interview
            </span>
          </h1>
          <p className="text-white/70 text-lg">AI-Powered Voice Interview with Proctoring</p>
          
          {/* Interview Configuration Display */}
          {interviewConfig && (
            <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm">
              <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full">
                <Clock className="w-4 h-4 text-indigo-400" />
                <span className="text-white/80">{interviewConfig.duration} minutes</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full">
                <Languages className="w-4 h-4 text-indigo-400" />
                <span className="text-white/80">{interviewConfig.language}</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full">
                <Settings className="w-4 h-4 text-indigo-400" />
                <span className="text-white/80">{interviewConfig.difficulty} level</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full">
                <span className="text-white/80">{interviewConfig.mode} mode</span>
              </div>
            </div>
          )}
        </div>

        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
          {/* Setup Screen */}
          {currentScreen === "setup" && (
            <div className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-semibold text-white mb-2 flex items-center justify-center gap-3">
                  <FileText className="w-6 h-6 text-indigo-400" />
                  Step 1: Paste Resume Data
                </h2>
              </div>
              
              <textarea
                value={resumeData}
                onChange={(e) => setResumeData(e.target.value)}
                placeholder="Paste the candidate's resume here including:
- Introduction & Background
- Education
- Technical Skills
- Experience
- Projects
- Achievements
- Certifications"
                className="w-full h-64 p-6 text-white placeholder:text-white/50 text-lg border border-white/30 bg-white/10 rounded-2xl backdrop-blur-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 resize-none"
              />

              {/* Proctoring Requirements */}
              {interviewConfig && (
                <div className="mt-6 p-6 bg-white/5 border border-white/10 rounded-2xl">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-indigo-400" />
                    Interview Requirements
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Mic className={`w-4 h-4 ${interviewConfig.proctoring.micRequired ? 'text-green-400' : 'text-gray-400'}`} />
                      <span className="text-white/80">Microphone {interviewConfig.proctoring.micRequired ? 'Required' : 'Optional'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`w-4 h-4 inline-flex items-center justify-center rounded-full ${interviewConfig.proctoring.cameraRequired ? 'text-green-400' : 'text-gray-400'}`}>📷</span>
                      <span className="text-white/80">Camera {interviewConfig.proctoring.cameraRequired ? 'Required' : 'Optional'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`w-4 h-4 inline-flex items-center justify-center rounded-full ${interviewConfig.proctoring.screenShareRequired ? 'text-green-400' : 'text-gray-400'}`}>🖥️</span>
                      <span className="text-white/80">Screen Share {interviewConfig.proctoring.screenShareRequired ? 'Required' : 'Optional'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Consent Checkbox */}
              {interviewConfig?.consentRequired && (
                <div className="mt-6 p-6 bg-white/5 border border-white/10 rounded-2xl">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="consent"
                      checked={hasConsent}
                      onChange={(e) => setHasConsent(e.target.checked)}
                      className="mt-1 w-4 h-4 text-indigo-600 bg-white/10 border-white/30 rounded focus:ring-indigo-500"
                    />
                    <label htmlFor="consent" className="text-white/80 text-sm">
                      I consent to this interview being recorded and monitored for assessment purposes. 
                      I understand that my audio, video, and screen activity may be captured during this session.
                    </label>
                  </div>
                </div>
              )}
              
              <div className="text-center mt-6">
                <Button
                  onClick={startInterview}
                  disabled={isLoading || (interviewConfig?.consentRequired && !hasConsent)}
                  className="bg-gradient-to-r from-indigo-500 to-rose-500 hover:from-indigo-600 hover:to-rose-600 text-white font-semibold text-lg px-8 py-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Generating Questions...
                    </div>
                  ) : (
                    <>
                      <Play className="w-5 h-5 mr-2" />
                      Start Voice Interview
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Loading Screen */}
          {currentScreen === "loading" && (
            <div className="p-12 text-center">
              <div className="mb-8">
                <Brain className="w-16 h-16 text-indigo-400 mx-auto mb-4 animate-pulse" />
                <h2 className="text-2xl font-semibold text-white mb-4">AI is Analyzing Resume...</h2>
                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-white/70 mt-6 text-lg">Extracting information and generating questions...</p>
              </div>
            </div>
          )}

          {/* Interview Screen */}
          {currentScreen === "interview" && (
            <div className="p-6">
              {/* Timer and Voice Controls */}
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                  <div className="bg-white/10 px-4 py-2 rounded-full border border-white/20">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-indigo-400" />
                      <span className="text-white font-mono text-lg">{formatTime(timeRemaining)}</span>
                    </div>
                  </div>
                  
                  {/* Voice Controls */}
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={isRecording ? stopRecording : startRecording}
                      variant="outline"
                      size="sm"
                      className={`border-white/20 ${isRecording ? 'bg-red-500/20 text-red-300' : 'bg-white/10 text-white'}`}
                    >
                      {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </Button>
                    
                    <Button
                      onClick={toggleMute}
                      variant="outline"
                      size="sm"
                      className={`border-white/20 ${isMuted ? 'bg-red-500/20 text-red-300' : 'bg-white/10 text-white'}`}
                    >
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </Button>
                    
                    
                    {/* Stop Interview */}
                    <Button
                      onClick={endInterview}
                      variant="destructive"
                      size="sm"
                      className="border-white/20 bg-red-500/20 text-red-300 hover:bg-red-500/30"
                    >
                      Stop
                    </Button>
                  </div>
                </div>
                
                {/* Speaking Indicator */}
                {isSpeaking && (
                  <div className="flex items-center gap-2 bg-indigo-500/20 px-3 py-1 rounded-full border border-indigo-500/30">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
                    <span className="text-indigo-300 text-sm">AI Speaking</span>
                  </div>
                )}
              </div>

              {/* Video Processing (camera preview and detection) */}
              {interviewConfig?.proctoring.cameraRequired && (
                <div className="mb-6">
                  <VideoProcessing />
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card className="backdrop-blur-xl bg-white/5 border border-white/10">
                  <CardContent className="p-6 text-center">
                    <div className="text-2xl font-bold text-white mb-2">{stats.questionsAsked}</div>
                    <div className="text-white/70 text-sm">Questions Asked</div>
                  </CardContent>
                </Card>
                <Card className="backdrop-blur-xl bg-white/5 border border-white/10">
                  <CardContent className="p-6 text-center">
                    <div className="text-2xl font-bold text-white mb-2">{stats.queue1Size}</div>
                    <div className="text-white/70 text-sm">Queue 1 (Main)</div>
                  </CardContent>
                </Card>
                <Card className="backdrop-blur-xl bg-white/5 border border-white/10">
                  <CardContent className="p-6 text-center">
                    <div className="text-2xl font-bold text-white mb-2">{stats.queue2Size}</div>
                    <div className="text-white/70 text-sm">Queue 2 (Deep Dive)</div>
                  </CardContent>
                </Card>
                <Card className="backdrop-blur-xl bg-white/5 border border-white/10">
                  <CardContent className="p-6 text-center">
                    <div className="text-2xl font-bold text-white mb-2">{stats.queue3Size}</div>
                    <div className="text-white/70 text-sm">Queue 3 (Follow-up)</div>
                  </CardContent>
                </Card>
              </div>

              {/* Chat Container */}
              <Card className="backdrop-blur-xl bg-white/5 border border-white/10 mb-6">
                <CardContent className="p-0">
                  <div 
                    ref={chatContainerRef}
                    className="h-96 overflow-y-auto p-6 space-y-4"
                  >
                    {conversation.map((msg, index) => (
                      <div
                        key={index}
                        className={`flex gap-4 ${msg.role === "assistant" ? "justify-start" : "justify-end"}`}
                      >
                        {msg.role === "assistant" && (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                            <Bot className="w-5 h-5 text-white" />
                          </div>
                        )}
                        
                        <div className={`max-w-[80%] rounded-2xl p-4 ${
                          msg.role === "assistant" 
                            ? "bg-white/10 border border-white/20 rounded-tl-none" 
                            : "bg-gradient-to-r from-indigo-500/30 to-rose-500/30 border border-indigo-500/30 rounded-tr-none"
                        }`}>
                          {msg.role === "assistant" && msg.question && (
                            <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full mb-2 border ${
                              msg.question.category === "technical" 
                                ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                                : msg.question.category === "followup"
                                ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                                : "bg-purple-500/20 text-purple-300 border-purple-500/30"
                            }`}>
                              {msg.question.category.toUpperCase()}
                              {msg.question.difficulty && ` • ${msg.question.difficulty.toUpperCase()}`}
                            </span>
                          )}
                          <p className="text-white">{msg.content}</p>
                        </div>

                        {msg.role === "user" && (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center flex-shrink-0">
                            <User className="w-5 h-5 text-white" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Input Area */}
              <div className="flex gap-4 mb-8">
                <div className="flex-1 relative">
                  <Input
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={isRecording ? "Listening... Speak your answer" : "Type your answer here or use voice input..."}
                    className="h-14 text-white placeholder:text-white/50 text-lg border-white/30 bg-white/10 rounded-xl backdrop-blur-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent pr-12"
                  />
                  <Button
                    onClick={isRecording ? stopRecording : startRecording}
                    size="sm"
                    variant="ghost"
                    className={`absolute right-2 top-1/2 transform -translate-y-1/2 ${isRecording ? 'text-red-400' : 'text-white/70'}`}
                  >
                    {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </Button>
                </div>
                <Button
                  onClick={submitAnswer}
                  disabled={!userAnswer.trim()}
                  className="h-14 bg-gradient-to-r from-indigo-500 to-rose-500 hover:from-indigo-600 hover:to-rose-600 text-white font-semibold text-lg px-8 rounded-xl transition-all duration-300"
                >
                  <Send className="w-5 h-5 mr-2" />
                  Send
                </Button>
              </div>

              {/* Queues Panel */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Queue 1 */}
                <Card className="backdrop-blur-xl bg-white/5 border border-white/10">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-white flex items-center gap-2 text-lg">
                      <List className="w-5 h-5 text-blue-400" />
                      Queue 1: Main Questions
                      <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full ml-auto">
                        {queues.queue1.length}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {queues.queue1.slice(0, 5).map((q) => (
                      <div
                        key={q.id}
                        className="p-3 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
                      >
                        <div className={`text-xs font-semibold mb-1 px-2 py-1 rounded-full inline-block ${
                          q.category === "technical" 
                            ? "bg-blue-500/20 text-blue-300" 
                            : "bg-purple-500/20 text-purple-300"
                        }`}>
                          {q.category.toUpperCase()}
                        </div>
                        <p className="line-clamp-2">{q.question}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Queue 2 */}
                <Card className="backdrop-blur-xl bg-white/5 border border-white/10">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-white flex items-center gap-2 text-lg">
                      <GraduationCap className="w-5 h-5 text-amber-400" />
                      Queue 2: Deep Dive
                      <span className="bg-amber-500 text-white text-xs px-2 py-1 rounded-full ml-auto">
                        {queues.queue2.length}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {queues.queue2.slice(0, 5).map((q) => (
                      <div
                        key={q.id}
                        className="p-3 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
                      >
                        <div className={`text-xs font-semibold mb-1 px-2 py-1 rounded-full inline-block ${getDifficultyColor(q.difficulty)}`}>
                          {q.difficulty?.toUpperCase() || "MEDIUM"}
                        </div>
                        <p className="line-clamp-2">{q.question}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Queue 3 */}
                <Card className="backdrop-blur-xl bg-white/5 border border-white/10">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-white flex items-center gap-2 text-lg">
                      <Zap className="w-5 h-5 text-rose-400" />
                      Queue 3: Follow-ups
                      <span className="bg-rose-500 text-white text-xs px-2 py-1 rounded-full ml-auto">
                        {queues.queue3.length}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {queues.queue3.slice(0, 5).map((q) => (
                      <div
                        key={q.id}
                        className="p-3 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
                      >
                        <div className="text-xs font-semibold mb-1 px-2 py-1 rounded-full inline-block bg-rose-500/20 text-rose-300">
                          FOLLOW-UP
                        </div>
                        <p className="line-clamp-2">{q.question}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Complete Screen */}
          {currentScreen === "complete" && (
            <div className="p-12 text-center">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-6" />
              <h2 className="text-2xl font-semibold text-white mb-4">Interview Completed!</h2>
              <p className="text-white/70 text-lg mb-8">
                Thank you for completing the interview. The session has been saved and analyzed.
              </p>
              <Button
                onClick={() => window.location.reload()}
                className="bg-gradient-to-r from-indigo-500 to-rose-500 hover:from-indigo-600 hover:to-rose-600 text-white font-semibold text-lg px-8 py-6 rounded-xl"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Start New Interview
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}