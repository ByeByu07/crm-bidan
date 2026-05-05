import { useQuery } from "@tanstack/react-query";
import type { PatientTransactionHistory } from "@repo/types";

export function usePatientTransactions(patientId: string | undefined) {
  return useQuery<{
    transactions: PatientTransactionHistory[];
  }>({
    queryKey: ["patient-transactions", patientId],
    queryFn: async () => {
      if (!patientId) throw new Error("Patient ID required");
      const res = await fetch(`/api/patients/${patientId}/transactions`);
      if (!res.ok) throw new Error("Failed to fetch patient transactions");
      return res.json();
    },
    enabled: !!patientId,
  });
}
