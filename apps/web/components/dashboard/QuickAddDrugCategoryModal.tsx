"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { toast } from "sonner";
import type { DrugCategoryItem } from "@repo/types";

interface QuickAddDrugCategoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCategoryAdded?: (category: DrugCategoryItem) => void;
}

export function QuickAddDrugCategoryModal({
  open,
  onOpenChange,
  onCategoryAdded,
}: QuickAddDrugCategoryModalProps) {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/drug-categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const message =
          typeof err.error === "string"
            ? err.error
            : typeof err.message === "string"
              ? err.message
              : "Gagal menambahkan kategori";
        throw new Error(message);
      }

      const data = await res.json();
      const newCategory: DrugCategoryItem | undefined = data?.category;

      toast.success("Kategori berhasil ditambahkan");
      setName("");

      await queryClient.invalidateQueries({ queryKey: ["drug-categories"] });

      if (newCategory) {
        onCategoryAdded?.(newCategory);
      }

      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Kategori Obat Baru</DialogTitle>
          <DialogDescription>
            Tambahkan kategori obat yang dapat dipilih saat menambahkan obat
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category_name">Nama Kategori</Label>
            <Input
              id="category_name"
              placeholder="Contoh: Vitamin, Antibiotik, dll"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
