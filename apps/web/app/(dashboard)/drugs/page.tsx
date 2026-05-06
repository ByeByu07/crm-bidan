"use client";

import { useState } from "react";
import { DrugCard } from "@/components/dashboard/DrugCard";
import { useDrugs } from "@/hooks/use-drugs";
import { useDrugCategories } from "@/hooks/use-drug-categories";
import { QuickAddDrugCategoryModal } from "@/components/dashboard/QuickAddDrugCategoryModal";
import { CurrencyInput } from "@/components/dashboard/CurrencyInput";
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
import { Plus, Search, Pencil, Trash2, Power, PowerOff } from "lucide-react";
import { AvatarButton } from "@/components/dashboard/AvatarButton";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { useDebounce } from "@/hooks/use-debounce";
import type { Drug } from "@repo/types";

export default function DrugsPage() {
  const { data, isLoading, refetch } = useDrugs();
  const { data: categoriesData, isLoading: categoriesLoading } = useDrugCategories();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [open, setOpen] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [selectedDrug, setSelectedDrug] = useState<Drug | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [detailSubmitting, setDetailSubmitting] = useState(false);

  const categories = categoriesData?.categories ?? [];

  const [form, setForm] = useState({
    name: "",
    category: "",
    dispense_unit: "tablet",
    package_unit: "box",
    units_per_package: 1,
    duration_per_dispense_unit: 1,
    sell_price_per_dispense: 0,
    buy_price_per_package: 0,
    notes: "",
  });

  const [editForm, setEditForm] = useState({
    name: "",
    category: "",
    dispense_unit: "tablet",
    package_unit: "box",
    units_per_package: 1,
    duration_per_dispense_unit: 1,
    sell_price_per_dispense: 0,
    buy_price_per_package: 0,
    notes: "",
  });

  const filtered = data?.drugs.filter((drug) => {
    const matchesSearch = drug.name.toLowerCase().includes(debouncedSearch.toLowerCase());
    const matchesCategory = activeCategory === "all" || drug.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  function openDetail(drug: Drug) {
    setSelectedDrug(drug);
    setEditForm({
      name: drug.name,
      category: drug.category,
      dispense_unit: drug.dispenseUnit,
      package_unit: drug.packageUnit,
      units_per_package: drug.unitsPerPackage,
      duration_per_dispense_unit: drug.durationPerDispenseUnit,
      sell_price_per_dispense: Number(drug.sellPricePerDispense),
      buy_price_per_package: Number(drug.buyPricePerPackage),
      notes: drug.notes ?? "",
    });
    setEditMode(false);
    setDetailOpen(true);
  }

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
        category: "",
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

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedDrug) return;
    setDetailSubmitting(true);

    try {
      const res = await fetch(`/api/drugs/${selectedDrug.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Gagal mengupdate obat");
      }

      toast.success("Obat berhasil diupdate");
      setEditMode(false);
      setDetailOpen(false);
      setSelectedDrug(null);
      refetch();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setDetailSubmitting(false);
    }
  }

  async function handleToggleActive() {
    if (!selectedDrug) return;
    setDetailSubmitting(true);

    try {
      const res = await fetch(`/api/drugs/${selectedDrug.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !selectedDrug.isActive }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Gagal mengupdate status");
      }

      toast.success(selectedDrug.isActive ? "Obat dinonaktifkan" : "Obat diaktifkan");
      setDetailOpen(false);
      setSelectedDrug(null);
      refetch();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setDetailSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!selectedDrug) return;
    setDetailSubmitting(true);

    try {
      const res = await fetch(`/api/drugs/${selectedDrug.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Gagal menghapus obat");
      }

      toast.success("Obat berhasil dihapus");
      setDeleteConfirmOpen(false);
      setDetailOpen(false);
      setSelectedDrug(null);
      refetch();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setDetailSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Katalog Obat</h1>
        <AvatarButton />
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Cari obat..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          Kategori
        </span>
        <Select
          value={activeCategory}
          onValueChange={setActiveCategory}
          disabled={categoriesLoading}
        >
          <SelectTrigger className="w-full sm:w-[240px]">
            <SelectValue placeholder="Pilih kategori" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.name}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
      ) : filtered?.length === 0 ? (
        <EmptyState
          icon="pill"
          title="Tidak ada obat"
          description={search ? "Coba kata kunci lain atau tambahkan obat baru" : "Katalog obat masih kosong. Tambahkan obat pertama Anda."}
          actionLabel="Tambah Obat"
          onAction={() => setOpen(true)}
        />
      ) : (
        <div className="space-y-3">
          {filtered?.map((drug) => (
            <DrugCard key={drug.id} drug={drug} onClick={() => openDetail(drug)} />
          ))}
        </div>
      )}

      <Button
        className="fixed right-4 bottom-20 size-14 rounded-full shadow-lg"
        onClick={() => setOpen(true)}
      >
        <Plus className="size-6" />
      </Button>

      {/* Add Drug Dialog */}
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
              <div className="flex gap-2">
                <div className="flex-1">
                  <Select
                    value={form.category}
                    onValueChange={(v) => setForm({ ...form, category: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kategori..." />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.name}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setShowAddCategory(true)}
                >
                  <Plus className="size-4" />
                </Button>
              </div>
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
                <p className="text-xs text-muted-foreground">
                  Jumlah unit dalam satu kemasan (contoh: 10 tablet/strip)
                </p>
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
                <p className="text-xs text-muted-foreground">
                  Berapa hari 1 unit habis (contoh: 1 tablet = 1 hari)
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="sell_price">Harga Jual per Satuan</Label>
                <CurrencyInput
                  id="sell_price"
                  value={form.sell_price_per_dispense}
                  onChange={(v) =>
                    setForm({
                      ...form,
                      sell_price_per_dispense: v,
                    })
                  }
                  placeholder="0"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="buy_price">Harga Beli per Kemasan</Label>
                <CurrencyInput
                  id="buy_price"
                  value={form.buy_price_per_package}
                  onChange={(v) =>
                    setForm({
                      ...form,
                      buy_price_per_package: v,
                    })
                  }
                  placeholder="0"
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

      {/* Detail / Edit Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editMode ? "Edit Obat" : selectedDrug?.name}</DialogTitle>
            <DialogDescription>
              {editMode
                ? "Ubah detail obat"
                : "Detail dan pengaturan obat"}
            </DialogDescription>
          </DialogHeader>

          {selectedDrug && !editMode && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1">
                  <Badge variant="secondary">{selectedDrug.category}</Badge>
                  <Badge variant="outline">{selectedDrug.dispenseUnit}</Badge>
                  {!selectedDrug.isActive && (
                    <Badge variant="destructive">Nonaktif</Badge>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Satuan Jual</p>
                    <p className="font-medium">{selectedDrug.dispenseUnit}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Satuan Kemasan</p>
                    <p className="font-medium">{selectedDrug.packageUnit}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Isi per Kemasan</p>
                    <p className="font-medium">{selectedDrug.unitsPerPackage}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Durasi per Satuan</p>
                    <p className="font-medium">{selectedDrug.durationPerDispenseUnit} hari</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Harga Jual</p>
                    <p className="font-medium">Rp {Number(selectedDrug.sellPricePerDispense).toLocaleString("id-ID")}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Harga Beli</p>
                    <p className="font-medium">Rp {Number(selectedDrug.buyPricePerPackage).toLocaleString("id-ID")}</p>
                  </div>
                </div>
                {selectedDrug.notes && (
                  <div className="text-sm">
                    <p className="text-muted-foreground">Catatan</p>
                    <p>{selectedDrug.notes}</p>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Button variant="outline" onClick={() => setEditMode(true)}>
                  <Pencil className="mr-2 size-4" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  onClick={handleToggleActive}
                  disabled={detailSubmitting}
                >
                  {selectedDrug.isActive ? (
                    <>
                      <PowerOff className="mr-2 size-4 text-destructive" />
                      Nonaktifkan
                    </>
                  ) : (
                    <>
                      <Power className="mr-2 size-4 text-emerald-500" />
                      Aktifkan
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  className="text-destructive hover:text-destructive"
                  onClick={() => setDeleteConfirmOpen(true)}
                >
                  <Trash2 className="mr-2 size-4" />
                  Hapus
                </Button>
              </div>
            </div>
          )}

          {selectedDrug && editMode && (
            <form onSubmit={handleEdit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit_name">Nama Obat</Label>
                <Input
                  id="edit_name"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Kategori</Label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Select
                      value={editForm.category}
                      onValueChange={(v) => setEditForm({ ...editForm, category: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih kategori..." />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.name}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setShowAddCategory(true)}
                  >
                    <Plus className="size-4" />
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="edit_dispense_unit">Satuan Jual</Label>
                  <Input
                    id="edit_dispense_unit"
                    value={editForm.dispense_unit}
                    onChange={(e) => setEditForm({ ...editForm, dispense_unit: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_package_unit">Satuan Kemasan</Label>
                  <Input
                    id="edit_package_unit"
                    value={editForm.package_unit}
                    onChange={(e) => setEditForm({ ...editForm, package_unit: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="edit_units_per_package">Isi per Kemasan</Label>
                  <Input
                    id="edit_units_per_package"
                    type="number"
                    min={1}
                    value={editForm.units_per_package}
                    onChange={(e) =>
                      setEditForm({ ...editForm, units_per_package: parseInt(e.target.value) || 0 })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_duration">Durasi per Satuan (hari)</Label>
                  <Input
                    id="edit_duration"
                    type="number"
                    min={1}
                    value={editForm.duration_per_dispense_unit}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        duration_per_dispense_unit: parseInt(e.target.value) || 0,
                      })
                    }
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="edit_sell_price">Harga Jual per Satuan</Label>
                  <CurrencyInput
                    id="edit_sell_price"
                    value={editForm.sell_price_per_dispense}
                    onChange={(v) =>
                      setEditForm({ ...editForm, sell_price_per_dispense: v })
                    }
                    placeholder="0"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_buy_price">Harga Beli per Kemasan</Label>
                  <CurrencyInput
                    id="edit_buy_price"
                    value={editForm.buy_price_per_package}
                    onChange={(v) =>
                      setEditForm({ ...editForm, buy_price_per_package: v })
                    }
                    placeholder="0"
                    required
                  />
                </div>
              </div>
              <DialogFooter className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setEditMode(false)}>
                  Batal
                </Button>
                <Button type="submit" disabled={detailSubmitting}>
                  {detailSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Obat</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus obat "{selectedDrug?.name}"? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={detailSubmitting}>
              {detailSubmitting ? "Menghapus..." : "Hapus"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <QuickAddDrugCategoryModal
        open={showAddCategory}
        onOpenChange={setShowAddCategory}
        onCategoryAdded={(cat) => {
          setForm((prev) => ({ ...prev, category: cat.name }));
          setEditForm((prev) => ({ ...prev, category: cat.name }));
        }}
      />
    </div>
  );
}
