"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useJobFilters } from '../hooks';
import JobList from './JobList';
import JobFilters from './JobFilters';
import type { JobOpportunity } from '../types';

interface JobOpportunitiesClientProps {
  initialJobs: JobOpportunity[];
  initialTechStack: string[];
}

export function JobOpportunitiesClient({ initialJobs, initialTechStack }: JobOpportunitiesClientProps) {
  const router = useRouter();
  const { 
    filters, 
    updateTechStack, 
    updateExperience, 
    updateLocation 
  } = useJobFilters();

  const handleViewDetails = (id: string) => {
    router.push(`/job-opportunities/${id}`);
  };

  return (
    <>
      {/* Filters Sidebar */}
      <JobFilters
        techStackOptions={initialTechStack}
        techStackLoading={false}
        filters={filters}
        onTechStackChange={updateTechStack}
        onExperienceChange={updateExperience}
        onLocationChange={updateLocation}
      />

      {/* Job List */}
      <div className="w-2/3 overflow-y-auto max-h-full pr-2">
        <JobList
          jobs={initialJobs}
          isLoading={false}
          onViewDetails={handleViewDetails}
        />
      </div>
    </>
  );
}