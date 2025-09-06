import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CodePreview({
  title,
  badge = "LIVE",
  metrics,
}: {
  title: string;
  badge: string;
  metrics: string;
}) {
  return (
    <Card className="bg-[#282036] border border-white/5 rounded-lg shadow-sm">
      <CardHeader className="pb-2 px-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-neutral-200">
            {title}
          </CardTitle>
          <span className="text-[10px] font-semibold uppercase text-red-500 border border-red-500 rounded px-2 py-0.5">
            {badge}
          </span>
        </div>
      </CardHeader>
      <CardContent className="px-4 space-y-3">
        <div className="grid md:grid-cols-2 gap-3">
          <pre className="rounded-md border border-white/10 bg-zinc-950 text-zinc-100 p-3 text-xs leading-relaxed overflow-auto">
            {`function calculateScore(ans) {
  let score = 0;
  // Calculating
  // total score...
}`}
          </pre>
          <pre className="rounded-md border border-white/10 bg-zinc-950 text-zinc-100 p-3 text-xs leading-relaxed overflow-auto">
            {`[Video Feed Preview]
Candidate is focused
No proctoring flags`}
          </pre>
        </div>
        <div className="text-xs text-neutral-400">
          <span className="font-medium text-neutral-200">Metrics:</span>{" "}
          {metrics}
        </div>
      </CardContent>
    </Card>
  );
}
