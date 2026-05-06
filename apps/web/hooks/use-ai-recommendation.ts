import { useQuery } from "@tanstack/react-query";

async function fetchRecommendation(patientId: string): Promise<string> {
  const res = await fetch("/api/ai/recommendation", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ patientId }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? "Failed to fetch AI recommendation");
  }

  if (!res.body) {
    throw new Error("No response body");
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let text = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    text += decoder.decode(value, { stream: true });
  }

  return text;
}

export function useAiRecommendation(patientId: string | undefined) {
  return useQuery<string>({
    queryKey: ["ai-recommendation", patientId],
    queryFn: () => fetchRecommendation(patientId!),
    enabled: !!patientId,
    staleTime: 1000 * 60 * 60 * 12, // 12 hours
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
  });
}
