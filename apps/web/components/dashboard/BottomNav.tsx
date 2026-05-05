"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@repo/ui/lib/utils";
import {
  LayoutDashboard,
  Receipt,
  Bell,
  Pill,
} from "lucide-react";

const tabs = [
  { label: "Penjualan", href: "/sales", icon: LayoutDashboard },
  { label: "Transaksi", href: "/transactions/new", icon: Receipt },
  { label: "Notifikasi", href: "/notifications", icon: Bell },
  { label: "Obat", href: "/drugs", icon: Pill },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-md items-center justify-around">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href || pathname.startsWith(tab.href + "/");
          const Icon = tab.icon;
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
              <Icon
                className={cn(
                  "size-5 transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              />
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
