import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../../db/src/index.js";
import * as schema from "../../db/src/schema.js";
import { apiKey, admin } from "better-auth/plugins";

export const auth = betterAuth({
   trustedOrigins: [
    "http://localhost:3000",
    "http://web:3000",
    "http://localhost",
    ...(process.env.BETTER_AUTH_TRUSTED_ORIGINS
      ? process.env.BETTER_AUTH_TRUSTED_ORIGINS.split(",")
      : []),
  ],
  database: drizzleAdapter(db, {
    provider: "pg", // or "mysql", "sqlite"
    schema: schema,
  }),
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      creditBalance: {
        type: "string", // Stored as decimal in DB, but Better Auth uses string for numbers
        required: false,
        defaultValue: "0",
        input: false, // Don't allow user to set this during signup
      },
      webhookUrl: {
        type: "string",
        required: false,
        defaultValue: null,
        input: false, // Don't allow user to set this during signup
      },
    },
  },
  plugins: [
    apiKey({
      enableMetadata: true,
    }),
    admin({
      adminUserIds: ["z8Fis3ZdNBqhHwobvXNJ0fXLLLsiZnRM"],
    }),
  ],
});
