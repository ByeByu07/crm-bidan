import { cn } from "@repo/ui/lib/utils";
import { Card, CardContent } from "@repo/ui/components/card";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  change?: number | null;
}

export function MetricCard({ title, value, change }: MetricCardProps) {
  const isPositive = change && change >= 0;
  const isNegative = change && change < 0;

  return (
    <Card>
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">{title}</p>
          {change !== null && change !== undefined && (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-medium",
                isPositive && "bg-emerald-500/10 text-emerald-600",
                isNegative && "bg-rose-500/10 text-rose-600"
              )}
            >
              {isPositive ? (
                <ArrowUpRight className="size-2.5" />
              ) : (
                <ArrowDownRight className="size-2.5" />
              )}
              {isPositive ? "+" : ""}
              {change}%
            </span>
          )}
        </div>
        <p className="mt-1 text-lg font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}
