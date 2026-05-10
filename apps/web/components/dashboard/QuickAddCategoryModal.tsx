"use client";

import { useState } from "react";
import { Input } from "@repo/ui/components/input";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { BottomSheet } from "@/components/design-system/BottomSheet";

interface QuickAddCategoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCategoryAdded?: (category: { id: string; name: string }) => void;
}

export function QuickAddCategoryModal({
  open,
  onOpenChange,
  onCategoryAdded,
}: QuickAddCategoryModalProps) {
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const queryClient = useQueryClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Gagal menambahkan kategori");
      }
      const data = await res.json();
      toast.success("Kategori berhasil ditambahkan");
      setName("");
      onOpenChange(false);
      onCategoryAdded?.(data.category);
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <BottomSheet open={open} onClose={() => onOpenChange(false)} title="Tambah Kategori Baru">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="fg">
          <label className="fl">Nama Kategori</label>
          <Input
            placeholder="Nama kategori"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="fi"
          />
        </div>
        <button type="submit" className="bp" disabled={submitting}>
          {submitting ? "Menyimpan..." : "Simpan Kategori"}
        </button>
      </form>
    </BottomSheet>
  );
}
