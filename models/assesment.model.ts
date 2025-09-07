import mongoose, { Schema, Document } from "mongoose";

export interface Assessment extends Document {
  title: string;
  description?: string;
  jobOpportunity?: mongoose.Types.ObjectId;
  employer: mongoose.Types.ObjectId;
  status: 'draft' | 'active' | 'completed' | 'archived';
  
  // Rounds configuration
  toConductRounds: {
    aptitude: boolean;
    coding: boolean;
    technicalInterview: boolean;
    hrInterview: boolean;
  };

  // Aptitude Round Configuration
  aptitude?: {
    numberOfQuestions: number;
    scheduledDate?: Date;
    startTime?: string; // Format: "HH:MM"
    endTime?: string; // Format: "HH:MM"
    addManualQuestion: boolean;
    duration: number; // in minutes
    
    score: {
      min: number;
      max: number;
      required: number; // minimum score to pass
    };
    
    warnings: {
      fullscreen: number;
      tabSwitch: number;
      audio: number;
    };
    
    // Weightage for different sections (must add up to 100)
    sectionWeightage: {
      logicalReasoning: number; // percentage
      quantitative: number; // percentage
      technical: number; // percentage
      verbal: number; // percentage
    };
    
    candidateIds: mongoose.Types.ObjectId[];
    
    // Question pool configuration
    questionPool: {
      logicalReasoning: number; // number of questions from this category
      quantitative: number;
      technical: number;
      verbal: number;
    };
    
    // Additional settings
    randomizeQuestions: boolean;
    showResultImmediately: boolean;
    allowReviewBeforeSubmit: boolean;
    negativeMarking: boolean;
    negativeMarkingPercentage?: number; // if negative marking is enabled
  };

  // Coding Round Configuration (structure for future implementation)
  /*
  coding?: {
    numberOfProblems: number;
    scheduledDate?: Date;
    startTime?: string;
    endTime?: string;
    duration: number; // in minutes
    
    score: {
      min: number;
      max: number;
      required: number;
    };
    
    warnings: {
      fullscreen: number;
      tabSwitch: number;
      audio: number;
    };
    
    candidateIds: mongoose.Types.ObjectId[];
    
    // Coding specific settings
    allowedLanguages: string[];
    testCasesVisible: boolean;
    compilerTimeout: number; // in seconds
    memoryLimit: number; // in MB
    
    // Problem difficulty weightage
    difficultyWeightage: {
      easy: number;
      medium: number;
      hard: number;
    };
  };

  // Technical Interview Configuration (structure for future implementation)
  technicalInterview?: {
    scheduledDate?: Date;
    startTime?: string;
    endTime?: string;
    duration: number; // in minutes
    interviewerIds: mongoose.Types.ObjectId[];
    candidateIds: mongoose.Types.ObjectId[];
    
    score: {
      min: number;
      max: number;
      required: number;
    };
    
    // Interview criteria
    evaluationCriteria: {
      technicalKnowledge: number; // percentage weightage
      problemSolving: number;
      communication: number;
      codeQuality: number;
    };
    
    // Meeting configuration
    meetingLink?: string;
    meetingPlatform?: string; // 'zoom', 'teams', 'google-meet', etc.
    recordSession: boolean;
  };

  // HR Interview Configuration (structure for future implementation)
  hrInterview?: {
    scheduledDate?: Date;
    startTime?: string;
    endTime?: string;
    duration: number; // in minutes
    interviewerIds: mongoose.Types.ObjectId[];
    candidateIds: mongoose.Types.ObjectId[];
    
    score: {
      min: number;
      max: number;
      required: number;
    };
    
    // HR Interview criteria
    evaluationCriteria: {
      communication: number; // percentage weightage
      culturalFit: number;
      motivation: number;
      leadership: number;
      teamwork: number;
    };
    
    // Meeting configuration
    meetingLink?: string;
    meetingPlatform?: string;
    recordSession: boolean;
  };
  */

  // Overall assessment settings
  overallPassingCriteria: {
    minimumRoundsToPass: number;
    overallMinimumScore?: number;
    weightagePerRound: {
      aptitude?: number;
      coding?: number;
      technicalInterview?: number;
      hrInterview?: number;
    };
  };

  // Assessment metadata
  totalCandidates: number;
  completedCandidates: number;
  passingCandidates: number;
  
  // Scheduling
  applicationDeadline?: Date;
  assessmentStartDate?: Date;
  assessmentEndDate?: Date;
  
  // Notifications
  sendReminders: boolean;
  reminderTimings: number[]; // hours before assessment [24, 2, 0.5]
  
