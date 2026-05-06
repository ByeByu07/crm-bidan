"use client";

import { useQuery } from "@tanstack/react-query";
import { authClient } from "@repo/auth";

interface ActiveOrganization {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
}

export function useOrganization() {
  return useQuery<ActiveOrganization | null>({
    queryKey: ["organization"],
    queryFn: async () => {
      const { data } = await authClient.organization.getFullOrganization();
      if (!data) return null;
      return {
        id: data.id,
        name: data.name,
        slug: data.slug,
        logo: data.logo || null,
        metadata: data.metadata || null,
        createdAt: new Date(data.createdAt),
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}
