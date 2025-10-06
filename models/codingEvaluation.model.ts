import mongoose, { Schema, Document } from "mongoose";

export interface CodeRun {
  problemId: number;
  code: string;
  language: string;
  timestamp: Date;
  results?: any;
  passed?: boolean;
}

export interface CodeSubmission {
  problemId: number;
  code: string;
  language: string;
  timestamp: Date;
  results?: any;
  passed?: boolean;
}

export interface CodingEvaluation extends Document {
  candidateId: mongoose.Types.ObjectId;
  jobId: mongoose.Types.ObjectId;
  codingRoundId: mongoose.Types.ObjectId;
  assessmentId?: mongoose.Types.ObjectId | null;
  questionId: number;
  language: string;
  code: string;
  results?: any;
  passed?: boolean;
  codeRuns: CodeRun[];
  codeSubmissions: CodeSubmission[];
  problemStatus: {
    [problemId: number]: 'solved' | 'attempted' | 'not-attempted';
  };
  timeLeft: number; // Time remaining in seconds
  isSubmitted: boolean; // Explicit submission flag
  createdAt: Date;
  updatedAt: Date;
}

const CodeRunSchema = new Schema({
  problemId: { type: Number, required: true },
  code: { type: String, required: true },
  language: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  results: { type: Schema.Types.Mixed },
  passed: { type: Boolean, default: false }
});

const CodeSubmissionSchema = new Schema({
  problemId: { type: Number, required: true },
  code: { type: String, required: true },
  language: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  results: { type: Schema.Types.Mixed },
  passed: { type: Boolean, default: false }
});

const CodingEvaluationSchema: Schema = new Schema(
  {
    candidateId: { type: Schema.Types.ObjectId, ref: "candidates", required: true },
    jobId: { type: Schema.Types.ObjectId, ref: "jobopportunity", required: true },
    codingRoundId: { type: Schema.Types.ObjectId, ref: "coding", required: true },
    assessmentId: { type: Schema.Types.ObjectId, ref: "assessment", required: false },
    questionId: { type: Number, required: true },
    language: { type: String, required: true },
    code: { type: String, required: true },
    results: { type: Schema.Types.Mixed },
    passed: { type: Boolean, default: false },
    codeRuns: [CodeRunSchema],
    codeSubmissions: [CodeSubmissionSchema],
    problemStatus: { type: Map, of: String, default: {} },
    timeLeft: { type: Number, default: 0 }, // Time remaining in seconds
    isSubmitted: { type: Boolean, default: false } // Explicit submission flag
  },
  { timestamps: true }
);

CodingEvaluationSchema.index({ candidateId: 1, codingRoundId: 1, questionId: 1 });
CodingEvaluationSchema.index({ jobId: 1 });

const CodingEvaluationModel = (mongoose.models.codingevaluation as mongoose.Model<CodingEvaluation>) ||
  mongoose.model<CodingEvaluation>("codingevaluation", CodingEvaluationSchema);

export default CodingEvaluationModel;



