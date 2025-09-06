import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CodePreview({
  title,
  badge = "LIVE",
  metrics,
}: {
  title: string;
  badge?: string;
  metrics: string;
}) {
  return (
    <Card className="bg-[#282036] border-0">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-neutral-300">{title}</CardTitle>
          <span className="text-xs font-medium text-red-500 border border-red-500 rounded px-1.5 py-0.5">
            {badge}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid md:grid-cols-2 gap-3">
          <pre className="rounded-md border bg-zinc-950 text-zinc-100 p-3 text-xs overflow-auto">
            {`function calculateScore(ans) {
  let score = 0;
  // Calculating
  // total score...
}`}
          </pre>
          <pre className="rounded-md border bg-zinc-950 text-zinc-100 p-3 text-xs overflow-auto">
            {`[Video Feed Preview]
Candidate is focused
No proctoring flags`}
          </pre>
        </div>
        <div className="text-xs text-neutral-300">
          <span className="font-semibold">Metrics: </span>
          {metrics}
        </div>
      </CardContent>
    </Card>
  );
}
