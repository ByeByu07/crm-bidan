"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Input } from "@repo/ui/components/input";
import { toast } from "sonner";
import { BottomSheet } from "@/components/design-system/BottomSheet";
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
    <BottomSheet open={open} onClose={() => onOpenChange(false)} title="Tambah Kondisi Baru">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="fg">
          <label className="fl">Nama Kondisi</label>
          <Input
            id="condition_name"
            placeholder="Contoh: Ibu Hamil, Diabetes, dll"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="fi"
          />
        </div>
        <button type="submit" className="bp" disabled={loading}>
          {loading ? "Menyimpan..." : "Simpan"}
        </button>
      </form>
    </BottomSheet>
  );
}
