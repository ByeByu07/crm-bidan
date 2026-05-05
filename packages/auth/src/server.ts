import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { organization } from "better-auth/plugins";
import { toNextJsHandler } from "better-auth/next-js";
import { db } from "@repo/db";
import * as schema from "@repo/db/schema";
import { eq } from "drizzle-orm";

export { toNextJsHandler };

const trustedOrigins = [
  "http://localhost:3000",
  ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []),
  ...(process.env.BETTER_AUTH_TRUSTED_ORIGINS
    ? process.env.BETTER_AUTH_TRUSTED_ORIGINS.split(",").map((o) => o.trim()).filter(Boolean)
    : []),
];

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  trustedOrigins,
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url }) => {
      const resendApiKey = process.env.RESEND_API_KEY;
      const fromEmail = process.env.RESEND_FROM_EMAIL || "noreply@bidan-crm.vercel.app";
      if (!resendApiKey) {
        console.warn("RESEND_API_KEY not set. Skipping verification email.");
        return;
      }
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromEmail,
          to: user.email,
          subject: "Verifikasi Email BidanCRM",
          html: `<p>Halo ${user.name},</p><p>Klik <a href="${url}">di sini</a> untuk memverifikasi email Anda.</p>`,
        }),
      });
    },
  },
  plugins: [
    organization({
      allowUserToCreateOrganization: true,
    }),
  ],
  databaseHooks: {
    user: {
      create: {
        after: async (user, context) => {
          const body = context?.body as Record<string, unknown> | undefined;
          const clinicName = body?.clinic_name;
          if (typeof clinicName === "string" && clinicName.trim()) {
            try {
              const orgId = crypto.randomUUID();
              const slugBase = clinicName
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-|-$/g, "");
              const slug = `${slugBase}-${orgId.slice(0, 8)}`;

              await db.insert(schema.organization).values({
                id: orgId,
                name: clinicName.trim(),
                slug,
                createdAt: new Date(),
              });

              await db.insert(schema.member).values({
                id: crypto.randomUUID(),
                organizationId: orgId,
                userId: user.id,
                role: "owner",
                createdAt: new Date(),
              });
            } catch (err) {
              console.error("Failed to auto-create organization:", err);
            }
          }
        },
      },
    },
    session: {
      create: {
        before: async (session) => {
          const memberships = await db
            .select()
            .from(schema.member)
            .where(eq(schema.member.userId, session.userId))
            .limit(1);

          const activeOrganizationId = memberships[0]?.organizationId ?? null;
          return {
            data: {
              ...session,
              activeOrganizationId,
            },
          };
        },
      },
    },
  },
});
