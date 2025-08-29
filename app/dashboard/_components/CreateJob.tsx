"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

type CreateJobDialogProps = {
  children: React.ReactNode; // trigger
  className?: string;
};

export function CreateJobDialog({ children, className }: CreateJobDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    // Collect values (for now we just log them)
    const payload = Object.fromEntries(data.entries());
    console.log("[v0] Create Job payload:", payload);

    setSubmitting(true);
    // Simulate request
    setTimeout(() => {
      setSubmitting(false);
      setOpen(false);
      // form.reset() // uncomment if you want to reset after submit
    }, 800);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className={cn("sm:max-w-2xl", className)}>
        <DialogHeader>
          <DialogTitle>Create Job</DialogTitle>
          <DialogDescription>
            Fill in the details to create a new job posting.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[80dvh] overflow-y-auto pr-1">
          <form onSubmit={onSubmit} className="space-y-6 m-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="title">Job Title</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="e.g., Frontend Engineer"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  name="department"
                  placeholder="e.g., Engineering"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label>Employment Type</Label>
                <Select name="employmentType" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full-time">Full-time</SelectItem>
                    <SelectItem value="part-time">Part-time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="internship">Internship</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Seniority</Label>
                <Select name="seniority" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="junior">Junior</SelectItem>
                    <SelectItem value="mid">Mid</SelectItem>
                    <SelectItem value="senior">Senior</SelectItem>
                    <SelectItem value="lead">Lead</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Location Type</Label>
                <Select name="locationType" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Remote / Hybrid / Onsite" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="remote">Remote</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                    <SelectItem value="onsite">Onsite</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  name="location"
                  placeholder="City, Country or Timezone"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="openings">Openings</Label>
                <Input
                  id="openings"
                  name="openings"
                  type="number"
                  min={1}
                  defaultValue={1}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="salaryMin">Salary Min</Label>
                  <Input
                    id="salaryMin"
                    name="salaryMin"
                    type="number"
                    inputMode="numeric"
                    placeholder="e.g., 80000"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="salaryMax">Salary Max</Label>
                  <Input
                    id="salaryMax"
                    name="salaryMax"
                    type="number"
                    inputMode="numeric"
                    placeholder="e.g., 120000"
                  />
                </div>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="deadline">Application Deadline</Label>
                <Input id="deadline" name="deadline" type="date" />
              </div>
            </div>

            {/* Long text fields */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="description">Job Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Short summary about the role and company"
                  className="min-h-24"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="responsibilities">Responsibilities</Label>
                <Textarea
                  id="responsibilities"
                  name="responsibilities"
                  placeholder="Key responsibilities (one per line)"
                  className="min-h-24"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="requirements">Requirements</Label>
                <Textarea
                  id="requirements"
                  name="requirements"
                  placeholder="Required skills & experience (one per line)"
                  className="min-h-24"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="questions">Screening Questions</Label>
                <Textarea
                  id="questions"
                  name="questions"
                  placeholder="Optional: add screening questions (one per line)"
                  className="min-h-20"
                />
              </div>
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-center gap-2">
                <Checkbox name="public" defaultChecked />
                <span className="text-sm">Public posting</span>
              </label>
              <label className="flex items-center gap-2">
                <Checkbox name="autoScreen" />
                <span className="text-sm">Enable auto-screening</span>
              </label>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Creating..." : "Create Job"}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default CreateJobDialog;
