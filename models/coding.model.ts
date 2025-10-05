import mongoose, { Schema, Document } from "mongoose";

export interface Coding extends Document {
	totalProblems: number;
	duration: number;
	passingScore: number;
	warnings: {
		fullscreen: number;
		tabSwitch: number;
		audio: number;
	};
	scheduledDate?: Date;
	startTime?: string;
	endTime?: string;
	addManualProblem: boolean;
	difficultyWeightage: {
		easy: number;
		medium: number;
		hard: number;
	};
	candidateIds: mongoose.Types.ObjectId[];
	problemPool: {
		easy: number;
		medium: number;
		hard: number;
	};
	randomizeProblems: boolean;
	showResultImmediately: boolean;
	allowReviewBeforeSubmit: boolean;
	languages: string[];
	compilerTimeout: number; // seconds
	memoryLimit: number; // MB
	assessmentId: mongoose.Types.ObjectId | null;
	problemIds: number[];
	expiredProblemIds: number[];
	sections: {
		name: string;
		description?: string;
		problemIds: number[];
		timeLimit?: number;
	}[];
	status: 'inactive' | 'active' | 'completed';
}

export const CodingSchema: Schema = new Schema({
	totalProblems: { type: Number, min: 1, max: 50 },
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
	addManualProblem: { type: Boolean, default: false },
	difficultyWeightage: {
		easy: { type: Number, min: 0, max: 100, default: 30 },
		medium: { type: Number, min: 0, max: 100, default: 50 },
		hard: { type: Number, min: 0, max: 100, default: 20 }
	},
	candidateIds: [{
		type: Schema.Types.ObjectId,
		ref: "candidate"
	}],
	problemPool: {
		easy: { type: Number, default: 0, min: 0 },
		medium: { type: Number, default: 0, min: 0 },
		hard: { type: Number, default: 0, min: 0 }
	},
	randomizeProblems: { type: Boolean, default: true },
	showResultImmediately: { type: Boolean, default: false },
	allowReviewBeforeSubmit: { type: Boolean, default: true },
	languages: [{ type: String, enum: ['javascript','typescript','python','java','cpp','c','go','ruby','php'] }],
	compilerTimeout: { type: Number, default: 10, min: 5, max: 60 },
	memoryLimit: { type: Number, default: 256, min: 128, max: 2048 },
	assessmentId: {
		type: Schema.Types.ObjectId,
		required: false,
		ref: "assessment",
		default: null
	},
	problemIds: [{ type: Number }],
	expiredProblemIds: [{ type: Number }],
	sections: [{
		name: { type: String, required: true },
		description: { type: String },
		problemIds: [{ type: Number }],
		timeLimit: { type: Number }
	}],
	status: {
		type: String,
		enum: ['inactive', 'active', 'completed'],
		default: 'inactive'
	}
}, {
	timestamps: true
});

const CodingModel = (mongoose.models.coding as mongoose.Model<Coding>) || 
										mongoose.model<Coding>('coding', CodingSchema);

export default CodingModel;

