"use client";

import { useState } from "react";
import { Streamdown } from "streamdown";
import { useAiRecommendation } from "@/hooks/use-ai-recommendation";
import { usePatientTransactions } from "@/hooks/use-patient-transactions";
import { Skeleton } from "@repo/ui/components/skeleton";
import { formatDate } from "@repo/utils/date";
import { formatCurrency } from "@repo/utils/format";
import { Sparkles, ChevronDown, ChevronUp } from "lucide-react";

interface AIRecommendationProps {
  patientId: string;
}

export function AIRecommendation({ patientId }: AIRecommendationProps) {
  const [expanded, setExpanded] = useState(false);

  const {
    data: aiText,
    isLoading: aiLoading,
    error: aiError,
  } = useAiRecommendation(expanded ? patientId : undefined);

  const {
    data: historyData,
    isLoading: historyLoading,
  } = usePatientTransactions(expanded ? patientId : undefined);

  const latestTxs = historyData?.transactions ?? [];

  const isLoading = aiLoading || historyLoading;

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between rounded-md border px-3 py-2 text-sm hover:bg-muted/50 transition-colors"
      >
        <span className="flex items-center gap-2 text-muted-foreground">
          <Sparkles className="size-4 text-amber-500" />
          Rekomendasi AI
        </span>
        {expanded ? (
          <ChevronUp className="size-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="size-4 text-muted-foreground" />
        )}
      </button>

      {expanded && (
        <div className="rounded-md border bg-card p-3 space-y-3">
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
            </div>
          ) : aiError ? (
            <p className="text-xs text-destructive">
              Gagal memuat rekomendasi AI. Silakan coba lagi.
            </p>
          ) : (
            <>
              {/* AI Insight */}
              <div className="text-sm prose prose-sm max-w-none">
                <Streamdown>{aiText ?? ""}</Streamdown>
              </div>

              {/* Divider + History */}
              {latestTxs.length > 0 && (
                <>
                  <div className="border-t" />
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">
                      Riwayat 3 Transaksi Terakhir
                    </p>
                    {latestTxs.map((tx) => (
                      <div
                        key={tx.transactionId}
                        className="flex items-start justify-between text-xs"
                      >
                        <div className="space-y-0.5">
                          <p className="font-medium">
                            {formatDate(tx.purchaseDate)}
                          </p>
                          <div className="text-muted-foreground">
                            {tx.items.map((item, idx) => (
                              <span key={idx}>
                                {idx > 0 && ", "}
                                {item.drugName} x{item.quantityDispense}
                              </span>
                            ))}
                          </div>
                        </div>
                        <span className="font-semibold shrink-0 ml-2">
                          {formatCurrency(tx.totalPrice)}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
