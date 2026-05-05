"use client";

import { useState, useEffect } from "react";
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
  const [organization, setOrganization] = useState<ActiveOrganization | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    authClient.organization.getFullOrganization()
      .then(({ data }) => {
        if (data) {
          setOrganization({
            id: data.id,
            name: data.name,
            slug: data.slug,
            logo: data.logo || null,
            metadata: data.metadata || null,
            createdAt: new Date(data.createdAt),
          });
        }
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });
  }, []);

  return { organization, isLoading };
}
