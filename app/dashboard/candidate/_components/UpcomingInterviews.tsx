"use client";
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Clock, Video, Building2 } from 'lucide-react';
import { useUpcomingInterviews } from '../hooks';

const UpcomingInterviews = () => {
  const { interviews, isLoading, nextInterviewCountdown, joinInterview, rescheduleInterview } = useUpcomingInterviews();

  if (isLoading) {
    return (
      <Card className="bg-white/5 backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Skeleton className="w-6 h-6 rounded" />
            <Skeleton className="w-48 h-6" />
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Countdown Timer Skeleton */}
          <Card className="bg-gradient-to-br from-indigo-500/20 to-purple-600/20 border-indigo-500/30">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center space-x-3 mb-3">
                <Skeleton className="w-6 h-6 rounded" />
                <Skeleton className="w-48 h-6" />
              </div>
              <Skeleton className="w-64 h-8 mx-auto rounded-lg" />
            </CardContent>
          </Card>

          {/* Interview List Skeleton */}
          <div className="space-y-4">
            {Array(3).fill(0).map((_, index) => (
              <Card key={index} className="bg-gradient-to-br from-blue-500/10 to-cyan-600/10 border-blue-500/20">
                <CardContent className="flex items-center justify-between p-6">
                  <div className="flex items-start space-x-4 flex-1">
                    <Skeleton className="w-12 h-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="w-32 h-6" />
                      <Skeleton className="w-24 h-5" />
                      <Skeleton className="w-20 h-6 rounded-full" />
                    </div>
                  </div>
                  <Skeleton className="w-24 h-10 rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>

        <CardFooter className="justify-center pt-6">
          <Skeleton className="w-48 h-12 rounded" />
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="bg-white/5 backdrop-blur-sm border-white/10">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-white">
          <Calendar className="w-6 h-6 text-white/70" />
          <span className="text-xl font-bold">Upcoming Interviews</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Countdown Timer */}
        <Card className="bg-gradient-to-br from-indigo-500/20 to-purple-600/20 border-indigo-500/30">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center space-x-3 mb-3">
              <Clock className="w-6 h-6 text-indigo-300" />
              <span className="text-lg font-bold text-white">Next Interview In:</span>
            </div>
            <div className="text-2xl font-bold text-indigo-200 bg-indigo-500/10 px-4 py-2 rounded-lg">{nextInterviewCountdown}</div>
          </CardContent>
        </Card>

        {/* Interview List */}
        <div className="space-y-4">
          {interviews.map((interview, index) => (
            <Card key={index} className="bg-gradient-to-br from-blue-500/10 to-cyan-600/10 border-blue-500/20 hover:border-blue-500/40 transition-all duration-200">
              <CardContent className="flex items-center justify-between p-6">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-lg font-bold text-white mb-1">{interview.company}</div>
                    <div className="text-base text-blue-200 mb-1">{interview.type}</div>
                    <div className="text-sm text-cyan-300 bg-cyan-500/10 px-3 py-1 rounded-full inline-block">{interview.time}</div>
                  </div>
                </div>
                <Button 
                  size="lg"
                  variant={interview.urgent ? "default" : "outline"}
                  className={interview.urgent 
                    ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:from-emerald-600 hover:to-green-700 border-emerald-500/30 px-6 py-3" 
                    : "bg-transparent text-blue-200 hover:bg-blue-500/20 border-blue-500/30 px-6 py-3"
                  }
                  onClick={() => interview.urgent ? joinInterview(index) : rescheduleInterview(index)}
                >
                  {interview.urgent && <Video className="w-5 h-5 mr-2" />}
                  {interview.status}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>

      <CardFooter className="justify-center pt-6">
        <Button variant="outline" className="bg-gradient-to-r from-indigo-500/20 to-purple-600/20 text-indigo-200 border-indigo-500/30 hover:bg-indigo-500/30 px-8 py-3 text-base">
          View All Interviews
        </Button>
      </CardFooter>
    </Card>
  );
};

export default UpcomingInterviews;
