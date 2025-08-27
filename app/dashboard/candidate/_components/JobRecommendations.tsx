"use client";
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Briefcase, MapPin, DollarSign, Clock } from 'lucide-react';
import { useJobRecommendations } from '../hooks';

const JobRecommendations = () => {
  const { jobs, isLoading, quickApply, saveJob, viewJobDetails, viewAllRecommendations } = useJobRecommendations();

  if (isLoading) {
    return (
      <Card className="bg-white/5 backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Skeleton className="w-6 h-6 rounded" />
            <Skeleton className="w-48 h-6" />
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {Array(3).fill(0).map((_, index) => (
            <Card key={index} className="bg-gradient-to-br from-emerald-500/10 to-cyan-600/10 border-emerald-500/20">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <Skeleton className="w-48 h-6" />
                  <Skeleton className="w-16 h-6 rounded-full" />
                </div>
                
                <div className="space-y-2 mb-3">
                  <Skeleton className="w-64 h-4" />
                  <Skeleton className="w-48 h-4" />
                  <Skeleton className="w-56 h-4" />
                </div>
                
                <div className="flex gap-2 mt-4">
                  <Skeleton className="w-24 h-8 rounded" />
                  <Skeleton className="w-20 h-8 rounded" />
                  <Skeleton className="w-28 h-8 rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>

        <CardFooter className="justify-center">
          <Skeleton className="w-48 h-10 rounded" />
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="bg-white/5 backdrop-blur-sm border-white/10">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-white">
          <Briefcase className="w-6 h-6 text-white/70" />
          <span className="text-xl font-bold">Job Recommendations</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {jobs.map((job, index) => (
          <Card key={index} className="bg-gradient-to-br from-emerald-500/10 to-cyan-600/10 border-emerald-500/20">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-white">{job.title}</h3>
                <span className="bg-gradient-to-r from-indigo-500 to-rose-500 text-white px-2 py-1 rounded text-xs font-medium">
                  {job.match}
                </span>
              </div>
              
              <div className="flex items-center text-emerald-200 text-sm mb-2">
                <MapPin className="w-4 h-4 mr-1" />
                {job.company} • {job.location}
              </div>
              
              <div className="flex items-center text-cyan-200 text-sm mb-3">
                <DollarSign className="w-4 h-4 mr-1" />
                {job.salary} • 
                <Clock className="w-4 h-4 ml-2 mr-1" />
                {job.type}
              </div>
              
              <div className="text-white/40 text-xs mb-4">
                Skills match: {job.skills}
              </div>
              
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="bg-gradient-to-r from-purple-500/20 to-pink-600/20 text-purple-200 border-purple-500/30 hover:bg-purple-500/30 font-semibold transition-all duration-300"
                  onClick={() => quickApply(index)}
                >
                  Quick Apply
                </Button>

                <Button 
                  size="sm" 
                  variant="outline" 
                  className="bg-gradient-to-r from-purple-500/20 to-pink-600/20 text-purple-200 border-purple-500/30 hover:bg-purple-500/30 font-semibold transition-all duration-300"
                  onClick={() => saveJob(index)}
                >
                  Save Job
                </Button>

                <Button 
                  size="sm" 
                  variant="outline" 
                  className="bg-gradient-to-r from-purple-500/20 to-pink-600/20 text-purple-200 border-purple-500/30 hover:bg-purple-500/30 font-semibold transition-all duration-300"
                  onClick={() => viewJobDetails(index)}
                >
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </CardContent>

      <CardFooter className="justify-center">
        <Button 
          variant="outline" 
          className="bg-gradient-to-r from-purple-500/20 to-pink-600/20 text-purple-200 border-purple-500/30 hover:bg-purple-500/30"
          onClick={viewAllRecommendations}
        >
          View All Recommendations
        </Button>
      </CardFooter>
    </Card>
  );
};

export default JobRecommendations;
