"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, X, FileText} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner";

type CreateJobDialogProps = {
  children: React.ReactNode // trigger
  className?: string
}

export function CreateJobDialog({ children, className }: CreateJobDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [submitting, setSubmitting] = React.useState(false)
  const [uploadedFile, setUploadedFile] = React.useState<File | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [tab, setTab] = React.useState<"form" | "upload">("form")

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadedFile(file)
      setTab("form")
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) {
      setUploadedFile(file)
      setTab("form")
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const removeFile = () => {
    setUploadedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const data = new FormData(form)

    if (uploadedFile) {
      data.append("jobDocument", uploadedFile)
    }

    const payload = Object.fromEntries(data.entries())
    console.log("[v0] Create Job payload:", payload)
    if (uploadedFile) {
      console.log("[v0] Uploaded file:", uploadedFile.name, uploadedFile.size, "bytes")
    }
    try {
      // Simulate API call or job creation logic here
      // If successful:
      toast.success("Job posting created!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err));
    }

    setSubmitting(true)
    setTimeout(() => {
      setSubmitting(false)
      setOpen(false)
      setUploadedFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }, 800)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className={cn("sm:max-w-2xl bg-[#171726] border-0", className)}>
        <DialogHeader>
          <DialogTitle className="text-neutral-100">Create Job</DialogTitle>
          <DialogDescription className="text-neutral-200">Fill in the details to create a new job posting.</DialogDescription>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => setTab(v as "form" | "upload")} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-[#5A5A75] rounded-lg">
            <TabsTrigger value="form" className="text-neutral-100 data-[state=active]:bg-purple-600">Form</TabsTrigger>
            <TabsTrigger value="upload" className="text-neutral-100 data-[state=active]:bg-purple-600">Upload</TabsTrigger>
          </TabsList>

          {/* FORM TAB */}
          <TabsContent value="form" className="mt-4">
            <div className="max-h-[70dvh] overflow-y-auto pr-1">
              <form onSubmit={onSubmit} className="space-y-6 m-2">
                {uploadedFile && (
                  <div className="flex items-center gap-2 p-2 bg-[#5A5A75] rounded-md text-sm text-neutral-100">
                    <FileText className="h-4 w-4" />
                    <span>Document attached: {uploadedFile.name}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="title" className="text-neutral-300">Job Title</Label>
                    <Input id="title" name="title" placeholder="e.g., Frontend Engineer" required className="border-neutral-500 bg-[#171726] text-neutral-100" />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="department" className="text-neutral-300">Department</Label>
                    <Input id="department" name="department" placeholder="e.g., Engineering" required className="border-neutral-500 bg-[#171726] text-neutral-100" />
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
                    <Label htmlFor="location" className="text-neutral-300">Location</Label>
                    <Input id="location" name="location" placeholder="City, Country or Timezone" required className="border-neutral-500 bg-[#171726] text-neutral-100" />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="openings" className="text-neutral-300">Openings</Label>
                    <Input id="openings" name="openings" type="number" min={1} defaultValue={1} required className="border-neutral-500 bg-[#171726] text-neutral-100" />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="salaryMin" className="text-neutral-300">Salary Min</Label>
                      <Input id="salaryMin" name="salaryMin" type="number" inputMode="numeric" placeholder="e.g., 80000" className="border-neutral-500 bg-[#171726] text-neutral-100" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="salaryMax" className="text-neutral-300">Salary Max</Label>
                      <Input id="salaryMax" name="salaryMax" type="number" inputMode="numeric" placeholder="e.g., 120000" className="border-neutral-500 bg-[#171726] text-neutral-100" />
                    </div>
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <Label htmlFor="deadline" className="text-neutral-300">Application Deadline</Label>
                    <Input id="deadline" name="deadline" type="date" className="border-neutral-500 bg-[#171726] text-neutral-100" />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="description" className="text-neutral-300">Job Description</Label>
                    <Textarea id="description" name="description" placeholder="Short summary about the role and company" className="min-h-24 border-neutral-500 bg-[#171726] text-neutral-100" required />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="responsibilities" className="text-neutral-300">Responsibilities</Label>
                    <Textarea id="responsibilities" name="responsibilities" placeholder="Key responsibilities (one per line)" className="min-h-24 border-neutral-500 bg-[#171726] text-neutral-100" required />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="requirements" className="text-neutral-300">Requirements</Label>
                    <Textarea id="requirements" name="requirements" placeholder="Required skills & experience (one per line)" className="min-h-24 border-neutral-500 bg-[#171726] text-neutral-100" required />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="questions" className="text-neutral-300">Screening Questions</Label>
                    <Textarea id="questions" name="questions" placeholder="Optional: add screening questions (one per line)" className="min-h-20 border-neutral-500 bg-[#171726] text-neutral-100" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="flex items-center gap-2 text-neutral-300">
                    <Checkbox name="public" defaultChecked />
                    <span className="text-sm">Public posting</span>
                  </label>
                  <label className="flex items-center gap-2 text-neutral-300">
                    <Checkbox name="autoScreen" />
                    <span className="text-sm">Enable auto-screening</span>
                  </label>
                </div>

                <DialogFooter>
                  <Button type="button" onClick={() => setOpen(false)} className="bg-[#5A5A75] hover:bg-[#4A4A61] text-neutral-100">Cancel</Button>
                  <Button type="submit" disabled={submitting} className="bg-purple-500 text-white font-semibold hover:bg-purple-700">
                    {submitting ? "Creating..." : "Create Job"}
                  </Button>
                </DialogFooter>
              </form>
            </div>
          </TabsContent>

          {/* UPLOAD TAB */}
          <TabsContent value="upload" className="mt-4">
            <div className="max-h-[70dvh] overflow-y-auto pr-1">
              <div className="space-y-6">
                <div className="text-sm text-neutral-300">
                  Upload a job description document to automatically populate the form fields.
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
                          <div className="text-neutral-400">{(uploadedFile.size / 1024).toFixed(1)} KB</div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 justify-center">
                        <Button type="button" variant="default" size="sm" onClick={() => setTab("form")} className="bg-purple-500 text-white hover:bg-purple-700">Attach to Form</Button>
                        <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="border-neutral-500 text-neutral-200">Replace File</Button>
                        <Button type="button" variant="outline" size="sm" onClick={removeFile} className="border-neutral-500 text-neutral-200">
                          <X className="h-4 w-4 mr-1" /> Remove
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Upload className="h-12 w-12 mx-auto text-neutral-400" />
                      <div>
                        <div className="text-lg font-medium text-neutral-100">Drop your file here</div>
                        <div className="text-sm text-neutral-400">or click to browse</div>
                      </div>
                      <Button type="button" onClick={() => fileInputRef.current?.click()} className="bg-purple-500 text-white font-semibold hover:bg-purple-700">Browse Files</Button>
                    </div>
                  )}
                  <input ref={fileInputRef} type="file" className="hidden" accept=".pdf,.doc,.docx,.txt" onChange={handleFileUpload} />
                </div>

                {uploadedFile && (
                  <div className="space-y-4 text-sm text-neutral-400">
                    File ready to attach to your job posting. Switch to the Form tab to complete the details.
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

export default CreateJobDialog
