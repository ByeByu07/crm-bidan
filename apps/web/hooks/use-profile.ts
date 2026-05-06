"use client";

import { useQuery } from "@tanstack/react-query";
import { authClient } from "@repo/auth";

export interface Profile {
  id: string;
  name: string;
  email: string;
  image?: string | null;
}

export function useProfile() {
  return useQuery<Profile | null>({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data } = await authClient.getSession();
      if (!data?.user) return null;
      return {
        id: data.user.id,
        name: data.user.name || "",
        email: data.user.email || "",
        image: data.user.image,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}