  // Results
  publishResults: boolean;
  resultsPublishedAt?: Date;
  
  // Security and monitoring
  allowMultipleAttempts: boolean;
  maxAttempts?: number;
  ipRestrictions: string[]; // allowed IP ranges
  browserRestrictions: string[]; // allowed browsers
  
  // Custom instructions
  instructions?: string;
  candidateInstructions?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

const AssessmentSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },
    
    description: {
      type: String,
      trim: true,
      maxlength: 1000
    },
    
    jobOpportunity: {
      type: Schema.Types.ObjectId,
      ref: "jobopportunity"
    },
    
    employer: {
      type: Schema.Types.ObjectId,
      ref: "employer",
      required: true
    },
    
    status: {
      type: String,
      enum: ['draft', 'active', 'completed', 'archived'],
      default: 'draft'
    },
    
    toConductRounds: {
      aptitude: { type: Boolean, default: false },
      coding: { type: Boolean, default: false },
      technicalInterview: { type: Boolean, default: false },
      hrInterview: { type: Boolean, default: false }
    },
    
    aptitude: {
      numberOfQuestions: { type: Number, min: 1, max: 200 },
      scheduledDate: { type: Date },
      startTime: { type: String, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ },
      endTime: { type: String, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ },
      addManualQuestion: { type: Boolean, default: false },
      duration: { type: Number, min: 15, max: 480 }, // 15 minutes to 8 hours
      
      score: {
        min: { type: Number, default: 0 },
        max: { type: Number, required: true },
        required: { type: Number, required: true }
      },
      
      warnings: {
        fullscreen: { type: Number, default: 3, min: 0 },
        tabSwitch: { type: Number, default: 2, min: 0 },
        audio: { type: Number, default: 1, min: 0 }
      },
      
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
      negativeMarkingPercentage: { type: Number, min: 0, max: 50 }
    },
    
    /*
    // Commented out for now to avoid validation errors
    coding: {
      numberOfProblems: { type: Number, min: 1, max: 10 },
      scheduledDate: { type: Date },
      startTime: { type: String, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ },
      endTime: { type: String, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ },
      duration: { type: Number, min: 30, max: 480 },
      
      score: {
        min: { type: Number, default: 0 },
        max: { type: Number },
        required: { type: Number }
      },
      
      warnings: {
        fullscreen: { type: Number, default: 3, min: 0 },
        tabSwitch: { type: Number, default: 2, min: 0 },
        audio: { type: Number, default: 1, min: 0 }
      },
      
      candidateIds: [{
        type: Schema.Types.ObjectId,
        ref: "candidate"
      }],
      
      allowedLanguages: [{ type: String }],
      testCasesVisible: { type: Boolean, default: true },
      compilerTimeout: { type: Number, default: 10, min: 5, max: 30 },
      memoryLimit: { type: Number, default: 256, min: 128, max: 1024 },
      
      difficultyWeightage: {
        easy: { type: Number, min: 0, max: 100, default: 30 },
        medium: { type: Number, min: 0, max: 100, default: 50 },
        hard: { type: Number, min: 0, max: 100, default: 20 }
      }
    },
    
    technicalInterview: {
      scheduledDate: { type: Date },
      startTime: { type: String, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ },
      endTime: { type: String, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ },
      duration: { type: Number, min: 30, max: 180 },
      
      interviewerIds: [{
        type: Schema.Types.ObjectId,
        ref: "employer"
      }],
      
      candidateIds: [{
        type: Schema.Types.ObjectId,
        ref: "candidate"
      }],
      
      score: {
        min: { type: Number, default: 0 },
        max: { type: Number },
        required: { type: Number }
      },
      
      evaluationCriteria: {
        technicalKnowledge: { type: Number, min: 0, max: 100, default: 40 },
        problemSolving: { type: Number, min: 0, max: 100, default: 30 },
        communication: { type: Number, min: 0, max: 100, default: 20 },
        codeQuality: { type: Number, min: 0, max: 100, default: 10 }
      },
      
      meetingLink: { type: String, trim: true },
      meetingPlatform: { 
        type: String, 
        enum: ['zoom', 'teams', 'google-meet', 'other'],
        default: 'zoom'
      },
      recordSession: { type: Boolean, default: false }
    },
    
    hrInterview: {
      scheduledDate: { type: Date },
      startTime: { type: String, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ },
      endTime: { type: String, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ },
      duration: { type: Number, min: 15, max: 120 },
      
      interviewerIds: [{
        type: Schema.Types.ObjectId,
        ref: "employer"
      }],
      
      candidateIds: [{
        type: Schema.Types.ObjectId,
        ref: "candidate"
      }],
      
      score: {
        min: { type: Number, default: 0 },
        max: { type: Number },
        required: { type: Number }
      },
      
      evaluationCriteria: {
        communication: { type: Number, min: 0, max: 100, default: 25 },
        culturalFit: { type: Number, min: 0, max: 100, default: 25 },
        motivation: { type: Number, min: 0, max: 100, default: 20 },
        leadership: { type: Number, min: 0, max: 100, default: 15 },
        teamwork: { type: Number, min: 0, max: 100, default: 15 }
      },
      
      meetingLink: { type: String, trim: true },
      meetingPlatform: { 
        type: String, 
        enum: ['zoom', 'teams', 'google-meet', 'other'],
        default: 'zoom'
      },
      recordSession: { type: Boolean, default: false }
    },
    */
    
    overallPassingCriteria: {
      minimumRoundsToPass: { type: Number, min: 1, max: 4, default: 1 },
      overallMinimumScore: { type: Number, min: 0 },
      weightagePerRound: {
        aptitude: { type: Number, min: 0, max: 100 },
        coding: { type: Number, min: 0, max: 100 },
        technicalInterview: { type: Number, min: 0, max: 100 },
        hrInterview: { type: Number, min: 0, max: 100 }
      }
    },
    
    totalCandidates: { type: Number, default: 0, min: 0 },
    completedCandidates: { type: Number, default: 0, min: 0 },
    passingCandidates: { type: Number, default: 0, min: 0 },
    
    applicationDeadline: { type: Date },
    assessmentStartDate: { type: Date },
    assessmentEndDate: { type: Date },
    
    sendReminders: { type: Boolean, default: true },
    reminderTimings: [{ type: Number }], // hours before assessment
    
    publishResults: { type: Boolean, default: false },
    resultsPublishedAt: { type: Date },
    
    allowMultipleAttempts: { type: Boolean, default: false },
    maxAttempts: { type: Number, min: 1, max: 5 },
    ipRestrictions: [{ type: String }],
    browserRestrictions: [{ type: String }],
    
    instructions: { type: String, trim: true, maxlength: 2000 },
    candidateInstructions: { type: String, trim: true, maxlength: 2000 }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for better performance
