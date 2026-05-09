import { cn } from "@repo/ui/lib/utils";

interface MetricCardProps {
  title: string;
  value: string;
  change?: number | null;
}

function IUp() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}

function IDown() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
      <polyline points="17 18 23 18 23 12" />
    </svg>
  );
}

export function MetricCard({ title, value, change }: MetricCardProps) {
  const isPositive = change && change >= 0;
  const isNegative = change && change < 0;

  return (
    <div className="kc card">
      <div className="kh">
        <span className="kl">{title}</span>
        {change !== null && change !== undefined && (
          <span className={cn("kb", isPositive ? "up" : "down")}>
            {isPositive ? <IUp /> : <IDown />}
            {isPositive ? "+" : ""}
            {change}%
          </span>
        )}
      </div>
      <div className="kv">{value}</div>
    </div>
  );
}
