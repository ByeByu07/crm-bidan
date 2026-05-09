"use client";

import { useState } from "react";
import { useProfile } from "@/hooks/use-profile";
import { useOrganization } from "@/hooks/use-organization";
import { ProfileSheet } from "./ProfileSheet";
import { Skeleton } from "@repo/ui/components/skeleton";

interface AvatarButtonProps {
  className?: string;
}

export function AvatarButton({ className }: AvatarButtonProps) {
  const [open, setOpen] = useState(false);
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: organization, isLoading: orgLoading } = useOrganization();

  const isLoading = profileLoading || orgLoading;

  const initials = (organization?.name?.[0] || profile?.name?.[0] || "U").toUpperCase();

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`av ${className ?? ""}`}
        aria-label="Buka profil"
      >
        {isLoading ? (
          <Skeleton className="size-10 rounded-full" />
        ) : (
          initials
        )}
      </button>

      <ProfileSheet open={open} onOpenChange={setOpen} />
    </>
  );
}
