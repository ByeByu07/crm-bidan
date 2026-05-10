"use client";

import { useState, useMemo } from "react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { SalesChart } from "@/components/dashboard/SalesChart";
import { useSales } from "@/hooks/use-sales";
import { AvatarButton } from "@/components/dashboard/AvatarButton";
import { Skeleton } from "@repo/ui/components/skeleton";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { Pills } from "@/components/design-system/Pills";
import { formatCurrencyShort } from "@repo/utils/format";
import type { SalesPeriod } from "@repo/types";

const periodOptions = ["Bulan Ini", "3 Bulan", "6 Bulan"];
const periodMap: Record<string, SalesPeriod> = {
  "Bulan Ini": "1m",
  "3 Bulan": "3m",
  "6 Bulan": "6m",
};

export default function SalesPage() {
  const [activePeriodLabel, setActivePeriodLabel] = useState("Bulan Ini");
  const period = periodMap[activePeriodLabel];

  const { data: metricsData, isLoading: metricsLoading } = useSales("1m");
  const { data: chartData, isLoading: chartLoading } = useSales(period ?? "1m");

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 11) return "Selamat pagi,";
    if (hour < 15) return "Selamat siang,";
    if (hour < 18) return "Selamat sore,";
    return "Selamat malam,";
  }, []);

  return (
    <div className="space-y-5">
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          <span className="c">{greeting}</span>
          <span className="d" style={{ fontSize: "22px" }}>Bidan Wati</span>
        </div>
        <AvatarButton />
      </header>

      <Pills
        options={periodOptions}
        active={activePeriodLabel}
        onChange={setActivePeriodLabel}
      />

      {metricsLoading ? (
        <div className="kg">
          <Skeleton className="h-[88px] rounded-[14px]" />
          <Skeleton className="h-[88px] rounded-[14px]" />
          <Skeleton className="h-[88px] rounded-[14px]" />
          <Skeleton className="h-[88px] rounded-[14px]" />
        </div>
      ) : (
        <div className="kg">
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

      <section className="card" style={{ padding: "16px", marginBottom: "20px" }}>
        <div className="sec">
          <h2 className="h">Grafik Penjualan</h2>
          <span className="c" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: "var(--bidan-fg)", display: "inline-block" }} />
            Pendapatan
          </span>
        </div>
        {chartLoading ? (
          <Skeleton className="h-64" />
        ) : (
          <SalesChart data={chartData?.chartData ?? []} />
        )}
      </section>

      <section style={{ marginBottom: "20px" }}>
        <div className="sec">
          <h2 className="h">Produk Terlaris</h2>
        </div>
        <div className="card" style={{ padding: "0 16px" }}>
          {metricsLoading ? (
            <Skeleton className="h-20" />
          ) : metricsData?.topProducts.length === 0 ? (
            <EmptyState
              icon="chart"
              title="Belum ada data"
              description="Data produk terlaris akan muncul setelah ada transaksi"
            />
          ) : (
            metricsData?.topProducts.map((product) => (
              <div className="pr" key={product.catalogItemId}>
                <div style={{ minWidth: 0 }}>
                  <p className="pn">{product.catalogItemName}</p>
                  <p className="pm">{product.unitsSold} unit terjual</p>
                </div>
                <p className="pp">{formatCurrencyShort(product.revenue)}</p>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
