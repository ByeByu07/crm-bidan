"use client";

import { useState } from "react";
import { BottomSheet } from "@/components/design-system/BottomSheet";
import { toast } from "sonner";

interface RescheduleBottomSheetProps {
  open: boolean;
  onClose: () => void;
  itemName: string;
  patientName: string;
  maxDays: number;
  onReschedule: (date: Date) => void;
  onStop: () => void;
}

export function RescheduleBottomSheet({
  open,
  onClose,
  itemName,
  patientName,
  maxDays,
  onReschedule,
  onStop,
}: RescheduleBottomSheetProps) {
  const [customDate, setCustomDate] = useState("");

  function getDate(days: number): Date {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d;
  }

  function handleChip(days: number) {
    onReschedule(getDate(days));
    onClose();
  }

  function handleCustom() {
    if (!customDate) return;
    const d = new Date(customDate);
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + maxDays);
    if (d.getTime() > maxDate.getTime()) {
      toast.error(`Maksimal ${maxDays} hari dari sekarang`);
      return;
    }
    onReschedule(d);
    onClose();
  }

  const chips = [
    { label: "+3 hari", days: 3 },
    { label: "+5 hari", days: 5 },
    { label: "+7 hari", days: 7 },
  ].filter((c) => c.days <= maxDays);

  return (
    <BottomSheet open={open} onClose={onClose} title="Jadwal Ulang Follow-Up">
      <div className="space-y-4">
        <p className="c">
          {patientName} — {itemName}
        </p>

        <div className="flex gap-2 flex-wrap">
          {chips.map((chip) => (
            <button
              key={chip.days}
              type="button"
              className="pill on"
              onClick={() => handleChip(chip.days)}
            >
              {chip.label}
            </button>
          ))}
        </div>

        <div className="fg">
          <label className="fl">Pilih Tanggal Lain</label>
          <input
            type="date"
            className="fs fi"
            value={customDate}
            onChange={(e) => setCustomDate(e.target.value)}
            min={new Date().toLocaleDateString("en-CA")}
          />
          <button
            type="button"
            className="bg mt-2"
            onClick={handleCustom}
            disabled={!customDate}
          >
            Jadwalkan
          </button>
        </div>

        <div style={{ borderTop: "1px solid var(--bidan-border)", paddingTop: "16px" }}>
          <button
            type="button"
            className="bp"
            style={{ background: "#c62828" }}
            onClick={() => {
              onStop();
              onClose();
            }}
          >
            Hentikan Follow-Up
          </button>
          <p className="c" style={{ marginTop: "4px", fontSize: "12px" }}>
            Tidak ada pengingat lagi untuk item ini
          </p>
        </div>
      </div>
    </BottomSheet>
  );
}
