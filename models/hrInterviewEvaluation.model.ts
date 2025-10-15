import mongoose, { Schema, Document } from "mongoose";

export interface HRInterviewEvaluation extends Document {
  candidateId: mongoose.Types.ObjectId;
  jobId?: mongoose.Types.ObjectId | null;
  assessmentId?: mongoose.Types.ObjectId | null;
  hrInterviewId: mongoose.Types.ObjectId;

  // Timeline
  startedAt: Date;
  endedAt?: Date;

  // Media/transcripts
  transcriptUrl?: string;
  audioUrl?: string;
  videoUrl?: string;

  // AI outputs
  aiSummary?: string;
  aiScores?: { key: string; score: number }[];
  overallScore?: number;
  verdict?: 'strong-pass' | 'pass' | 'borderline' | 'no-hire';

  // Observations
  notes?: { authorId?: mongoose.Types.ObjectId; text: string; createdAt: Date }[];
  flags?: { type: string; severity: 'low' | 'medium' | 'high'; message: string; createdAt: Date }[];

  createdAt: Date;
  updatedAt: Date;
}

const HRInterviewEvaluationSchema: Schema = new Schema({
  candidateId: { type: Schema.Types.ObjectId, ref: 'candidate', required: true },
  jobId: { type: Schema.Types.ObjectId, ref: 'jobopportunity' },
  assessmentId: { type: Schema.Types.ObjectId, ref: 'assessment' },
  hrInterviewId: { type: Schema.Types.ObjectId, ref: 'hrinterview', required: true },

  startedAt: { type: Date, required: true },
  endedAt: { type: Date },

  transcriptUrl: { type: String },
  audioUrl: { type: String },
  videoUrl: { type: String },

  aiSummary: { type: String, maxlength: 20000 },
  aiScores: [{ key: { type: String }, score: { type: Number, min: 0, max: 100 } }],
  overallScore: { type: Number, min: 0, max: 100 },
  verdict: { type: String, enum: ['strong-pass', 'pass', 'borderline', 'no-hire'] },

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
  }]
}, { timestamps: true });

HRInterviewEvaluationSchema.index({ candidateId: 1, hrInterviewId: 1 });
HRInterviewEvaluationSchema.index({ assessmentId: 1, startedAt: -1 });
HRInterviewEvaluationSchema.index({ jobId: 1 });

const HRInterviewEvaluationModel = (mongoose.models.hrinterviewevaluation as mongoose.Model<HRInterviewEvaluation>) ||
  mongoose.model<HRInterviewEvaluation>('hrinterviewevaluation', HRInterviewEvaluationSchema);

export default HRInterviewEvaluationModel;


