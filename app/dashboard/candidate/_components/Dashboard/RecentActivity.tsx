"use client";
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Activity, CheckCircle, Calendar, User, FileText } from 'lucide-react';
import { Activity as ActivityType } from '../../types.d';
import { toast } from 'sonner';

interface RecentActivityProps {
  activities: ActivityType[];
}

const RecentActivity = ({ activities }: RecentActivityProps) => {
  const handleViewAll = () => {
    toast.info('Navigating to all activities...');
    // Future: Navigate to activities page
  };

  return (
    <Card className="bg-white/5 backdrop-blur-sm border-white/10">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-white">
          <Activity className="w-6 h-6 text-white/70" />
          <span className="text-lg sm:text-xl font-bold">Recent Activity</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-4 sm:p-6">
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 sm:left-5 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
          
          <div className="space-y-6 sm:space-y-8">
            {activities.map((activity, index) => {
              // Map activity types to icons
              const getIcon = (title: string) => {
                if (title.includes('Assessment')) return CheckCircle;
                if (title.includes('Interview')) return Calendar;
                if (title.includes('Profile')) return User;
                if (title.includes('Application')) return FileText;
                return Activity;
              };
              const IconComponent = getIcon(activity.title);
              
              return (
                <div key={index} className="relative flex items-start space-x-4 sm:space-x-6">
                  {/* Timeline dot */}
                  <div className={`w-8 sm:w-10 h-8 sm:h-10 rounded-full flex items-center justify-center z-10 border-3 flex-shrink-0 ${
                    activity.type === 'success' ? 'bg-gradient-to-br from-emerald-500 to-green-600 border-emerald-400' : 
                    'bg-gradient-to-br from-blue-500 to-purple-600 border-blue-400'
                  }`}>
                    <IconComponent className="w-4 sm:w-5 h-4 sm:h-5 text-white" />
                  </div>
                  
                  <div className="flex-1 pb-4 sm:pb-6 border-b border-purple-500/20 last:border-b-0 min-w-0">
                    <div className="font-bold text-white text-base sm:text-lg mb-2 truncate">{activity.title}</div>
                    <div className={`text-sm sm:text-base mt-2 leading-relaxed ${
                      activity.type === 'success' ? 'text-emerald-200' : 'text-blue-200'
                    }`}>{activity.description}</div>
                    <div className="text-purple-300 text-xs sm:text-sm mt-3 bg-purple-500/10 px-2 sm:px-3 py-1 rounded-full inline-block">{activity.time}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>

      <CardFooter className="justify-center pt-4 sm:pt-6">
        <Button 
          variant="outline" 
          className=""
          onClick={handleViewAll}
        >
          View All Activity
        </Button>
      </CardFooter>
    </Card>
  );
};

export default RecentActivity;
