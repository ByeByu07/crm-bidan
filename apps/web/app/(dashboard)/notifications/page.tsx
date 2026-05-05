"use client";

import { useState } from "react";
import { NotificationCard } from "@/components/dashboard/NotificationCard";
import { useNotifications } from "@/hooks/use-notifications";
import { useSendNotification } from "@/hooks/use-send-notification";
import { useSetOutcome } from "@/hooks/use-set-outcome";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@repo/ui/components/tabs";
import { Skeleton } from "@repo/ui/components/skeleton";
import { toast } from "sonner";

export default function NotificationsPage() {
  const { data, isLoading } = useNotifications();
  const sendNotification = useSendNotification();
  const setOutcome = useSetOutcome();
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [outcomeId, setOutcomeId] = useState<string | null>(null);

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
      <h1 className="text-xl font-bold">Notifikasi</h1>

      {isLoading ? (
        <div className="grid grid-cols-3 gap-2">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-lg border p-3 text-center">
            <p className="text-2xl font-bold">{data?.today ?? 0}</p>
            <p className="text-xs text-muted-foreground">Hari Ini</p>
          </div>
          <div className="rounded-lg border p-3 text-center">
            <p className="text-2xl font-bold text-destructive">{data?.overdue ?? 0}</p>
            <p className="text-xs text-muted-foreground">Terlambat</p>
          </div>
          <div className="rounded-lg border p-3 text-center">
            <p className="text-2xl font-bold">{data?.thisWeek ?? 0}</p>
            <p className="text-xs text-muted-foreground">Minggu Ini</p>
          </div>
        </div>
      )}

      <Tabs defaultValue="scheduled">
        <TabsList className="w-full">
          <TabsTrigger value="scheduled" className="flex-1">
            Menunggu
          </TabsTrigger>
          <TabsTrigger value="sent" className="flex-1">
            Terkirim
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex-1">
            Selesai
          </TabsTrigger>
        </TabsList>

        <TabsContent value="scheduled" className="mt-4 space-y-3">
          {isLoading ? (
            <Skeleton className="h-32" />
          ) : data?.scheduled.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground">
              Tidak ada notifikasi menunggu
            </p>
          ) : (
            data?.scheduled.map((n) => (
              <NotificationCard
                key={n.id}
                notification={n}
                onSend={handleSend}
                onSetOutcome={handleSetOutcome}
                sending={sendingId === n.id}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="sent" className="mt-4 space-y-3">
          {isLoading ? (
            <Skeleton className="h-32" />
          ) : data?.sentPending.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground">
              Tidak ada notifikasi terkirim menunggu respon
            </p>
          ) : (
            data?.sentPending.map((n) => (
              <NotificationCard
                key={n.id}
                notification={n}
                onSend={handleSend}
                onSetOutcome={handleSetOutcome}
                settingOutcome={outcomeId === n.id}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-4 space-y-3">
          {isLoading ? (
            <Skeleton className="h-32" />
          ) : data?.completedToday.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground">
              Tidak ada notifikasi selesai hari ini
            </p>
          ) : (
            data?.completedToday.map((n) => (
              <NotificationCard
                key={n.id}
                notification={n}
                onSend={handleSend}
                onSetOutcome={handleSetOutcome}
              />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
