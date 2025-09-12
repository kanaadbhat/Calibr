import mongoose, { Schema, Document } from "mongoose";

// Function to generate N unique random numbers between 1 and 31900

export interface Aptitude extends Document {
  // From second interface (renamed from numberOfQuestions)
  totalQuestions: number;
  duration: number;
  passingScore: number; // renamed from score.required
  warnings: {
    fullscreen: number;
    tabSwitch: number;
    audio: number;
  };
  scheduledDate?: Date;
  startTime?: string;
  endTime?: string;
  addManualQuestion: boolean;
  sectionWeightage: {
    logicalReasoning: number;
    quantitative: number;
    technical: number;
    verbal: number;
  };
  candidateIds: mongoose.Types.ObjectId[];
  questionPool: {
    logicalReasoning: number;
    quantitative: number;
    technical: number;
    verbal: number;
  };
  randomizeQuestions: boolean;
  showResultImmediately: boolean;
  allowReviewBeforeSubmit: boolean;
  negativeMarking: boolean;
  negativeMarkingPercentage?: number;
  assessmentId: mongoose.Types.ObjectId;
  questionIds: number[]; 
  expiredQuestionIds: number[];
  sections: {
    name: string;
    description?: string;
    questionIds: number[];
    timeLimit?: number;
  }[];
  status: 'inactive' | 'active' | 'completed';
}

export const AptitudeSchema: Schema = new Schema({
  totalQuestions: { type: Number, min: 1, max: 200 },
  duration: { type: Number, min: 15, max: 480 },
  passingScore: { type: Number, required: true },
  warnings: {
    fullscreen: { type: Number, default: 3, min: 0 },
    tabSwitch: { type: Number, default: 2, min: 0 },
    audio: { type: Number, default: 1, min: 0 }
  },
  scheduledDate: { type: Date },
  startTime: { type: String, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ },
  endTime: { type: String, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ },
  addManualQuestion: { type: Boolean, default: false },
  sectionWeightage: {
    logicalReasoning: { type: Number, min: 0, max: 100, default: 25 },
    quantitative: { type: Number, min: 0, max: 100, default: 25 },
    technical: { type: Number, min: 0, max: 100, default: 25 },
    verbal: { type: Number, min: 0, max: 100, default: 25 }
  },
  candidateIds: [{
    type: Schema.Types.ObjectId,
    ref: "candidate"
  }],
  questionPool: {
    logicalReasoning: { type: Number, default: 0, min: 0 },
    quantitative: { type: Number, default: 0, min: 0 },
    technical: { type: Number, default: 0, min: 0 },
    verbal: { type: Number, default: 0, min: 0 }
  },
  randomizeQuestions: { type: Boolean, default: true },
  showResultImmediately: { type: Boolean, default: false },
  allowReviewBeforeSubmit: { type: Boolean, default: true },
  negativeMarking: { type: Boolean, default: false },
  negativeMarkingPercentage: { type: Number, min: 0, max: 50 },
  assessmentId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "assessment"
  },
  questionIds: [{ type: Number }], 
  expiredQuestionIds: [{ type: Number }],
  sections: [{
    name: { type: String, required: true },
    description: { type: String },
    questionIds: [{ type: Number }],
    timeLimit: { type: Number }
  }],
  status: {
    type: String,
    enum: ['inactive', 'active', 'completed'],
    default: 'inactive'
  }
});

// Pre-save middleware to generate question IDs if not provided

const AptitudeModel = (mongoose.models.aptitudes as mongoose.Model<Aptitude>) || 
                     mongoose.model<Aptitude>('aptitudes', AptitudeSchema);

export default AptitudeModel;