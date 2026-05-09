"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Input } from "@repo/ui/components/input";
import { toast } from "sonner";
import { BottomSheet } from "@/components/design-system/BottomSheet";
import type { Patient } from "@repo/types";

interface QuickAddPatientModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPatientAdded?: (patient: Patient) => void;
}

export function QuickAddPatientModal({
  open,
  onOpenChange,
  onPatientAdded,
}: QuickAddPatientModalProps) {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, whatsapp_number: whatsappNumber }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const message =
          typeof err.error === "string"
            ? err.error
            : typeof err.message === "string"
              ? err.message
              : "Gagal menambahkan pasien";
        throw new Error(message);
      }

      const data = await res.json();
      const newPatient: Patient | undefined = data?.patient;

      toast.success("Pasien berhasil ditambahkan");
      setName("");
      setWhatsappNumber("");

      await queryClient.invalidateQueries({ queryKey: ["patients"] });

      if (newPatient) {
        onPatientAdded?.(newPatient);
      }

      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <BottomSheet open={open} onClose={() => onOpenChange(false)} title="Tambah Pasien Baru">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="fg">
          <label className="fl">Nama</label>
          <Input
            id="patient_name"
            placeholder="Nama pasien"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="fi"
          />
        </div>
        <div className="fg">
          <label className="fl">Nomor WhatsApp</label>
          <Input
            id="patient_wa"
            placeholder="08123456789"
            value={whatsappNumber}
            onChange={(e) => setWhatsappNumber(e.target.value)}
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
