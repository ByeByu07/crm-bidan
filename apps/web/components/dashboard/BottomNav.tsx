"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@repo/ui/lib/utils";
import {
  LayoutDashboard,
  Receipt,
  Bell,
  Pill,
  User,
} from "lucide-react";
import { useNotifications } from "@/hooks/use-notifications";

const tabs = [
  { label: "Penjualan", href: "/sales", icon: LayoutDashboard, badgeKey: null as string | null },
  { label: "Transaksi", href: "/transactions/new", icon: Receipt, badgeKey: null as string | null },
  { label: "Notifikasi", href: "/notifications", icon: Bell, badgeKey: "notifications" as string | null },
  { label: "Obat", href: "/drugs", icon: Pill, badgeKey: null as string | null },
  { label: "Profil", href: "/profile", icon: User, badgeKey: null as string | null },
];

export function BottomNav() {
  const pathname = usePathname();
  const { data: notificationsData } = useNotifications();

  const badgeCount = notificationsData
    ? notificationsData.today + notificationsData.overdue
    : 0;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-md items-center justify-around">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href || pathname.startsWith(tab.href + "/");
          const Icon = tab.icon;
          const showBadge = tab.badgeKey === "notifications" && badgeCount > 0 && !isActive;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "relative flex flex-col items-center justify-center gap-1 px-4 py-3 min-h-[56px] min-w-[64px] text-xs font-medium transition-colors rounded-lg",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className="relative">
                <Icon
                  className={cn(
                    "size-5 transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                />
                {showBadge && (
                  <span className="absolute -right-2 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
                    {badgeCount > 99 ? "99+" : badgeCount}
                  </span>
                )}
              </div>
              <span>{tab.label}</span>
              {isActive && (
                <span className="absolute bottom-1 h-1 w-6 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
