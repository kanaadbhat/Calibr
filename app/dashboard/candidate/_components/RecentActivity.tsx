"use client";
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Activity, CheckCircle, Calendar, User, FileText } from 'lucide-react';
import { useRecentActivity } from '../hooks';

const RecentActivity = () => {
  const { activities, isLoading, viewAllActivity } = useRecentActivity();

  if (isLoading) {
    return (
      <Card className="bg-white/5 backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Skeleton className="w-6 h-6 rounded" />
            <Skeleton className="w-40 h-6" />
          </CardTitle>
        </CardHeader>

        <CardContent className="p-6">
          <div className="relative">
            {/* Timeline line skeleton */}
            <div className="absolute left-5 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500/30 to-pink-500/30 rounded-full"></div>
            
            <div className="space-y-8">
              {Array(4).fill(0).map((_, index) => (
                <div key={index} className="relative flex items-start space-x-6">
                  {/* Timeline dot skeleton */}
                  <Skeleton className="w-10 h-10 rounded-full z-10" />
                  
                  <div className="flex-1 pb-6 border-b border-purple-500/20 last:border-b-0">
                    <Skeleton className="w-48 h-6 mb-2" />
                    <div className="space-y-2 mt-2">
                      <Skeleton className="w-full h-4" />
                      <Skeleton className="w-3/4 h-4" />
                    </div>
                    <Skeleton className="w-24 h-6 rounded-full mt-3" />
                  </div>
                </div>
              ))}
            </div>
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
          <Activity className="w-6 h-6 text-white/70" />
          <span className="text-xl font-bold">Recent Activity</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-6">
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-5 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
          
          <div className="space-y-8">
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
                <div key={index} className="relative flex items-start space-x-6">
                  {/* Timeline dot */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 border-3 ${
                    activity.type === 'success' ? 'bg-gradient-to-br from-emerald-500 to-green-600 border-emerald-400' : 
                    'bg-gradient-to-br from-blue-500 to-purple-600 border-blue-400'
                  }`}>
                    <IconComponent className="w-5 h-5 text-white" />
                  </div>
                  
                  <div className="flex-1 pb-6 border-b border-purple-500/20 last:border-b-0">
                    <div className="font-bold text-white text-lg mb-2">{activity.title}</div>
                    <div className={`text-base mt-2 leading-relaxed ${
                      activity.type === 'success' ? 'text-emerald-200' : 'text-blue-200'
                    }`}>{activity.description}</div>
                    <div className="text-purple-300 text-sm mt-3 bg-purple-500/10 px-3 py-1 rounded-full inline-block">{activity.time}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>

      <CardFooter className="justify-center pt-6">
        <Button 
          variant="outline" 
          className="bg-gradient-to-r from-purple-500/20 to-pink-600/20 text-purple-200 border-purple-500/30 hover:bg-purple-500/30 px-8 py-3 text-base"
          onClick={viewAllActivity}
        >
          View All Activity
        </Button>
      </CardFooter>
    </Card>
  );
};

export default RecentActivity;
