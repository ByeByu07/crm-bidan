"use client";

import { useState, useMemo } from "react";
import { NotificationCard } from "@/components/dashboard/NotificationCard";
import { useNotifications } from "@/hooks/use-notifications";
import { useSendNotification } from "@/hooks/use-send-notification";
import { useSetOutcome } from "@/hooks/use-set-outcome";
import { Skeleton } from "@repo/ui/components/skeleton";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { Pills } from "@/components/design-system/Pills";
import { toast } from "sonner";

const filters = ["Semua", "Belum Dikirim", "Sudah Dikirim"];

export default function NotificationsPage() {
  const { data, isLoading } = useNotifications();
  const sendNotification = useSendNotification();
  const setOutcome = useSetOutcome();
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [outcomeId, setOutcomeId] = useState<string | null>(null);
  const [filter, setFilter] = useState("Semua");

  const items = useMemo(() => {
    if (!data) return [];
    const all = [...data.scheduled, ...data.sentPending];
    return all.sort(
      (a, b) =>
        new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()
    );
  }, [data]);

  const filteredItems = useMemo(() => {
    if (filter === "Belum Dikirim") return items.filter((n) => n.status === "pending");
    if (filter === "Sudah Dikirim") return items.filter((n) => n.status === "sent");
    return items;
  }, [items, filter]);

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

  const pendingCount = items.filter((n) => n.status === "pending").length;

  return (
    <div className="space-y-4">
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
        <h1 className="t">Notifikasi</h1>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            minWidth: "22px",
            height: "22px",
            padding: "0 7px",
            borderRadius: "9999px",
            background: "var(--bidan-accent)",
            color: "#fff",
            fontSize: "12px",
            fontWeight: 600,
          }}
        >
          {pendingCount}
        </span>
      </header>

      <Pills options={filters} active={filter} onChange={setFilter} />

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-32 rounded-[14px]" />
          <Skeleton className="h-32 rounded-[14px]" />
          <Skeleton className="h-32 rounded-[14px]" />
        </div>
      ) : filteredItems.length === 0 ? (
        <EmptyState
          icon="bell"
          title="Tidak ada notifikasi"
          description="Semua pasien sudah ditangani"
        />
      ) : (
        <div className="space-y-3">
          {filteredItems.map((n) => (
            <NotificationCard
              key={n.id}
              notification={n}
              onSend={n.status === "pending" ? handleSend : undefined}
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
