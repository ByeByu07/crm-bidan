"use client";

import { useState } from "react";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { Textarea } from "@repo/ui/components/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { Card, CardContent } from "@repo/ui/components/card";
import { PatientCombobox } from "./PatientCombobox";
import { DrugCombobox } from "./DrugCombobox";
import { QuickAddPatientModal } from "./QuickAddPatientModal";
import type { Drug, Patient, PatientCondition } from "@repo/types";
import { formatCurrency } from "@repo/utils/format";
import { calculateSubtotal, calculateDurationDays } from "@repo/utils/calc";
import { Plus, Trash2 } from "lucide-react";

interface TransactionItem {
  id: string;
  drug: Drug | null;
  quantityDispense: number;
  pricePerDispense: number;
}

interface TransactionFormProps {
  patients: Patient[];
  drugs: Drug[];
  onSubmit: (data: {
    patient_id: string;
    purchase_date: string;
    patient_condition: PatientCondition;
    notes: string;
    items: Array<{
      drug_id: string;
      quantity_dispense: number;
      price_per_dispense: number;
    }>;
  }) => void;
  isSubmitting: boolean;
}

export function TransactionForm({
  patients,
  drugs,
  onSubmit,
  isSubmitting,
}: TransactionFormProps) {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [purchaseDate, setPurchaseDate] = useState<string>(() =>
    new Date().toISOString().split("T")[0]!
  );
  const [condition, setCondition] = useState<PatientCondition>("umum");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<TransactionItem[]>([
    { id: crypto.randomUUID(), drug: null, quantityDispense: 1, pricePerDispense: 0 },
  ]);
  const [showAddPatient, setShowAddPatient] = useState(false);

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
          next.pricePerDispense = updates.drug.sellPricePerDispense;
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
      <div className="space-y-2">
        <Label>Pasien</Label>
        <div className="flex gap-2">
          <div className="flex-1">
            <PatientCombobox
              patients={patients}
              selected={selectedPatient}
              onSelect={setSelectedPatient}
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setShowAddPatient(true)}
          >
            <Plus className="size-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="purchase_date">Tanggal Pembelian</Label>
        <Input
          id="purchase_date"
          type="date"
          value={purchaseDate}
          onChange={(e) => setPurchaseDate(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Kondisi Pasien</Label>
        <Select
          value={condition}
          onValueChange={(v) => setCondition(v as PatientCondition)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ibu_hamil">Ibu Hamil</SelectItem>
            <SelectItem value="ibu_menyusui">Ibu Menyusui</SelectItem>
            <SelectItem value="umum">Umum</SelectItem>
            <SelectItem value="lainnya">Lainnya</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Item Obat</Label>
          <Button type="button" variant="outline" size="sm" onClick={addItem}>
            <Plus className="mr-1 size-3" />
            Tambah
          </Button>
        </div>
        {items.map((item, idx) => (
          <Card key={item.id}>
            <CardContent className="space-y-3 p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Item {idx + 1}</span>
                {items.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => removeItem(item.id)}
                  >
                    <Trash2 className="size-3 text-destructive" />
                  </Button>
                )}
              </div>
              <DrugCombobox
                drugs={drugs}
                selected={item.drug}
                onSelect={(drug) => updateItem(item.id, { drug })}
              />
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Jumlah</Label>
                  <Input
                    type="number"
                    min={1}
                    value={item.quantityDispense}
                    onChange={(e) =>
                      updateItem(item.id, {
                        quantityDispense: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Harga Satuan</Label>
                  <Input
                    type="number"
                    min={0}
                    value={item.pricePerDispense}
                    onChange={(e) =>
                      updateItem(item.id, {
                        pricePerDispense: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>
              {item.drug && (
                <div className="text-xs text-muted-foreground">
                  Estimasi habis:{" "}
                  {calculateDurationDays(
                    item.quantityDispense,
                    item.drug.durationPerDispenseUnit
                  )}{" "}
                  hari
                </div>
              )}
              <div className="text-right text-sm font-semibold">
                Subtotal: {formatCurrency(calculateSubtotal(item.quantityDispense, item.pricePerDispense))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Catatan</Label>
        <Textarea
          id="notes"
          placeholder="Catatan tambahan..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <div className="flex items-center justify-between rounded-lg border p-4">
        <span className="font-semibold">Total</span>
        <span className="text-lg font-bold">{formatCurrency(totalPrice)}</span>
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting || !selectedPatient || items.some((i) => !i.drug)}
      >
        {isSubmitting ? "Menyimpan..." : "Simpan Transaksi"}
      </Button>

      <QuickAddPatientModal
        open={showAddPatient}
        onOpenChange={setShowAddPatient}
      />
    </form>
  );
}
