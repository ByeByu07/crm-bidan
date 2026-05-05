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
import type { Condition } from "@repo/types";

interface QuickAddConditionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConditionAdded?: (condition: Condition) => void;
}

export function QuickAddConditionModal({
  open,
  onOpenChange,
  onConditionAdded,
}: QuickAddConditionModalProps) {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/conditions", {
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
              : "Gagal menambahkan kondisi";
        throw new Error(message);
      }

      const data = await res.json();
      const newCondition: Condition | undefined = data?.condition;

      toast.success("Kondisi berhasil ditambahkan");
      setName("");

      await queryClient.invalidateQueries({ queryKey: ["conditions"] });

      if (newCondition) {
        onConditionAdded?.(newCondition);
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
          <DialogTitle>Tambah Kondisi Baru</DialogTitle>
          <DialogDescription>
            Tambahkan kondisi pasien yang dapat dipilih saat transaksi
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="condition_name">Nama Kondisi</Label>
            <Input
              id="condition_name"
              placeholder="Contoh: Ibu Hamil, Diabetes, dll"
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
