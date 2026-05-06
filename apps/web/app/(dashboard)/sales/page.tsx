"use client";

import { useState, useMemo } from "react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { SalesChart } from "@/components/dashboard/SalesChart";
import { useSales } from "@/hooks/use-sales";
import { AvatarButton } from "@/components/dashboard/AvatarButton";
import { Skeleton } from "@repo/ui/components/skeleton";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { Button } from "@repo/ui/components/button";
import { Calendar } from "@repo/ui/components/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@repo/ui/components/popover";
import { Separator } from "@repo/ui/components/separator";
import { formatCurrency, formatCurrencyShort } from "@repo/utils/format";
import { format as formatDate } from "date-fns";
import type { SalesPeriod } from "@repo/types";
import { ChevronDown } from "lucide-react";

type ChartFilter = SalesPeriod | { from: string; to: string };

function getFilterLabel(filter: ChartFilter): string {
  if (typeof filter === "string") {
    if (filter === "1m") return "Bulan Ini";
    if (filter === "3m") return "3 Bulan Terakhir";
    if (filter === "6m") return "6 Bulan Terakhir";
  }
  const { from, to } = filter as { from: string; to: string };
  return `${formatDate(new Date(from), "d MMM")} - ${formatDate(new Date(to), "d MMM yyyy")}`;
}

export default function SalesPage() {
  const [chartFilter, setChartFilter] = useState<ChartFilter>("1m");
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [customRange, setCustomRange] = useState<{ from?: Date; to?: Date } | undefined>(undefined);

  const { data: metricsData, isLoading: metricsLoading } = useSales("1m");
  const { data: chartData, isLoading: chartLoading } = useSales(chartFilter);

  const filterLabel = useMemo(() => getFilterLabel(chartFilter), [chartFilter]);

  function handlePreset(period: SalesPeriod) {
    setChartFilter(period);
    setCustomRange(undefined);
    setPopoverOpen(false);
  }

  function handleApplyCustom() {
    if (customRange?.from && customRange?.to) {
      setChartFilter({
        from: formatDate(customRange.from, "yyyy-MM-dd"),
        to: formatDate(customRange.to, "yyyy-MM-dd"),
      });
    }
    setPopoverOpen(false);
  }

  const isCustomActive = typeof chartFilter === "object";

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Penjualan</h1>
        <AvatarButton />
      </div>

      {metricsLoading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Skeleton className="h-[4.5rem]" />
          <Skeleton className="h-[4.5rem]" />
          <Skeleton className="h-[4.5rem]" />
          <Skeleton className="h-[4.5rem]" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <MetricCard
            title="Pendapatan"
            value={formatCurrencyShort(metricsData?.currentRevenue ?? 0)}
            change={metricsData?.revenueChangePercent ?? null}
          />
          <MetricCard
            title="Transaksi"
            value={(metricsData?.transactionCount ?? 0).toString()}
            change={metricsData?.transactionChangePercent ?? null}
          />
          <MetricCard
            title="Pasien Aktif"
            value={(metricsData?.activePatients ?? 0).toString()}
            change={metricsData?.activePatientsChangePercent ?? null}
          />
          <MetricCard
            title="Rata-rata"
            value={formatCurrencyShort(
              metricsData?.transactionCount
                ? (metricsData.currentRevenue / metricsData.transactionCount)
                : 0
            )}
          />
        </div>
      )}

      <div className="rounded-lg border">
        <div className="flex items-center justify-between p-4 pb-0">
          <h2 className="text-sm font-semibold">Grafik Penjualan</h2>
          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1">
                <span className="max-w-[140px] truncate">{filterLabel}</span>
                <ChevronDown className="size-3 shrink-0" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-auto p-3">
              <div className="space-y-2">
                <div className="grid gap-1">
                  <Button
                    variant={chartFilter === "1m" ? "secondary" : "ghost"}
                    size="sm"
                    className="justify-start font-normal"
                    onClick={() => handlePreset("1m")}
                  >
                    Bulan Ini
                  </Button>
                  <Button
                    variant={chartFilter === "3m" ? "secondary" : "ghost"}
                    size="sm"
                    className="justify-start font-normal"
                    onClick={() => handlePreset("3m")}
                  >
                    3 Bulan Terakhir
                  </Button>
                  <Button
                    variant={chartFilter === "6m" ? "secondary" : "ghost"}
                    size="sm"
                    className="justify-start font-normal"
                    onClick={() => handlePreset("6m")}
                  >
                    6 Bulan Terakhir
                  </Button>
                </div>
                <Separator />
                <div className="space-y-2">
                  <p className="px-2 text-xs font-medium text-muted-foreground">
                    Rentang Kustom
                  </p>
                  <Calendar
                    mode="range"
                    selected={
                      customRange?.from
                        ? { from: customRange.from, to: customRange.to }
                        : isCustomActive
                          ? {
                              from: new Date((chartFilter as { from: string }).from),
                              to: new Date((chartFilter as { to: string }).to),
                            }
                          : undefined
                    }
                    onSelect={(selected) => {
                      if (!selected) {
                        setCustomRange(undefined);
                        return;
                      }
                      setCustomRange({
                        from: selected.from,
                        to: selected.to,
                      });
                    }}
                    numberOfMonths={1}
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPopoverOpen(false)}
                    >
                      Batal
                    </Button>
                    <Button
                      size="sm"
                      disabled={!customRange?.from || !customRange?.to}
                      onClick={handleApplyCustom}
                    >
                      Terapkan
                    </Button>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        <div className="p-4 pt-3">
          {chartLoading ? (
            <Skeleton className="h-64" />
          ) : (
            <SalesChart data={chartData?.chartData ?? []} />
          )}
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold mb-3">Produk Terlaris</h2>
        {metricsLoading ? (
          <Skeleton className="h-20" />
        ) : metricsData?.topProducts.length === 0 ? (
          <EmptyState
            icon="chart"
            title="Belum ada data"
            description="Data produk terlaris akan muncul setelah ada transaksi"
          />
        ) : (
          <div className="space-y-0">
            {metricsData?.topProducts.map((product) => (
              <div
                key={product.drugId}
                className="flex items-center justify-between py-2.5 border-b last:border-0"
              >
                <div>
                  <p className="text-sm font-medium">{product.drugName}</p>
                  <p className="text-xs text-muted-foreground">
                    {product.unitsSold} unit terjual
                  </p>
                </div>
                <p className="text-sm font-semibold">
                  {formatCurrency(product.revenue)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
