"use client";

import { useState } from "react";
import { DrugCard } from "@/components/dashboard/DrugCard";
import { useDrugs } from "@/hooks/use-drugs";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { Badge } from "@repo/ui/components/badge";
import { Skeleton } from "@repo/ui/components/skeleton";
import { toast } from "sonner";
import { Plus, Search } from "lucide-react";
import type { DrugCategory } from "@repo/types";

const categories: Array<{ value: DrugCategory | "all"; label: string }> = [
  { value: "all", label: "Semua" },
  { value: "vitamin", label: "Vitamin" },
  { value: "suplemen", label: "Suplemen" },
  { value: "KB", label: "KB" },
  { value: "obat", label: "Obat" },
  { value: "lainnya", label: "Lainnya" },
];

export default function DrugsPage() {
  const { data, isLoading, refetch } = useDrugs();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<DrugCategory | "all">("all");
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    category: "obat" as DrugCategory,
    dispense_unit: "tablet",
    package_unit: "box",
    units_per_package: 1,
    duration_per_dispense_unit: 1,
    sell_price_per_dispense: 0,
    buy_price_per_package: 0,
    notes: "",
  });

  const filtered = data?.drugs.filter((drug) => {
    const matchesSearch = drug.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === "all" || drug.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/drugs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Gagal menambahkan obat");
      }

      toast.success("Obat berhasil ditambahkan");
      setOpen(false);
      setForm({
        name: "",
        category: "obat",
        dispense_unit: "tablet",
        package_unit: "box",
        units_per_package: 1,
        duration_per_dispense_unit: 1,
        sell_price_per_dispense: 0,
        buy_price_per_package: 0,
        notes: "",
      });
      refetch();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Katalog Obat</h1>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Cari obat..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <Badge
            key={cat.value}
            variant={activeCategory === cat.value ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setActiveCategory(cat.value)}
          >
            {cat.label}
          </Badge>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
      ) : filtered?.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground">
          Tidak ada obat ditemukan
        </p>
      ) : (
        <div className="space-y-3">
          {filtered?.map((drug) => (
            <DrugCard key={drug.id} drug={drug} />
          ))}
        </div>
      )}

      <Button
        className="fixed right-4 bottom-20 size-14 rounded-full shadow-lg"
        onClick={() => setOpen(true)}
      >
        <Plus className="size-6" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tambah Obat Baru</DialogTitle>
            <DialogDescription>
              Isi detail obat baru untuk katalog Anda
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="drug_name">Nama Obat</Label>
              <Input
                id="drug_name"
                placeholder="Nama obat"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Kategori</Label>
              <Select
                value={form.category}
                onValueChange={(v) => setForm({ ...form, category: v as DrugCategory })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vitamin">Vitamin</SelectItem>
                  <SelectItem value="suplemen">Suplemen</SelectItem>
                  <SelectItem value="KB">KB</SelectItem>
                  <SelectItem value="obat">Obat</SelectItem>
                  <SelectItem value="lainnya">Lainnya</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="dispense_unit">Satuan Jual</Label>
                <Input
                  id="dispense_unit"
                  placeholder="tablet"
                  value={form.dispense_unit}
                  onChange={(e) => setForm({ ...form, dispense_unit: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="package_unit">Satuan Kemasan</Label>
                <Input
                  id="package_unit"
                  placeholder="box"
                  value={form.package_unit}
                  onChange={(e) => setForm({ ...form, package_unit: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="units_per_package">Isi per Kemasan</Label>
                <Input
                  id="units_per_package"
                  type="number"
                  min={1}
                  value={form.units_per_package}
                  onChange={(e) =>
                    setForm({ ...form, units_per_package: parseInt(e.target.value) || 0 })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Durasi per Satuan (hari)</Label>
                <Input
                  id="duration"
                  type="number"
                  min={1}
                  value={form.duration_per_dispense_unit}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      duration_per_dispense_unit: parseInt(e.target.value) || 0,
                    })
                  }
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="sell_price">Harga Jual per Satuan</Label>
                <Input
                  id="sell_price"
                  type="number"
                  min={0}
                  value={form.sell_price_per_dispense}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      sell_price_per_dispense: parseFloat(e.target.value) || 0,
                    })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="buy_price">Harga Beli per Kemasan</Label>
                <Input
                  id="buy_price"
                  type="number"
                  min={0}
                  value={form.buy_price_per_package}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      buy_price_per_package: parseFloat(e.target.value) || 0,
                    })
                  }
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Menyimpan..." : "Simpan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
