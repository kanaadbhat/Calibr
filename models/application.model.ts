import mongoose, { Schema, Document } from "mongoose";

export interface RoundStatus {
  aptitude: 'pending' | 'shortlisted' | 'rejected' | 'completed';
  coding: 'pending' | 'shortlisted' | 'rejected' | 'completed';
  technicalInterview: 'pending' | 'shortlisted' | 'rejected' | 'completed';
  hrInterview: 'pending' | 'shortlisted' | 'rejected' | 'completed';
}

export interface Application extends Document {
  candidateId: mongoose.Types.ObjectId;
  jobId: mongoose.Types.ObjectId;
  resumeId?: mongoose.Types.ObjectId;
  applicationDate: Date;
  status: 'applied' | 'under-review' | 'shortlisted' | 'interviewed' | 'rejected' | 'accepted';
  rounds: RoundStatus;
}

const ApplicationSchema: Schema = new Schema(
  {
    candidateId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "candidates", 
      required: true 
    },
    jobId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "jobopportunity", 
      required: true 
    },
    resumeId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "resumes",
      required: false 
    },
    applicationDate: { 
      type: Date, 
      default: Date.now,
      required: true 
    },
    status: {
      type: String,
      enum: ['applied', 'under-review', 'shortlisted', 'interviewed', 'rejected', 'accepted'],
      default: 'applied',
      required: true
    },
    rounds: {
      aptitude: {
        type: String,
        enum: ['pending', 'shortlisted', 'rejected', 'completed'],
        default: 'pending'
      },
      coding: {
        type: String,
        enum: ['pending', 'shortlisted', 'rejected', 'completed'],
        default: 'pending'
      },
      technicalInterview: {
        type: String,
        enum: ['pending', 'shortlisted', 'rejected', 'completed'],
        default: 'pending'
      },
      hrInterview: {
        type: String,
        enum: ['pending', 'shortlisted', 'rejected', 'completed'],
        default: 'pending'
      }
    }
  },
  { timestamps: true }
);

// Index for efficient queries
ApplicationSchema.index({ candidateId: 1, jobId: 1 });
ApplicationSchema.index({ jobId: 1, status: 1 });
ApplicationSchema.index({ candidateId: 1, applicationDate: -1 });

const ApplicationModel =
  (mongoose.models.application as mongoose.Model<Application>) ||
  mongoose.model<Application>("application", ApplicationSchema);

export default ApplicationModel;