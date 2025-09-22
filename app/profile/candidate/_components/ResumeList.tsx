"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ResumeListProps {
  resumes: any[];
}

export default function ResumeList({ resumes }: ResumeListProps) {
  return (
    <div className="mt-6">
      <h4 className="text-lg font-semibold text-white mb-3">Manage Resumes</h4>
      {resumes?.length > 0 ? (
        <ul className="space-y-3">
          {resumes.map((res: any, index: number) => (
            <li
              key={index}
              className="flex items-center justify-between bg-white/10 rounded-lg p-3"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-medium">📄</span>
                </div>
                <span className="text-white font-medium">
                  {res.fileName || "Resume"}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open(res.url, "_blank")}
                  className="border-white/20 text-black hover:bg-white/10"
                >
                  View
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    if (confirm(`Are you sure you want to delete ${res.fileName}?`)) {
                      try {
                        const { deleteResume } = await import("../actions");
                        const result = await deleteResume(res.id);
                        if (result.success) {
                          toast.success(result.message);
                          window.location.reload();
                        } else {
                          toast.error(result.error || "Failed to delete resume");
                        }
                      } catch {
                        toast.error("An error occurred while deleting");
                      }
                    }
                  }}
                  className="border-red-600/20 text-red-400 hover:bg-red-600/10"
                >
                  Delete
                </Button>
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