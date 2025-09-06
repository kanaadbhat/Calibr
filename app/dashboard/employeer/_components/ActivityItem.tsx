import React from "react";

export default function ActivityItem({
  icon: Icon,
  title,
  meta,
  intent = "default",
}: {
  icon: React.ElementType;
  title: string;
  meta: string;
  intent?: "success" | "info" | "user" | "announce" | "default";
}) {
  const intentClasses =
    intent === "success"
      ? "bg-emerald-50 border-emerald-200 text-emerald-600"
      : intent === "info"
      ? "bg-blue-50 border-blue-200 text-blue-600"
      : intent === "user"
      ? "bg-slate-50 border-slate-200 text-slate-700"
      : intent === "announce"
      ? "bg-rose-50 border-rose-200 text-rose-600"
      : "bg-zinc-50 border-zinc-200 text-zinc-600";

  return (
    <li className="flex items-start gap-3 py-3">
      <div
        className={`mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full border ${intentClasses}`}
        aria-hidden="true">
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1">
        <div className="text-sm font-medium leading-5 text-neutral-200">
          {title}
        </div>
        <div className="text-xs text-neutral-300">{meta}</div>
      </div>
    </li>
  );
}
