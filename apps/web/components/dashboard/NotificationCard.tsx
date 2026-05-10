"use client";

import { useRouter } from "next/navigation";
import type { NotificationLogItem } from "@repo/types";
import { formatPhoneE164 } from "@repo/utils/format";
import { AIRecommendation } from "./AIRecommendation";

interface NotificationCardProps {
  notification: NotificationLogItem;
  onSend?: (id: string) => void;
  onSetOutcome: (id: string, outcome: "bought" | "ignored" | "no_response") => void;
  onReschedule?: (id: string, defaultOutcome: "ignored" | "no_response") => void;
  sending?: boolean;
  settingOutcome?: boolean;
}

function IPhone() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function ICheck() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function IX() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function IHelp() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

export function NotificationCard({
  notification,
  onSend,
  onSetOutcome,
  onReschedule,
  sending,
  settingOutcome,
}: NotificationCardProps) {
  const isScheduled = notification.status === "pending";
  const isSent = notification.status === "sent";
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
    <div className="nc card">
      <div className="row1">
        <p className="name">{notification.patientName}</p>
        {notification.outcome && (
          <span className="tag" style={{ background: "#e8f5e9", color: "#2e7d32" }}>
            Selesai
          </span>
        )}
      </div>

      <p className="msg">{notification.waMessage}</p>

      <div className="meta">
        <span className="date">
          {new Date(notification.scheduledDate).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </span>
      </div>

      <AIRecommendation patientId={notification.patientId} />

      {isScheduled && (
        <button className="bp" style={{ marginTop: "8px" }} onClick={handleWaClick} disabled={sending}>
          <IPhone /> {sending ? "Membuka..." : "Hubungi WA"}
        </button>
      )}

      {isSent && !notification.outcome && (
        <div className="ob">
          <button className="buy" onClick={handleBuy}>
            <ICheck /> Pasien Beli
          </button>
          <button className="ignore" onClick={() => onReschedule?.(notification.id, "ignored")} disabled={settingOutcome}>
            <IX /> Tidak Jadi
          </button>
          <button className="nores" onClick={() => onReschedule?.(notification.id, "no_response")} disabled={settingOutcome}>
            <IHelp /> Tidak Dihubungi
          </button>
        </div>
      )}

      {notification.outcome && (
        <p
          className="c"
          style={{
            marginTop: "8px",
            color:
              notification.outcome === "bought"
                ? "#2e7d32"
                : notification.outcome === "ignored"
                ? "#c62828"
                : "var(--bidan-muted)",
          }}
        >
          {notification.outcome === "bought"
            ? "✓ Pasien membeli"
            : notification.outcome === "ignored"
            ? "✗ Pasien tidak jadi"
            : "? Belum ada respons"}
        </p>
      )}
    </div>
  );
}
