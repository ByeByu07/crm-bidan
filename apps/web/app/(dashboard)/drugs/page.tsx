"use client";

import { useState } from "react";
import { DrugCard } from "@/components/dashboard/DrugCard";
import { useDrugs } from "@/hooks/use-drugs";
import { useDrugCategories } from "@/hooks/use-drug-categories";
import { QuickAddDrugCategoryModal } from "@/components/dashboard/QuickAddDrugCategoryModal";
import { CurrencyInput } from "@/components/dashboard/CurrencyInput";
import { Input } from "@repo/ui/components/input";
import { Skeleton } from "@repo/ui/components/skeleton";
import { toast } from "sonner";
import { Pencil, Trash2, Power, PowerOff } from "lucide-react";
import { AvatarButton } from "@/components/dashboard/AvatarButton";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { useDebounce } from "@/hooks/use-debounce";
import { SearchBar } from "@/components/design-system/SearchBar";
import { FAB } from "@/components/design-system/FAB";
import { BottomSheet } from "@/components/design-system/BottomSheet";
import type { Drug } from "@repo/types";

function IPlus() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

export default function DrugsPage() {
  const { data, isLoading, refetch } = useDrugs();
  const { data: categoriesData, isLoading: categoriesLoading } = useDrugCategories();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [activeCategory, setActiveCategory] = useState<string>("Semua");
  const [open, setOpen] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [selectedDrug, setSelectedDrug] = useState<Drug | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [detailSubmitting, setDetailSubmitting] = useState(false);

  const categories = categoriesData?.categories ?? [];
  const categoryNames = ["Semua", ...categories.map((c) => c.name)];

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
    const matchesCategory = activeCategory === "Semua" || drug.category === activeCategory;
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
        name: "", category: "", dispense_unit: "tablet", package_unit: "box",
        units_per_package: 1, duration_per_dispense_unit: 1,
        sell_price_per_dispense: 0, buy_price_per_package: 0, notes: "",
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
      const res = await fetch(`/api/drugs/${selectedDrug.id}`, { method: "DELETE" });
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
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
        <h1 className="t">Katalog Obat</h1>
        <span className="c">{data?.drugs?.length ?? 0} jenis</span>
      </header>

      <SearchBar placeholder="Cari obat..." value={search} onChange={setSearch} />

      {categoriesLoading ? (
        <Skeleton className="h-9 w-full" />
      ) : (
        <div className="pillrow">
          {categoryNames.map((cat) => (
            <button
              key={cat}
              className={`pill ${activeCategory === cat ? "on" : ""}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-20 rounded-[14px]" />
          <Skeleton className="h-20 rounded-[14px]" />
          <Skeleton className="h-20 rounded-[14px]" />
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

      <FAB onClick={() => setOpen(true)} label="Tambah Obat" />

      {/* Add Drug BottomSheet */}
      <BottomSheet open={open} onClose={() => setOpen(false)} title="Tambah Obat Baru">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="fg">
            <label className="fl">Nama Obat</label>
            <Input
              id="drug_name"
              placeholder="Nama obat"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="fi"
            />
          </div>
          <div className="fg">
            <label className="fl">Kategori</label>
            <div className="flex gap-2">
              <select
                className="fs flex-1"
                value={form.category}
                onChange={(e) => {
                  if (e.target.value === "__add__") {
                    setShowAddCategory(true);
                  } else {
                    setForm({ ...form, category: e.target.value });
                  }
                }}
                required
              >
                <option value="">Pilih kategori...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
                <option value="__add__">+ Tambah Kategori Baru</option>
              </select>
              <button
                type="button"
                className="cl"
                style={{ width: "44px", height: "44px", flexShrink: 0 }}
                onClick={() => setShowAddCategory(true)}
              >
                <IPlus />
              </button>
            </div>
          </div>
          <div className="fr">
            <div className="fg">
              <label className="fl">Satuan Jual</label>
              <Input
                id="dispense_unit"
                placeholder="tablet"
                value={form.dispense_unit}
                onChange={(e) => setForm({ ...form, dispense_unit: e.target.value })}
                required
                className="fi"
              />
            </div>
            <div className="fg">
              <label className="fl">Satuan Kemasan</label>
              <Input
                id="package_unit"
                placeholder="box"
                value={form.package_unit}
                onChange={(e) => setForm({ ...form, package_unit: e.target.value })}
                required
                className="fi"
              />
            </div>
          </div>
          <div className="fr">
            <div className="fg">
              <label className="fl">Isi per Kemasan</label>
              <Input
                id="units_per_package"
                type="number"
                min={1}
                value={form.units_per_package}
                onChange={(e) => setForm({ ...form, units_per_package: parseInt(e.target.value) || 0 })}
                required
                className="fi"
              />
              <p className="c">Jumlah unit dalam satu kemasan (contoh: 10 tablet/strip)</p>
            </div>
            <div className="fg">
              <label className="fl">Durasi per Satuan (hari)</label>
              <Input
                id="duration"
                type="number"
                min={1}
                value={form.duration_per_dispense_unit}
                onChange={(e) => setForm({ ...form, duration_per_dispense_unit: parseInt(e.target.value) || 0 })}
                required
                className="fi"
              />
              <p className="c">Berapa hari 1 unit habis (contoh: 1 tablet = 1 hari)</p>
            </div>
          </div>
          <div className="fr">
            <div className="fg">
              <label className="fl">Harga Jual per Satuan</label>
              <CurrencyInput
                id="sell_price"
                value={form.sell_price_per_dispense}
                onChange={(v) => setForm({ ...form, sell_price_per_dispense: v })}
                placeholder="0"
                required
              />
            </div>
            <div className="fg">
              <label className="fl">Harga Beli per Kemasan</label>
              <CurrencyInput
                id="buy_price"
                value={form.buy_price_per_package}
                onChange={(v) => setForm({ ...form, buy_price_per_package: v })}
                placeholder="0"
                required
              />
            </div>
          </div>
          <button type="submit" className="bp" disabled={submitting}>
            {submitting ? "Menyimpan..." : "Simpan Obat"}
          </button>
        </form>
      </BottomSheet>

      {/* Detail / Edit BottomSheet */}
      <BottomSheet
        open={detailOpen}
        onClose={() => { setDetailOpen(false); setSelectedDrug(null); setEditMode(false); }}
        title={editMode ? "Edit Obat" : "Detail Obat"}
      >
        {selectedDrug && !editMode && (
          <div className="space-y-4">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <div>
                <p className="d" style={{ fontSize: "20px" }}>{selectedDrug.name}</p>
                <p className="c">{selectedDrug.category} · {selectedDrug.dispenseUnit}</p>
              </div>
              <p className="d" style={{ fontSize: "18px", color: "#2e7d32" }}>
                Rp {Number(selectedDrug.sellPricePerDispense).toLocaleString("id-ID")}
              </p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
              <div className="card" style={{ padding: "12px" }}>
                <p className="c">Harga Beli</p>
                <p className="h">Rp {Number(selectedDrug.buyPricePerPackage).toLocaleString("id-ID")}</p>
              </div>
              <div className="card" style={{ padding: "12px" }}>
                <p className="c">Kemasan</p>
                <p className="h">{selectedDrug.packageUnit}</p>
              </div>
              <div className="card" style={{ padding: "12px" }}>
                <p className="c">Isi per Kemasan</p>
                <p className="h">{selectedDrug.unitsPerPackage}</p>
              </div>
              <div className="card" style={{ padding: "12px" }}>
                <p className="c">Durasi</p>
                <p className="h">{selectedDrug.durationPerDispenseUnit} hari</p>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
              <span
                className="tag"
                style={{
                  padding: "4px 10px",
                  borderRadius: "9999px",
                  fontSize: "12px",
                  fontWeight: 600,
                  background: selectedDrug.isActive ? "#e8f5e9" : "#f5f5f5",
                  color: selectedDrug.isActive ? "#2e7d32" : "var(--bidan-muted)",
                }}
              >
                {selectedDrug.isActive ? "Aktif" : "Nonaktif"}
              </span>
            </div>
            <div className="space-y-2">
              <button className="bg" onClick={() => setEditMode(true)}>
                <Pencil className="size-4" />
                Edit
              </button>
              <button className="bg" onClick={handleToggleActive} disabled={detailSubmitting}>
                {selectedDrug.isActive ? (
                  <>
                    <PowerOff className="size-4 text-destructive" />
                    Nonaktifkan
                  </>
                ) : (
                  <>
                    <Power className="size-4 text-emerald-500" />
                    Aktifkan
                  </>
                )}
              </button>
              <button className="bg" style={{ color: "#c62828" }} onClick={() => setDeleteConfirmOpen(true)}>
                <Trash2 className="size-4" />
                Hapus
              </button>
            </div>
          </div>
        )}

        {selectedDrug && editMode && (
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="fg">
              <label className="fl">Nama Obat</label>
              <Input id="edit_name" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} required className="fi" />
            </div>
            <div className="fg">
              <label className="fl">Kategori</label>
              <div className="flex gap-2">
                <select
                  className="fs flex-1"
                  value={editForm.category}
                  onChange={(e) => {
                    if (e.target.value === "__add__") {
                      setShowAddCategory(true);
                    } else {
                      setEditForm({ ...editForm, category: e.target.value });
                    }
                  }}
                  required
                >
                  <option value="">Pilih kategori...</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                  <option value="__add__">+ Tambah Kategori Baru</option>
                </select>
                <button
                  type="button"
                  className="cl"
                  style={{ width: "44px", height: "44px", flexShrink: 0 }}
                  onClick={() => setShowAddCategory(true)}
                >
                  <IPlus />
                </button>
              </div>
            </div>
            <div className="fr">
              <div className="fg">
                <label className="fl">Satuan Jual</label>
                <Input id="edit_dispense_unit" value={editForm.dispense_unit} onChange={(e) => setEditForm({ ...editForm, dispense_unit: e.target.value })} required className="fi" />
              </div>
              <div className="fg">
                <label className="fl">Satuan Kemasan</label>
                <Input id="edit_package_unit" value={editForm.package_unit} onChange={(e) => setEditForm({ ...editForm, package_unit: e.target.value })} required className="fi" />
              </div>
            </div>
            <div className="fr">
              <div className="fg">
                <label className="fl">Isi per Kemasan</label>
                <Input id="edit_units_per_package" type="number" min={1} value={editForm.units_per_package} onChange={(e) => setEditForm({ ...editForm, units_per_package: parseInt(e.target.value) || 0 })} required className="fi" />
              </div>
              <div className="fg">
                <label className="fl">Durasi per Satuan (hari)</label>
                <Input id="edit_duration" type="number" min={1} value={editForm.duration_per_dispense_unit} onChange={(e) => setEditForm({ ...editForm, duration_per_dispense_unit: parseInt(e.target.value) || 0 })} required className="fi" />
              </div>
            </div>
            <div className="fr">
              <div className="fg">
                <label className="fl">Harga Jual per Satuan</label>
                <CurrencyInput id="edit_sell_price" value={editForm.sell_price_per_dispense} onChange={(v) => setEditForm({ ...editForm, sell_price_per_dispense: v })} placeholder="0" required />
              </div>
              <div className="fg">
                <label className="fl">Harga Beli per Kemasan</label>
                <CurrencyInput id="edit_buy_price" value={editForm.buy_price_per_package} onChange={(v) => setEditForm({ ...editForm, buy_price_per_package: v })} placeholder="0" required />
              </div>
            </div>
            <div className="flex gap-2">
              <button type="button" className="bg" onClick={() => setEditMode(false)}>Batal</button>
              <button type="submit" className="bp" disabled={detailSubmitting}>
                {detailSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>
          </form>
        )}
      </BottomSheet>

      {/* Delete Confirmation BottomSheet */}
      <BottomSheet
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Hapus Obat"
      >
        <p className="b" style={{ marginBottom: "20px" }}>
          Apakah Anda yakin ingin menghapus obat &quot;{selectedDrug?.name}&quot;? Tindakan ini tidak dapat dibatalkan.
        </p>
        <div className="flex gap-2">
          <button className="bg" onClick={() => setDeleteConfirmOpen(false)}>Batal</button>
          <button className="bp" style={{ background: "#c62828" }} onClick={handleDelete} disabled={detailSubmitting}>
            {detailSubmitting ? "Menghapus..." : "Hapus"}
          </button>
        </div>
      </BottomSheet>

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
