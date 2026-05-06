import { useQuery } from "@tanstack/react-query";
import type { DashboardSalesData, SalesPeriod } from "@repo/types";

export interface SalesDateRange {
  from: string; // "YYYY-MM-DD"
  to: string;   // "YYYY-MM-DD"
}

export type SalesQuery = SalesPeriod | SalesDateRange;

export function useSales(query: SalesQuery) {
  const queryKey =
    typeof query === "string"
      ? (["sales", query] as const)
      : (["sales", query.from, query.to] as const);

  const queryString =
    typeof query === "string"
      ? `period=${query}`
      : `from=${query.from}&to=${query.to}`;

  return useQuery<DashboardSalesData>({
    queryKey,
    queryFn: async () => {
      const res = await fetch(`/api/dashboard/sales?${queryString}`);
      if (!res.ok) throw new Error("Failed to fetch sales");
      return res.json();
    },
  });
}
