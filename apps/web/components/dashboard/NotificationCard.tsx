"use client";

import { Card, CardContent } from "@repo/ui/components/card";
import { Button } from "@repo/ui/components/button";
import { Badge } from "@repo/ui/components/badge";
import type { NotificationLogItem } from "@repo/types";
import { formatDate } from "@repo/utils/date";
import { formatPhoneE164 } from "@repo/utils/format";
import { Phone, CheckCircle, XCircle, HelpCircle } from "lucide-react";

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
  const isScheduled = notification.status === "scheduled";
  const isSent = notification.status === "sent";
  const isOverdue = new Date(notification.scheduledDate) < new Date();

  const waNumber = formatPhoneE164(notification.whatsappNumber).replace(/\D/g, "");
  const waLink = `https://wa.me/${waNumber}`;

  function handleWaClick() {
    if (onSend) {
      onSend(notification.id);
    }
    window.open(waLink, "_blank", "noopener,noreferrer");
  }

  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between">
          <div className="min-w-0">
            <p className="font-medium truncate">{notification.patientName}</p>
            <p className="text-xs text-muted-foreground">{notification.drugName}</p>
          </div>
          {isOverdue && (
            <Badge variant="destructive" className="shrink-0 ml-2">
              Terlambat
            </Badge>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          Estimasi habis: {formatDate(notification.scheduledDate)}
        </p>

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
              onClick={() => onSetOutcome(notification.id, "bought")}
              disabled={settingOutcome}
            >
              <CheckCircle className="mr-2 size-4 text-emerald-500" />
              Beli
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => onSetOutcome(notification.id, "ignored")}
              disabled={settingOutcome}
            >
              <XCircle className="mr-2 size-4 text-rose-500" />
              Abaikan
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => onSetOutcome(notification.id, "no_response")}
              disabled={settingOutcome}
            >
              <HelpCircle className="mr-2 size-4 text-muted-foreground" />
              Tidak Respon
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
