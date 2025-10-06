// "use server";

// import { withDatabase, createErrorResponse, createSuccessResponse, type ActionResponse } from '@/utils/action-helpers';
// import { requireAuth } from '@/utils/auth-helpers';
// import AssessmentModel from '@/models/assesment.model';
// import ApplicationModel from '@/models/application.model';
// import CodingModel from '@/models/coding.model';
// import CodingEvaluationModel, { type CodingEvaluation } from '@/models/codingEvaluation.model';

// export async function fetchCodingRoundById(codingRoundId: string): Promise<ActionResponse<any>> {
//   return withDatabase(async () => {
//     const round = await CodingModel.findById(codingRoundId).lean();
//     if (!round) return createErrorResponse('Coding round not found');
//     return createSuccessResponse('OK', { ...round, _id: round._id.toString() });
//   }, 'Failed to connect to database');
// }

// export async function getCandidateCodingEligibility(): Promise<ActionResponse<{ codingRoundId: string; assessmentId: string | null; jobId: string }>> {
//   const candidateId = await requireAuth();
//   return withDatabase(async () => {
//     const application = await ApplicationModel.findOne({
//       candidateId,
//       'rounds.coding': 'shortlisted'
//     }).sort({ createdAt: -1 }).lean();

//     if (!application) return createErrorResponse('Not shortlisted for coding');

//     const assessment = await AssessmentModel.findOne({ jobOpportunity: (application as any).jobId }).lean();
//     const codingId = (assessment as any)?.codingRoundId?.toString();
//     if (!assessment || !codingId) return createErrorResponse('Coding round not configured');

//     return createSuccessResponse('OK', { codingRoundId: codingId, assessmentId: (assessment as any)?._id?.toString?.() || null, jobId: (application as any).jobId.toString() });
//   }, 'Failed to connect to database');
// }

// export async function saveCodingSubmission(params: {
//   jobId: string;
//   codingRoundId: string;
//   assessmentId?: string | null;
//   questionId: number;
//   language: string;
//   code: string;
//   results?: any;
//   passed?: boolean;
// }): Promise<ActionResponse<{ id: string }>> {
//   const candidateId = await requireAuth();
//   return withDatabase(async () => {
//     const doc = await CodingEvaluationModel.create({
//       candidateId,
//       jobId: params.jobId,
//       codingRoundId: params.codingRoundId,
//       assessmentId: params.assessmentId || null,
//       questionId: params.questionId,
//       language: params.language,
//       code: params.code,
//       results: params.results || null,
//       passed: !!params.passed
//     } as Partial<CodingEvaluation>);
//     return createSuccessResponse('Saved', { id: doc._id.toString() });
//   }, 'Failed to connect to database');
// }



