/**
 * Central export file for all employer dashboard actions
 * This file re-exports all actions from their respective modules
 */

// Stats actions
export { fetchStats } from './actions/stats-actions';

// Activity actions
export { fetchActivities } from './actions/activity-actions';

// Candidate pipeline actions
export { fetchCandidates } from './actions/candidate-actions';

// Live monitoring actions
export { fetchLiveMonitoring } from './actions/monitoring-actions';

// Job-related actions
export { fetchJobs, createJobPosting } from './actions/job-actions';
export type { JobCreationData } from './actions/job-actions';

// Assessment-related actions
export {
  createAssessment,
  fetchJobPostingsForAssessment,
  fetchAssessmentsForJob,
  fetchAssessmentById,
  updateAssessment,
  fetchJobForAssessment,
  createAptitudeRound,
  updateAptitudeRound,
} from './actions/assessment-actions';
export type { AssessmentCreationData, JobForAssessment, Aptitude } from './actions/assessment-actions';
