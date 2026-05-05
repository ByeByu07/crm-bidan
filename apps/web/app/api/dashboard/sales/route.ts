import { NextRequest, NextResponse } from "next/server";
import { db } from "@repo/db";
import { transaction, saleItem } from "@repo/db/schema";
import { getActiveOrganizationId } from "@repo/auth/session";
import { eq, and, gte, sql } from "drizzle-orm";
import { calculateChangePercent } from "@repo/utils";
import type { DashboardSalesData, MonthlySalesData, TopProduct, SalesPeriod } from "@repo/types";

function getPeriodDates(period: SalesPeriod) {
  const now = new Date();
  const months = period === "1m" ? 1 : period === "3m" ? 3 : 6;
  const currentStart = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);
  const previousStart = new Date(now.getFullYear(), now.getMonth() - months * 2 + 1, 1);
  return { currentStart, previousStart };
}

export async function GET(request: NextRequest) {
  const orgId = await getActiveOrganizationId();
  if (!orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const period = (searchParams.get("period") ?? "1m") as SalesPeriod;
  const { currentStart, previousStart } = getPeriodDates(period);

  const txs = await db
    .select()
    .from(transaction)
    .where(and(eq(transaction.organizationId, orgId), gte(transaction.purchaseDate, previousStart)));

  const items = await db
    .select()
    .from(saleItem)
    .innerJoin(transaction, eq(saleItem.transactionId, transaction.id))
    .where(and(eq(transaction.organizationId, orgId), gte(transaction.purchaseDate, previousStart)));

  const currentTxs = txs.filter((t) => new Date(t.purchaseDate) >= currentStart);
  const previousTxs = txs.filter((t) => new Date(t.purchaseDate) >= previousStart && new Date(t.purchaseDate) < currentStart);

  const currentRevenue = currentTxs.reduce((sum, t) => sum + Number(t.totalPrice), 0);
  const previousRevenue = previousTxs.reduce((sum, t) => sum + Number(t.totalPrice), 0);
  const transactionCount = currentTxs.length;
  const previousTransactionCount = previousTxs.length;

  const activePatientIds = new Set(currentTxs.map((t) => t.patientId));
  const previousActivePatientIds = new Set(previousTxs.map((t) => t.patientId));

  // Monthly chart data
  const months: MonthlySalesData[] = [];
  const count = period === "1m" ? 1 : period === "3m" ? 3 : 6;
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const monthTxs = currentTxs.filter((t) => {
      const pd = new Date(t.purchaseDate);
      return pd.getFullYear() === d.getFullYear() && pd.getMonth() === d.getMonth();
    });
    const revenue = monthTxs.reduce((sum, t) => sum + Number(t.totalPrice), 0);
    months.push({
      month: monthStr,
      revenue,
      transactionCount: monthTxs.length,
    });
  }

  // Calculate change percent for each month
  for (let i = 1; i < months.length; i++) {
    const current = months[i]!;
    const previous = months[i - 1]!;
    current.changePercent = calculateChangePercent(current.revenue, previous.revenue);
  }

  // Top products
  const productMap = new Map<string, { name: string; revenue: number; units: number }>();
  for (const row of items) {
    if (!row.transaction || !row.sale_item) continue;
    if (new Date(row.transaction.purchaseDate) < currentStart) continue;
    const key = row.sale_item.drugId;
    const existing = productMap.get(key) ?? { name: key, revenue: 0, units: 0 };
    existing.revenue += Number(row.sale_item.subtotal);
    existing.units += row.sale_item.quantityDispense;
    productMap.set(key, existing);
  }

  const topProducts: TopProduct[] = Array.from(productMap.entries())
    .map(([drugId, val]) => ({ drugId, drugName: val.name, revenue: val.revenue, unitsSold: val.units }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const result: DashboardSalesData = {
    currentRevenue,
    previousRevenue,
    revenueChangePercent: calculateChangePercent(currentRevenue, previousRevenue),
    transactionCount,
    previousTransactionCount,
    transactionChangePercent: calculateChangePercent(transactionCount, previousTransactionCount),
    activePatients: activePatientIds.size,
    previousActivePatients: previousActivePatientIds.size,
    activePatientsChangePercent: calculateChangePercent(activePatientIds.size, previousActivePatientIds.size),
    chartData: months,
    topProducts,
    period,
  };

  return NextResponse.json(result);
}
