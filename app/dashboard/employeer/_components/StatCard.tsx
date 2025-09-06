import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function StatCard({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <Card className="bg-[#171726] border-0">
      <CardHeader className="pb-2">
        <CardTitle className="text-3xl font-semibold text-neutral-100">
          {value}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <CardDescription className="text-neutral-300">{label}</CardDescription>
      </CardContent>
    </Card>
  );
}
