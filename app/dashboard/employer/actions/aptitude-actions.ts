"use server";

import AptitudeModel, { Aptitude } from '@/models/aptitude.model';
import { Document } from 'mongoose';
import { 
  safeAction, 
  createSuccessResponse, 
  createErrorResponse, 
  withDatabase, 
  logSuccess,
  type ActionResponse 
} from '@/utils/action-helpers';

// Export Aptitude type for use in forms
export type { Aptitude };

// Utility to generate N unique random numbers between 1 and 31900
function generateUniqueRandomNumbers(count: number, min: number = 1, max: number = 31900): number[] {
  if (count > (max - min + 1)) {
    throw new Error(`Cannot generate ${count} unique numbers in range ${min}-${max}`);
  }
  const numbers = new Set<number>();
  while (numbers.size < count) {
    const randomNum = Math.floor(Math.random() * (max - min + 1)) + min;
    numbers.add(randomNum);
  }
  return Array.from(numbers);
}

// Create aptitude round separately
export async function createAptitudeRound(aptitudeData: Omit<Aptitude, keyof Document | 'createdAt' | 'updatedAt'>): Promise<ActionResponse<Aptitude>> {
  return safeAction(async () => {
    return await withDatabase(async () => {
      const newAptitude = new AptitudeModel(aptitudeData);
      const savedAptitude = await newAptitude.save();

      const aptitudePlain = JSON.parse(JSON.stringify(savedAptitude));
      delete aptitudePlain.__v;

      logSuccess("Aptitude round created", aptitudePlain._id);
      return createSuccessResponse("Aptitude round created successfully!", aptitudePlain);
    }, "Failed to connect to database");
  }, "Failed to create aptitude round");
}

// Update aptitude round
export async function updateAptitudeRound(
  aptitudeId: string, 
  updateData: Partial<Omit<Aptitude, keyof Document | 'createdAt' | 'updatedAt'>>
): Promise<ActionResponse<Aptitude>> {
  return safeAction(async () => {
    return await withDatabase(async () => {
      const updatedAptitude = await AptitudeModel.findByIdAndUpdate(
        aptitudeId,
        updateData,
        { new: true, runValidators: true }
      );

      if (!updatedAptitude) {
        return createErrorResponse("Aptitude round not found");
      }

      const aptitudePlain = JSON.parse(JSON.stringify(updatedAptitude));
      delete aptitudePlain.__v;

      logSuccess("Aptitude round updated", aptitudeId);
      return createSuccessResponse("Aptitude round updated successfully!", aptitudePlain);
    }, "Failed to connect to database");
  }, "Failed to update aptitude round");
}

// Fetch aptitude round by ID
export async function fetchAptitudeById(aptitudeId: string): Promise<ActionResponse<Aptitude>> {
  return safeAction(async () => {
    return await withDatabase(async () => {
      const aptitude = await AptitudeModel.findById(aptitudeId).lean();

      if (!aptitude) {
        return createErrorResponse("Aptitude round not found");
      }

      const aptitudePlain = JSON.parse(JSON.stringify(aptitude));
      delete aptitudePlain.__v;

      return createSuccessResponse("Aptitude round fetched successfully", aptitudePlain);
    }, "Failed to connect to database");
  }, "Failed to fetch aptitude round");
}

// Generate question IDs for aptitude
export async function generateAptitudeQuestionIds(totalQuestions: number): Promise<number[]> {
  return generateUniqueRandomNumbers(totalQuestions);
}
