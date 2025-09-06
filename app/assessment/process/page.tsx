"use client"
import React from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, Lock, Play, Clock, BarChart3, Brain, Code, Users } from 'lucide-react';
import { useSession } from "next-auth/react";
import { format } from 'date-fns';

export interface InterviewRound {
  id: string;
  type: 'aptitude' | 'coding' | 'technical' | 'hr';
  name: string;
  isEnabled: boolean;
  duration?: number;
  questions?: Question[];
}

export interface Question {
  id: string;
  text: string;
  type: 'mcq' | 'coding' | 'interview';
  options?: string[];
  correctAnswer?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

const InterviewProgress = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const userName = session?.user?.name || "Candidate";
  const firstName = userName.split(" ")[0];

  const defaultRounds: InterviewRound[] = [
    {
      id: 'aptitude',
      type: 'aptitude',
      name: 'Aptitude Round',
      isEnabled: true,
      duration: 30
    },
    {
      id: 'coding',
      type: 'coding',
      name: 'Coding Round',
      isEnabled: true,
      duration: 45
    },
    {
      id: 'technical',
      type: 'technical',
      name: 'Technical Interview',
      isEnabled: true,
      duration: 60
    },
    {
      id: 'hr',
      type: 'hr',
      name: 'HR Interview',
      isEnabled: true,
      duration: 30
    }
  ];

  const currentRound = 2; // This could come from API or state management
  const isMockMode = true; // This could be determined by route or props

  const handleStartRound = (roundIndex: number) => {
    router.push(`/assessment/round/${roundIndex}`);
  };

  const interviewRounds = defaultRounds;
  const enabledRounds = interviewRounds.filter(round => round.isEnabled);

  const getRoundIcon = (index: number, type: string) => {
    if (index < currentRound) {
      return <CheckCircle className="h-6 w-6 text-emerald-400" />;
    } else if (index === currentRound || isMockMode) {
      switch(type) {
        case 'aptitude': return <Brain className="h-6 w-6 text-indigo-400" />;
        case 'coding': return <Code className="h-6 w-6 text-blue-400" />;
        case 'technical': return <BarChart3 className="h-6 w-6 text-purple-400" />;
        case 'hr': return <Users className="h-6 w-6 text-rose-400" />;
        default: return <Play className="h-6 w-6 text-indigo-400" />;
      }
    } else {
      return <Lock className="h-6 w-6 text-white/40" />;
    }
  };

  const getRoundStatus = (index: number) => {
    if (index < currentRound) return 'completed';
    if (index === currentRound || isMockMode) return 'active';
    return 'locked';
  };

  const canStartRound = (index: number) => {
    return isMockMode || index === currentRound;
  };

  const getRoundTypeDescription = (type: string) => {
    switch(type) {
      case 'aptitude': 
        return 'Test your logical reasoning and problem-solving abilities with multiple-choice questions.';
      case 'coding': 
        return 'Solve programming challenges to demonstrate your technical skills and coding proficiency.';
      case 'technical': 
        return 'Discuss technical concepts, system design, and your experience with our AI interviewer.';
      case 'hr': 
        return 'Explore cultural fit, behavioral patterns, and career aspirations in this comprehensive interview.';
      default: 
        return 'Complete this round to progress in your interview journey.';
    }
  };

