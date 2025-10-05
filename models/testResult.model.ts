import mongoose, { Schema, Document } from "mongoose";

export interface TestResult extends Document {
  candidateId: mongoose.Types.ObjectId;
  aptitudeId: mongoose.Types.ObjectId;
  answers: Record<string, number>; 
  score: number;
  totalQuestions: number;
  correctCount: number;
  incorrectCount: number;
  unattemptedCount: number;
  percentage: number;
  passed: boolean;
  passingScore: number;
  timeTaken: number; 
  submittedAt: Date;
  status: 'completed' | 'incomplete';
  warnings: {
    tabSwitch: {
      count: number;
      maxAllowed: number;
      exceeded: boolean;
    };
    fullscreen: {
      count: number;
      maxAllowed: number;
      exceeded: boolean;
    };
    audio: {
      count: number;
      maxAllowed: number;
      exceeded: boolean;
    };
  };
  terminatedDueToWarnings: boolean;
  terminationReason?: string;
}

export const TestResultSchema: Schema = new Schema({
  candidateId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "candidates"
  },
  aptitudeId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "aptitude"
  },
  answers: {
    type: Map,
    of: Number,
    required: true
  },
  
  score: {
    type: Number,
    required: true,
    min: 0
  },
  totalQuestions: {
    type: Number,
    required: true,
    min: 0
  },
  correctCount: {
    type: Number,
    required: true,
    min: 0
  },
  incorrectCount: {
    type: Number,
    required: true,
    min: 0
  },
  unattemptedCount: {
    type: Number,
    required: true,
    min: 0
  },
  percentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  passed: {
    type: Boolean,
    required: true
  },
  passingScore: {
    type: Number,
    required: true
  },
  timeTaken: {
    type: Number,
    required: true,
    min: 0
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['completed', 'incomplete'],
    default: 'completed'
  },
  warnings: {
    tabSwitch: {
      count: {
        type: Number,
        default: 0,
        min: 0
      },
      maxAllowed: {
        type: Number,
        required: true,
        min: 0
      },
      exceeded: {
        type: Boolean,
        default: false
      }
    },
    fullscreen: {
      count: {
        type: Number,
        default: 0,
        min: 0
      },
      maxAllowed: {
        type: Number,
        required: true,
        min: 0
      },
      exceeded: {
        type: Boolean,
        default: false
      }
    },
    audio: {
      count: {
        type: Number,
        default: 0,
        min: 0
      },
      maxAllowed: {
        type: Number,
        required: true,
        min: 0
      },
      exceeded: {
        type: Boolean,
        default: false
      }
    }
  },
  terminatedDueToWarnings: {
    type: Boolean,
    default: false
  },
  terminationReason: {
    type: String
  }
});


if (mongoose.models.testResult) {
  delete mongoose.models.testResult;
}

const TestResultModel = mongoose.model<TestResult>('testResult', TestResultSchema);

export default TestResultModel;
