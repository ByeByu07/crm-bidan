"use client";

import { useEffect } from "react";

export function PushTokenProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    (window as any).onExpoPushTokenReceived = async (token: string) => {
      try {
        const res = await fetch("/api/push-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        if (!res.ok) {
          console.error("Failed to register push token:", await res.text());
        }
      } catch (err) {
        console.error("Push token registration error:", err);
      }
    };
  }, []);

  return <>{children}</>;
}
