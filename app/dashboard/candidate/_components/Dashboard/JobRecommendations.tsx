"use client";
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Briefcase, MapPin, DollarSign, Clock } from 'lucide-react';
import { Job } from '../../types.d';
import { toast } from 'sonner';

interface JobRecommendationsProps {
  jobs: Job[];
}

const JobRecommendations = ({ jobs }: JobRecommendationsProps) => {
  const handleQuickApply = (index: number) => {
    toast.success('Application submitted successfully!');
    console.log('Quick apply to job:', index);
    // Future: Submit application
  };

  const handleSaveJob = (index: number) => {
    toast.success('Job saved!');
    console.log('Save job:', index);
    // Future: Save to database
  };

  const handleViewDetails = (index: number) => {
    console.log('View job details:', index);
    // Future: Navigate to job details page
  };

  const handleViewAll = () => {
    console.log('View all recommendations');
    // Future: Navigate to all recommendations page
  };

  return (
    <Card className="bg-white/5 backdrop-blur-sm border-white/10">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-white">
          <Briefcase className="w-6 h-6 text-white/70" />
          <span className="text-lg sm:text-xl font-bold">Job Recommendations</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3 sm:space-y-4">
        {jobs.map((job, index) => (
          <Card key={index} className="bg-gradient-to-br from-emerald-500/10 to-cyan-600/10 border-emerald-500/20">
            <CardContent className="p-3 sm:p-4">
              <div className="flex justify-between items-start mb-2 sm:mb-3">
                <h3 className="font-bold text-white text-sm sm:text-base truncate flex-1 mr-2">{job.title}</h3>
                <span className="bg-gradient-to-r from-indigo-500 to-rose-500 text-white px-2 py-1 rounded text-xs font-medium flex-shrink-0">
                  {job.match}
                </span>
              </div>
              
              <div className="flex items-center text-emerald-200 text-xs sm:text-sm mb-2">
                <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                <span className="truncate">{job.company} • {job.location}</span>
              </div>
              
              <div className="flex items-center text-cyan-200 text-xs sm:text-sm mb-2 sm:mb-3">
                <DollarSign className="w-4 h-4 mr-1 flex-shrink-0" />
                <span className="truncate">{job.salary} • </span>
                <Clock className="w-4 h-4 ml-2 mr-1 flex-shrink-0" />
                <span className="truncate">{job.type}</span>
              </div>
              
              <div className="text-white/40 text-xs mb-3 sm:mb-4">
                Skills match: {job.skills}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="bg-gradient-to-r from-purple-500/20 to-pink-600/20 text-purple-200 border-purple-500/30 hover:bg-purple-500/30 font-semibold transition-all duration-300"
                  onClick={() => handleQuickApply(index)}
                >
                  Quick Apply
                </Button>

                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="text-white/70 hover:text-white hover:bg-white/10"
                  onClick={() => handleSaveJob(index)}
                >
                  Save
                </Button>

                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="text-white/70 hover:text-white hover:bg-white/10"
                  onClick={() => handleViewDetails(index)}
                >
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </CardContent>

      <CardFooter className="justify-center pt-3 sm:pt-4">
        <Button 
          variant="outline" 
          className=""
          onClick={handleViewAll}
        >
          View All Recommendations
        </Button>
      </CardFooter>
    </Card>
  );
};

export default JobRecommendations;
