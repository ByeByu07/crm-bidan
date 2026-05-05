import { useQuery } from "@tanstack/react-query";
import type { DrugCategoryItem } from "@repo/types";

export function useDrugCategories() {
  return useQuery<{ categories: DrugCategoryItem[] }>({
    queryKey: ["drug-categories"],
    queryFn: async () => {
      const res = await fetch("/api/drug-categories");
      if (!res.ok) throw new Error("Failed to fetch drug categories");
      return res.json();
    },
  });
}
