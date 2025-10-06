import React from "react";
import { Activity } from "../../types";
import { CheckCircle, Megaphone, UserPlus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const ICONS: Record<Activity["icon"], React.ElementType> = {
  "check-circle": CheckCircle,
  "user-plus": UserPlus,
  megaphone: Megaphone,
};

export default function ActivityItem({
  icon,
  title,
  meta,
  intent = "default",
  loading = false,
}: {
  icon: Activity["icon"];
  title: string;
  meta: string;
  intent?: "success" | "info" | "user" | "announce" | "default";
  loading?: boolean;
}) {
  const Icon = ICONS[icon];

  const intentClasses =
    intent === "success"
      ? "bg-emerald-100 border-emerald-300 text-emerald-700"
      : intent === "info"
      ? "bg-blue-100 border-blue-300 text-blue-700"
      : intent === "user"
      ? "bg-slate-100 border-slate-300 text-slate-700"
      : intent === "announce"
      ? "bg-rose-100 border-rose-300 text-rose-700"
      : "bg-zinc-100 border-zinc-300 text-zinc-700";

  if (loading) {
    return (
      <li className="flex items-start gap-3 py-2.5">
        <Skeleton className="mt-0.5 h-8 w-8 rounded-full" />
        <div className="flex-1">
          <Skeleton className="h-4 w-3/4 mb-1" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </li>
    );
  }

  return (
    <li className="flex items-start gap-3 py-2.5">
      <div
        className={`mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-full border text-sm font-medium ${intentClasses}`}
        aria-hidden="true">
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1">
        <div className="text-sm font-medium text-neutral-100 leading-tight">
          {title}
        </div>
        <div className="text-xs text-neutral-400 mt-0.5">{meta}</div>
      </div>
    </li>
  );
}
