'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AlreadyAttempted() {
  const router = useRouter();


  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0A18] via-[#0D0D20] to-[#0A0A18] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-12 w-12 text-blue-500" />
            </div>
            <CardTitle className="text-2xl font-bold text-white mb-2">
              Assessment Already Attempted
            </CardTitle>
            <p className="text-white/70">
              You have already taken this aptitude assessment
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Simple Message */}
            <div className="text-center text-lg text-white/80">
              Thank you for your participation. You have already completed this assessment.
            </div>

            {/* Information Card */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <div className="flex items-center gap-2 text-blue-400 mb-2">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Assessment Completed</span>
              </div>
              <p className="text-blue-300 text-sm">
                Your assessment has been submitted and is being reviewed. You will be notified of the results through your registered email.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button 
                onClick={() => router.push('/dashboard/candidate')}
                className="flex-1 bg-gradient-to-r from-indigo-500 to-rose-500 hover:from-indigo-600 hover:to-rose-600 text-white"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              
              <Button 
                onClick={() => router.push('/dashboard/candidate')}
                variant="outline"
                className="flex-1 bg-white/5 border-white/20 text-white hover:bg-white/10"
              >
                View All Assessments
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
