// API route to migrate candidates to applications
// Call this once: GET /api/migrate-candidates

import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/connectDb';
import JobOpportunityModel from '@/models/jobOpportunity.model';

export async function GET() {
  try {
    await connectToDatabase();
    console.log('Connected to database for migration');
    
    // Check current state
    const beforeCount = await JobOpportunityModel.countDocuments({
      candidates: { $exists: true }
    });
    
    console.log(`Found ${beforeCount} documents with 'candidates' field`);
    
    if (beforeCount === 0) {
      return NextResponse.json({
        success: true,
        message: 'No migration needed. All documents already have the correct structure.',
        beforeCount: 0,
        modifiedCount: 0
      });
    }
    
    // Perform the migration using MongoDB aggregation pipeline
    const result = await JobOpportunityModel.collection.updateMany(
      { candidates: { $exists: true } },
      [
        {
          $set: {
            applications: [], // Set applications as empty array
            candidates: "$$REMOVE" // Remove the candidates field
          }
        }
      ]
    );
    
    // Verify migration
    const afterCount = await JobOpportunityModel.countDocuments({
      applications: { $exists: true }
    });
    
    const remainingCandidates = await JobOpportunityModel.countDocuments({
      candidates: { $exists: true }
    });
    
    console.log('Migration completed:', {
      beforeCount,
      modifiedCount: result.modifiedCount,
      afterCount,
      remainingCandidates
    });
    
    return NextResponse.json({
      success: true,
      message: 'Migration completed successfully!',
      beforeCount,
      modifiedCount: result.modifiedCount,
      afterCount,
      remainingCandidates
    });
    
  } catch (error) {
    console.error('Migration failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Migration failed',
      },
      { status: 500 }
    );
  }
}