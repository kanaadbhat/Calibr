import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function StatCard({
  value,
  label,
  trend,
  trendDirection = "up", // "up" | "down"
  loading = false,
}: {
  value: string;
  label: string;
  trend?: string;
  trendDirection?: "up" | "down";
  loading?: boolean;
}) {
  const TrendIcon = trendDirection === "up" ? ArrowUpRight : ArrowDownRight;
  const trendColor =
    trendDirection === "up" ? "text-green-400" : "text-red-400";

  if (loading) {
    return (
      <Card className="bg-[#171726] border-0">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <Skeleton className="h-9 w-16" />
          <Skeleton className="h-4 w-12" />
        </CardHeader>
        <CardContent className="pt-0 space-y-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-1.5 w-full rounded-full" />
          <Skeleton className="h-3 w-32" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[#171726] border-0">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-3xl font-semibold text-neutral-100">
          {value}
        </CardTitle>
        {trend && (
          <span
            className={`inline-flex items-center text-sm font-medium ${trendColor}`}>
            <TrendIcon className="w-4 h-4 mr-1" />
            {trend}
          </span>
        )}
      </CardHeader>
      <CardContent className="pt-0 space-y-1">
        <CardDescription className="text-neutral-300">{label}</CardDescription>

        {/* optional progress bar if it’s a percentage */}
        {label.toLowerCase().includes("rate") && (
          <div className="h-1.5 bg-neutral-700 rounded-full overflow-hidden">
            <div className="h-full bg-purple-500" style={{ width: value }} />
          </div>
        )}

        <p className="text-xs text-neutral-400">Compared to last week</p>
      </CardContent>
    </Card>
  );
}
