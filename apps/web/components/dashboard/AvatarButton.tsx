"use client";

import { useState } from "react";
import { useProfile } from "@/hooks/use-profile";
import { useOrganization } from "@/hooks/use-organization";
import { ProfileSheet } from "./ProfileSheet";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/components/avatar";
import { Skeleton } from "@repo/ui/components/skeleton";
import { cn } from "@repo/ui/lib/utils";

interface AvatarButtonProps {
  className?: string;
}

export function AvatarButton({ className }: AvatarButtonProps) {
  const [open, setOpen] = useState(false);
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: organization, isLoading: orgLoading } = useOrganization();

  const isLoading = profileLoading || orgLoading;

  // Priority: org logo → user image → initials
  const avatarSrc = organization?.logo || profile?.image || null;
  const initials = (organization?.name?.[0] || profile?.name?.[0] || "U").toUpperCase();

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "relative shrink-0 rounded-full border-2 border-border transition-all",
          "hover:ring-2 hover:ring-primary/50 hover:ring-offset-2 hover:ring-offset-background",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
          className
        )}
        aria-label="Buka profil"
      >
        {isLoading ? (
          <Skeleton className="size-9 rounded-full" />
        ) : (
          <Avatar className="size-9">
            <AvatarImage src={avatarSrc || undefined} alt={profile?.name || "User"} />
            <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
        )}
      </button>

      <ProfileSheet open={open} onOpenChange={setOpen} />
    </>
  );
}
