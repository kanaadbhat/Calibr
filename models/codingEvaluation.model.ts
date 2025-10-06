import mongoose, { Schema, Document } from "mongoose";

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
  createdAt: Date;
  updatedAt: Date;
}

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
    passed: { type: Boolean, default: false }
  },
  { timestamps: true }
);

CodingEvaluationSchema.index({ candidateId: 1, codingRoundId: 1, questionId: 1 });
CodingEvaluationSchema.index({ jobId: 1 });

const CodingEvaluationModel = (mongoose.models.codingevaluation as mongoose.Model<CodingEvaluation>) ||
  mongoose.model<CodingEvaluation>("codingevaluation", CodingEvaluationSchema);

export default CodingEvaluationModel;



