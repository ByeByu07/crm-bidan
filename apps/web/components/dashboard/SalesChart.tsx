"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "@repo/utils/format";
import type { SalesChartDataPoint } from "@repo/types";

interface SalesChartProps {
  data: SalesChartDataPoint[];
}

export function SalesChart({ data }: SalesChartProps) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <XAxis
            dataKey="label"
            tickFormatter={(value: string) => {
              const parts = value.split("-");
              if (parts.length === 3) {
                const day = Number(parts[2]);
                const monthNames = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
                const monthIdx = Number(parts[1]) - 1;
                return `${day} ${monthNames[monthIdx] ?? ""}`;
              }
              const year = parts[0] ?? "";
              const month = parts[1] ?? "";
              return `${month}/${year.slice(2)}`;
            }}
            tick={{ fontSize: 12, fill: "#7a6e63" }}
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
            tick={{ fontSize: 12, fill: "#7a6e63" }}
            axisLine={false}
            tickLine={false}
            width={50}
          />
          <Tooltip
            formatter={(value: any) => formatCurrency(Number(value))}
            labelFormatter={(label: any) => {
              const parts = String(label).split("-");
              if (parts.length === 3) {
                const day = Number(parts[2]);
                const monthNames = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
                const monthIdx = Number(parts[1]) - 1;
                return `${day} ${monthNames[monthIdx] ?? ""} ${parts[0]}`;
              }
              const year = parts[0] ?? "";
              const month = parts[1] ?? "";
              return `${month}/${year}`;
            }}
            contentStyle={{
              borderRadius: "10px",
              border: "1px solid #e8e0d8",
              background: "#ffffff",
              fontFamily: "var(--font-sans), sans-serif",
              fontSize: "13px",
              color: "#2a2118",
            }}
          />
          <Bar
            dataKey="revenue"
            fill="#2a2118"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
