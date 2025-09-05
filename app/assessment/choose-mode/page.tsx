"use client"
import React from 'react';
import { Target, Briefcase, User, Award } from 'lucide-react';
import { useRouter } from 'next/navigation';

const UserDashboard = () => {
  const router = useRouter();

  const handleNavigate = (page: 'mock' | 'jobs') => {
    if (page === 'mock') {
      router.push('/assessment/process');
    } else {
      router.push('/jobs');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0A18] to-[#0D0D20]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mt-12">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/5 rounded-full mb-6 border border-white/10">
            <User className="h-10 w-10 text-indigo-300" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Welcome back, <span className="bg-gradient-to-r from-indigo-300 to-rose-300 bg-clip-text text-transparent">Ritesh Borse</span>!
          </h1>
          <p className="text-xl text-white/60 max-w-2xl mx-auto">
            Ready to take your career to the next level? Choose your path below.
          </p>
        </div>

        {/* Main Options */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Mock Practice Card */}
          <div 
            onClick={() => handleNavigate('mock')}
            className="group cursor-pointer bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-indigo-500/50 transition-all duration-300 overflow-hidden p-8 hover:scale-105"
          >
            <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500/20 to-indigo-600/20 rounded-2xl mb-6 group-hover:scale-110 transition-transform border border-indigo-500/30">
              <Target className="h-8 w-8 text-indigo-300" />
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-4">Mock Practice</h2>
            <p className="text-white/60 mb-6 leading-relaxed">
              Sharpen your skills with our comprehensive mock interview system. Practice all rounds 
              and get detailed feedback to improve your performance.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center text-sm text-white/70">
                <div className="w-2 h-2 bg-indigo-400 rounded-full mr-3"></div>
                All interview rounds unlocked
              </div>
              <div className="flex items-center text-sm text-white/70">
                <div className="w-2 h-2 bg-indigo-400 rounded-full mr-3"></div>
                Detailed performance analysis
              </div>
              <div className="flex items-center text-sm text-white/70">
                <div className="w-2 h-2 bg-indigo-400 rounded-full mr-3"></div>
                Instant feedback and tips
              </div>
            </div>
            
            <div className="mt-6 flex items-center text-indigo-300 font-medium group-hover:text-indigo-200 transition-colors">
              <span>Start Practice</span>
              <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>

          {/* Job Openings Card */}
          <div 
            onClick={() => handleNavigate('jobs')}
            className="group cursor-pointer bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-rose-500/50 transition-all duration-300 overflow-hidden p-8 hover:scale-105"
          >
            <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-rose-500/20 to-rose-600/20 rounded-2xl mb-6 group-hover:scale-110 transition-transform border border-rose-500/30">
              <Briefcase className="h-8 w-8 text-rose-300" />
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-4">Job Openings</h2>
            <p className="text-white/60 mb-6 leading-relaxed">
              Explore exciting career opportunities and apply to positions that match your skills. 
              Take part in real interview processes with top companies.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center text-sm text-white/70">
                <div className="w-2 h-2 bg-rose-400 rounded-full mr-3"></div>
                Real job opportunities
              </div>
              <div className="flex items-center text-sm text-white/70">
                <div className="w-2 h-2 bg-rose-400 rounded-full mr-3"></div>
                Progressive interview rounds
              </div>
              <div className="flex items-center text-sm text-white/70">
                <div className="w-2 h-2 bg-rose-400 rounded-full mr-3"></div>
                Track application status
              </div>
            </div>
            
            <div className="mt-6 flex items-center text-rose-300 font-medium group-hover:text-rose-200 transition-colors">
              <span>Browse Jobs</span>
              <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-16 max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-white mb-8 text-center">Your Progress</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-violet-500/20 rounded-lg mb-4 border border-violet-500/30">
                <Award className="h-6 w-6 text-violet-300" />
              </div>
              <div className="text-2xl font-bold text-white">0</div>
              <div className="text-sm text-white/60">Completed Interviews</div>
            </div>
            
            <div className="text-center p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-500/20 rounded-lg mb-4 border border-indigo-500/30">
                <Target className="h-6 w-6 text-indigo-300" />
              </div>
              <div className="text-2xl font-bold text-white">0</div>
              <div className="text-sm text-white/60">Practice Sessions</div>
            </div>
            
            <div className="text-center p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-500/20 rounded-lg mb-4 border border-emerald-500/30">
                <Briefcase className="h-6 w-6 text-emerald-300" />
              </div>
              <div className="text-2xl font-bold text-white">0</div>
              <div className="text-sm text-white/60">Active Applications</div>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-12 text-center">
          <p className="text-white/50 text-sm">
            Need help getting started? <span className="text-indigo-300 cursor-pointer hover:underline">Check out our guide</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;