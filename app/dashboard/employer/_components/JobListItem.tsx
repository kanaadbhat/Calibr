import { FileText, Star, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function JobListItem({
  title,
  subtitle,
  applications,
  inInterview,
  rating,
  loading = false,
}: {
  title: string;
  subtitle: string;
  applications: number;
  inInterview: number;
  rating: number;
  loading?: boolean;
}) {
  if (loading) {
    return (
      <div className="rounded-lg bg-[#282036] border border-white/5 px-4 py-3 shadow-sm">
        <Skeleton className="h-4 w-3/4 mb-1" />
        <Skeleton className="h-3 w-1/2 mb-3" />
        <div className="flex flex-wrap items-center gap-4">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-[#282036] border border-white/5 px-4 py-3 shadow-sm">
      <div className="text-sm font-semibold text-neutral-100">{title}</div>
      <div className="text-xs text-neutral-400">{subtitle}</div>
      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-neutral-400">
        <span className="inline-flex items-center gap-1">
          <FileText className="h-4 w-4 text-neutral-500" aria-hidden="true" />
          {applications} Applications
        </span>
        <span className="inline-flex items-center gap-1">
          <Users className="h-4 w-4 text-neutral-500" aria-hidden="true" />{" "}
          {inInterview} in Interview
        </span>
        <span className="inline-flex items-center gap-1">
          <Star className="h-4 w-4 text-yellow-500" aria-hidden="true" />
          {rating.toFixed(1)}/5 Rating
        </span>
      </div>
    </div>
  );
}
