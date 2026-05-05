import { useQuery } from "@tanstack/react-query";
import type { Patient } from "@repo/types";

export function usePatients(search: string = "") {
  return useQuery<{ patients: Patient[] }>({
    queryKey: ["patients", search],
    queryFn: async () => {
      const res = await fetch(`/api/patients?q=${encodeURIComponent(search)}`);
      if (!res.ok) throw new Error("Failed to fetch patients");
      return res.json();
    },
  });
}