  // Add early return if no rounds are available
  if (enabledRounds.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A0A18] to-[#0D0D20] flex items-center justify-center">
        <div className="text-center text-white/60">
          <p>No interview rounds available at the moment.</p>
        </div>
      </div>
    );
  }

  // Add personalized messages based on progress
  const getProgressMessage = () => {
    const totalRounds = enabledRounds.length;
    const completedPercentage = (currentRound / totalRounds) * 100;

    if (completedPercentage === 0) return `Welcome ${firstName}! Ready to begin your journey?`;
    if (completedPercentage < 50) return `Great start ${firstName}! Keep up the momentum!`;
    if (completedPercentage < 100) return `You're doing great ${firstName}! Almost there!`;
    return `Congratulations ${firstName}! You've completed all rounds!`;
  };

  // Add time estimates
  const getRemainingTime = () => {
    const remainingRounds = enabledRounds.slice(currentRound);
    const totalMinutes = remainingRounds.reduce((acc, round) => acc + (round.duration || 0), 0);
    return totalMinutes;
  };

  // Add a formatted date function
  const getFormattedDate = () => {
    return format(new Date(), 'MM/dd/yyyy');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0A18] to-[#0D0D20]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mt-12">
        {/* Enhanced Header with Personal Progress */}
        <div className="text-center mb-12">
          <div className="mb-6">
            <span className="px-4 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-sm font-medium">
              {currentRound === enabledRounds.length ? "Final Round" : `Round ${currentRound + 1} of ${enabledRounds.length}`}
            </span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-indigo-300 to-rose-300 bg-clip-text text-transparent">
              {getProgressMessage()}
            </span>
          </h1>
          <p className="text-white/60 max-w-2xl mx-auto text-lg">
            {currentRound < enabledRounds.length ? (
              <span>
                Estimated time remaining: <span className="text-indigo-300 font-medium">{getRemainingTime()} minutes</span>
              </span>
            ) : (
              "All rounds completed! Check your results below."
            )}
          </p>
        </div>

        {/* Enhanced Progress Flow with Animations */}
        <div className="mb-12 relative">
          <div className="flex justify-between items-center mb-8">
            {enabledRounds.map((round, index) => {
              const status = getRoundStatus(index);
              return (
                <React.Fragment key={round.id}>
                  <div className="flex flex-col items-center text-center relative z-10 group">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center border-2 mb-4 transition-all duration-300 ${
                      status === 'completed' ? 'border-emerald-500 bg-emerald-500/20 group-hover:scale-110' :
                      status === 'active' ? 'border-indigo-500 bg-indigo-500/20 shadow-lg shadow-indigo-500/30 animate-pulse' :
                      'border-white/30 bg-white/5'
                    }`}>
                      {getRoundIcon(index, round.type)}
                    </div>
                    {/* Add tooltips */}
                    <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-lg text-xs text-white whitespace-nowrap">
                        {status === 'completed' ? 'Completed ✓' : status === 'active' ? 'In Progress' : 'Upcoming'}
                      </div>
                    </div>
                    <span className={`text-sm font-medium ${
                      status === 'completed' ? 'text-emerald-300' :
                      status === 'active' ? 'text-indigo-300' :
                      'text-white/60'
                    }`}>
                      {round.name}
                    </span>
                  </div>
                  
                  {/* Enhanced progress line */}
                  {index < enabledRounds.length - 1 && (
                    <div className="flex-1 mx-2 relative">
                      <div className="h-0.5 bg-white/10 absolute top-1/2 left-0 right-0 transform -translate-y-1/2"></div>
                      <div 
                        className={`h-0.5 absolute top-1/2 left-0 transform -translate-y-1/2 transition-all duration-1000 ${
                          index < currentRound ? 'bg-gradient-to-r from-emerald-500 to-indigo-500 w-full' : 'w-0'
                        }`}
                      ></div>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
          
          {/* Progress bar for mobile */}
          <div className="lg:hidden w-full bg-white/10 rounded-full h-2 mb-4">
            <div 
              className="bg-gradient-to-r from-indigo-500 to-rose-500 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${(currentRound / enabledRounds.length) * 100}%` }}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-white/70 text-sm">Your progress</span>
            <span className="text-white font-medium">
              {currentRound} of {enabledRounds.length} rounds completed
            </span>
          </div>
        </div>

        {/* Enhanced Current Round Focus */}
        {enabledRounds.map((round, index) => {
          if (index === currentRound || (isMockMode && index === 0)) {
            const status = getRoundStatus(index);
            const isClickable = canStartRound(index);
            
            return (
              <div key={round.id} className="mb-12">
                <h2 className="text-2xl font-bold text-white mb-6 text-center">
                  {status === 'completed' ? 'Completed: ' : 'Current: '}
                  <span className="bg-gradient-to-r from-indigo-300 to-rose-300 bg-clip-text text-transparent">
                    {round.name}
                  </span>
                </h2>
                
                <div 
                  className={`bg-white/5 backdrop-blur-sm rounded-2xl border transition-all duration-300 p-8 ${
                    status === 'completed' ? 'border-emerald-500/30' :
                    status === 'active' ? 'border-indigo-500/50 shadow-lg shadow-indigo-500/20' :
                    'border-white/10'
                  } ${isClickable ? 'hover:scale-102 hover:shadow-xl cursor-pointer' : 'opacity-80'}`}
                  onClick={() => isClickable && handleStartRound(index)}
                >
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center space-x-6">
                      <div className={`relative w-20 h-20 rounded-xl flex items-center justify-center border-2 ${
                        status === 'completed' ? 'border-emerald-500/30 bg-emerald-500/10' :
                        status === 'active' ? 'border-indigo-500/30 bg-indigo-500/10' :
                        'border-white/20 bg-white/5'
                      }`}>
                        {getRoundIcon(index, round.type)}
                        {status === 'active' && (
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <h3 className="text-2xl font-semibold text-white">{round.name}</h3>
                        <div className="flex items-center space-x-4 mt-2">
                          {round.duration && (
                            <div className="flex items-center text-white/60">
                              <Clock className="h-5 w-5 mr-1" />
                              {round.duration} minutes
                            </div>
                          )}
                          <span className={`px-3 py-1 text-sm rounded-full font-medium ${
                            status === 'completed' ? 'bg-emerald-500/20 text-emerald-300' :
                            status === 'active' ? 'bg-indigo-500/20 text-indigo-300' :
                            'bg-white/10 text-white/60'
                          }`}>
                            {status === 'completed' ? 'Completed' :
                             status === 'active' ? (isMockMode ? 'Available' : 'Current Round') :
                             'Locked'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {isClickable && (
                      <button className={`px-6 py-3 rounded-xl font-medium flex items-center ${
                        status === 'completed' ? 
                          'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30' : 
                          'bg-gradient-to-r from-indigo-500 to-rose-500 text-white hover:from-indigo-600 hover:to-rose-600'
                      }`}>
                        <span className="mr-2">
                          {status === 'completed' ? 'Review Results' : 'Start Now'}
                        </span>
                        <Play className="h-5 w-5" />
                      </button>
                    )}
                  </div>

                  <div className="mt-6">
                    <p className="text-white/70 leading-relaxed text-lg">
                      {getRoundTypeDescription(round.type)}
                    </p>
                    
                    {status === 'completed' && (
                      <div className="mt-4 flex items-center text-emerald-400">
                        <CheckCircle className="h-5 w-5 mr-2" />
                        Completed on {getFormattedDate()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          }
          return null;
        })}

        {/* Enhanced All Rounds List with Animation */}
        <div className="grid md:grid-cols-2 gap-6">
          {enabledRounds.map((round, index) => {
            const status = getRoundStatus(index);
            const isClickable = canStartRound(index);
            
            return (
              <div
                key={round.id}
                className={`transform transition-all duration-300 hover:translate-y-[-4px] ${
                  isClickable ? 'cursor-pointer' : 'opacity-70'
                }`}
                onClick={() => isClickable && handleStartRound(index)}
              >
                <div className={`h-full bg-white/5 backdrop-blur-sm rounded-2xl border p-6 ${
                  status === 'completed' ? 'border-emerald-500/20 bg-emerald-500/5' :
                  status === 'active' ? 'border-indigo-500/30 bg-indigo-500/5' :
                  'border-white/10'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${
                        status === 'completed' ? 'border-emerald-500/30 bg-emerald-500/10' :
                        status === 'active' ? 'border-indigo-500/30 bg-indigo-500/10' :
                        'border-white/20 bg-white/5'
                      }`}>
                        {getRoundIcon(index, round.type)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">{round.name}</h4>
                        <p className="text-white/60 text-sm">{round.duration} minutes</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      status === 'completed' ? 'bg-emerald-500/20 text-emerald-300' :
                      status === 'active' ? 'bg-indigo-500/20 text-indigo-300' :
                      'bg-white/10 text-white/60'
                    }`}>
                      {status === 'completed' ? 'Done' : status === 'active' ? 'Next' : 'Upcoming'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {isMockMode && (
          <div className="mt-8">
            <div className="bg-gradient-to-r from-indigo-500/10 to-rose-500/10 rounded-2xl border border-white/10 p-6">
              <h3 className="text-lg font-semibold text-white mb-3">
                <span className="bg-gradient-to-r from-indigo-300 to-rose-300 bg-clip-text text-transparent">
                  Mock Practice Mode
                </span>
              </h3>
              <p className="text-white/60">
                All rounds are unlocked for practice. Complete the entire process to receive a comprehensive 
                performance report with personalized feedback, skill assessments, and improvement suggestions.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewProgress;