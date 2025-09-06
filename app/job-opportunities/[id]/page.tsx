"use client";

import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useJobOpportunity } from '../hooks';
import { JobActions, JobDetails, JobHeader } from './_components';


export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const { job, isLoading, error } = useJobOpportunity(id);

  const handleBack = () => {
    router.back();
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A0A18] to-[#0D0D20] pt-22 pb-16">
        <div className="container mx-auto px-6">
          <Button
            onClick={handleBack}
            variant="outline"
            className="mb-6 bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Jobs
          </Button>
          
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-400 mb-4">Error</h1>
            <p className="text-white/60">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0A18] to-[#0D0D20] pt-22 pb-16">
      <div className="container mx-auto px-6">
        {/* Back Button */}
        <Button
          onClick={handleBack}
          variant="outline"
          className="mb-6 bg-white/10 border-white/20 text-white hover:bg-white/20"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Jobs
        </Button>

        {/* Job Header - Full Width */}
        <div className="mb-8">
          <JobHeader job={job} isLoading={isLoading} />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Center Section - Job Details (spans 2 columns) */}
          <div className="lg:col-span-2">
            <JobDetails job={job} isLoading={isLoading} />
          </div>

          {/* Right Section - Actions & Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <JobActions job={job} isLoading={isLoading} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
