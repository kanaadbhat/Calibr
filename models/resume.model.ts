import mongoose, { Schema, Document } from "mongoose";

export interface Resume extends Document {
  candidateId: mongoose.Types.ObjectId;
  fileName: string;
  originalFileName: string;
  s3Url: string;
  s3Key: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: Date;
  
  // Parsed data from AI
  parsedData: {
    tagline?: string;
    summary?: string;
    workDetails?: string;
    education?: {
      year: string;
      degree: string;
      institution: string;
    }[];
    skills?: string;
    projects?: {
      name: string;
      description: string;
      link?: string;
    }[];
    certificates?: {
      name: string;
      issuer: string;
      link?: string;
    }[];
    socialLinks?: {
      linkedin?: string;
      github?: string;
    };
  };
  
  isParsed: boolean;
  parseError?: string;
  lastUpdated: Date;
  
  // Versioning for same filename
  version: number;
  isActive: boolean; // Only one version per filename should be active
}

const ResumeSchema: Schema = new Schema(
  {
    candidateId: {
      type: Schema.Types.ObjectId,
      ref: "candidate",
      required: true,
      index: true,
    },
    
    fileName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    
    originalFileName: {
      type: String,
      required: true,
      trim: true,
    },
    
    s3Url: {
      type: String,
      required: true,
      trim: true,
    },
    
    s3Key: {
      type: String,
      required: true,
      trim: true,
    },
    
    fileSize: {
      type: Number,
      required: true,
      min: 0,
    },
    
    mimeType: {
      type: String,
      required: true,
      trim: true,
    },
    
    uploadedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
    
    parsedData: {
      tagline: { type: String, trim: true, default: "" },
      summary: { type: String, trim: true, default: "" },
      workDetails: { type: String, trim: true, default: "" },
      education: [
        {
          year: { type: String, trim: true },
          degree: { type: String, trim: true },
          institution: { type: String, trim: true },
          _id: false,
        },
      ],
      skills: { type: String, trim: true, default: "" },
      projects: [
        {
          name: { type: String, trim: true },
          description: { type: String, trim: true },
          link: { type: String, trim: true },
          _id: false,
        },
      ],
      certificates: [
        {
          name: { type: String, trim: true },
          issuer: { type: String, trim: true },
          link: { type: String, trim: true },
          _id: false,
        },
      ],
      socialLinks: {
        linkedin: { type: String, trim: true, default: "" },
        github: { type: String, trim: true, default: "" },
      },
    },
    
    isParsed: {
      type: Boolean,
      default: false,
    },
    
    parseError: {
      type: String,
      trim: true,
    },
    
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    
    version: {
      type: Number,
      default: 1,
      min: 1,
    },
    
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries
ResumeSchema.index({ candidateId: 1, fileName: 1 });
ResumeSchema.index({ candidateId: 1, isActive: 1 });

const Resume =
  (mongoose.models.Resume as mongoose.Model<Resume>) ||
  mongoose.model<Resume>("Resume", ResumeSchema);

export default Resume;