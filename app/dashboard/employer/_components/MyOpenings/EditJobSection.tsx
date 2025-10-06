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
import { useUpdateJobDetails } from "../../hooks";
import { JobUpdateData } from "../../actions/job-management-actions";

interface EditJobSectionProps {
  jobId: string;
  initialData: {
    description: string;
    requirements: string;
    benefits?: string;
    deadline?: Date | string;
    salaryMin?: number;
    salaryMax?: number;
    isPublic: boolean;
    autoScreen: boolean;
    startDate?: Date | string;
  };
  onUpdate: () => void;
}

export function EditJobSection({ jobId, initialData, onUpdate }: EditJobSectionProps) {
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<JobUpdateData>({
    description: initialData.description,
    requirements: initialData.requirements,
    benefits: initialData.benefits || "",
    deadline: initialData.deadline ? new Date(initialData.deadline).toISOString().split('T')[0] : "",
    salaryMin: initialData.salaryMin,
    salaryMax: initialData.salaryMax,
    isPublic: initialData.isPublic,
    autoScreen: initialData.autoScreen,
    startDate: initialData.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : "",
  });

  const { updateJob, loading } = useUpdateJobDetails();

  const handleSave = async () => {
    setError(null);
    const result = await updateJob(jobId, formData);
    if (result.success) {
      setEditing(false);
      onUpdate();
    } else {
      setError(result.message || "Failed to update job");
    }
  };

  const handleCancel = () => {
    setFormData({
      description: initialData.description,
      requirements: initialData.requirements,
      benefits: initialData.benefits || "",
      deadline: initialData.deadline ? new Date(initialData.deadline).toISOString().split('T')[0] : "",
      salaryMin: initialData.salaryMin,
      salaryMax: initialData.salaryMax,
      isPublic: initialData.isPublic,
      autoScreen: initialData.autoScreen,
      startDate: initialData.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : "",
    });
    setEditing(false);
  };

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white">Editable Details</CardTitle>
            <CardDescription className="text-white/60">
              Update job description, requirements, salary, and settings
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
            <Label className="text-white/80">Description</Label>
            {editing ? (
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-2 bg-white/5 border-white/10 text-white min-h-[120px]"
                placeholder="Enter job description..."
              />
            ) : (
              <div className="mt-2 text-white/80 whitespace-pre-wrap">{initialData.description}</div>
            )}
          </div>

          <div>
            <Label className="text-white/80">Requirements</Label>
            {editing ? (
              <Textarea
                value={formData.requirements}
                onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                className="mt-2 bg-white/5 border-white/10 text-white min-h-[120px]"
                placeholder="Enter job requirements..."
              />
            ) : (
              <div className="mt-2 text-white/80 whitespace-pre-wrap">{initialData.requirements}</div>
            )}
          </div>

          <div>
            <Label className="text-white/80">Benefits (Optional)</Label>
            {editing ? (
              <Textarea
                value={formData.benefits}
                onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                className="mt-2 bg-white/5 border-white/10 text-white min-h-[80px]"
                placeholder="Enter benefits..."
              />
            ) : (
              <div className="mt-2 text-white/80 whitespace-pre-wrap">{initialData.benefits || "Not specified"}</div>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label className="text-white/80">Minimum Salary (Optional)</Label>
              {editing ? (
                <Input
                  type="number"
                  value={formData.salaryMin || ""}
                  onChange={(e) => setFormData({ ...formData, salaryMin: e.target.value ? Number(e.target.value) : undefined })}
                  className="mt-2 bg-white/5 border-white/10 text-white"
                  placeholder="e.g., 50000"
                />
              ) : (
                <div className="mt-2 text-white/80">
                  {initialData.salaryMin ? `$${initialData.salaryMin.toLocaleString()}` : "Not specified"}
                </div>
              )}
            </div>

            <div>
              <Label className="text-white/80">Maximum Salary (Optional)</Label>
              {editing ? (
                <Input
                  type="number"
                  value={formData.salaryMax || ""}
                  onChange={(e) => setFormData({ ...formData, salaryMax: e.target.value ? Number(e.target.value) : undefined })}
                  className="mt-2 bg-white/5 border-white/10 text-white"
                  placeholder="e.g., 80000"
                />
              ) : (
                <div className="mt-2 text-white/80">
                  {initialData.salaryMax ? `$${initialData.salaryMax.toLocaleString()}` : "Not specified"}
                </div>
              )}
            </div>

            <div>
              <Label className="text-white/80">Application Deadline (Optional)</Label>
              {editing ? (
                <Input
                  type="date"
                  value={formData.deadline || ""}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  className="mt-2 bg-white/5 border-white/10 text-white"
                />
              ) : (
                <div className="mt-2 text-white/80">
                  {initialData.deadline ? new Date(initialData.deadline).toLocaleDateString() : "Not specified"}
                </div>
              )}
            </div>

            <div>
              <Label className="text-white/80">Start Date (Optional)</Label>
              {editing ? (
                <Input
                  type="date"
                  value={formData.startDate || ""}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="mt-2 bg-white/5 border-white/10 text-white"
                />
              ) : (
                <div className="mt-2 text-white/80">
                  {initialData.startDate ? new Date(initialData.startDate).toLocaleDateString() : "Not specified"}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
              <div>
                <Label className="text-white/80">Public Visibility</Label>
                <p className="text-sm text-white/60">Make this job visible to all candidates</p>
              </div>
              {editing ? (
                <Switch
                  checked={formData.isPublic}
                  onCheckedChange={(checked) => setFormData({ ...formData, isPublic: checked })}
                />
              ) : (
                <div className="text-white/80">{initialData.isPublic ? "Yes" : "No"}</div>
              )}
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
              <div>
                <Label className="text-white/80">Auto-Screen Applications</Label>
                <p className="text-sm text-white/60">Automatically screen incoming applications</p>
              </div>
              {editing ? (
                <Switch
                  checked={formData.autoScreen}
                  onCheckedChange={(checked) => setFormData({ ...formData, autoScreen: checked })}
                />
              ) : (
                <div className="text-white/80">{initialData.autoScreen ? "Enabled" : "Disabled"}</div>
              )}
            </div>
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
