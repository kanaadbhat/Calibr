import mongoose, { Schema, Document } from "mongoose";

export interface JobOpportunity extends Document {
  company: string;
  logo: string;
  title: string;
  position: string;
  timePosted: string;
  location: string;
  techStack: string[];
  description?: string;
  salary?: string;
  type?: string;
  requirements?: string[];
  responsibilities?: string[];
  profileMatch?: number;
  startDate?: string;
  selectionRounds?: string[];
  benefits?: string[];
  workMode?: string;
  experience?: string;
  postedDate?: string;
  applicants?: number;
}

const JobOpportunitySchema: Schema = new Schema(
  {
    company: { type: String, required: true, trim: true },
    logo: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    position: { type: String, required: true, trim: true },
    timePosted: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },

    techStack: [{ type: String, trim: true }],

    description: { type: String, trim: true },
    salary: { type: String, trim: true },
    type: { type: String, trim: true },

    requirements: [{ type: String, trim: true }],
    responsibilities: [{ type: String, trim: true }],

    profileMatch: { type: Number, min: 0, max: 100 },

    startDate: { type: String, trim: true },
    selectionRounds: [{ type: String, trim: true }],
    benefits: [{ type: String, trim: true }],
    workMode: { type: String, trim: true },
    experience: { type: String, trim: true },
    postedDate: { type: String, trim: true },
    applicants: { type: Number, min: 0, default: 0 },
  },
  { timestamps: true }
);

const JobOpportunityModel =
  (mongoose.models.jobopportunity as mongoose.Model<JobOpportunity>) ||
  mongoose.model<JobOpportunity>("jobopportunity", JobOpportunitySchema);

export default JobOpportunityModel;
