import mongoose, { Schema, Document } from "mongoose";

export interface CandidateProfile extends Document {
  candidate: mongoose.Types.ObjectId;
  name: string;
  tagline?: string;
  summary?: string;
  workDetails?: string;
  profileImage?: string;
  education: {
    _id: mongoose.Types.ObjectId;
    year: string;
    degree: string;
    institution: string;
  }[];
  skills: string;
  projects: {
    _id: mongoose.Types.ObjectId;
    name: string;
    description: string;
    link?: string;
  };
  certificates: {
    _id: mongoose.Types.ObjectId;
    name: string;
    issuer: string;
    link?: string;
  }[];
  socialLinks: {
    linkedin?: string;
    github?: string;
  };
  resume?: {
    url: string;
    fileName?: string;
    fileSize?: number;
    mimeType?: string;
    _id: string
  };
}

const CandidateProfileSchema: Schema = new Schema(
  {
    candidate: {
      type: Schema.Types.ObjectId,
      ref: "candidate",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    tagline: { type: String, trim: true, maxlength: 500 },

    summary: { type: String, trim: true, maxlength: 1000 },

    workDetails: { type: String, trim: true, maxlength: 2000 },

    profileImage: { type: String, trim: true },

    education: [
      {
        year: { type: String, required: true, trim: true },
        degree: { type: String, required: true, trim: true },
        institution: { type: String, required: true, trim: true },
        _id: false,
      },
    ],

    skills: {
      type: String,
      default: "",
      index: true,
    },

    projects: [
      {
        name: { type: String, required: true, trim: true },
        description: { type: String, required: true, trim: true },
        link: { type: String, trim: true },
        _id: false,
      },
    ],

    certificates: [
      {
        name: { type: String, required: true, trim: true },
        issuer: { type: String, required: true, trim: true },
        link: { type: String, trim: true },
        _id: false,
      },
    ],

    socialLinks: {
      linkedin: {
        type: String,
        trim: true,
      },
      github: {
        type: String,
        trim: true,
      },
    },

    resume: [
      {
        url: { type: String, trim: true },
        fileName: { type: String, trim: true },
        fileSize: { type: Number, min: 0 },
        mimeType: { type: String, trim: true },
      },
    ],
  },
  { timestamps: true }
);

const Profile = (mongoose.models.candidateprofiles as mongoose.Model<CandidateProfile>) || mongoose.model<CandidateProfile>('candidateprofiles', CandidateProfileSchema);

export default Profile;
