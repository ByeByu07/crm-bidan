import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useSendNotification() {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean }, Error, { id: string }>({
    mutationFn: async ({ id }) => {
      const res = await fetch(`/api/notifications/${id}/send`, {
        method: "PATCH",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Failed to send notification");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
