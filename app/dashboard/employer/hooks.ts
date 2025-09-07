'use client';

import { useState, useCallback } from 'react';
import { createAssessment, fetchJobPostingsForAssessment } from './assessment-actions';
import { toast } from 'sonner';
import mongoose from 'mongoose';

// Types
export interface AssessmentFormData {
  title: string;
  description: string;
  jobId: string;
  jobTitle: string;
  timeLimit: number;
  maxAttempts: number;
  rounds: {
    aptitude?: {
      enabled: boolean;
      questionsCount: number;
      timeLimit: number;
      weightage: number;
      topics: string[];
    };
    coding?: {
      enabled: boolean;
      questionsCount: number;
      timeLimit: number;
      weightage: number;
      difficulty: 'easy' | 'medium' | 'hard';
      languages: string[];
    };
    technicalInterview?: {
      enabled: boolean;
      duration: number;
      weightage: number;
      topics: string[];
      interviewers: string[];
    };
    hrInterview?: {
      enabled: boolean;
      duration: number;
      weightage: number;
      topics: string[];
      interviewers: string[];
    };
  };
}

// Custom hook for managing assessment creation
export function useAssessmentCreation() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<AssessmentFormData | null>(null);

  const createNewAssessment = useCallback(async (data: AssessmentFormData) => {
    setLoading(true);
    try {
      // Transform the form data to match the Assessment model structure
      const assessmentData = {
        title: data.title,
        description: data.description,
        jobOpportunity: new mongoose.Types.ObjectId(data.jobId),
        employer: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'), // TODO: Get from auth context
        status: 'draft' as const,
        
        toConductRounds: {
          aptitude: data.rounds.aptitude?.enabled || false,
          coding: data.rounds.coding?.enabled || false,
          technicalInterview: data.rounds.technicalInterview?.enabled || false,
          hrInterview: data.rounds.hrInterview?.enabled || false,
        },

        // Configure rounds based on enabled status
        ...(data.rounds.aptitude?.enabled && {
          aptitude: {
            numberOfQuestions: data.rounds.aptitude.questionsCount,
            addManualQuestion: false,
            duration: data.rounds.aptitude.timeLimit,
            score: { min: 0, max: 100, required: 60 },
            warnings: { fullscreen: 3, tabSwitch: 5, audio: 2 },
            sectionWeightage: { logicalReasoning: 40, quantitative: 30, technical: 20, verbal: 10 },
            candidateIds: [],
            questionPool: {
              logicalReasoning: Math.ceil(data.rounds.aptitude.questionsCount * 0.4),
              quantitative: Math.ceil(data.rounds.aptitude.questionsCount * 0.3),
              technical: Math.ceil(data.rounds.aptitude.questionsCount * 0.2),
              verbal: Math.floor(data.rounds.aptitude.questionsCount * 0.1)
            },
            randomizeQuestions: true,
            showResultImmediately: false,
            allowReviewBeforeSubmit: true,
            negativeMarking: false
          }
        }),

        ...(data.rounds.coding?.enabled && {
          coding: {
            numberOfProblems: data.rounds.coding.questionsCount,
            duration: data.rounds.coding.timeLimit,
            score: { min: 0, max: 100, required: 60 },
            warnings: { fullscreen: 3, tabSwitch: 3, audio: 2 },
            candidateIds: [],
            allowedLanguages: data.rounds.coding.languages,
            testCasesVisible: true,
            compilerTimeout: 30,
            memoryLimit: 256,
            difficultyWeightage: {
              easy: data.rounds.coding.difficulty === 'easy' ? 70 : 20,
              medium: data.rounds.coding.difficulty === 'medium' ? 70 : 50,
              hard: data.rounds.coding.difficulty === 'hard' ? 70 : 30
            }
          }
        }),

        ...(data.rounds.technicalInterview?.enabled && {
          technicalInterview: {
            duration: data.rounds.technicalInterview.duration,
            interviewerIds: [],
            candidateIds: [],
            score: { min: 0, max: 100, required: 60 },
            evaluationCriteria: {
              technicalKnowledge: 40,
              problemSolving: 30,
              communication: 20,
              codeQuality: 10
            },
            recordSession: false
          }
        }),

        ...(data.rounds.hrInterview?.enabled && {
          hrInterview: {
            duration: data.rounds.hrInterview.duration,
            interviewerIds: [],
            candidateIds: [],
            score: { min: 0, max: 100, required: 60 },
            evaluationCriteria: {
              communication: 30,
              culturalFit: 25,
              motivation: 20,
              leadership: 15,
              teamwork: 10
            },
            recordSession: false
          }
        }),

        overallPassingCriteria: {
          minimumRoundsToPass: 1,
          weightagePerRound: {
            // Only set aptitude to 100% when it's the only enabled round
            ...(data.rounds.aptitude?.enabled && { aptitude: 100 })
            // Other rounds commented out for now
            // ...(data.rounds.coding?.enabled && { coding: data.rounds.coding.weightage }),
            // ...(data.rounds.technicalInterview?.enabled && { technicalInterview: data.rounds.technicalInterview.weightage }),
            // ...(data.rounds.hrInterview?.enabled && { hrInterview: data.rounds.hrInterview.weightage })
          }
        },

        totalCandidates: 0,
        completedCandidates: 0,
        passingCandidates: 0,
        sendReminders: true,
        reminderTimings: [24, 2],
        publishResults: false,
        allowMultipleAttempts: data.maxAttempts > 1,
        maxAttempts: data.maxAttempts,
        ipRestrictions: [],
        browserRestrictions: [],
        instructions: data.description
      };

      // Convert ObjectIds to strings to avoid serialization issues
      const cleanAssessmentData = {
        ...assessmentData,
        jobOpportunity: assessmentData.jobOpportunity.toString(),
        employer: assessmentData.employer.toString()
      };

      const result = await createAssessment(cleanAssessmentData as any);
      
      if (result.success) {
        setFormData(null);
        return { success: true, data: result.data };
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create assessment';
      console.error('Assessment creation error:', error);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateFormData = useCallback((data: Partial<AssessmentFormData>) => {
    setFormData(prev => prev ? { ...prev, ...data } : null);
  }, []);

  const resetForm = useCallback(() => {
    setFormData(null);
  }, []);

  return {
    loading,
    formData,
    createNewAssessment,
    updateFormData,
    resetForm
  };
}

// Custom hook for fetching job postings
export function useJobPostings() {
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState<any[]>([]);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchJobPostingsForAssessment();
      if (result.success) {
        setJobs(result.data);
        return { success: true, data: result.data };
      } else {
        throw new Error(result.message || 'Failed to fetch jobs');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch jobs';
      toast.error(message);
      setJobs([]);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    jobs,
    fetchJobs
  };
}
