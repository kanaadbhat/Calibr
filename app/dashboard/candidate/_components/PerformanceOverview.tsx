"use client";
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, Target, Award } from 'lucide-react';
import { usePerformanceData } from '../hooks';

const PerformanceOverview = () => {
  const { data, isLoading } = usePerformanceData();

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
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array(4).fill(0).map((_, index) => (
              <Card key={index} className="bg-white/5 border-white/10">
                <CardContent className="p-4 text-center space-y-3">
                  <Skeleton className="w-16 h-16 rounded-full mx-auto" />
                  <Skeleton className="w-12 h-8 mx-auto" />
                  <Skeleton className="w-20 h-4 mx-auto" />
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/5 backdrop-blur-sm border-white/10">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-white">
          <TrendingUp className="w-6 h-6 text-white/70" />
          <span className="text-xl font-bold">Performance Overview</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-emerald-500/20 to-green-600/20 border-emerald-500/30">
            <CardContent className="p-6 text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center">
                <Target className="w-10 h-10 text-white" />
              </div>
              <div className="text-3xl font-bold text-white mb-2">{data.overallScore}%</div>
              <div className="text-emerald-200 text-base font-medium">Overall Score</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/20 to-indigo-600/20 border-blue-500/30">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-white mb-2">{data.completedAssessments.current}/{data.completedAssessments.total}</div>
              <div className="text-blue-200 text-base font-medium mb-3">Completed Assessments</div>
              <div className="text-sm text-blue-300 bg-blue-500/10 px-3 py-1 rounded-full">{data.completedAssessments.percentage}% Complete</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/20 to-violet-600/20 border-purple-500/30">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-white mb-2">{data.upcomingInterviews.count}</div>
              <div className="text-purple-200 text-base font-medium mb-3">Upcoming Interviews</div>
              <div className="text-sm text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full">Next: {data.upcomingInterviews.nextTime}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500/20 to-orange-600/20 border-amber-500/30">
            <CardContent className="p-6 text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                <Award className="w-10 h-10 text-white" />
              </div>
              <div className="text-amber-200 text-base font-medium mb-2">Skill Level</div>
              <div className="text-lg font-semibold text-amber-300">{data.skillLevel}</div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceOverview;
