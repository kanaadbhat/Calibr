"use client";

import { useState } from 'react';
import { Application } from '../../../types.d';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { XCircle, FileText, ExternalLink, Building2 } from 'lucide-react';
import { withdrawApplication, getResumeUrl } from '../../../actions/application-actions';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface ApplicationActionsProps {
  application?: Application | null;
  isLoading?: boolean;
}

export default function ApplicationActions({ application, isLoading }: ApplicationActionsProps) {
  const router = useRouter();
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);
  const [isLoadingResume, setIsLoadingResume] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!application) {
    return null;
  }

  const handleWithdraw = async () => {
    setIsWithdrawing(true);
    try {
      const response = await withdrawApplication(application._id);
      
      if (response.success) {
        toast.success('Application withdrawn successfully');
        setShowWithdrawDialog(false);
        router.refresh(); // Refresh to show updated status
      } else {
        toast.error(response.error || 'Failed to withdraw application');
      }
    } catch (error) {
      toast.error('An error occurred while withdrawing the application');
      console.error('Withdraw error:', error);
    } finally {
      setIsWithdrawing(false);
    }
  };

  const handleViewResume = async () => {
    if (!application.resumeId) return;
    
    setIsLoadingResume(true);
    try {
      const response = await getResumeUrl(application.resumeId);
      
      if (response.success && response.data) {
        // Open resume in new tab
        window.open(response.data, '_blank', 'noopener,noreferrer');
      } else {
        toast.error(response.error || 'Failed to load resume');
      }
    } catch (error) {
      toast.error('An error occurred while loading the resume');
      console.error('Resume load error:', error);
    } finally {
      setIsLoadingResume(false);
    }
  };

  const canWithdraw = application.status === 'applied' || application.status === 'under-review';

  return (
    <div className="space-y-4">
      {/* Quick Actions */}
      <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-lg">Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* View Original Job Posting */}
          <Button
            size="default"
            variant="outline"
            className="w-full border-purple-500/30 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 hover:text-white hover:border-purple-500/50"
            onClick={() => router.push(`/job-opportunities/${application.jobId}`)}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            View Job Posting
          </Button>

          {/* View Resume (if available) */}
          {application.resumeId && (
            <Button
              size="default"
              variant="outline"
              className="w-full border-blue-500/30 bg-blue-500/10 text-blue-300 hover:bg-blue-500/20 hover:text-white hover:border-blue-500/50"
              onClick={handleViewResume}
              disabled={isLoadingResume}
            >
              <FileText className="h-4 w-4 mr-2" />
              {isLoadingResume ? 'Loading...' : 'View Submitted Resume'}
            </Button>
          )}

          {/* Withdraw Application */}
          {canWithdraw && (
            <Button
              size="default"
              variant="outline"
              className="w-full border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 hover:border-red-500/50"
              onClick={() => setShowWithdrawDialog(true)}
              disabled={isWithdrawing}
            >
              <XCircle className="h-4 w-4 mr-2" />
              {isWithdrawing ? 'Withdrawing...' : 'Withdraw Application'}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Application Summary */}
      <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-lg">Application Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-white/60 mb-1">Application ID</p>
            <p className="text-xs font-mono text-white/80 bg-white/5 px-3 py-2 rounded border border-white/10 break-all">
              {application._id}
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-white/60 mb-1">Current Status</p>
            <p className="text-white capitalize font-medium">
              {application.status.replace('-', ' ')}
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-white/60 mb-1">Applied On</p>
            <p className="text-white">
              {new Date(application.applicationDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>

          {application.updatedAt && application.updatedAt !== application.applicationDate && (
            <div>
              <p className="text-sm font-medium text-white/60 mb-1">Last Updated</p>
              <p className="text-white">
                {new Date(application.updatedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Company Info */}
      <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white text-lg">
            <Building2 className="h-5 w-5" />
            Company
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-white font-medium mb-2">
            {application.job?.employer.companyName}
          </p>
          <p className="text-sm text-white/60">
            {application.job?.location}
          </p>
        </CardContent>
      </Card>

      {/* Withdraw Confirmation Dialog */}
      <AlertDialog open={showWithdrawDialog} onOpenChange={setShowWithdrawDialog}>
        <AlertDialogContent className="bg-gradient-to-br from-gray-900 to-gray-950 border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Withdraw Application</AlertDialogTitle>
            <AlertDialogDescription className="text-white/70">
              Are you sure you want to withdraw your application for{' '}
              <span className="font-semibold text-white">{application.job?.title}</span> at{' '}
              <span className="font-semibold text-white">{application.job?.employer.companyName}</span>?
              <br /><br />
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              className="border-white/20 bg-white/5 text-white hover:bg-white/10"
              disabled={isWithdrawing}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={handleWithdraw}
              disabled={isWithdrawing}
            >
              {isWithdrawing ? 'Withdrawing...' : 'Withdraw'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
