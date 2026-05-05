"use client";

import { Card, CardContent } from "@repo/ui/components/card";
import { Button } from "@repo/ui/components/button";
import { Badge } from "@repo/ui/components/badge";
import type { NotificationLogItem } from "@repo/types";
import { formatDate } from "@repo/utils/date";
import { Phone, CheckCircle, XCircle, HelpCircle, ExternalLink } from "lucide-react";

interface NotificationCardProps {
  notification: NotificationLogItem;
  onSend: (id: string) => void;
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

  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-medium">{notification.patientName}</p>
            <p className="text-xs text-muted-foreground">{notification.drugName}</p>
          </div>
          <Badge variant={isOverdue ? "destructive" : isSent ? "secondary" : "default"}>
            {isScheduled ? "Menunggu" : isSent ? "Terkirim" : notification.status}
          </Badge>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Phone className="size-3" />
          <span>{notification.whatsappNumber}</span>
        </div>

        <p className="text-xs text-muted-foreground">
          Jadwal: {formatDate(notification.scheduledDate)}
        </p>

        {notification.waMessage && (
          <p className="rounded-md bg-muted p-2 text-xs">{notification.waMessage}</p>
        )}

        {isScheduled && (
          <Button
            size="sm"
            className="w-full"
            onClick={() => onSend(notification.id)}
            disabled={sending}
          >
            <ExternalLink className="mr-1 size-3" />
            {sending ? "Membuka..." : "Kirim WA"}
          </Button>
        )}

        {isSent && !notification.outcome && (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={() => onSetOutcome(notification.id, "bought")}
              disabled={settingOutcome}
            >
              <CheckCircle className="mr-1 size-3 text-emerald-500" />
              Beli
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={() => onSetOutcome(notification.id, "ignored")}
              disabled={settingOutcome}
            >
              <XCircle className="mr-1 size-3 text-rose-500" />
              Abaikan
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={() => onSetOutcome(notification.id, "no_response")}
              disabled={settingOutcome}
            >
              <HelpCircle className="mr-1 size-3 text-muted-foreground" />
              Tidak Respon
            </Button>
          </div>
        )}

        {notification.outcome && (
          <Badge
            variant={
              notification.outcome === "bought"
                ? "default"
                : notification.outcome === "ignored"
                ? "secondary"
                : "outline"
            }
          >
            {notification.outcome === "bought"
              ? "Membeli"
              : notification.outcome === "ignored"
              ? "Diabaikan"
              : "Tidak Respon"}
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}
