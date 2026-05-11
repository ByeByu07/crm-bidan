"use client";

import { useState } from "react";
import { CatalogItemCard } from "@/components/dashboard/CatalogItemCard";
import { useCatalogItems } from "@/hooks/use-catalog-items";
import { useCategories } from "@/hooks/use-categories";
import { QuickAddCategoryModal } from "@/components/dashboard/QuickAddCategoryModal";
import { CurrencyInput } from "@/components/dashboard/CurrencyInput";
import { Input } from "@repo/ui/components/input";
import { Skeleton } from "@repo/ui/components/skeleton";
import { toast } from "sonner";
import { Pencil, Trash2, Power, PowerOff } from "lucide-react";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { useDebounce } from "@/hooks/use-debounce";
import { SearchBar } from "@/components/design-system/SearchBar";
import { FAB } from "@/components/design-system/FAB";
import { BottomSheet } from "@/components/design-system/BottomSheet";
import type { CatalogItem } from "@repo/types";

function IPlus() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

export default function CatalogPage() {
  const { data, isLoading, refetch } = useCatalogItems();
  const { data: categoriesData, isLoading: categoriesLoading } = useCategories();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [activeCategory, setActiveCategory] = useState<string>("Semua");
  const [activeType, setActiveType] = useState<string>("Semua");
  const [open, setOpen] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [selectedItem, setSelectedItem] = useState<CatalogItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [detailSubmitting, setDetailSubmitting] = useState(false);

  const categories = categoriesData?.categories ?? [];
  const categoryNames = ["Semua", ...categories.map((c) => c.name)];

  const [form, setForm] = useState({
    name: "",
    type: "product" as "product" | "service",
    category: "",
    unit: "",
    sell_price: 0,
    cost_price: 0,
    duration_days: 1,
    notes: "",
  });

  const [editForm, setEditForm] = useState({
    name: "",
    type: "product" as "product" | "service",
    category: "",
    unit: "",
    sell_price: 0,
    cost_price: 0,
    duration_days: 1,
    notes: "",
  });

  const filtered = data?.items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(debouncedSearch.toLowerCase());
    const matchesCategory = activeCategory === "Semua" || item.category === activeCategory;
    const matchesType = activeType === "Semua" || item.type === activeType;
    return matchesSearch && matchesCategory && matchesType;
  });

  function openDetail(item: CatalogItem) {
    setSelectedItem(item);
    setEditForm({
      name: item.name,
      type: item.type,
      category: item.category ?? "",
      unit: item.unit,
      sell_price: Number(item.sellPrice),
      cost_price: Number(item.costPrice ?? 0),
      duration_days: item.durationDays,
      notes: item.notes ?? "",
    });
    setEditMode(false);
    setDetailOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/catalog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Gagal menambahkan item");
      }
      toast.success("Item berhasil ditambahkan");
      setOpen(false);
      setForm({
        name: "", type: "product", category: "", unit: "",
        sell_price: 0, cost_price: 0, duration_days: 1, notes: "",
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
    if (!selectedItem) return;
    setDetailSubmitting(true);
    try {
      const res = await fetch(`/api/catalog/${selectedItem.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Gagal mengupdate item");
      }
      toast.success("Item berhasil diupdate");
      setEditMode(false);
      setDetailOpen(false);
      setSelectedItem(null);
      refetch();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setDetailSubmitting(false);
    }
  }

  async function handleToggleActive() {
    if (!selectedItem) return;
    setDetailSubmitting(true);
    try {
      const res = await fetch(`/api/catalog/${selectedItem.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !selectedItem.isActive }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Gagal mengupdate status");
      }
      toast.success(selectedItem.isActive ? "Item dinonaktifkan" : "Item diaktifkan");
      setDetailOpen(false);
      setSelectedItem(null);
      refetch();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setDetailSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!selectedItem) return;
    setDetailSubmitting(true);
    try {
      const res = await fetch(`/api/catalog/${selectedItem.id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Gagal menghapus item");
      }
      toast.success("Item berhasil dihapus");
      setDeleteConfirmOpen(false);
      setDetailOpen(false);
      setSelectedItem(null);
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
        <h1 className="t">Katalog</h1>
        <span className="c">{data?.items?.length ?? 0} jenis</span>
      </header>

      <SearchBar placeholder="Cari item..." value={search} onChange={setSearch} />

      <div className="space-y-2">
        {/* Type — segmented control */}
        <div className="flex rounded-xl p-0.5" style={{ background: "var(--bidan-border)" }}>
          {["Semua", "Produk", "Layanan"].map((t) => (
            <button
              key={t}
              className="flex-1 rounded-lg py-1.5 text-[13px] font-medium transition-all"
              style={{
                background: activeType === t ? "var(--bidan-surface)" : "transparent",
                color: activeType === t ? "var(--bidan-fg)" : "var(--bidan-muted)",
                boxShadow: activeType === t ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
              }}
              onClick={() => setActiveType(t)}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Category — compact pills */}
        {categoriesLoading ? (
          <Skeleton className="h-8 w-full" />
        ) : (
          <div className="pillrow" style={{ marginBottom: 0 }}>
            {categoryNames.map((cat) => (
              <button
                key={cat}
                className={`pill ${activeCategory === cat ? "on" : ""}`}
                style={{ padding: "4px 12px", fontSize: 12 }}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-20 rounded-[14px]" />
          <Skeleton className="h-20 rounded-[14px]" />
          <Skeleton className="h-20 rounded-[14px]" />
        </div>
      ) : filtered?.length === 0 ? (
        <EmptyState
          icon="pill"
          title="Tidak ada item"
          description={search ? "Coba kata kunci lain atau tambahkan item baru" : "Katalog masih kosong. Tambahkan item pertama Anda."}
          actionLabel="Tambah Item"
          onAction={() => setOpen(true)}
        />
      ) : (
        <div className="space-y-3">
          {filtered?.map((item) => (
            <CatalogItemCard key={item.id} item={item} onClick={() => openDetail(item)} />
          ))}
        </div>
      )}

      <FAB onClick={() => setOpen(true)} label="Tambah Item" />

      {/* Add Item BottomSheet */}
      <BottomSheet open={open} onClose={() => setOpen(false)} title="Tambah Item Baru">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="fg">
            <label className="fl">Nama</label>
            <Input
              id="item_name"
              placeholder="Nama item"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="fi"
            />
          </div>
          <div className="fg">
            <label className="fl">Tipe</label>
            <div className="flex gap-2">
              <button
                type="button"
                className={`pill ${form.type === "product" ? "on" : ""}`}
                onClick={() => setForm({ ...form, type: "product" })}
              >
                Produk
              </button>
              <button
                type="button"
                className={`pill ${form.type === "service" ? "on" : ""}`}
                onClick={() => setForm({ ...form, type: "service" })}
              >
                Layanan
              </button>
            </div>
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
          <div className="fg">
            <label className="fl">Satuan</label>
            <Input
              id="unit"
              placeholder="tablet, botol, sesi..."
              value={form.unit}
              onChange={(e) => setForm({ ...form, unit: e.target.value })}
              required
              className="fi"
            />
          </div>
          <div className="fr">
            <div className="fg">
              <label className="fl">Harga Jual</label>
              <CurrencyInput
                id="sell_price"
                value={form.sell_price}
                onChange={(v) => setForm({ ...form, sell_price: v })}
                placeholder="0"
                required
              />
            </div>
            <div className="fg">
              <label className="fl">Harga Modal</label>
              <CurrencyInput
                id="cost_price"
                value={form.cost_price}
                onChange={(v) => setForm({ ...form, cost_price: v })}
                placeholder="0"
              />
            </div>
          </div>
          <div className="fg">
            <label className="fl">Durasi (hari per unit)</label>
            <Input
              id="duration_days"
              type="number"
              min={1}
              value={form.duration_days}
              onChange={(e) => setForm({ ...form, duration_days: parseInt(e.target.value) || 1 })}
              required
              className="fi"
            />
            <p className="c">Berapa hari 1 unit sampai follow-up</p>
          </div>
          <div className="fg">
            <label className="fl">Catatan</label>
            <Input
              id="notes"
              placeholder="Catatan opsional"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="fi"
            />
          </div>
          <button type="submit" className="bp" disabled={submitting}>
            {submitting ? "Menyimpan..." : "Simpan Item"}
          </button>
        </form>
      </BottomSheet>

      {/* Detail / Edit BottomSheet */}
      <BottomSheet
        open={detailOpen}
        onClose={() => { setDetailOpen(false); setSelectedItem(null); setEditMode(false); }}
        title={editMode ? "Edit Item" : "Detail Item"}
      >
        {selectedItem && !editMode && (
          <div className="space-y-4">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <div>
                <p className="d" style={{ fontSize: "20px" }}>{selectedItem.name}</p>
                <p className="c">{selectedItem.category} · {selectedItem.unit} · {selectedItem.type === "service" ? "Layanan" : "Produk"}</p>
              </div>
              <p className="d" style={{ fontSize: "18px", color: "#2e7d32" }}>
                Rp {Number(selectedItem.sellPrice).toLocaleString("id-ID")}
              </p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
              <div className="card" style={{ padding: "12px" }}>
                <p className="c">Harga Modal</p>
                <p className="h">Rp {Number(selectedItem.costPrice ?? 0).toLocaleString("id-ID")}</p>
              </div>
              <div className="card" style={{ padding: "12px" }}>
                <p className="c">Satuan</p>
                <p className="h">{selectedItem.unit}</p>
              </div>
              <div className="card" style={{ padding: "12px" }}>
                <p className="c">Durasi</p>
                <p className="h">{selectedItem.durationDays} hari</p>
              </div>
              <div className="card" style={{ padding: "12px" }}>
                <p className="c">Tipe</p>
                <p className="h">{selectedItem.type === "service" ? "Layanan" : "Produk"}</p>
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
                  background: selectedItem.isActive ? "#e8f5e9" : "#f5f5f5",
                  color: selectedItem.isActive ? "#2e7d32" : "var(--bidan-muted)",
                }}
              >
                {selectedItem.isActive ? "Aktif" : "Nonaktif"}
              </span>
            </div>
            <div className="space-y-2">
              <button className="bg" onClick={() => setEditMode(true)}>
                <Pencil className="size-4" />
                Edit
              </button>
              <button className="bg" onClick={handleToggleActive} disabled={detailSubmitting}>
                {selectedItem.isActive ? (
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

        {selectedItem && editMode && (
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="fg">
              <label className="fl">Nama</label>
              <Input id="edit_name" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} required className="fi" />
            </div>
            <div className="fg">
              <label className="fl">Tipe</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  className={`pill ${editForm.type === "product" ? "on" : ""}`}
                  onClick={() => setEditForm({ ...editForm, type: "product" })}
                >
                  Produk
                </button>
                <button
                  type="button"
                  className={`pill ${editForm.type === "service" ? "on" : ""}`}
                  onClick={() => setEditForm({ ...editForm, type: "service" })}
                >
                  Layanan
                </button>
              </div>
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
            <div className="fg">
              <label className="fl">Satuan</label>
              <Input id="edit_unit" value={editForm.unit} onChange={(e) => setEditForm({ ...editForm, unit: e.target.value })} required className="fi" />
            </div>
            <div className="fr">
              <div className="fg">
                <label className="fl">Harga Jual</label>
                <CurrencyInput id="edit_sell_price" value={editForm.sell_price} onChange={(v) => setEditForm({ ...editForm, sell_price: v })} placeholder="0" required />
              </div>
              <div className="fg">
                <label className="fl">Harga Modal</label>
                <CurrencyInput id="edit_cost_price" value={editForm.cost_price} onChange={(v) => setEditForm({ ...editForm, cost_price: v })} placeholder="0" />
              </div>
            </div>
            <div className="fg">
              <label className="fl">Durasi (hari)</label>
              <Input id="edit_duration" type="number" min={1} value={editForm.duration_days} onChange={(e) => setEditForm({ ...editForm, duration_days: parseInt(e.target.value) || 1 })} required className="fi" />
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
        title="Hapus Item"
      >
        <p className="b" style={{ marginBottom: "20px" }}>
          Apakah Anda yakin ingin menghapus item &quot;{selectedItem?.name}&quot;? Tindakan ini tidak dapat dibatalkan.
        </p>
        <div className="flex gap-2">
          <button className="bg" onClick={() => setDeleteConfirmOpen(false)}>Batal</button>
          <button className="bp" style={{ background: "#c62828" }} onClick={handleDelete} disabled={detailSubmitting}>
            {detailSubmitting ? "Menghapus..." : "Hapus"}
          </button>
        </div>
      </BottomSheet>

      <QuickAddCategoryModal
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
