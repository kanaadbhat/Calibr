/**
 * Central export file for all employer dashboard actions
 * This file re-exports all actions from their respective modules
 */

// Dashboard data actions (stats, activities, candidates, monitoring)
export {
  fetchStats,
  fetchActivities,
  fetchCandidates,
  fetchLiveMonitoring,
  fetchJobs,
} from './actions/dashboard-actions';

// Job creation actions
export {
  createJobPosting,
} from './actions/createJob-actions';

export type {
  JobCreationData,
} from './actions/createJob-actions';

// Assessment-related actions
export {
  createAssessment,
  fetchJobPostingsForAssessment,
  fetchAssessmentsForJob,
  fetchAssessmentById,
  updateAssessment,
  fetchJobForAssessment,
} from './actions/assessment-actions';

export type {
  AssessmentCreationData,
  JobForAssessment,
} from './actions/assessment-actions';

// Aptitude-related actions
export {
  createAptitudeRound,
  updateAptitudeRound,
  fetchAptitudeById,
  generateAptitudeQuestionIds,
} from './actions/aptitude-actions';

export type { Aptitude } from './actions/aptitude-actions';
