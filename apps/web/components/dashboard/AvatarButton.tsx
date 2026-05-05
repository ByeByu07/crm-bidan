"use client";

import { useState, useEffect } from "react";
import { authClient } from "@repo/auth";
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
  const { organization, isLoading: orgLoading } = useOrganization();
  const [user, setUser] = useState<{ name: string; image?: string | null } | null>(null);
  const [userLoading, setUserLoading] = useState(true);

  useEffect(() => {
    authClient.getSession().then(({ data }) => {
      if (data?.user) {
        setUser({
          name: data.user.name || "",
          image: data.user.image,
        });
      }
      setUserLoading(false);
    });
  }, []);

  const isLoading = userLoading || orgLoading;

  // Priority: org logo → user image → initials
  const avatarSrc = organization?.logo || user?.image || null;
  const initials = (organization?.name?.[0] || user?.name?.[0] || "U").toUpperCase();

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
            <AvatarImage src={avatarSrc || undefined} alt={user?.name || "User"} />
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
