"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Edit, Check, X, Loader2 } from "lucide-react";
import { useUpdateAssessmentDetails } from "../../hooks";
import { AssessmentUpdateData } from "../../actions/job-management-actions";

interface EditAssessmentSectionProps {
  assessmentId: string;
  initialData: {
    description?: string;
    applicationDeadline?: Date | string;
    assessmentStartDate?: Date | string;
    assessmentEndDate?: Date | string;
    sendReminders: boolean;
    publishResults: boolean;
    allowMultipleAttempts: boolean;
    maxAttempts?: number;
    instructions?: string;
    candidateInstructions?: string;
  };
  onUpdate: () => void;
}

export function EditAssessmentSection({ assessmentId, initialData, onUpdate }: EditAssessmentSectionProps) {
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<AssessmentUpdateData>({
    description: initialData.description || "",
    applicationDeadline: initialData.applicationDeadline ? new Date(initialData.applicationDeadline).toISOString().split('T')[0] : "",
    assessmentStartDate: initialData.assessmentStartDate ? new Date(initialData.assessmentStartDate).toISOString().split('T')[0] : "",
    assessmentEndDate: initialData.assessmentEndDate ? new Date(initialData.assessmentEndDate).toISOString().split('T')[0] : "",
    sendReminders: initialData.sendReminders,
    publishResults: initialData.publishResults,
    allowMultipleAttempts: initialData.allowMultipleAttempts,
    maxAttempts: initialData.maxAttempts,
    instructions: initialData.instructions || "",
    candidateInstructions: initialData.candidateInstructions || "",
  });

  const { updateAssessment, loading } = useUpdateAssessmentDetails();

  const handleSave = async () => {
    setError(null);
    const result = await updateAssessment(assessmentId, formData);
    if (result.success) {
      setEditing(false);
      onUpdate();
    } else {
      setError(result.message || "Failed to update assessment");
    }
  };

  const handleCancel = () => {
    setFormData({
      description: initialData.description || "",
      applicationDeadline: initialData.applicationDeadline ? new Date(initialData.applicationDeadline).toISOString().split('T')[0] : "",
      assessmentStartDate: initialData.assessmentStartDate ? new Date(initialData.assessmentStartDate).toISOString().split('T')[0] : "",
      assessmentEndDate: initialData.assessmentEndDate ? new Date(initialData.assessmentEndDate).toISOString().split('T')[0] : "",
      sendReminders: initialData.sendReminders,
      publishResults: initialData.publishResults,
      allowMultipleAttempts: initialData.allowMultipleAttempts,
      maxAttempts: initialData.maxAttempts,
      instructions: initialData.instructions || "",
      candidateInstructions: initialData.candidateInstructions || "",
    });
    setEditing(false);
  };

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white">Assessment Settings</CardTitle>
            <CardDescription className="text-white/60">
              Update assessment dates, instructions, and configuration
            </CardDescription>
          </div>
          {!editing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditing(true)}
              className="text-white/80 hover:text-white border-white/20 hover:bg-white/10 bg-transparent"
            >
              <Edit className="w-4 h-4 mr-2 text-white/80" />
              Edit
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div>
            <Label className="text-white/80">Assessment Description (Optional)</Label>
            {editing ? (
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-2 bg-white/5 border-white/10 text-white min-h-[80px]"
                placeholder="Brief description of the assessment process..."
              />
            ) : (
              <div className="mt-2 text-white/80 whitespace-pre-wrap">{initialData.description || "Not specified"}</div>
            )}
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label className="text-white/80">Application Deadline (Optional)</Label>
              {editing ? (
                <Input
                  type="date"
                  value={formData.applicationDeadline || ""}
                  onChange={(e) => setFormData({ ...formData, applicationDeadline: e.target.value })}
                  className="mt-2 bg-white/5 border-white/10 text-white"
                />
              ) : (
                <div className="mt-2 text-white/80">
                  {initialData.applicationDeadline ? new Date(initialData.applicationDeadline).toLocaleDateString() : "Not specified"}
                </div>
              )}
            </div>

            <div>
              <Label className="text-white/80">Assessment Start Date (Optional)</Label>
              {editing ? (
                <Input
                  type="date"
                  value={formData.assessmentStartDate || ""}
                  onChange={(e) => setFormData({ ...formData, assessmentStartDate: e.target.value })}
                  className="mt-2 bg-white/5 border-white/10 text-white"
                />
              ) : (
                <div className="mt-2 text-white/80">
                  {initialData.assessmentStartDate ? new Date(initialData.assessmentStartDate).toLocaleDateString() : "Not specified"}
                </div>
              )}
            </div>

            <div>
              <Label className="text-white/80">Assessment End Date (Optional)</Label>
              {editing ? (
                <Input
                  type="date"
                  value={formData.assessmentEndDate || ""}
                  onChange={(e) => setFormData({ ...formData, assessmentEndDate: e.target.value })}
                  className="mt-2 bg-white/5 border-white/10 text-white"
                />
              ) : (
                <div className="mt-2 text-white/80">
                  {initialData.assessmentEndDate ? new Date(initialData.assessmentEndDate).toLocaleDateString() : "Not specified"}
                </div>
              )}
            </div>
          </div>

          <div>
            <Label className="text-white/80">Instructions (Optional)</Label>
            {editing ? (
              <Textarea
                value={formData.instructions}
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                className="mt-2 bg-white/5 border-white/10 text-white min-h-[80px]"
                placeholder="General instructions for the assessment..."
              />
            ) : (
              <div className="mt-2 text-white/80 whitespace-pre-wrap">{initialData.instructions || "Not specified"}</div>
            )}
          </div>

          <div>
            <Label className="text-white/80">Candidate Instructions (Optional)</Label>
            {editing ? (
              <Textarea
                value={formData.candidateInstructions}
                onChange={(e) => setFormData({ ...formData, candidateInstructions: e.target.value })}
                className="mt-2 bg-white/5 border-white/10 text-white min-h-[80px]"
                placeholder="Instructions specifically for candidates..."
              />
            ) : (
              <div className="mt-2 text-white/80 whitespace-pre-wrap">{initialData.candidateInstructions || "Not specified"}</div>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
              <div>
                <Label className="text-white/80">Send Reminders</Label>
                <p className="text-sm text-white/60">Automatically send reminders to candidates</p>
              </div>
              {editing ? (
                <Switch
                  checked={formData.sendReminders}
                  onCheckedChange={(checked) => setFormData({ ...formData, sendReminders: checked })}
                />
              ) : (
                <div className="text-white/80">{initialData.sendReminders ? "Enabled" : "Disabled"}</div>
              )}
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
              <div>
                <Label className="text-white/80">Publish Results</Label>
                <p className="text-sm text-white/60">Make assessment results visible to candidates</p>
              </div>
              {editing ? (
                <Switch
                  checked={formData.publishResults}
                  onCheckedChange={(checked) => setFormData({ ...formData, publishResults: checked })}
                />
              ) : (
                <div className="text-white/80">{initialData.publishResults ? "Yes" : "No"}</div>
              )}
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
              <div>
                <Label className="text-white/80">Allow Multiple Attempts</Label>
                <p className="text-sm text-white/60">Let candidates retake the assessment</p>
              </div>
              {editing ? (
                <Switch
                  checked={formData.allowMultipleAttempts}
                  onCheckedChange={(checked) => setFormData({ ...formData, allowMultipleAttempts: checked })}
                />
              ) : (
                <div className="text-white/80">{initialData.allowMultipleAttempts ? "Enabled" : "Disabled"}</div>
              )}
            </div>

            {formData.allowMultipleAttempts && (
              <div className="ml-6">
                <Label className="text-white/80">Maximum Attempts (Optional)</Label>
                {editing ? (
                  <Input
                    type="number"
                    min="1"
                    value={formData.maxAttempts || ""}
                    onChange={(e) => setFormData({ ...formData, maxAttempts: e.target.value ? Number(e.target.value) : undefined })}
                    className="mt-2 bg-white/5 border-white/10 text-white"
                    placeholder="e.g., 3"
                  />
                ) : (
                  <div className="mt-2 text-white/80">{initialData.maxAttempts || "Unlimited"}</div>
                )}
              </div>
            )}
          </div>
        </div>

        {editing && (
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSave}
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-600"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={loading}
              className="text-white/80 hover:text-white border-white/20 hover:bg-white/10 bg-transparent"
            >
              <X className="w-4 h-4 mr-2 text-white/80" />
              Cancel
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
