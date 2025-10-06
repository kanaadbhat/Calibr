import mongoose, { Schema, Document } from "mongoose";

export interface CandidateProfile extends Document {
  candidate: mongoose.Types.ObjectId;
  name: string;
  profileImage?: string;
  resumes: mongoose.Types.ObjectId[]; // References to Resume documents
  activeResume?: mongoose.Types.ObjectId; // Currently active resume ID
}

const CandidateProfileSchema: Schema = new Schema(
  {
    candidate: {
      type: Schema.Types.ObjectId,
      ref: "candidates",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    profileImage: { type: String, trim: true },

    resumes: [
      {
        type: Schema.Types.ObjectId,
        ref: "Resume",
      },
    ],

    activeResume: {
      type: Schema.Types.ObjectId,
      ref: "Resume",
    },
  },
  { timestamps: true }
);

const Profile = (mongoose.models.candidateprofiles as mongoose.Model<CandidateProfile>) || mongoose.model<CandidateProfile>('candidateprofiles', CandidateProfileSchema);

export default Profile;
