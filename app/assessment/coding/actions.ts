"use server";

import { 
  safeAction, 
  createSuccessResponse,
  createErrorResponse,
  withDatabase,
  type ActionResponse 
} from '@/utils/action-helpers';
import { requireAuth } from '@/utils/auth-helpers';
import CodingModel from '@/models/coding.model';
import CodingEvaluationModel, { CodeRun, CodeSubmission } from '@/models/codingEvaluation.model';
import mongoose from 'mongoose';

export interface CodingRoundDetails {
  _id: string;
  totalProblems: number;
  duration: number;
  passingScore: number;
  warnings: {
    fullscreen: number;
    tabSwitch: number;
    audio: number;
  };
  difficultyWeightage: {
    easy: number;
    medium: number;
    hard: number;
  };
  problemPool: {
    easy: number;
    medium: number;
    hard: number;
  };
  randomizeProblems: boolean;
  manuallyAddProblems: boolean;
  showResultImmediately: boolean;
  allowReviewBeforeSubmit: boolean;
  languages: string[];
  compilerTimeout: number;
  memoryLimit: number;
  problemIds: number[];
  expiredProblemIds: number[];
  status: 'inactive' | 'active' | 'completed';
  assessmentId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export async function fetchCodingRoundById(
  codingRoundId: string
): Promise<ActionResponse<CodingRoundDetails>> {
  return safeAction(async () => {
    await requireAuth(); // Ensure user is authenticated

    if (!mongoose.Types.ObjectId.isValid(codingRoundId)) {
      return createErrorResponse('Invalid coding round ID');
    }

    return await withDatabase(async () => {
      const codingRound = await CodingModel.findById(codingRoundId).lean();

      if (!codingRound) {
        console.log('Coding round not found for ID:', codingRoundId);
        return createErrorResponse('Coding round not found');
      }

      console.log('Found coding round:', {
        id: codingRound._id,
        status: codingRound.status,
        totalProblems: codingRound.totalProblems,
        duration: codingRound.duration,
        passingScore: codingRound.passingScore
      });

      // Check if coding round is active (allow both active and inactive for now)
      if (codingRound.status !== 'active' && codingRound.status !== 'inactive') {
        console.log('Coding round status is not active or inactive:', codingRound.status);
        return createErrorResponse(`Coding round is ${codingRound.status}. Only active or inactive rounds are allowed.`);
      }

      const codingRoundDetails: CodingRoundDetails = {
        _id: codingRound._id.toString(),
        totalProblems: codingRound.totalProblems || 1,
        duration: codingRound.duration || 60,
        passingScore: codingRound.passingScore || 70,
        warnings: codingRound.warnings || {
          fullscreen: 3,
          tabSwitch: 2,
          audio: 1
        },
        difficultyWeightage: codingRound.difficultyWeightage || {
          easy: 30,
          medium: 50,
          hard: 20
        },
        problemPool: codingRound.problemPool || {
          easy: 0,
          medium: 0,
          hard: 0
        },
        randomizeProblems: codingRound.randomizeProblems ?? true,
        manuallyAddProblems: codingRound.manuallyAddProblems ?? false,
        showResultImmediately: codingRound.showResultImmediately ?? false,
        allowReviewBeforeSubmit: codingRound.allowReviewBeforeSubmit ?? true,
        languages: codingRound.languages || ['javascript'],
        compilerTimeout: codingRound.compilerTimeout || 10,
        memoryLimit: codingRound.memoryLimit || 256,
        problemIds: codingRound.problemIds || [],
        expiredProblemIds: codingRound.expiredProblemIds || [],
        status: codingRound.status,
        assessmentId: codingRound.assessmentId?.toString() || null,
        createdAt: (codingRound as any).createdAt || new Date(),
        updatedAt: (codingRound as any).updatedAt || new Date()
      };

      return createSuccessResponse('Coding round details fetched successfully', codingRoundDetails);
    });
  });
}

export async function getAssessmentByCodingRoundId(
  codingRoundId: string
): Promise<ActionResponse<{ assessmentId: string; jobId: string }>> {
  return safeAction(async () => {
    await requireAuth();

    if (!mongoose.Types.ObjectId.isValid(codingRoundId)) {
      return createErrorResponse('Invalid coding round ID');
    }

    return await withDatabase(async () => {
      const codingRound = await CodingModel.findById(codingRoundId)
        .populate('assessmentId')
        .lean();

      if (!codingRound) {
        return createErrorResponse('Coding round not found');
      }

      const assessment = codingRound.assessmentId as any;
      if (!assessment) {
        return createErrorResponse('Assessment not found for this coding round');
      }

      return createSuccessResponse('Assessment details fetched', {
        assessmentId: assessment._id.toString(),
        jobId: assessment.jobOpportunity?.toString() || ''
      });
    });
  });
}

export async function saveCodeRun(
  codingRoundId: string,
  problemId: number,
  code: string,
  language: string,
  results?: any,
  passed?: boolean
): Promise<ActionResponse<{ success: boolean }>> {
  return safeAction(async () => {
    const candidateId = await requireAuth();

    if (!mongoose.Types.ObjectId.isValid(codingRoundId)) {
      return createErrorResponse('Invalid coding round ID');
    }

    return await withDatabase(async () => {
      // Get coding round to find jobId and assessmentId
      const codingRound = await CodingModel.findById(codingRoundId).lean();
      if (!codingRound) {
        return createErrorResponse('Coding round not found');
      }

      // Find or create coding evaluation record
      let evaluation = await CodingEvaluationModel.findOne({
        candidateId: new mongoose.Types.ObjectId(candidateId),
        codingRoundId: new mongoose.Types.ObjectId(codingRoundId)
      });

      if (!evaluation) {
        evaluation = await CodingEvaluationModel.create({
          candidateId: new mongoose.Types.ObjectId(candidateId),
          jobId: codingRound.assessmentId ? new mongoose.Types.ObjectId(codingRound.assessmentId) : null,
          codingRoundId: new mongoose.Types.ObjectId(codingRoundId),
          assessmentId: codingRound.assessmentId,
          questionId: problemId,
          language,
          code,
          results,
          passed: passed || false,
          codeRuns: [],
          codeSubmissions: [],
          problemStatus: {}
        });
      }

      // Add code run
      const codeRun: CodeRun = {
        problemId,
        code,
        language,
        timestamp: new Date(),
        results,
        passed: passed || false
      };

      await CodingEvaluationModel.findByIdAndUpdate(
        evaluation._id,
        {
          $push: { codeRuns: codeRun },
          $set: {
            [`problemStatus.${problemId}`]: 'attempted' // Code runs should only mark as attempted, not solved
          }
        }
      );

      return createSuccessResponse('Code run saved successfully', { success: true });
    });
  });
}

export async function saveCodeSubmission(
  codingRoundId: string,
  problemId: number,
  code: string,
  language: string,
  results?: any,
  passed?: boolean
): Promise<ActionResponse<{ success: boolean }>> {
  return safeAction(async () => {
    const candidateId = await requireAuth();

    if (!mongoose.Types.ObjectId.isValid(codingRoundId)) {
      return createErrorResponse('Invalid coding round ID');
    }

    return await withDatabase(async () => {
      // Get coding round to find jobId and assessmentId
      const codingRound = await CodingModel.findById(codingRoundId).lean();
      if (!codingRound) {
        return createErrorResponse('Coding round not found');
      }

      // Find or create coding evaluation record
      let evaluation = await CodingEvaluationModel.findOne({
        candidateId: new mongoose.Types.ObjectId(candidateId),
        codingRoundId: new mongoose.Types.ObjectId(codingRoundId)
      });

      if (!evaluation) {
        evaluation = await CodingEvaluationModel.create({
          candidateId: new mongoose.Types.ObjectId(candidateId),
          jobId: codingRound.assessmentId ? new mongoose.Types.ObjectId(codingRound.assessmentId) : null,
          codingRoundId: new mongoose.Types.ObjectId(codingRoundId),
          assessmentId: codingRound.assessmentId,
          questionId: problemId,
          language,
          code,
          results,
          passed: passed || false,
          codeRuns: [],
          codeSubmissions: [],
          problemStatus: {}
        });
      }

      // Add code submission
      const codeSubmission: CodeSubmission = {
        problemId,
        code,
        language,
        timestamp: new Date(),
        results,
        passed: passed || false
      };

      await CodingEvaluationModel.findByIdAndUpdate(
        evaluation._id,
        {
          $push: { codeSubmissions: codeSubmission },
          $set: {
            [`problemStatus.${problemId}`]: passed ? 'solved' : 'attempted'
          }
        }
      );

      return createSuccessResponse('Code submission saved successfully', { success: true });
    });
  });
}

export async function getProblemStatus(
  codingRoundId: string
): Promise<ActionResponse<{ [problemId: number]: 'solved' | 'attempted' | 'not-attempted' }>> {
  return safeAction(async () => {
    const candidateId = await requireAuth();

    if (!mongoose.Types.ObjectId.isValid(codingRoundId)) {
      return createErrorResponse('Invalid coding round ID');
    }

    return await withDatabase(async () => {
      const evaluation = await CodingEvaluationModel.findOne({
        candidateId: new mongoose.Types.ObjectId(candidateId),
        codingRoundId: new mongoose.Types.ObjectId(codingRoundId)
      }).lean();

      if (!evaluation) {
        return createSuccessResponse('No evaluation found', {});
      }

      return createSuccessResponse('Problem status retrieved', evaluation.problemStatus || {});
    });
  });
}

export async function getSavedTimer(
  codingRoundId: string
): Promise<ActionResponse<{ timeLeft: number; exists: boolean; isSubmitted: boolean }>> {
  return safeAction(async () => {
    const candidateId = await requireAuth();

    if (!mongoose.Types.ObjectId.isValid(codingRoundId)) {
      return createErrorResponse('Invalid coding round ID');
    }

    return await withDatabase(async () => {
      const evaluation = await CodingEvaluationModel.findOne({
        candidateId: new mongoose.Types.ObjectId(candidateId),
        codingRoundId: new mongoose.Types.ObjectId(codingRoundId)
      }).lean();

      if (!evaluation) {
        return createSuccessResponse('No saved timer found', { timeLeft: 0, exists: false, isSubmitted: false });
      }

      // Check if assessment is explicitly submitted using the isSubmitted flag
      const isSubmitted = evaluation.isSubmitted || false;

      return createSuccessResponse('Saved timer retrieved', { 
        timeLeft: evaluation.timeLeft || 0, 
        exists: true,
        isSubmitted: isSubmitted
      });
    });
  });
}

export async function updateTimer(
  codingRoundId: string,
  timeLeft: number
): Promise<ActionResponse<{ success: boolean }>> {
  return safeAction(async () => {
    const candidateId = await requireAuth();

    if (!mongoose.Types.ObjectId.isValid(codingRoundId)) {
      return createErrorResponse('Invalid coding round ID');
    }

    return await withDatabase(async () => {
      // Get coding round to find jobId and assessmentId
      const codingRound = await CodingModel.findById(codingRoundId).lean();
      if (!codingRound) {
        return createErrorResponse('Coding round not found');
      }

      // Find or create coding evaluation record
      let evaluation = await CodingEvaluationModel.findOne({
        candidateId: new mongoose.Types.ObjectId(candidateId),
        codingRoundId: new mongoose.Types.ObjectId(codingRoundId)
      });

      if (!evaluation) {
        evaluation = await CodingEvaluationModel.create({
          candidateId: new mongoose.Types.ObjectId(candidateId),
          jobId: codingRound.assessmentId ? new mongoose.Types.ObjectId(codingRound.assessmentId) : null,
          codingRoundId: new mongoose.Types.ObjectId(codingRoundId),
          assessmentId: codingRound.assessmentId,
          questionId: 1, // Default question ID
          language: 'javascript', // Default language
          code: '', // Default empty code
          results: null,
          passed: false,
          codeRuns: [],
          codeSubmissions: [],
          problemStatus: {},
          timeLeft: timeLeft,
          isSubmitted: false
        });
      } else {
        // Update existing evaluation with new time (only if not submitted)
        if (!evaluation.isSubmitted) {
          await CodingEvaluationModel.findByIdAndUpdate(
            evaluation._id,
            { $set: { timeLeft: timeLeft } }
          );
        }
      }

      return createSuccessResponse('Timer updated successfully', { success: true });
    });
  });
}

export async function markAssessmentAsSubmitted(
  codingRoundId: string
): Promise<ActionResponse<{ success: boolean }>> {
  return safeAction(async () => {
    const candidateId = await requireAuth();

    if (!mongoose.Types.ObjectId.isValid(codingRoundId)) {
      return createErrorResponse('Invalid coding round ID');
    }

    return await withDatabase(async () => {
      // Find coding evaluation record
      const evaluation = await CodingEvaluationModel.findOne({
        candidateId: new mongoose.Types.ObjectId(candidateId),
        codingRoundId: new mongoose.Types.ObjectId(codingRoundId)
      });

      if (!evaluation) {
        return createErrorResponse('Evaluation record not found');
      }

      // Mark as submitted
      await CodingEvaluationModel.findByIdAndUpdate(
        evaluation._id,
        { $set: { isSubmitted: true, timeLeft: 0 } }
      );

      return createSuccessResponse('Assessment marked as submitted', { success: true });
    });
  });
}



