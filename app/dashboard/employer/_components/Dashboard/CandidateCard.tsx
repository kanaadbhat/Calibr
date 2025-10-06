import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function CandidateCard({
  name,
  role,
  metaLeft,
  metaRight,
  score,
  loading = false,
}: {
  name: string;
  role: string;
  metaLeft: string;
  metaRight: string;
  score: string;
  loading?: boolean;
}) {
  if (loading) {
    return (
      <div className="rounded-md bg-[#282036] border border-zinc-700 shadow-sm">
        <div className="px-4 py-3 space-y-1 flex gap-3">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-20 rounded-full" />
        </div>
        <div className="px-4 pb-3 space-y-1.5">
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-3 w-8" />
          </div>
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md bg-[#282036] border border-zinc-700 shadow-sm">
      <div className="px-4 py-3 space-y-1 flex gap-3">
        <div className="font-semibold leading-5 text-neutral-200">{name}</div>
        <Badge
          variant="outline"
          className="text-[11px] px-2 py-0.5 rounded-full border border-zinc-600 text-neutral-300 bg-[#171726]">
          {role}
        </Badge>
      </div>
      <div className="px-4 pb-3 text-xs text-neutral-400 space-y-1.5">
        <div className="flex items-center justify-between">
          <span>Score:</span>
          <span className="font-medium text-neutral-200">{score}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>{metaLeft}</span>
          <span>{metaRight}</span>
        </div>
      </div>
    </div>
  );
}
