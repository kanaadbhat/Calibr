import mongoose, { Document, Schema } from "mongoose";

export interface EmployerProfile extends Document {
  employer: mongoose.Types.ObjectId;
  companyName: string;
  companyLogo: string;
  tagline: string;
  description: string;
  industry: string;
  companySize: string;
  foundedYear: string;
  website: string;
  location: string;
  socialLinks: {
    linkedin: string;
    twitter: string;
    facebook: string;
  };
  benefits: string[];
  culture: string;
  createdAt: Date;
  updatedAt: Date;
}

const employerProfileSchema: Schema<EmployerProfile> = new Schema(
  {
    employer: {
      type: Schema.Types.ObjectId,
      ref: "employers",
      required: true,
      unique: true,
    },
    companyName: {
      type: String,
      default: "",
    },
    companyLogo: {
      type: String,
      default: "",
    },
    tagline: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    industry: {
      type: String,
      default: "",
    },
    companySize: {
      type: String,
      default: "",
    },
    foundedYear: {
      type: String,
      default: "",
    },
    website: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      default: "",
    },
    socialLinks: {
      linkedin: { type: String, default: "" },
      twitter: { type: String, default: "" },
      facebook: { type: String, default: "" },
    },
    benefits: {
      type: [String],
      default: [],
    },
    culture: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const EmployerProfileModel =
  (mongoose.models.EmployerProfile as mongoose.Model<EmployerProfile>) ||
  mongoose.model<EmployerProfile>("EmployerProfile", employerProfileSchema);

export default EmployerProfileModel;
