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
    <div
      className={`rounded-lg bg-[#171726] border border-white/5 ${
        className || ""
      }`}>
      <div className="flex items-baseline justify-between px-4 py-2.5 border-b border-white/5">
        <h4 className="text-lg font-semibold text-neutral-100">
          {title}{" "}
          <span className="text-xs text-neutral-400 font-normal">
            ({count})
          </span>
        </h4>
      </div>
      <div className="p-3 space-y-2.5">{children}</div>
    </div>
  );
}
