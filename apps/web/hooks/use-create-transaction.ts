import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Transaction } from "@repo/types";

interface CreateTransactionInput {
  patient_id: string;
  purchase_date: string;
  patient_condition?: string | null;
  notes?: string | null;
  items: Array<{
    drug_id: string;
    quantity_dispense: number;
    price_per_dispense: number;
  }>;
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation<{ transaction: Transaction }, Error, CreateTransactionInput>({
    mutationFn: async (input) => {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Failed to create transaction");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
