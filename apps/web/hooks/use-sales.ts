import { useQuery } from "@tanstack/react-query";
import type { DashboardSalesData, SalesPeriod } from "@repo/types";

export function useSales(period: SalesPeriod) {
  return useQuery<DashboardSalesData>({
    queryKey: ["sales", period],
    queryFn: async () => {
      const res = await fetch(`/api/dashboard/sales?period=${period}`);
      if (!res.ok) throw new Error("Failed to fetch sales");
      return res.json();
    },
  });
}
