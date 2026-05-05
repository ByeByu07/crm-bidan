import { useQuery } from "@tanstack/react-query";
import type { Drug } from "@repo/types";

export function useDrugs() {
  return useQuery<{ drugs: Drug[] }>({
    queryKey: ["drugs"],
    queryFn: async () => {
      const res = await fetch("/api/drugs");
      if (!res.ok) throw new Error("Failed to fetch drugs");
      return res.json();
    },
  });
}
