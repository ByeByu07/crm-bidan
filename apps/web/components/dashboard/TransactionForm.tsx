"use client";

import { useState, useEffect } from "react";
import { Input } from "@repo/ui/components/input";
import { Textarea } from "@repo/ui/components/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { PatientCombobox } from "./PatientCombobox";
import { DrugCombobox } from "./DrugCombobox";
import { QuickAddPatientModal } from "./QuickAddPatientModal";
import { QuickAddConditionModal } from "./QuickAddConditionModal";
import { CurrencyInput } from "./CurrencyInput";
import { Stepper } from "@/components/design-system/Stepper";
import type { Drug, Patient, Condition } from "@repo/types";
import { formatCurrency } from "@repo/utils/format";
import { calculateSubtotal, calculateDurationDays } from "@repo/utils/calc";
import { CalendarIcon, Trash2 } from "lucide-react";
import { Calendar } from "@repo/ui/components/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@repo/ui/components/popover";
import { formatDate } from "@repo/utils/date";

interface TransactionItem {
  id: string;
  drug: Drug | null;
  quantityDispense: number;
  pricePerDispense: number;
}

interface TransactionFormProps {
  patients: Patient[];
  drugs: Drug[];
  conditions: Condition[];
  preselectedPatientId?: string;
  onSubmit: (data: {
    patient_id: string;
    purchase_date: string;
    patient_condition: string;
    notes: string;
    items: Array<{
      drug_id: string;
      quantity_dispense: number;
      price_per_dispense: number;
    }>;
  }) => void;
  isSubmitting: boolean;
}

function IPlus() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

