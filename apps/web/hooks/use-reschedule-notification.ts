import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { NotificationLog } from "@repo/types";

export function useRescheduleNotification() {
  const queryClient = useQueryClient();

  return useMutation<
    { notification: NotificationLog },
    Error,
    { id: string; scheduled_date: string }
  >({
    mutationFn: async ({ id, scheduled_date }) => {
      const res = await fetch(`/api/notifications/${id}/reschedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scheduled_date }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Failed to reschedule notification");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
