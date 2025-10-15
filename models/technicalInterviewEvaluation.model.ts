import mongoose, { Schema, Document } from "mongoose";

export interface TechnicalInterviewEvaluation extends Document {
  candidateId: mongoose.Types.ObjectId;
  jobId?: mongoose.Types.ObjectId | null;
  assessmentId?: mongoose.Types.ObjectId | null;
  technicalInterviewId: mongoose.Types.ObjectId;

  // Timeline
  startedAt: Date;
  endedAt?: Date;

  // Media/transcripts
  transcriptUrl?: string;
  audioUrl?: string;
  videoUrl?: string;

  // AI outputs
  aiSummary?: string;
  aiScores?: { key: string; score: number }[]; // map to rubric categories
  overallScore?: number; // 0-100
  verdict?: 'pass' | 'borderline' | 'fail';

  // Observations
  notes?: { authorId?: mongoose.Types.ObjectId; text: string; createdAt: Date }[];
  flags?: { type: string; severity: 'low' | 'medium' | 'high'; message: string; createdAt: Date }[];

  // Runtime diagnostics
  diagnostics?: {
    averageLatencyMs?: number;
    disconnects?: number;
    bitrateKbps?: number;
  };

  createdAt: Date;
  updatedAt: Date;
}

const TechnicalInterviewEvaluationSchema: Schema = new Schema({
  candidateId: { type: Schema.Types.ObjectId, ref: 'candidate', required: true },
  jobId: { type: Schema.Types.ObjectId, ref: 'jobopportunity' },
  assessmentId: { type: Schema.Types.ObjectId, ref: 'assessment' },
  technicalInterviewId: { type: Schema.Types.ObjectId, ref: 'technicalinterview', required: true },

  startedAt: { type: Date, required: true },
  endedAt: { type: Date },

  transcriptUrl: { type: String },
  audioUrl: { type: String },
  videoUrl: { type: String },

  aiSummary: { type: String, maxlength: 20000 },
  aiScores: [{ key: { type: String }, score: { type: Number, min: 0, max: 100 } }],
  overallScore: { type: Number, min: 0, max: 100 },
  verdict: { type: String, enum: ['pass', 'borderline', 'fail'] },

  notes: [{
    authorId: { type: Schema.Types.ObjectId, ref: 'employer' },
    text: { type: String, maxlength: 10000 },
    createdAt: { type: Date, default: Date.now }
  }],
  flags: [{
    type: { type: String },
    severity: { type: String, enum: ['low', 'medium', 'high'] },
    message: { type: String },
    createdAt: { type: Date, default: Date.now }
  }],

  diagnostics: {
    averageLatencyMs: { type: Number, min: 0 },
    disconnects: { type: Number, min: 0 },
    bitrateKbps: { type: Number, min: 0 }
  }
}, { timestamps: true });

TechnicalInterviewEvaluationSchema.index({ candidateId: 1, technicalInterviewId: 1 });
TechnicalInterviewEvaluationSchema.index({ assessmentId: 1, startedAt: -1 });
TechnicalInterviewEvaluationSchema.index({ jobId: 1 });

const TechnicalInterviewEvaluationModel = (mongoose.models.technicalinterviewevaluation as mongoose.Model<TechnicalInterviewEvaluation>) ||
  mongoose.model<TechnicalInterviewEvaluation>('technicalinterviewevaluation', TechnicalInterviewEvaluationSchema);

export default TechnicalInterviewEvaluationModel;


