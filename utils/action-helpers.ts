import { connectToDatabase } from "@/utils/connectDb";
import mongoose from "mongoose";

/**
 * Standard response type for all action functions
 */
export interface ActionResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

/**
 * Wrapper for database operations with automatic connection and error handling
 */
export async function withDatabase<T>(
  operation: () => Promise<T>,
  errorMessage: string = "Database operation failed"
): Promise<T> {
  try {
    await connectToDatabase();
    return await operation();
  } catch (error) {
    console.error(`${errorMessage}:`, error);
    throw formatMongooseError(error, errorMessage);
  }
}

/**
 * Format mongoose/database errors into user-friendly messages
 */
export function formatMongooseError(error: any, defaultMessage: string = "Database error"): Error {
  if (error instanceof mongoose.Error.ValidationError) {
    return new Error("Invalid data provided");
  } else if (error instanceof mongoose.Error.CastError) {
    return new Error("Invalid ID format");
  } else if (error.name === 'MongoError' || error.name === 'MongooseError') {
    return new Error("Database connection error");
  } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
    return new Error("Network connection error");
  } else if (error instanceof Error) {
    return error;
  }
  return new Error(defaultMessage);
}

/**
 * Create a standardized error response
 */
export function createErrorResponse(
  message: string,
  error?: any
): ActionResponse {
  const errorMessage = error instanceof Error 
    ? error.message 
    : typeof error === 'string' 
      ? error 
      : "Unknown error";
  
  return {
    success: false,
    message,
    error: errorMessage,
  };
}

/**
 * Create a standardized success response
 */
export function createSuccessResponse<T = any>(
  message: string,
  data?: T
): ActionResponse<T> {
  const response: ActionResponse<T> = {
    success: true,
    message,
  };
  
  if (data !== undefined) {
    response.data = data;
  }
  
  return response;
}

/**
 * Safely execute an action with automatic error handling
 */
export async function safeAction<T>(
  operation: () => Promise<ActionResponse<T>>,
  errorMessage: string = "Operation failed"
): Promise<ActionResponse<T>> {
  try {
    return await operation();
  } catch (error) {
    console.error(`${errorMessage}:`, error);
    return createErrorResponse(errorMessage, error);
  }
}

/**
 * Validate required fields in an object
 */
export function validateRequiredFields(
  data: Record<string, any>,
  requiredFields: string[]
): { valid: boolean; missingFields?: string[] } {
  const missingFields = requiredFields.filter(field => !data[field]);
  
  if (missingFields.length > 0) {
    return { valid: false, missingFields };
  }
  
  return { valid: true };
}

/**
 * Log action with emoji for better debugging
 */
export function logAction(emoji: string, message: string, ...args: any[]): void {
  console.log(`${emoji} ${message}`, ...args);
}

/**
 * Log error with emoji
 */
export function logError(message: string, error?: any): void {
  console.error(`❌ ${message}`, error || '');
}

/**
 * Log success with emoji
 */
export function logSuccess(message: string, ...args: any[]): void {
  console.log(`✅ ${message}`, ...args);
}
