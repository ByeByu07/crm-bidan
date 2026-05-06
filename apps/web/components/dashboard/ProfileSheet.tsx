"use client";

import { useProfile } from "@/hooks/use-profile";
import { useOrganization } from "@/hooks/use-organization";
import { authClient } from "@repo/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/components/avatar";
import { Button } from "@repo/ui/components/button";
import { Skeleton } from "@repo/ui/components/skeleton";
import { ArrowLeft, LogOut, Building2, Mail } from "lucide-react";
import { cn } from "@repo/ui/lib/utils";

interface ProfileSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProfileSheet({ open, onOpenChange }: ProfileSheetProps) {
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: organization, isLoading: orgLoading } = useOrganization();

  async function handleLogout() {
    await authClient.signOut();
    window.location.href = "/signin";
  }

  const isLoading = profileLoading || orgLoading;

  const avatarSrc = organization?.logo || profile?.image || null;
  const initials = (organization?.name?.[0] || profile?.name?.[0] || "U").toUpperCase();

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/50 transition-opacity duration-200",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={() => onOpenChange(false)}
      />

      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 bg-background transition-transform duration-200 ease-out",
          "rounded-t-2xl shadow-xl",
          "flex flex-col",
          open ? "translate-y-0" : "translate-y-full"
        )}
        style={{ height: "100dvh" }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 border-b px-4 py-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="shrink-0 -ml-2"
          >
            <ArrowLeft className="size-5" />
          </Button>
          <h2 className="text-base font-semibold">Profil</h2>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-5">
          {isLoading ? (
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <Skeleton className="size-12 rounded-full" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-40" />
                </div>
              </div>
              <Skeleton className="h-20" />
            </div>
          ) : (
            <div className="space-y-5">
              {/* User Info */}
              <div className="flex items-center gap-3">
                <Avatar className="size-12">
                  <AvatarImage src={avatarSrc || undefined} />
                  <AvatarFallback className="text-base bg-primary/10 text-primary font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{profile?.name}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Mail className="size-3 shrink-0" />
                    <span className="truncate">{profile?.email}</span>
                  </div>
                </div>
              </div>

              {/* Organization Info */}
              <div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                  <Building2 className="size-3.5" />
                  <span>Informasi Klinik</span>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">{organization?.name || "-"}</p>
                  <p className="text-xs text-muted-foreground">@{organization?.slug || "-"}</p>
                </div>
              </div>

              {/* Logout */}
              <Button variant="outline" className="w-full text-destructive hover:text-destructive hover:bg-destructive/5" onClick={handleLogout}>
                <LogOut className="mr-2 size-4" />
                Keluar
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