AssessmentSchema.index({ employer: 1, createdAt: -1 });
AssessmentSchema.index({ jobOpportunity: 1 });
AssessmentSchema.index({ status: 1 });
AssessmentSchema.index({ "aptitude.scheduledDate": 1 });
AssessmentSchema.index({ "coding.scheduledDate": 1 });

// Virtual for total weightage validation
AssessmentSchema.virtual('aptitudeWeightageTotal').get(function() {
  const doc = this as unknown as Assessment;
  if (!doc.aptitude?.sectionWeightage) return 0;
  const weightage = doc.aptitude.sectionWeightage;
  return weightage.logicalReasoning + weightage.quantitative + weightage.technical + weightage.verbal;
});

// Validation middleware
AssessmentSchema.pre('save', function(next) {
  const doc = this as unknown as Assessment;
  
  // Remove round configurations if the round is not enabled
  if (!doc.toConductRounds?.aptitude && doc.aptitude) {
    doc.aptitude = undefined;
  }
  
  // Validate aptitude section weightage adds up to 100
  if (doc.toConductRounds?.aptitude && doc.aptitude?.sectionWeightage) {
    const weightage = doc.aptitude.sectionWeightage;
    const total = weightage.logicalReasoning + 
                  weightage.quantitative + 
                  weightage.technical + 
                  weightage.verbal;
    
    if (total !== 100) {
      return next(new Error('Aptitude section weightage must add up to 100%'));
    }
  }
  
  // Validate overall round weightage if specified
  if (doc.overallPassingCriteria?.weightagePerRound) {
    const weights = doc.overallPassingCriteria.weightagePerRound;
    
    // Since only aptitude is implemented for now, validate accordingly
    if (doc.toConductRounds?.aptitude && weights.aptitude && weights.aptitude !== 100) {
      return next(new Error('Aptitude round weightage must be 100% when it\'s the only enabled round'));
    }
    
    // Once other rounds are implemented, add validation for them here
  }
  
  next();
});

const AssessmentModel = (mongoose.models.assessment as mongoose.Model<Assessment>) || 
                       mongoose.model<Assessment>('assessment', AssessmentSchema);

export default AssessmentModel;
