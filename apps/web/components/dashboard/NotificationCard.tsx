"use client";

import { useState } from "react";
import { Card, CardContent } from "@repo/ui/components/card";
import { Button } from "@repo/ui/components/button";
import { Badge } from "@repo/ui/components/badge";
import { Skeleton } from "@repo/ui/components/skeleton";
import type { NotificationLogItem } from "@repo/types";
import { formatDate } from "@repo/utils/date";
import { formatPhoneE164, formatCurrency } from "@repo/utils/format";
import { usePatientTransactions } from "@/hooks/use-patient-transactions";
import {
  Phone,
  CheckCircle,
  XCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  History,
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
  const isOverdue = new Date(notification.scheduledDate) < new Date();
  const [expanded, setExpanded] = useState(false);

  const {
    data: historyData,
    isLoading: historyLoading,
  } = usePatientTransactions(expanded ? notification.patientId : undefined);

  const latestTxs = historyData?.transactions ?? [];

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
          Estimasi: {formatDate(notification.scheduledDate)}
        </p>

        {/* Expandable history */}
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex w-full items-center justify-between rounded-md border px-3 py-2 text-sm hover:bg-muted/50 transition-colors"
        >
          <span className="flex items-center gap-2 text-muted-foreground">
            <History className="size-4" />
            Riwayat Pembelian
          </span>
          {expanded ? (
            <ChevronUp className="size-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="size-4 text-muted-foreground" />
          )}
        </button>

        {expanded && (
          <div className="space-y-2">
            {historyLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ) : latestTxs.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                Belum ada riwayat pembelian.
              </p>
            ) : (
              <div className="space-y-2">
                {latestTxs.map((tx, tIdx) => (
                  <div
                    key={tx.transactionId}
                    className="rounded-md bg-muted p-3 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium">
                        {formatDate(tx.purchaseDate)}
                      </p>
                      {tx.patientCondition && (
                        <Badge variant="outline" className="text-[10px]">
                          {tx.patientCondition}
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-1">
                      {tx.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-xs"
                        >
                          <span className="text-muted-foreground">
                            {item.drugName} &middot; {item.quantityDispense} unit
                          </span>
                          <span className="font-medium">
                            {formatCurrency(item.subtotal)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between border-t pt-2 text-xs">
                      <span className="text-muted-foreground">Total</span>
                      <span className="font-semibold">
                        {formatCurrency(tx.totalPrice)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

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
