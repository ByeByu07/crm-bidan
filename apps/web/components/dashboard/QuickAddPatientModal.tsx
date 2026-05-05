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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Pasien Baru</DialogTitle>
          <DialogDescription>
            Tambahkan pasien baru dengan cepat
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="patient_name">Nama</Label>
            <Input
              id="patient_name"
              placeholder="Nama pasien"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="patient_wa">Nomor WhatsApp</Label>
            <Input
              id="patient_wa"
              placeholder="08123456789"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
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