export function TransactionForm({
  patients,
  drugs,
  conditions,
  preselectedPatientId,
  onSubmit,
  isSubmitting,
}: TransactionFormProps) {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [purchaseDate, setPurchaseDate] = useState<string>(() =>
    new Date().toISOString().split("T")[0]!
  );
  const [condition, setCondition] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<TransactionItem[]>([
    { id: crypto.randomUUID(), drug: null, quantityDispense: 1, pricePerDispense: 0 },
  ]);
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [showAddCondition, setShowAddCondition] = useState(false);

  useEffect(() => {
    if (preselectedPatientId && patients.length > 0) {
      const found = patients.find((p) => p.id === preselectedPatientId);
      if (found) {
        setSelectedPatient(found);
      }
    }
  }, [preselectedPatientId, patients]);

  function addItem() {
    setItems((prev) => [
      ...prev,
      { id: crypto.randomUUID(), drug: null, quantityDispense: 1, pricePerDispense: 0 },
    ]);
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  function updateItem(id: string, updates: Partial<TransactionItem>) {
    setItems((prev) =>
      prev.map((i) => {
        if (i.id !== id) return i;
        const next = { ...i, ...updates };
        if (updates.drug) {
          next.pricePerDispense = Number(updates.drug.sellPricePerDispense);
        }
        return next;
      })
    );
  }

  const totalPrice = items.reduce(
    (sum, item) =>
      sum + calculateSubtotal(item.quantityDispense, item.pricePerDispense),
    0
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedPatient) return;
    if (items.some((i) => !i.drug)) return;

    onSubmit({
      patient_id: selectedPatient.id,
      purchase_date: purchaseDate,
      patient_condition: condition,
      notes,
      items: items.map((i) => ({
        drug_id: i.drug!.id,
        quantity_dispense: i.quantityDispense,
        price_per_dispense: i.pricePerDispense,
      })),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="fg">
        <label className="fl">Pasien</label>
        <div className="flex gap-2">
          <div className="flex-1">
            <PatientCombobox
              patients={patients}
              selected={selectedPatient}
              onSelect={setSelectedPatient}
            />
          </div>
          <button
            type="button"
            className="cl"
            style={{ width: "44px", height: "44px" }}
            onClick={() => setShowAddPatient(true)}
          >
            <IPlus />
          </button>
        </div>
      </div>

      <div className="fg">
        <label className="fl">Kondisi Pasien</label>
        <div className="flex gap-2">
          <div className="flex-1">
            <Select value={condition} onValueChange={(v) => setCondition(v)}>
              <SelectTrigger className="fi" style={{ height: "44px" }}>
                <SelectValue placeholder="Pilih kondisi..." />
              </SelectTrigger>
              <SelectContent>
                {conditions.map((c) => (
                  <SelectItem key={c.id} value={c.name}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <button
            type="button"
            className="cl"
            style={{ width: "44px", height: "44px" }}
            onClick={() => setShowAddCondition(true)}
          >
            <IPlus />
          </button>
        </div>
        {conditions.length === 0 && (
          <p className="c">Belum ada kondisi. Klik + untuk menambahkan.</p>
        )}
      </div>

      <div className="fg">
        <label className="fl">Tanggal Pembelian</label>
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="fi"
              style={{ display: "flex", alignItems: "center", gap: "8px", textAlign: "left" }}
            >
              <CalendarIcon className="size-4" />
              {purchaseDate ? (
                formatDate(purchaseDate, "dd MMM yyyy")
              ) : (
                <span style={{ color: "var(--bidan-muted)" }}>Pilih tanggal</span>
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={purchaseDate ? new Date(purchaseDate) : undefined}
              onSelect={(date) => {
                if (!date) {
                  setPurchaseDate("");
                  return;
                }
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, "0");
                const day = String(date.getDate()).padStart(2, "0");
                setPurchaseDate(`${year}-${month}-${day}`);
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div style={{ marginBottom: "16px" }}>
        <label className="fl">Item Obat</label>
        {items.map((item, idx) => (
          <div key={item.id} className="card" style={{ padding: "12px", marginBottom: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
              <span className="c">Item {idx + 1}</span>
              {items.length > 1 && (
                <button
                  type="button"
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#c62828", padding: 0 }}
                  onClick={() => removeItem(item.id)}
                >
                  <Trash2 className="size-4" />
                </button>
              )}
            </div>
            <div className="fg">
              <DrugCombobox
                drugs={drugs}
                selected={item.drug}
                onSelect={(drug) => updateItem(item.id, { drug })}
              />
            </div>
            <div className="fg">
              <label className="fl">Harga Satuan</label>
              <CurrencyInput
                value={item.pricePerDispense}
                onChange={(v) => updateItem(item.id, { pricePerDispense: v })}
                placeholder="0"
              />
            </div>
            <div className="fg">
              <label className="fl">Jumlah</label>
              <Stepper
                value={item.quantityDispense}
                onChange={(v) => updateItem(item.id, { quantityDispense: v })}
                min={1}
              />
            </div>
            {item.drug && (
              <p className="c">
                Estimasi habis:{" "}
                {calculateDurationDays(
                  item.quantityDispense,
                  item.drug.durationPerDispenseUnit
                )}{" "}
                hari
              </p>
            )}
            <p className="c" style={{ textAlign: "right", marginTop: "8px" }}>
              Subtotal: {formatCurrency(calculateSubtotal(item.quantityDispense, item.pricePerDispense))}
            </p>
          </div>
        ))}
        <button type="button" className="btn-add-item" onClick={addItem}>
          <IPlus /> Tambah Item Obat
        </button>
      </div>

      <div className="fg">
        <label className="fl">Catatan</label>
        <Textarea
          id="notes"
          placeholder="Catatan tambahan..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="fi"
          rows={3}
        />
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px",
          border: "1px solid var(--bidan-border)",
          borderRadius: "10px",
          marginBottom: "16px",
        }}
      >
        <span className="h">Total</span>
        <span className="d" style={{ fontSize: "18px" }}>
          {formatCurrency(totalPrice)}
        </span>
      </div>

      <button
        type="submit"
        className="bp"
        disabled={isSubmitting || !selectedPatient || !condition || items.some((i) => !i.drug)}
      >
        {isSubmitting ? "Menyimpan..." : "Simpan Transaksi"}
      </button>

      <QuickAddPatientModal
        open={showAddPatient}
        onOpenChange={setShowAddPatient}
        onPatientAdded={(patient) => setSelectedPatient(patient)}
      />

      <QuickAddConditionModal
        open={showAddCondition}
        onOpenChange={setShowAddCondition}
        onConditionAdded={(c) => setCondition(c.name)}
      />
    </form>
  );
}
