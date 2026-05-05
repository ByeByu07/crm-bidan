import { useQuery } from "@tanstack/react-query";
import type { NotificationQueue } from "@repo/types";

export function useNotifications() {
  return useQuery<NotificationQueue>({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard/notifications");
      if (!res.ok) throw new Error("Failed to fetch notifications");
      return res.json();
    },
  });
}
