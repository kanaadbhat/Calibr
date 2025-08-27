"use client";
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, Target, Award, Calendar, TrendingDown, Minus, Lightbulb } from 'lucide-react';
import { usePerformanceData } from '../hooks';

const PerformanceOverview = () => {
  const { data, isLoading } = usePerformanceData();

  // Helper function to get trend difference with fallback
  const getTrendDifference = (current: number, previous: number, fallback: number = 5) => {
    if (current === undefined || previous === undefined) return fallback;
    return Math.abs(current - previous);
  };

  // Helper function to get tip with fallback
  const getTipWithFallback = (tip: string | undefined, defaultTip: string) => {
    return tip || defaultTip;
  };

  // Helper function to get trend with fallback
  const getTrendWithFallback = (trend: 'up' | 'down' | 'stable' | undefined, fallback: 'up' | 'down' | 'stable' = 'up') => {
    return trend || fallback;
  };

  if (isLoading || !data) {
    return (
      <Card className="bg-white/5 backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Skeleton className="w-8 h-8 rounded" />
            <Skeleton className="w-48 h-6" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array(4).fill(0).map((_, index) => (
              <Card key={index} className="bg-white/5 border-white/10">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <Skeleton className="w-8 h-8 rounded" />
                    <Skeleton className="w-16 h-6 rounded-full" />
                  </div>
                  <Skeleton className="w-16 h-10" />
                  <Skeleton className="w-24 h-4" />
                  <div className="space-y-2">
                    <Skeleton className="w-full h-3" />
                    <Skeleton className="w-3/4 h-3" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-emerald-400" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-400" />;
      case 'stable': return <Minus className="w-4 h-4 text-yellow-400" />;
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return 'text-emerald-400 bg-emerald-500/10';
      case 'down': return 'text-red-400 bg-red-500/10';
      case 'stable': return 'text-yellow-400 bg-yellow-500/10';
    }
  };

  return (
    <Card className="bg-white/5 backdrop-blur-sm border-white/10">
      <CardHeader>
        <CardTitle className="flex items-center space-x-3 text-white">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold">Performance Overview</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Overall Score Card */}
          <Card className="bg-gradient-to-br from-emerald-500/20 to-green-600/20 border-emerald-500/30 hover:border-emerald-500/50 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getTrendColor(getTrendWithFallback(data.overallScore.trend))}`}>
                  {getTrendIcon(getTrendWithFallback(data.overallScore.trend))}
                  <span>+{getTrendDifference(data.overallScore.current, data.overallScore.previous, 6)}</span>
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="text-3xl font-bold text-white">{data.overallScore.current}%</div>
                <div className="text-emerald-200 text-sm font-medium">Overall Score</div>
                <div className="text-xs text-emerald-300/70">Previous: {data.overallScore.previous || 72}%</div>
              </div>
              
              <div className="flex items-start space-x-2 p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                <Lightbulb className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-emerald-200 leading-relaxed">
                  {getTipWithFallback(data.overallScore.tip, "Keep taking assessments to improve your overall performance score.")}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Completed Assessments Card */}
          <Card className="bg-gradient-to-br from-blue-500/20 to-indigo-600/20 border-blue-500/30 hover:border-blue-500/50 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <div className="flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium text-blue-400 bg-blue-500/10">
                  <TrendingUp className="w-4 h-4" />
                  <span>+{getTrendDifference(data.completedAssessments.current, data.completedAssessments.lastMonthCompleted, 4)}</span>
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="text-3xl font-bold text-white">{data.completedAssessments.current}/{data.completedAssessments.total}</div>
                <div className="text-blue-200 text-sm font-medium">Completed Assessments</div>
                <div className="text-xs text-blue-300/70">Last month: {data.completedAssessments.lastMonthCompleted || 8}</div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-blue-300">Progress</span>
                  <span className="text-xs text-blue-300 font-medium">{data.completedAssessments.percentage}%</span>
                </div>
                <div className="w-full bg-blue-900/30 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-400 to-indigo-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${data.completedAssessments.percentage}%` }}
                  />
                </div>
                
                <div className="flex items-start space-x-2 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <Lightbulb className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-blue-200 leading-relaxed">
                    {getTipWithFallback(data.completedAssessments.tip, "Complete more assessments to showcase your skills and improve your ranking.")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Interviews Card */}
          <Card className="bg-gradient-to-br from-purple-500/20 to-violet-600/20 border-purple-500/30 hover:border-purple-500/50 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-400 to-violet-500 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div className="flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium text-purple-400 bg-purple-500/10">
                  <TrendingUp className="w-4 h-4" />
                  <span>+{getTrendDifference(data.upcomingInterviews.count, data.upcomingInterviews.lastMonthCount, 1)}</span>
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="text-3xl font-bold text-white">{data.upcomingInterviews.count}</div>
                <div className="text-purple-200 text-sm font-medium">Upcoming Interviews</div>
                <div className="text-xs text-purple-300/70">Success rate: {data.upcomingInterviews.successRate || 85}%</div>
              </div>
              
              <div className="space-y-3">
                <div className="text-xs text-amber-400 bg-amber-500/10 px-3 py-2 rounded-lg border border-amber-500/20">
                  <div className="font-medium">Next Interview</div>
                  <div className="text-amber-300 mt-1">{data.upcomingInterviews.nextTime}</div>
                </div>
                
                <div className="flex items-start space-x-2 p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                  <Lightbulb className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-purple-200 leading-relaxed">
                    {getTipWithFallback(data.upcomingInterviews.tip, "Prepare well for your upcoming interviews. Review the job requirements and practice common questions.")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Skill Level Card */}
          <Card className="bg-gradient-to-br from-amber-500/20 to-orange-600/20 border-amber-500/30 hover:border-amber-500/50 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <div className="flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium text-amber-400 bg-amber-500/10">
                  <TrendingUp className="w-4 h-4" />
                  <span>+{data.skillLevel.improvement || 12}%</span>
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="text-2xl font-bold text-white">{data.skillLevel.current}</div>
                <div className="text-amber-200 text-sm font-medium">Current Level</div>
                <div className="text-xs text-amber-300/70">Next: {data.skillLevel.nextLevel || 'Expert'}</div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-amber-300">Progress to {data.skillLevel.nextLevel || 'Expert'}</span>
                  <span className="text-xs text-amber-300 font-medium">{data.skillLevel.progress || 78}%</span>
                </div>
                <div className="w-full bg-amber-900/30 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-amber-400 to-orange-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${data.skillLevel.progress || 78}%` }}
                  />
                </div>
                
                <div className="flex items-start space-x-2 p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                  <Lightbulb className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-amber-200 leading-relaxed">
                    {getTipWithFallback(data.skillLevel.tip, "Continue learning and practicing to advance to the next skill level. Focus on challenging projects.")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceOverview;
