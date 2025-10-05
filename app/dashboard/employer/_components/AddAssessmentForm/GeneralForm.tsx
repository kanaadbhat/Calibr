"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface AssessmentGeneralFormProps {
  // _jobId: string; (removed unused prop)
  _jobTitle: string;
  onBack: () => void;
  onNext: (data: AssessmentGeneralData) => void;
}

export interface AssessmentGeneralData {
  // Basic information
  title: string;
  description: string;
  status: "draft" | "active" | "completed" | "archived";

  // Rounds to conduct
  toConductRounds: {
    aptitude: boolean;
    coding: boolean;
    technicalInterview: boolean;
    hrInterview: boolean;
  };

  // Scheduling
  applicationDeadline?: Date;
  assessmentStartDate?: Date;
  assessmentEndDate?: Date;

  // Settings
  allowMultipleAttempts: boolean;
  maxAttempts?: number;
  sendReminders: boolean;
  publishResults: boolean;

  // Instructions
  instructions?: string;
  candidateInstructions?: string;
}

const availableRounds = [
  {
    id: "aptitude",
    label: "Aptitude Test",
    description: "Logical reasoning and problem-solving questions",
  },
  {
    id: "coding",
    label: "Coding Challenge",
    description: "Programming problems and algorithms",
  },
  {
    id: "technicalInterview",
    label: "Technical Interview",
    description: "Technical knowledge assessment",
  },
  {
    id: "hrInterview",
    label: "HR Interview",
    description: "Behavioral and cultural fit assessment",
  },
];

