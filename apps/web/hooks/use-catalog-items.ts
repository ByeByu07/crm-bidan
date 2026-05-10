import { useQuery } from "@tanstack/react-query";
import type { CatalogItem } from "@repo/types";

export function useCatalogItems() {
  return useQuery<{ items: CatalogItem[] }>({
    queryKey: ["catalog-items"],
    queryFn: async () => {
      const res = await fetch("/api/catalog");
      if (!res.ok) throw new Error("Failed to fetch catalog items");
      return res.json();
    },
  });
}
