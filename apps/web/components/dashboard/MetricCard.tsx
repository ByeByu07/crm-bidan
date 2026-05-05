import { cn } from "@repo/ui/lib/utils";
import { Card, CardContent } from "@repo/ui/components/card";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  change?: number | null;
  icon?: React.ReactNode;
}

export function MetricCard({ title, value, change, icon }: MetricCardProps) {
  const isPositive = change && change >= 0;
  const isNegative = change && change < 0;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">{title}</p>
            <p className="text-xl font-bold">{value}</p>
          </div>
          {icon && <div className="text-muted-foreground">{icon}</div>}
        </div>
        {change !== null && change !== undefined && (
          <div className="mt-2 flex items-center gap-1 text-xs">
            {isPositive ? (
              <ArrowUpRight className="size-3 text-emerald-500" />
            ) : (
              <ArrowDownRight className="size-3 text-rose-500" />
            )}
            <span
              className={cn(
                isPositive && "text-emerald-500",
                isNegative && "text-rose-500"
              )}
            >
              {isPositive ? "+" : ""}
              {change}%
            </span>
            <span className="text-muted-foreground">vs periode lalu</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