export default function AssessmentGeneralForm({
  // _jobId, (removed unused prop)
  _jobTitle,
  onBack,
  onNext,
}: AssessmentGeneralFormProps) {
  const [formData, setFormData] = useState<AssessmentGeneralData>({
    title: `Assessment for ${_jobTitle}`,
    description: "",
    status: "draft",
    toConductRounds: {
      aptitude: true, // Default to aptitude for now
      coding: false,
      technicalInterview: false,
      hrInterview: false,
    },
    allowMultipleAttempts: false,
    maxAttempts: 1,
    sendReminders: true,
    publishResults: false,
    instructions: "",
    candidateInstructions: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Assessment title is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Assessment description is required";
    }

    // Check if at least one round is selected
    const selectedRounds = Object.values(formData.toConductRounds).some(
      (selected) => selected
    );
    if (!selectedRounds) {
      newErrors.rounds = "At least one assessment round must be selected";
    }

    if (
      formData.allowMultipleAttempts &&
      (!formData.maxAttempts ||
        formData.maxAttempts < 1 ||
        formData.maxAttempts > 5)
    ) {
      newErrors.maxAttempts =
        "Max attempts must be between 1 and 5 when multiple attempts are allowed";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onNext(formData);
    }
  };

const handleRoundToggle = (roundId: keyof AssessmentGeneralData['toConductRounds']) => {
  setFormData(prev => ({
    ...prev,
    toConductRounds: {
      ...prev.toConductRounds,
      [roundId]: !prev.toConductRounds[roundId]
    }
  }));
  
  // Clear rounds error if we now have at least one round selected
  const newRounds = { ...formData.toConductRounds, [roundId]: !formData.toConductRounds[roundId] };
  if (Object.values(newRounds).some(selected => selected) && errors.rounds) {
    setErrors(prevErrors => {
      // Use delete operator to remove the rounds property
      const updatedErrors = { ...prevErrors };
      delete updatedErrors.rounds;
      return updatedErrors;
    });
  }
};

  return (
    <div className="max-w-4xl mx-auto p-6 pt-16 text-white">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-4 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Job Selection
        </Button>

        <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg mb-6">
          <h2 className="text-xl font-semibold text-blue-300 mb-1">
            Creating Assessment for: {_jobTitle}
          </h2>
          <p className="text-white/80 text-sm">
            Configure the general settings for your assessment
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <Card className="bg-[#171726] border-0">
          <CardHeader>
            <CardTitle className="text-white">Basic Information</CardTitle>
            <CardDescription className="text-white/60">
              Set up the basic details for your assessment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-white">
                Assessment Title
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="Enter assessment title"
                className={`mt-1 bg-[#1f1f35] border-white/10 text-white placeholder:text-white/40 ${
                  errors.title ? "border-red-500" : ""
                }`}
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{errors.title}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-white">
                Description
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Describe what this assessment evaluates..."
                rows={4}
                className={`mt-1 bg-[#1f1f35] border-white/10 text-white placeholder:text-white/40 ${
                  errors.description ? "border-red-500" : ""
                }`}
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.description}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="status" className="text-white">
                  Status
                </Label>
                <Select
                  value={formData.status}
                  onValueChange={(
                    value: "draft" | "active" | "completed" | "archived"
                  ) => setFormData((prev) => ({ ...prev, status: value }))}
                >
                  <SelectTrigger className="bg-[#1f1f35] border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-white">Multiple Attempts</Label>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.allowMultipleAttempts}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          allowMultipleAttempts: e.target.checked,
                          maxAttempts: e.target.checked ? 3 : 1,
                        }))
                      }
                      className="rounded border-white/30"
                    />
                    <span className="text-sm text-white">
                      Allow multiple attempts
                    </span>
                  </label>
                  {formData.allowMultipleAttempts && (
                    <Input
                      type="number"
                      min="1"
                      max="5"
                      value={formData.maxAttempts}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          maxAttempts: parseInt(e.target.value) || 1,
                        }))
                      }
                      className={`w-20 bg-[#1f1f35] border-white/10 text-white ${
                        errors.maxAttempts ? "border-red-500" : ""
                      }`}
                    />
                  )}
                </div>
                {errors.maxAttempts && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.maxAttempts}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Assessment Rounds */}
        <Card className="bg-[#171726] border-0">
          <CardHeader>
            <CardTitle className="text-white">Assessment Rounds</CardTitle>
            <CardDescription className="text-white/60">
              Select which rounds to include in this assessment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableRounds.map((round) => (
                <div
                  key={round.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors select-none ${
                    formData.toConductRounds[
                      round.id as keyof typeof formData.toConductRounds
                    ]
                      ? "border-blue-500 bg-blue-500/10"
                      : "border-white/10 hover:border-white/20 bg-[#1f1f35]"
                  }`}
                  onClick={() =>
                    handleRoundToggle(
                      round.id as keyof typeof formData.toConductRounds
                    )
                  }
                  tabIndex={0}
                  role="button"
                  aria-pressed={
                    formData.toConductRounds[
                      round.id as keyof typeof formData.toConductRounds
                    ]
                  }
                >
                  <div className="flex items-start space-x-3">
                    <div
                      className={`mt-1 size-4 shrink-0 rounded-[4px] border transition-colors flex items-center justify-center ${
                        formData.toConductRounds[
                          round.id as keyof typeof formData.toConductRounds
                        ]
                          ? "bg-blue-600 border-blue-600 text-white"
                          : "border-white/30 bg-transparent"
                      }`}
                    >
                      {formData.toConductRounds[
                        round.id as keyof typeof formData.toConductRounds
                      ] && (
                        <svg
                          className="size-3"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-white">{round.label}</h4>
                      <p className="text-sm text-white/60 mt-1">
                        {round.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {errors.rounds && (
              <p className="text-red-500 text-sm mt-2">{errors.rounds}</p>
            )}
          </CardContent>
        </Card>

        {/* Settings */}
        <Card className="bg-[#171726] border-0">
          <CardHeader>
            <CardTitle className="text-white">Additional Settings</CardTitle>
            <CardDescription className="text-white/60">
              Configure notifications and other preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.sendReminders}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      sendReminders: e.target.checked,
                    }))
                  }
                  className="rounded border-white/30"
                />
                <div>
                  <div className="text-white font-medium">Send Reminders</div>
                  <div className="text-white/60 text-sm">
                    Automatically remind candidates about the assessment
                  </div>
                </div>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.publishResults}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      publishResults: e.target.checked,
                    }))
                  }
                  className="rounded border-white/30"
                />
                <div>
                  <div className="text-white font-medium">Publish Results</div>
                  <div className="text-white/60 text-sm">
                    Make results visible to candidates
                  </div>
                </div>
              </label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="instructions" className="text-white">
                General Instructions
              </Label>
              <Textarea
                id="instructions"
                value={formData.instructions}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    instructions: e.target.value,
                  }))
                }
                placeholder="Instructions for administrators..."
                rows={3}
                className="bg-[#1f1f35] border-white/10 text-white placeholder:text-white/40"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="candidateInstructions" className="text-white">
                Candidate Instructions
              </Label>
              <Textarea
                id="candidateInstructions"
                value={formData.candidateInstructions}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    candidateInstructions: e.target.value,
                  }))
                }
                placeholder="Instructions that candidates will see..."
                rows={3}
                className="bg-[#1f1f35] border-white/10 text-white placeholder:text-white/40"
              />
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            type="button"
            variant="ghost"
            onClick={onBack}
            className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <Button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Continue to Round Configuration
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
