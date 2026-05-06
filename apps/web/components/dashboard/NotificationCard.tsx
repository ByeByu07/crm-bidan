"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "@repo/ui/components/card";
import { Button } from "@repo/ui/components/button";
import type { NotificationLogItem } from "@repo/types";
import { formatPhoneE164 } from "@repo/utils/format";
import { AIRecommendation } from "./AIRecommendation";
import {
  Phone,
  CheckCircle,
  XCircle,
  HelpCircle,
} from "lucide-react";

interface NotificationCardProps {
  notification: NotificationLogItem;
  onSend?: (id: string) => void;
  onSetOutcome: (id: string, outcome: "bought" | "ignored" | "no_response") => void;
  sending?: boolean;
  settingOutcome?: boolean;
}

export function NotificationCard({
  notification,
  onSend,
  onSetOutcome,
  sending,
  settingOutcome,
}: NotificationCardProps) {
  const isScheduled = notification.status === "pending";
  const isSent = notification.status === "sent";
  // TODO: Re-enable when overdue feature implemented (see todo-history/2026-05-06-overdue-notification-pricing.md)
  // const isOverdue = new Date(notification.scheduledDate) < new Date();
  const router = useRouter();

  const waNumber = formatPhoneE164(notification.whatsappNumber).replace(/\D/g, "");
  const waLink = `https://wa.me/${waNumber}`;

  function handleWaClick() {
    if (onSend) {
      onSend(notification.id);
    }
    window.open(waLink, "_blank", "noopener,noreferrer");
  }

  function handleBuy() {
    router.push(
      `/transactions/new?patient_id=${notification.patientId}&notification_id=${notification.id}`
    );
  }

  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between">
          <div className="min-w-0">
            <p className="font-medium truncate">{notification.patientName}</p>
          </div>
          {/* TODO: Re-enable when overdue feature implemented
          {isOverdue && (
            <Badge variant="destructive" className="shrink-0 ml-2">
              Terlambat
            </Badge>
          )} */}
        </div>

        <AIRecommendation patientId={notification.patientId} />

        {isScheduled && (
          <Button
            className="w-full"
            onClick={handleWaClick}
            disabled={sending}
          >
            <Phone className="mr-2 size-4" />
            {sending ? "Membuka..." : "Hubungi WA"}
          </Button>
        )}

        {isSent && !notification.outcome && (
          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              className="w-full"
              onClick={handleBuy}
            >
              <CheckCircle className="mr-2 size-4 text-emerald-500" />
              Pasien Beli Obat
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => onSetOutcome(notification.id, "ignored")}
              disabled={settingOutcome}
            >
              <XCircle className="mr-2 size-4 text-rose-500" />
              Tidak Jadi Beli
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => onSetOutcome(notification.id, "no_response")}
              disabled={settingOutcome}
            >
              <HelpCircle className="mr-2 size-4 text-muted-foreground" />
              Belum Dihubungi
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
