"use client";
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Activity, CheckCircle, Calendar, User, FileText } from 'lucide-react';
import { useRecentActivity } from '../hooks';

const RecentActivity = () => {
  const { activities, viewAllActivity } = useRecentActivity();

  return (
    <Card className="bg-white/5 backdrop-blur-sm border-white/10">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-white">
          <Activity className="w-6 h-6 text-white/70" />
          <span className="text-xl font-bold">Recent Activity</span>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-500 to-pink-500"></div>
          
          <div className="space-y-6">
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
                <div key={index} className="relative flex items-start space-x-4">
                  {/* Timeline dot */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 border-2 ${
                    activity.type === 'success' ? 'bg-gradient-to-br from-emerald-500 to-green-600 border-emerald-400' : 
                    'bg-gradient-to-br from-blue-500 to-purple-600 border-blue-400'
                  }`}>
                    <IconComponent className="w-4 h-4 text-white" />
                  </div>
                  
                  <div className="flex-1 pb-4 border-b border-purple-500/20 last:border-b-0">
                    <div className="font-bold text-white text-sm">{activity.title}</div>
                    <div className={`text-sm mt-1 ${
                      activity.type === 'success' ? 'text-emerald-200' : 'text-blue-200'
                    }`}>{activity.description}</div>
                    <div className="text-purple-300 text-xs mt-2">{activity.time}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>

      <CardFooter className="justify-center">
        <Button 
          variant="outline" 
          className="bg-gradient-to-r from-purple-500/20 to-pink-600/20 text-purple-200 border-purple-500/30 hover:bg-purple-500/30"
          onClick={viewAllActivity}
        >
          View All Activity
        </Button>
      </CardFooter>
    </Card>
  );
};

export default RecentActivity;
