import type { LucideIcon } from "lucide-react";
import { ArrowUpRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type StatCardProps = {
  label: string;
  value: string | number;
  detail: string;
  icon: LucideIcon;
  trend?: string;
};

export function StatCard({
  label,
  value,
  detail,
  icon: Icon,
  trend,
}: StatCardProps) {
  return (
    <Card className="border-border/80 shadow-none">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <span className="text-sm text-muted-foreground">{label}</span>
          <span className="grid size-9 place-items-center rounded-full bg-primary/10 text-primary">
            <Icon className="size-4" />
          </span>
        </div>
        <div className="mt-4 flex items-baseline gap-2">
          <p className="font-heading text-3xl font-bold tracking-tight">
            {value}
          </p>
          {trend ? (
            <span className="inline-flex items-center text-xs font-medium text-primary">
              <ArrowUpRight className="size-3" />
              {trend}
            </span>
          ) : null}
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
      </CardContent>
    </Card>
  );
}
