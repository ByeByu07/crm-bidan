import { NextRequest, NextResponse } from "next/server";
import { db } from "@repo/db";
import { transaction, saleItem, drug } from "@repo/db/schema";
import { getActiveOrganizationId } from "@repo/auth/session";
import { eq, and, gte, sql } from "drizzle-orm";
import { calculateChangePercent } from "@repo/utils";
import type { DashboardSalesData, SalesChartDataPoint, TopProduct, SalesPeriod } from "@repo/types";

function getPeriodDates(period: SalesPeriod) {
  const now = new Date();
  const months = period === "1m" ? 1 : period === "3m" ? 3 : 6;
  const currentStart = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);
  const previousStart = new Date(now.getFullYear(), now.getMonth() - months * 2 + 1, 1);
  return { currentStart, previousStart };
}

function parseISODate(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year!, month! - 1, day!);
}

function formatDateKey(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatMonthKey(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function daysBetween(a: Date, b: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((b.getTime() - a.getTime())) / msPerDay;
}

export async function GET(request: NextRequest) {
  const orgId = await getActiveOrganizationId();
  if (!orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const periodParam = searchParams.get("period") as SalesPeriod | null;
  const fromParam = searchParams.get("from");
  const toParam = searchParams.get("to");

  let currentStart: Date;
  let previousStart: Date;
  let isCustomRange = false;
  let useDailyAggregation = false;

  if (fromParam && toParam) {
    isCustomRange = true;
    currentStart = parseISODate(fromParam);
    const toDate = parseISODate(toParam);
    const rangeDays = daysBetween(currentStart, toDate);
    useDailyAggregation = rangeDays <= 31;

    // Previous period is the same length before currentStart
    const rangeMs = toDate.getTime() - currentStart.getTime();
    previousStart = new Date(currentStart.getTime() - rangeMs);
  } else {
    const period = periodParam ?? "1m";
    const dates = getPeriodDates(period);
    currentStart = dates.currentStart;
    previousStart = dates.previousStart;
    useDailyAggregation = period === "1m"; // 1m shows daily data
  }

  const txs = await db
    .select()
    .from(transaction)
    .where(and(eq(transaction.organizationId, orgId), gte(transaction.purchaseDate, previousStart)));

  const items = await db
    .select()
    .from(saleItem)
    .innerJoin(transaction, eq(saleItem.transactionId, transaction.id))
    .innerJoin(drug, eq(saleItem.drugId, drug.id))
    .where(and(eq(transaction.organizationId, orgId), gte(transaction.purchaseDate, previousStart)));

  const currentTxs = txs.filter((t) => new Date(t.purchaseDate) >= currentStart);
  const previousTxs = txs.filter((t) => new Date(t.purchaseDate) >= previousStart && new Date(t.purchaseDate) < currentStart);

  const currentRevenue = currentTxs.reduce((sum, t) => sum + Number(t.totalPrice), 0);
  const previousRevenue = previousTxs.reduce((sum, t) => sum + Number(t.totalPrice), 0);
  const transactionCount = currentTxs.length;
  const previousTransactionCount = previousTxs.length;

  const activePatientIds = new Set(currentTxs.map((t) => t.patientId));
  const previousActivePatientIds = new Set(previousTxs.map((t) => t.patientId));

  // Chart data generation
  const chartData: SalesChartDataPoint[] = [];

  if (useDailyAggregation) {
    // Build a map of every day in the range
    const toDate = isCustomRange ? parseISODate(toParam!) : new Date();
    const dayMap = new Map<string, { revenue: number; transactionCount: number }>();

    for (let d = new Date(currentStart); d <= toDate; d.setDate(d.getDate() + 1)) {
      dayMap.set(formatDateKey(new Date(d)), { revenue: 0, transactionCount: 0 });
    }

    for (const t of currentTxs) {
      const key = formatDateKey(new Date(t.purchaseDate));
      const entry = dayMap.get(key);
      if (entry) {
        entry.revenue += Number(t.totalPrice);
        entry.transactionCount += 1;
      }
    }

    for (const [label, vals] of dayMap) {
      chartData.push({ label, revenue: vals.revenue, transactionCount: vals.transactionCount });
    }
  } else {
    // Monthly aggregation
    let count: number;
    if (isCustomRange) {
      const toDate = parseISODate(toParam!);
      count = (toDate.getFullYear() - currentStart.getFullYear()) * 12 + (toDate.getMonth() - currentStart.getMonth()) + 1;
    } else {
      count = periodParam === "3m" ? 3 : 6;
    }

    for (let i = 0; i < count; i++) {
      const d = new Date(currentStart.getFullYear(), currentStart.getMonth() + i, 1);
      const label = formatMonthKey(d);
      const monthTxs = currentTxs.filter((t) => {
        const pd = new Date(t.purchaseDate);
        return pd.getFullYear() === d.getFullYear() && pd.getMonth() === d.getMonth();
      });
      const revenue = monthTxs.reduce((sum, t) => sum + Number(t.totalPrice), 0);
      chartData.push({ label, revenue, transactionCount: monthTxs.length });
    }
  }

  // Calculate change percent for each data point
  for (let i = 1; i < chartData.length; i++) {
    const current = chartData[i]!;
    const previous = chartData[i - 1]!;
    current.changePercent = calculateChangePercent(current.revenue, previous.revenue);
  }

  // Top products
  const productMap = new Map<string, { name: string; revenue: number; units: number }>();
  for (const row of items) {
    if (!row.transaction || !row.sale_item || !row.drug) continue;
    if (new Date(row.transaction.purchaseDate) < currentStart) continue;
    const key = row.sale_item.drugId;
    const existing = productMap.get(key) ?? { name: row.drug.name, revenue: 0, units: 0 };
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
    chartData,
    topProducts,
    period: periodParam ?? "1m",
  };

  return NextResponse.json(result);
}
