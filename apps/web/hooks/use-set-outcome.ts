import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useSetOutcome() {
  const queryClient = useQueryClient();

  return useMutation<
    { success: boolean },
    Error,
    { id: string; outcome: "bought" | "ignored" | "no_response" }
  >({
    mutationFn: async ({ id, outcome }) => {
      const res = await fetch(`/api/notifications/${id}/outcome`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ outcome }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Failed to set outcome");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
