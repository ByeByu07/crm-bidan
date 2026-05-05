import type { NotificationService, NotificationPayload, NotificationResult } from "@repo/types";

export const waDeepLinkService: NotificationService = {
  async send(payload: NotificationPayload): Promise<NotificationResult> {
    const cleanedPhone = payload.phone.replace(/\D/g, "");
    const waUrl = `https://wa.me/${cleanedPhone}?text=${encodeURIComponent(payload.message)}`;

    return {
      status: "sent",
      url: waUrl,
    };
  },
};
