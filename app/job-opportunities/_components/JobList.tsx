"use client";

import React from 'react';
import { JobOpportunity } from '../interfaces';
import JobCard, { JobCardSkeleton } from './JobCard';

interface JobListProps {
  jobs: JobOpportunity[];
  isLoading: boolean;
  onViewDetails: (id: number) => void;
}

const JobList: React.FC<JobListProps> = ({ jobs, isLoading, onViewDetails }) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array(6).fill(0).map((_, index) => (
          <JobCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-white/60 text-lg mb-2">No job opportunities found</div>
        <div className="text-white/40 text-sm">Try adjusting your filters</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {jobs.map((job) => (
        <JobCard
          key={job.id}
          job={job}
          onViewDetails={onViewDetails}
        />
      ))}
    </div>
  );
};

export default JobList;
