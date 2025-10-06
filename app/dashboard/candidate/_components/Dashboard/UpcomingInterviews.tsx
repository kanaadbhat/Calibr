"use client";
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Calendar, Clock, Video, Building2 } from 'lucide-react';
import { Interview } from '../../types.d';
import { toast } from 'sonner';

interface UpcomingInterviewsProps {
  interviews: Interview[];
}

const UpcomingInterviews = ({ interviews }: UpcomingInterviewsProps) => {
  // Calculate countdown to next interview
  const nextInterviewCountdown = interviews[0] ? '2 hours 15 minutes' : 'No upcoming interviews';

  const handleJoinInterview = (interviewId: string) => {
    toast.success('Joining interview...');
    console.log('Joining interview:', interviewId);
    // Future: Navigate to interview room
  };

  const handleReschedule = (interviewId: string) => {
    toast.info('Opening reschedule dialog...');
    console.log('Rescheduling interview:', interviewId);
    // Future: Open reschedule modal
  };

  return (
    <Card className="bg-white/5 backdrop-blur-sm border-white/10">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-white">
          <Calendar className="w-6 h-6 text-white/70" />
          <span className="text-lg sm:text-xl font-bold">Upcoming Interviews</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 sm:space-y-6">
        {/* Countdown Timer */}
        <Card className="bg-gradient-to-br from-indigo-500/20 to-purple-600/20 border-indigo-500/30">
          <CardContent className="p-4 sm:p-6 text-center">
            <div className="flex items-center justify-center space-x-2 sm:space-x-3 mb-3">
              <Clock className="w-6 h-6 text-indigo-300" />
              <span className="text-base sm:text-lg font-bold text-white">Next Interview In:</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-indigo-200 bg-indigo-500/10 px-3 sm:px-4 py-2 rounded-lg">{nextInterviewCountdown}</div>
          </CardContent>
        </Card>

        {/* Interview List */}
        <div className="space-y-3 sm:space-y-4">
          {interviews.map((interview, index) => (
            <Card key={index} className="bg-gradient-to-br from-blue-500/10 to-cyan-600/10 border-blue-500/20 hover:border-blue-500/40 transition-all duration-200">
              <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 space-y-3 sm:space-y-0">
                <div className="flex items-start space-x-3 sm:space-x-4 flex-1">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-base sm:text-lg font-bold text-white mb-1 truncate">{interview.company}</div>
                    <div className="text-sm sm:text-base text-blue-200 mb-1">{interview.type}</div>
                    <div className="text-xs sm:text-sm text-cyan-300 bg-cyan-500/10 px-2 sm:px-3 py-1 rounded-full inline-block">{interview.time}</div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <Button 
                    size="sm"
                    variant={interview.urgent ? "default" : "outline"}
                    className=""
                    onClick={() => handleJoinInterview(interview.id)}
                  >
                    <Video className="w-4 h-4 mr-2" />
                    Join
                  </Button>
                  <Button 
                    size="sm"
                    variant="ghost" 
                    className="text-white/70 hover:text-white hover:bg-white/10"
                    onClick={() => handleReschedule(interview.id)}
                  >
                    Reschedule
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>

      <CardFooter className="justify-center pt-4 sm:pt-6">
        <Button 
          variant="outline" 
          className=""
        >
          View All Interviews
        </Button>
      </CardFooter>
    </Card>
  );
};

export default UpcomingInterviews;
