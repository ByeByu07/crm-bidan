"use client";

import { useProfile } from "@/hooks/use-profile";
import { useOrganization } from "@/hooks/use-organization";
import { authClient } from "@repo/auth";
import { Skeleton } from "@repo/ui/components/skeleton";

interface ProfileSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function IBack() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function IBuilding() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21h18" />
      <path d="M5 21V7l8-4 8 4v14" />
      <path d="M9 21v-6h6v6" />
    </svg>
  );
}

function IMail() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

function ILogout() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

export function ProfileSheet({ open, onOpenChange }: ProfileSheetProps) {
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: organization, isLoading: orgLoading } = useOrganization();

  async function handleLogout() {
    await authClient.signOut();
    window.location.href = "/signin";
  }

  const isLoading = profileLoading || orgLoading;
  const initials = (organization?.name?.[0] || profile?.name?.[0] || "U").toUpperCase();

  return (
    <>
      <div className={`pso ${open ? "open" : ""}`} onClick={() => onOpenChange(false)} />
      <div className={`ps ${open ? "open" : ""}`}>
        <div className="psh">
          <button className="cl" onClick={() => onOpenChange(false)}>
            <IBack />
          </button>
          <h2 className="h" style={{ fontSize: "16px" }}>Profil</h2>
        </div>
        <div className="psc">
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
              <div className="flex items-center gap-3">
                <div className="av" style={{ width: "48px", height: "48px", fontSize: "18px" }}>
                  {initials}
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontWeight: 600, fontSize: "14px" }}>{profile?.name}</p>
                  <p className="c" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <IMail /> {profile?.email}
                  </p>
                </div>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <p className="c" style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "8px" }}>
                  <IBuilding /> Informasi Klinik
                </p>
                <p className="h" style={{ fontSize: "14px" }}>{organization?.name || "-"}</p>
                <p className="c">@{organization?.slug || "-"}</p>
              </div>

              <button className="bg" style={{ color: "#c62828" }} onClick={handleLogout}>
                <ILogout /> Keluar
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
