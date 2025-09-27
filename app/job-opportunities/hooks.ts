"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import type { JobOpportunity, JobFilters } from './types.d.ts';
import { getJobOpportunities, getTechStackOptions, getJobOpportunityById, getResumes } from './actions';

export const useJobOpportunities = () => {
  const [jobs, setJobs] = useState<JobOpportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadJobs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getJobOpportunities();
      setJobs(result);
    } catch (err) {
      setError('Failed to load job opportunities');
      console.error('Error fetching jobs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  return { jobs, isLoading, error, reload: loadJobs };
};

export const useTechStackOptions = () => {
  const [techStack, setTechStack] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadTechStack = async () => {
    setIsLoading(true);
    try {
      const result = await getTechStackOptions();
      setTechStack(result);
    } catch (error) {
      console.error('Error fetching tech stack options:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTechStack();
  }, []);

  return { techStack, isLoading };
};

export const useJobFilters = () => {
  const [filters, setFilters] = useState<JobFilters>({
    techStack: [],
    experience: [0],
    location: ''
  });

  const updateTechStack = (tech: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      techStack: checked 
        ? [...prev.techStack, tech]
        : prev.techStack.filter(item => item !== tech)
    }));
  };

  const updateExperience = (experience: number[]) => {
    setFilters(prev => ({ ...prev, experience }));
  };

  const updateLocation = (location: string) => {
    setFilters(prev => ({ ...prev, location }));
  };

  const clearFilters = () => {
    setFilters({
      techStack: [],
      experience: [0],
      location: ''
    });
  };

  return {
    filters,
    updateTechStack,
    updateExperience,
    updateLocation,
    clearFilters
  };
};

export const useJobOpportunity = (id: string) => {
  const [job, setJob] = useState<JobOpportunity | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadJob = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getJobOpportunityById(id);
      setJob(result);
    } catch (err) {
      setError('Failed to load job details');
      console.error('Error fetching job:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadJob();
    }
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  return { job, isLoading, error, reload: loadJob };
};

export const useResumes = () => {
  const [resumes, setResumes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();

  const loadResumes = async () => {
    if (!session?.user?._id) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const result = await getResumes(session.user._id);
      setResumes(result);
    } catch (err) {
      setError('Failed to load resumes');
      console.error('Error fetching resumes:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadResumes();
  }, [session?.user?._id]); // Re-run when session changes

  return { resumes, isLoading, error, reload: loadResumes };
};