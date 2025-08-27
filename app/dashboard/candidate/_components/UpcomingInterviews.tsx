"use client";
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Calendar, Clock, Video, Building2 } from 'lucide-react';
import { useUpcomingInterviews } from '../hooks';

const UpcomingInterviews = () => {
  const { interviews, nextInterviewCountdown, joinInterview, rescheduleInterview } = useUpcomingInterviews();

  return (
    <Card className="bg-white/5 backdrop-blur-sm border-white/10">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-white">
          <Calendar className="w-6 h-6 text-white/70" />
          <span className="text-xl font-bold">Upcoming Interviews</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Countdown Timer */}
        <Card className="bg-gradient-to-br from-indigo-500/20 to-purple-600/20 border-indigo-500/30">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Clock className="w-5 h-5 text-indigo-300" />
              <span className="font-bold text-white">Next Interview In:</span>
            </div>
            <div className="text-lg text-indigo-200">{nextInterviewCountdown}</div>
          </CardContent>
        </Card>

        {/* Interview List */}
        <div className="space-y-4">
          {interviews.map((interview, index) => (
            <Card key={index} className="bg-gradient-to-br from-blue-500/10 to-cyan-600/10 border-blue-500/20">
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-start space-x-3 flex-1">
                  <Building2 className="w-5 h-5 text-blue-300 mt-1" />
                  <div className="flex-1">
                    <div className="font-bold text-white">{interview.company}</div>
                    <div className="text-sm text-blue-200">{interview.type}</div>
                    <div className="text-xs text-cyan-300">{interview.time}</div>
                  </div>
                </div>
                <Button 
                  size="sm"
                  variant={interview.urgent ? "default" : "outline"}
                  className={interview.urgent 
                    ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:from-emerald-600 hover:to-green-700 border-emerald-500/30" 
                    : "bg-transparent text-blue-200 hover:bg-blue-500/20 border-blue-500/30"
                  }
                  onClick={() => interview.urgent ? joinInterview(index) : rescheduleInterview(index)}
                >
                  {interview.urgent && <Video className="w-4 h-4 mr-1" />}
                  {interview.status}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>

      <CardFooter className="justify-center">
        <Button variant="outline" className="bg-gradient-to-r from-indigo-500/20 to-purple-600/20 text-indigo-200 border-indigo-500/30 hover:bg-indigo-500/30">
          View All Interviews
        </Button>
      </CardFooter>
    </Card>
  );
};

export default UpcomingInterviews;
