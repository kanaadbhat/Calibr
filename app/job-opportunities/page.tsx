"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useJobOpportunities, useTechStackOptions, useJobFilters } from './hooks';
import JobList from './_components/JobList';
import JobFilters from './_components/JobFilters';
import RoleWrapper from '@/lib/RoleWrapper';

export default function JobOpportunitiesPage() {
  const router = useRouter();
  const { jobs, isLoading: jobsLoading } = useJobOpportunities();
  const { techStack, isLoading: techStackLoading } = useTechStackOptions();
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
    <RoleWrapper role={["candidate" , "employer"]}>
      <div className="min-h-screen bg-gradient-to-br from-[#0A0A18] to-[#0D0D20] pt-22 pb-16">
        <div className="container mx-auto px-6">
          <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-violet-300 to-purple-300 bg-clip-text text-transparent">
            Job Opportunities
          </h1>
          
          <div className="flex gap-8 h-[calc(100vh-200px)]">
            {/* Filters Sidebar */}
            <JobFilters
              techStackOptions={techStack}
              techStackLoading={techStackLoading}
              filters={filters}
              onTechStackChange={updateTechStack}
              onExperienceChange={updateExperience}
              onLocationChange={updateLocation}
            />

            {/* Job List */}
            <div className="w-2/3 overflow-y-auto max-h-full pr-2">
              <JobList
                jobs={jobs}
                isLoading={jobsLoading}
                onViewDetails={handleViewDetails}
              />
            </div>
          </div>
        </div>
      </div>
    </RoleWrapper>
  );
}
