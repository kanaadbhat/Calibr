
"use client";

import { useState, useEffect } from 'react';
import { 
  fetchPerformanceData, 
  fetchUpcomingInterviews, 
  fetchRecentActivity, 
  fetchSkillAnalysis, 
  fetchJobRecommendations,
  joinInterview,
  rescheduleInterview,
  quickApply,
  saveJob,
  markActivityAsRead
} from './actions';

import{
  Job,Interview,Activity,Skill,PerformanceData
}from './types.d';

// Custom hooks for data management
export const usePerformanceData = () => {
  const [data, setData] = useState<PerformanceData | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start with loading true

  const loadPerformanceData = async () => {
    setIsLoading(true);
    try {
      const result = await fetchPerformanceData();
      if (result.success && result.data) {
        setData(result.data);
      }
    } catch (error) {
      console.error('Error fetching performance data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPerformanceData();
  }, []);

  return { data, isLoading, reload: loadPerformanceData, setData };
};

export const useUpcomingInterviews = () => {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Start with loading true
  const [nextInterviewCountdown] = useState('2 days 5 hours 23 minutes');

  const loadInterviews = async () => {
    setIsLoading(true);
    try {
      const result = await fetchUpcomingInterviews();
      if (result.success && result.data) {
        setInterviews(result.data);
      }
    } catch (error) {
      console.error('Error fetching upcoming interviews:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinInterview = async (index: number) => {
    try {
      await joinInterview(interviews[index].id);
    } catch (error) {
      console.error('Error joining interview:', error);
    }
  };

  const handleReschedule = async (index: number) => {
    try {
      await rescheduleInterview(interviews[index].id, 'Next available slot');
      // Reload interviews after reschedule
      await loadInterviews();
    } catch (error) {
      console.error('Error rescheduling interview:', error);
    }
  };

  useEffect(() => {
    loadInterviews();
  }, []);

  return {
    interviews,
    isLoading,
    nextInterviewCountdown,
    reload: loadInterviews,
    setInterviews,
    joinInterview: handleJoinInterview,
    rescheduleInterview: handleReschedule
  };
};

export const useRecentActivity = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Start with loading true

  const loadRecentActivity = async () => {
    setIsLoading(true);
    try {
      const result = await fetchRecentActivity();
      if (result.success && result.data) {
        setActivities(result.data);
      }
    } catch (error) {
      console.error('Error fetching recent activity:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewAllActivity = async () => {
    try {
      // For now, mark the first activity as read when viewing all
      if (activities.length > 0) {
        await markActivityAsRead(activities[0].title); // Using title as ID for now
      }
    } catch (error) {
      console.error('Error marking activity as read:', error);
    }
  };

  useEffect(() => {
    loadRecentActivity();
  }, []);

  return { 
    activities, 
    isLoading,
    reload: loadRecentActivity,
    setActivities, 
    viewAllActivity: handleViewAllActivity 
  };
};

export const useSkillAnalysis = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [radarData, setRadarData] = useState<any[]>([]);
  const [recommendation, setRecommendation] = useState('');
  const [isLoading, setIsLoading] = useState(true); // Start with loading true

  const loadSkillAnalysis = async () => {
    setIsLoading(true);
    try {
      const result = await fetchSkillAnalysis();
      if (result.success && result.data) {
        setSkills(result.data.skills);
        setRadarData(result.data.radarData);
        setRecommendation(result.data.recommendation);
      }
    } catch (error) {
      console.error('Error fetching skill analysis:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSkillAnalysis();
  }, []);

  return { 
    skills, 
    radarData, 
    recommendation, 
    isLoading,
    reload: loadSkillAnalysis,
    setSkills, 
    setRadarData, 
    setRecommendation 
  };
};

export const useJobRecommendations = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Start with loading true

  const loadJobRecommendations = async () => {
    setIsLoading(true);
    try {
      const result = await fetchJobRecommendations();
      if (result.success && result.data) {
        setJobs(result.data);
      }
    } catch (error) {
      console.error('Error fetching job recommendations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickApply = async (jobIndex: number) => {
    try {
      await quickApply(jobs[jobIndex].title);
    } catch (error) {
      console.error('Error applying to job:', error);
    }
  };

  const handleSaveJob = async (jobIndex: number) => {
    try {
      await saveJob(jobs[jobIndex].title);
    } catch (error) {
      console.error('Error saving job:', error);
    }
  };

  const handleViewJobDetails = (jobIndex: number) => {
    // For now, just log - future: navigate to job details
    console.log(`Viewing details for ${jobs[jobIndex].title}`);
  };

  const handleViewAllRecommendations = () => {
    // For now, just log - future: navigate to all recommendations page
    console.log('Viewing all recommendations');
  };

  useEffect(() => {
    loadJobRecommendations();
  }, []);

  return {
    jobs,
    isLoading,
    reload: loadJobRecommendations,
    setJobs,
    quickApply: handleQuickApply,
    saveJob: handleSaveJob,
    viewJobDetails: handleViewJobDetails,
    viewAllRecommendations: handleViewAllRecommendations
  };
};
