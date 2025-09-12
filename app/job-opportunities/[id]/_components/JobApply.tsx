"use client";

import React from "react";
import { JobOpportunity } from "../../types";
import { useResumes } from "../../hooks";
import { applyToJob } from "../../actions";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import {
  FileUser,
  Send,
  Building,
  MapPin,
  DollarSign,
} from "lucide-react";

interface JobApplyProps {
  job?: JobOpportunity | null;
  isLoading?: boolean;
}

export default function JobApply({ job, isLoading }: JobApplyProps) {
  const [open, setOpen] = React.useState(false);
  const [selectedResume, setSelectedResume] = React.useState<string>("");
  const [readTerms, setReadTerms] = React.useState(false);
  const [confirmSend, setConfirmSend] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const { resumes, isLoading: resumesLoading } = useResumes();
 // const { user, isAuth } = userStore();
  const canConfirm = selectedResume && readTerms && confirmSend;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  if (!job) {
    return null;
  }

  const handleApplyClick = () => {
    setOpen(true);
  };

  const handleConfirmApply = async () => {
    // if (!isAuth || !user?.id || !job) {
    //   alert('Please login as a candidate to apply for jobs');
    //   return;
    // }
    setIsSubmitting(true);
    
    try {
      await applyToJob(job._id);
      
      setOpen(false);
      // Reset form
      setSelectedResume("");
      setReadTerms(false);
      setConfirmSend(false);
      
      alert('Application confirmed! Your application has been submitted successfully.');
    } catch (error) {
      console.error('Error applying to job:', error);
      alert(error instanceof Error ? error.message : 'Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setOpen(false);
    // Reset form
    setSelectedResume("");
    setReadTerms(false);
    setConfirmSend(false);
  };

  return (
    <>
      <Button
        className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white border-0"
        onClick={handleApplyClick}
      >
        <Send className="h-5 w-5 mr-2" />
        Apply Now
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent 
          side="right" 
          className="w-full sm:max-w-lg bg-gradient-to-br from-[#0A0A18] to-[#0D0D20] border-white/10 text-white overflow-y-auto px-6 py-8"
        >
          <SheetHeader className="pb-6">
            <SheetTitle className="text-2xl font-bold text-white mb-4">
              Apply to {job.company || job.department}
            </SheetTitle>
            {/* Job Information */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-6 space-y-4">
              <div className="flex items-center gap-4">
                <Building className="h-5 w-5 text-violet-400" />
                <div>
                  <p className="text-xs text-white/60">Company</p>
                  <p className="text-sm font-medium text-white">{job.company || job.department}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <MapPin className="h-5 w-5 text-violet-400" />
                <div>
                  <p className="text-xs text-white/60">Position</p>
                  <p className="text-sm font-medium text-white">{job.title}</p>
                </div>
              </div>
              {job.salary && (
                <div className="flex items-center gap-4">
                  <DollarSign className="h-5 w-5 text-violet-400" />
                  <div>
                    <p className="text-xs text-white/60">Salary</p>
                    <p className="text-sm font-medium text-white">{job.salary}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-4">
                <MapPin className="h-5 w-5 text-violet-400" />
                <div>
                  <p className="text-xs text-white/60">Location</p>
                  <p className="text-sm font-medium text-white">{job.location}</p>
                </div>
              </div>
            </div>
          </SheetHeader>

          <div className="space-y-8 mt-6">
            {/* Resume Selection */}
            <div className="w-full flex justify-center">
              <div className="w-[75%] mx-auto">
                <h3 className="text-lg font-semibold text-white mb-4 text-center">
                  Select Resume
                </h3>
                {resumesLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <Skeleton className="w-12 h-12 rounded-lg" />
                        <div className="flex-1">
                          <Skeleton className="h-4 w-32 mb-1" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <RadioGroup
                    value={selectedResume}
                    onValueChange={setSelectedResume}
                    className="space-y-4"
                  >
                    {resumes.map((resume) => (
                      <div key={resume.id} className="flex items-center gap-4 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                        <RadioGroupItem 
                          value={resume.id} 
                          id={resume.id}
                          className="border-white/20 text-violet-400" />
                        <FileUser className="w-8 h-8 text-violet-400" />
                        <div className="flex flex-col justify-center ml-2">
                          <span className="font-medium text-white text-sm">{resume.name}</span>
                          <span className="text-xs text-white/50">{resume.size}</span>
                        </div>
                      </div>
                    ))}
                  </RadioGroup>
                )}
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="mt-2">
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="text-violet-400 hover:text-violet-300 underline text-sm transition-colors"
              >
                View terms and conditions of this job role
              </a>
            </div>

            {/* Checkboxes */}
            <div className="space-y-4 mt-2">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="readTerms"
                  checked={readTerms}
                  onChange={(e) => setReadTerms(e.target.checked)}
                  className="w-4 h-4 text-violet-600 bg-transparent border-white/20 rounded focus:ring-violet-500 focus:ring-2"
                />
                <Label htmlFor="readTerms" className="text-sm text-white cursor-pointer">
                  I have read terms and conditions
                </Label>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="confirmSend"
                  checked={confirmSend}
                  onChange={(e) => setConfirmSend(e.target.checked)}
                  className="w-4 h-4 text-violet-600 bg-transparent border-white/20 rounded focus:ring-violet-500 focus:ring-2"
                />
                <Label htmlFor="confirmSend" className="text-sm text-white cursor-pointer">
                  By clicking Confirm, your profile and resume will be sent to{' '}
                  <span className="font-semibold text-violet-300">{job.company || job.department}</span>
                </Label>
              </div>
            </div>
          </div>

          <SheetFooter className="pt-8">
            <div className="flex gap-4 w-full">
              <Button
                variant="outline"
                onClick={handleCancel}
                className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmApply}
                disabled={!canConfirm || isSubmitting}
                className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white border-0"
              >
                {isSubmitting ? 'Submitting...' : 'Confirm Apply'}
              </Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
