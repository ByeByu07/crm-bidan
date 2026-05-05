"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { MonthlySalesData } from "@repo/types";
import { formatCurrency } from "@repo/utils/format";

interface SalesChartProps {
  data: MonthlySalesData[];
}

export function SalesChart({ data }: SalesChartProps) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="month"
            tickFormatter={(value: string) => {
              const parts = value.split("-");
              const year = parts[0] ?? "";
              const month = parts[1] ?? "";
              return `${month}/${year.slice(2)}`;
            }}
            tick={{ fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(value: number) =>
              value >= 1_000_000
                ? `${(value / 1_000_000).toFixed(1)}jt`
                : value >= 1_000
                ? `${(value / 1_000).toFixed(0)}rb`
                : value.toString()
            }
            tick={{ fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            width={50}
          />
          <Tooltip
            formatter={(value: any) => formatCurrency(Number(value))}
            labelFormatter={(label: any) => {
              const parts = String(label).split("-");
              const year = parts[0] ?? "";
              const month = parts[1] ?? "";
              return `${month}/${year}`;
            }}
            contentStyle={{
              borderRadius: "0.5rem",
              border: "1px solid hsl(var(--border))",
              background: "hsl(var(--background))",
            }}
          />
          <Bar
            dataKey="revenue"
            fill="hsl(var(--primary))"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
