"use client";

import { useState, useMemo } from "react";
import { NotificationCard } from "@/components/dashboard/NotificationCard";
import { useNotifications } from "@/hooks/use-notifications";
import { useSendNotification } from "@/hooks/use-send-notification";
import { useSetOutcome } from "@/hooks/use-set-outcome";
import { Skeleton } from "@repo/ui/components/skeleton";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { toast } from "sonner";

export default function NotificationsPage() {
  const { data, isLoading } = useNotifications();
  const sendNotification = useSendNotification();
  const setOutcome = useSetOutcome();
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [outcomeId, setOutcomeId] = useState<string | null>(null);

  const items = useMemo(() => {
    if (!data) return [];
    const all = [...data.scheduled, ...data.sentPending];
    return all.sort(
      (a, b) =>
        new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()
    );
  }, [data]);

  function handleSend(id: string) {
    setSendingId(id);
    sendNotification.mutate(
      { id },
      {
        onSuccess: () => {
          toast.success("Notifikasi terkirim");
        },
        onError: (err) => {
          toast.error(err.message);
        },
        onSettled: () => setSendingId(null),
      }
    );
  }

  function handleSetOutcome(
    id: string,
    outcome: "bought" | "ignored" | "no_response"
  ) {
    setOutcomeId(id);
    setOutcome.mutate(
      { id, outcome },
      {
        onSuccess: () => {
          toast.success("Status diperbarui");
        },
        onError: (err) => {
          toast.error(err.message);
        },
        onSettled: () => setOutcomeId(null),
      }
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Perlu Dihubungi</h1>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon="bell"
          title="Tidak ada notifikasi"
          description="Semua pasien sudah ditangani"
        />
      ) : (
        <div className="space-y-3">
          {items.map((n) => (
            <NotificationCard
              key={n.id}
              notification={n}
              onSend={n.status === "scheduled" ? handleSend : undefined}
              onSetOutcome={handleSetOutcome}
              sending={sendingId === n.id}
              settingOutcome={outcomeId === n.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
