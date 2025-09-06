import { NextResponse } from 'next/server';

export async function GET() {
  // Simple ping endpoint that returns the current timestamp
  // This is used by the system check to measure connection speed
  return NextResponse.json({ 
    timestamp: Date.now(),
    status: 'ok'
  });
}