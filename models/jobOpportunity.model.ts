import mongoose, { Schema, Document } from "mongoose";

export interface JobOpportunity extends Document {
  title: string;
  department: string;
  position: string;
  employmentType: string;
  seniority: string;
  locationType: string;
  location: string;
  openings: number;
  employer: mongoose.Types.ObjectId;
  experience?: string;
  workMode?: string;
  salaryMin?: number;
  salaryMax?: number;
  deadline?: string;
  techStack: string[];
  description?: string;
  requirements?: string;
  benefits?: string;
  startDate?: string;
  autoScreen?: boolean;
  isPublic?: boolean;
}


const JobOpportunitySchema: Schema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    department: { type: String, required: true, trim: true },
    position: { type: String, required: true, trim: true },
    employmentType: { 
      type: String, 
      required: true, 
      enum: ['full-time', 'part-time', 'contract', 'internship'],
      trim: true 
    },
    seniority: { 
      type: String, 
      required: true, 
      enum: ['junior', 'mid', 'senior', 'lead'],
      trim: true 
    },
    locationType: { 
      type: String, 
      required: true, 
      enum: ['remote', 'hybrid', 'onsite'],
      trim: true 
    },
    location: { type: String, required: true, trim: true },
    openings: { type: Number, required: true, min: 1, default: 1 },
    employer: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "employer",
      required: true,
      index: true
    },
    experience: { type: String, trim: true },
    workMode: { type: String, trim: true },
    salaryMin: { type: Number, min: 0 },
    salaryMax: { type: Number, min: 0 },
    deadline: { type: Date },
    techStack: [{ type: String, trim: true }],
    description: { type: String, trim: true },
    requirements: { type: String, trim: true },
    benefits: { type: String, trim: true },
    startDate: { type: String, trim: true },
    autoScreen: { type: Boolean, default: false },
    isPublic: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const JobOpportunityModel =
  (mongoose.models.jobopportunity as mongoose.Model<JobOpportunity>) ||
  mongoose.model<JobOpportunity>("jobopportunity", JobOpportunitySchema);

export default JobOpportunityModel;
