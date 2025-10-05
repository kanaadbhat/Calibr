"use client";

import * as React from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, X, FileText, Home } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { toast } from "sonner";
import { useCreateJob } from "../../hooks";
import type { JobCreationData } from "../../actions";

export default function CreateJobPage() {
  const [uploadedFile, setUploadedFile] = React.useState<File | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [tab, setTab] = React.useState<"form" | "upload">("form");

  const { createJob, isLoading } = useCreateJob();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setTab("form");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setUploadedFile(file);
      setTab("form");
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const removeFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    if (uploadedFile) {
      data.append("jobDocument", uploadedFile);
    }

    // Process form data with proper types
    const techStackString = data.get("techStack") as string;
    const techStack = techStackString
      ? techStackString
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean)
      : [];

    const payload: JobCreationData = {
      title: data.get("title") as string,
      department: data.get("department") as string,
      position: data.get("position") as string,
      employmentType: data.get("employmentType") as string,
      seniority: data.get("seniority") as string,
      locationType: data.get("locationType") as string,
      location: data.get("location") as string,
      openings: parseInt(data.get("openings") as string) || 1,
      experience: (data.get("experience") as string) || undefined,
      workMode: (data.get("workMode") as string) || undefined,
      salaryMin: data.get("salaryMin")
        ? parseInt(data.get("salaryMin") as string)
        : undefined,
      salaryMax: data.get("salaryMax")
        ? parseInt(data.get("salaryMax") as string)
        : undefined,
      deadline: (data.get("deadline") as string) || undefined,
      techStack,
      description: (data.get("description") as string) || undefined,
      requirements: (data.get("requirements") as string) || undefined,
      benefits: (data.get("benefits") as string) || undefined,
      startDate: (data.get("startDate") as string) || undefined,
      autoScreen: data.get("autoScreen") === "on",
      isPublic: data.get("isPublic") === "on",
    };

    console.log("[v0] Create Job payload:", payload);
    if (uploadedFile) {
      console.log(
        "[v0] Uploaded file:",
        uploadedFile.name,
        uploadedFile.size,
        "bytes"
      );
    }

    try {
      const result = await createJob(payload);

      if (result.success) {
        toast.success(result.message || "Job posting created successfully!");
        setUploadedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        form.reset();
        // Return to dashboard after successful creation
        if ((window as any).handleViewChange) {
          (window as any).handleViewChange("dashboard");
        }
      } else {
        toast.error(result.message || "Failed to create job posting");
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8 mt-16">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-gradient-to-br from-[#0A0A18]/90 to-[#0D0D20]/90 backdrop-blur-xl border-b border-white/10 pb-4 pt-8 sm:pt-6 px-4 sm:px-6 lg:px-8 xl:px-12">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 sm:mb-3">
            Create Job Posting
          </h1>
          <Breadcrumb className="mt-4">
            <BreadcrumbList className="text-white/60">
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link
                    href="/"
                    className="flex items-center hover:text-white transition-colors">
                    <Home className="w-4 h-4" />
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-white/40" />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link
                    href="/dashboard/employer"
                    className="hover:text-white transition-colors">
                    Dashboard
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-white/40" />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-white font-semibold">
                  Create Job
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-8 xl:px-12">
        <Card className="bg-[#171726] border-0">
          <CardHeader>
            <CardTitle className="text-neutral-100">Job Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs
              value={tab}
              onValueChange={(v) => setTab(v as "form" | "upload")}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 bg-[#5A5A75] rounded-lg mb-6">
                <TabsTrigger
                  value="form"
                  className="text-neutral-100 data-[state=active]:bg-purple-600"
                >
                  Form
                </TabsTrigger>
                <TabsTrigger
                  value="upload"
                  className="text-neutral-100 data-[state=active]:bg-purple-600"
                >
                  Upload
                </TabsTrigger>
              </TabsList>

              {/* FORM TAB */}
              <TabsContent value="form" className="mt-4">
                <form onSubmit={onSubmit} className="space-y-6">{uploadedFile && (
                    <div className="flex items-center gap-2 p-2 bg-[#5A5A75] rounded-md text-sm text-neutral-100">
                      <FileText className="h-4 w-4" />
                      <span>Document attached: {uploadedFile.name}</span>
                    </div>
                  )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="title" className="text-neutral-300">
                      Job Title
                    </Label>
                    <Input
                      id="title"
                      name="title"
                      placeholder="e.g., Frontend Engineer"
                      required
                      className="border-neutral-500 bg-[#171726] text-neutral-100"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="department" className="text-neutral-300">
                      Department
                    </Label>
                    <Input
                      id="department"
                      name="department"
                      placeholder="e.g., Engineering"
                      required
                      className="border-neutral-500 bg-[#171726] text-neutral-100"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="position" className="text-neutral-300">
                      Position/Role
                    </Label>
                    <Input
                      id="position"
                      name="position"
                      placeholder="e.g., Software Engineer"
                      required
                      className="border-neutral-500 bg-[#171726] text-neutral-100"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-neutral-300">Employment Type</Label>
                    <Select name="employmentType" required>
                      <SelectTrigger className="border-neutral-500 bg-[#171726] text-neutral-100">
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
                    <Label className="text-neutral-300">Seniority</Label>
                    <Select name="seniority" required>
                      <SelectTrigger className="border-neutral-500 bg-[#171726] text-neutral-100">
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
                    <Label className="text-neutral-300">Location Type</Label>
                    <Select name="locationType" required>
                      <SelectTrigger className="border-neutral-500 bg-[#171726] text-neutral-100">
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
                    <Label htmlFor="location" className="text-neutral-300">
                      Location
                    </Label>
                    <Input
                      id="location"
                      name="location"
                      placeholder="City, Country or Timezone"
                      required
                      className="border-neutral-500 bg-[#171726] text-neutral-100"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="openings" className="text-neutral-300">
                      Openings
                    </Label>
                    <Input
                      id="openings"
                      name="openings"
                      type="number"
                      min={1}
                      defaultValue={1}
                      required
                      className="border-neutral-500 bg-[#171726] text-neutral-100"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="experience" className="text-neutral-300">
                      Experience Required
                    </Label>
                    <Input
                      id="experience"
                      name="experience"
                      placeholder="e.g., 2-4 years"
                      className="border-neutral-500 bg-[#171726] text-neutral-100"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="workMode" className="text-neutral-300">
                      Work Mode
                    </Label>
                    <Input
                      id="workMode"
                      name="workMode"
                      placeholder="e.g., Flexible hours, 9-5"
                      className="border-neutral-500 bg-[#171726] text-neutral-100"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="salaryMin" className="text-neutral-300">
                        Salary Min
                      </Label>
                      <Input
                        id="salaryMin"
                        name="salaryMin"
                        type="number"
                        inputMode="numeric"
                        placeholder="e.g., 80000"
                        className="border-neutral-500 bg-[#171726] text-neutral-100"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="salaryMax" className="text-neutral-300">
                        Salary Max
                      </Label>
                      <Input
                        id="salaryMax"
                        name="salaryMax"
                        type="number"
                        inputMode="numeric"
                        placeholder="e.g., 120000"
                        className="border-neutral-500 bg-[#171726] text-neutral-100"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <Label htmlFor="deadline" className="text-neutral-300">
                      Application Deadline
                    </Label>
                    <Input
                      id="deadline"
                      name="deadline"
                      type="date"
                      className="border-neutral-500 bg-[#171726] text-neutral-100"
                    />
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <Label htmlFor="techStack" className="text-neutral-300">
                      Tech Stack / Skills
                    </Label>
                    <Input
                      id="techStack"
                      name="techStack"
                      placeholder="e.g., React, Node.js, Python (comma separated)"
                      className="border-neutral-500 bg-[#171726] text-neutral-100"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="description" className="text-neutral-300">
                      Job Description
                    </Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Describe the role, responsibilities, and what makes this position exciting..."
                      className="min-h-[120px] border-neutral-500 bg-[#171726] text-neutral-100 resize-none"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="requirements" className="text-neutral-300">
                      Requirements
                    </Label>
                    <Textarea
                      id="requirements"
                      name="requirements"
                      placeholder="List the essential skills, qualifications, and experience needed..."
                      className="min-h-[100px] border-neutral-500 bg-[#171726] text-neutral-100 resize-none"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="benefits" className="text-neutral-300">
                      Benefits & Perks
                    </Label>
                    <Textarea
                      id="benefits"
                      name="benefits"
                      placeholder="Health insurance, flexible PTO, remote work, learning budget, etc."
                      className="min-h-[80px] border-neutral-500 bg-[#171726] text-neutral-100 resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="startDate" className="text-neutral-300">
                        Start Date
                      </Label>
                      <Input
                        id="startDate"
                        name="startDate"
                        type="date"
                        className="border-neutral-500 bg-[#171726] text-neutral-100"
                      />
                    </div>

                    <div className="flex items-center space-x-2 pt-6">
                      <Checkbox
                        id="autoScreen"
                        name="autoScreen"
                        className="border-neutral-500 data-[state=checked]:bg-blue-600"
                      />
                      <Label
                        htmlFor="autoScreen"
                        className="text-sm text-neutral-300"
                      >
                        Enable automatic candidate screening
                      </Label>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isPublic"
                      name="isPublic"
                      defaultChecked
                      className="border-neutral-500 data-[state=checked]:bg-blue-600"
                    />
                    <Label
                      htmlFor="isPublic"
                      className="text-sm text-neutral-300"
                    >
                      Make this job posting public
                    </Label>
                  </div>
                </div>

                {/* Removed duplicate public and autoScreen checkboxes */}

                <div className="flex gap-4 pt-6">
                  <Button
                    type="button"
                    onClick={() => {
                      if ((window as any).handleViewChange) {
                        (window as any).handleViewChange("dashboard");
                      }
                    }}
                    className="bg-[#5A5A75] hover:bg-[#4A4A61] text-neutral-100"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="bg-purple-500 text-white font-semibold hover:bg-purple-700"
                  >
                    {isLoading ? "Creating..." : "Create Job"}
                  </Button>
                </div>
              </form>
            </TabsContent>

            {/* UPLOAD TAB */}
            <TabsContent value="upload" className="mt-4">
              <div className="space-y-6">
                <div className="text-sm text-neutral-300">
                  Upload a job description document to automatically populate
                  the form fields.
                </div>

                <div
                  className="border-2 border-dashed border-neutral-600 rounded-lg p-8 text-center hover:border-neutral-400 transition-colors"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                >
                  {uploadedFile ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-center gap-2 text-sm text-neutral-200">
                        <FileText className="h-8 w-8 text-neutral-400" />
                        <div>
                          <div className="font-medium">{uploadedFile.name}</div>
                          <div className="text-neutral-400">
                            {(uploadedFile.size / 1024).toFixed(1)} KB
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 justify-center">
                        <Button
                          type="button"
                          variant="default"
                          size="sm"
                          onClick={() => setTab("form")}
                          className="bg-purple-500 text-white hover:bg-purple-700"
                        >
                          Attach to Form
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                          className="border-neutral-500 text-neutral-200"
                        >
                          Replace File
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={removeFile}
                          className="border-neutral-500 text-neutral-200"
                        >
                          <X className="h-4 w-4 mr-1" /> Remove
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Upload className="h-12 w-12 mx-auto text-neutral-400" />
                      <div>
                        <div className="text-lg font-medium text-neutral-100">
                          Drop your file here
                        </div>
                        <div className="text-sm text-neutral-400">
                          or click to browse
                        </div>
                      </div>
                      <Button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-purple-500 text-white font-semibold hover:bg-purple-700"
                      >
                        Browse Files
                      </Button>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={handleFileUpload}
                  />
                </div>

                {uploadedFile && (
                  <div className="space-y-4 text-sm text-neutral-400">
                    File ready to attach to your job posting. Switch to the Form
                    tab to complete the details.
                  </div>
                )}
              </div>
            </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
