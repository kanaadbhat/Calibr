import { useState } from 'react';
import { createJobPosting, JobCreationData } from './actions';

export function useCreateJob() {
  const [isLoading, setIsLoading] = useState(false);

  const createJob = async (jobData: JobCreationData) => {
    setIsLoading(true);
    try {
      const result = await createJobPosting(jobData);
      return result;
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "An unexpected error occurred",
      };
    } finally {
      setIsLoading(false);
    }
  };

  return { createJob, isLoading };
}