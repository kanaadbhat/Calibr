import { FileText, Star, Users } from "lucide-react";

export default function JobListItem({
  title,
  subtitle,
  applications,
  inInterview,
  rating,
}: {
  title: string;
  subtitle: string;
  applications: number;
  inInterview: number;
  rating: number;
}) {
  return (
    <div className="rounded-md bg-[#282036] px-4 py-3">
      <div className="font-semibold text-neutral-100">{title}</div>
      <div className="text-xs text-neutral-300">{subtitle}</div>
      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1 text-neutral-300">
          <FileText className="h-4 w-4" aria-hidden="true" /> {applications}{" "}
          Applications
        </span>
        <span className="inline-flex items-center gap-1 text-neutral-300">
          <Users className="h-4 w-4" aria-hidden="true" /> {inInterview} in
          Interview
        </span>
        <span className="inline-flex items-center gap-1 text-neutral-300">
          <Star className="h-4 w-4 text-yellow-500" aria-hidden="true" />
          {rating.toFixed(1)}/5 Rating
        </span>
      </div>
    </div>
  );
}
