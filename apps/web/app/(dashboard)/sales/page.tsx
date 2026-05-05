"use client";

import { useState } from "react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { SalesChart } from "@/components/dashboard/SalesChart";
import { useSales } from "@/hooks/use-sales";
import { Tabs, TabsList, TabsTrigger } from "@repo/ui/components/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/card";
import { Skeleton } from "@repo/ui/components/skeleton";
import { formatCurrency, formatCurrencyShort } from "@repo/utils/format";
import type { SalesPeriod } from "@repo/types";
import { TrendingUp, ShoppingCart, Users, Package } from "lucide-react";

export default function SalesPage() {
  const [period, setPeriod] = useState<SalesPeriod>("1m");
  const { data, isLoading } = useSales(period);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Penjualan</h1>
        <Tabs value={period} onValueChange={(v) => setPeriod(v as SalesPeriod)}>
          <TabsList>
            <TabsTrigger value="1m">1B</TabsTrigger>
            <TabsTrigger value="3m">3B</TabsTrigger>
            <TabsTrigger value="6m">6B</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <MetricCard
            title="Pendapatan"
            value={formatCurrencyShort(data?.currentRevenue ?? 0)}
            change={data?.revenueChangePercent ?? null}
            icon={<TrendingUp className="size-4" />}
          />
          <MetricCard
            title="Transaksi"
            value={(data?.transactionCount ?? 0).toString()}
            change={data?.transactionChangePercent ?? null}
            icon={<ShoppingCart className="size-4" />}
          />
          <MetricCard
            title="Pasien Aktif"
            value={(data?.activePatients ?? 0).toString()}
            change={data?.activePatientsChangePercent ?? null}
            icon={<Users className="size-4" />}
          />
          <MetricCard
            title="Rata-rata"
            value={formatCurrencyShort(
              data?.transactionCount
                ? (data.currentRevenue / data.transactionCount)
                : 0
            )}
            icon={<Package className="size-4" />}
          />
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Grafik Penjualan</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-64" />
          ) : (
            <SalesChart data={data?.chartData ?? []} />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Produk Terlaris</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <Skeleton className="h-20" />
          ) : data?.topProducts.length === 0 ? (
            <p className="text-sm text-muted-foreground">Belum ada data</p>
          ) : (
            data?.topProducts.map((product) => (
              <div
                key={product.drugId}
                className="flex items-center justify-between"
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
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
