"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface ResumeListProps {
  resumes: any[];
}

export default function ResumeList({ resumes }: ResumeListProps) {
  const [deletingResumeId, setDeletingResumeId] = useState<string | null>(null);

  const handleDeleteResume = async (resumeId: string) => {
    setDeletingResumeId(resumeId);
    try {
      const { deleteResume } = await import("../actions");
      const result = await deleteResume(resumeId);
      if (result.success) {
        toast.success(result.message);
        
        // Save scroll position to top before reload
        sessionStorage.setItem('scrollPosition', '0');
        
        window.location.reload();
      } else {
        toast.error(result.error || "Failed to delete resume");
      }
    } catch {
      toast.error("An error occurred while deleting");
    } finally {
      setDeletingResumeId(null);
    }
  };

  return (
    <div className="mt-6">
      <h4 className="text-lg font-semibold text-white mb-3">Manage Resumes</h4>
      {resumes?.length > 0 ? (
        <ul className="space-y-3">
          {resumes.map((res: any, index: number) => (
            <li
              key={index}
              className="flex flex-col bg-white/10 rounded-lg p-4 gap-3"
            >
              {/* Filename with icon */}
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-medium">📄</span>
                </div>
                <span className="text-white font-medium truncate">
                  {res.fileName || "Resume"}
                </span>
              </div>
              
              {/* Action buttons */}
              <div className="flex items-center gap-2 w-full">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open(res.url, "_blank")}
                  className="border-white/20 text-black hover:bg-white/10 flex-1"
                >
                  View
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={deletingResumeId === res.id}
                      className="border-red-600/20 text-red-400 hover:bg-red-600/10 flex-1"
                    >
                      {deletingResumeId === res.id ? "Deleting..." : "Delete All"}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-gray-900 border-gray-700">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-white">Delete Resume</AlertDialogTitle>
                      <AlertDialogDescription className="text-gray-300">
                        Are you sure you want to delete &quot;{res.fileName}&quot; and ALL its versions?
                        This action cannot be undone and will permanently remove all data associated with this resume.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDeleteResume(res.id)}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-white/60">No resumes uploaded yet.</p>
      )}
    </div>
  );
}