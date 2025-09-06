import React from "react";

export default function Column({
  title,
  count,
  children,
  className,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-md bg-[#171726] ${className || ""}`}>
      <div className="flex items-baseline justify-between px-4 py-3">
        <h4 className="font-semibold text-neutral-200">
          {title} <span className="text-neutral-200">({count})</span>
        </h4>
      </div>
      <div className="px-3 pb-3 space-y-3">{children}</div>
    </div>
  );
}
