import { useQuery } from "@tanstack/react-query";
import type { Condition } from "@repo/types";

export function useConditions() {
  return useQuery<{ conditions: Condition[] }>({
    queryKey: ["conditions"],
    queryFn: async () => {
      const res = await fetch("/api/conditions");
      if (!res.ok) throw new Error("Failed to fetch conditions");
      return res.json();
    },
  });
}
