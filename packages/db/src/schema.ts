import {
  pgTable,
  text,
  boolean,
  timestamp,
  decimal,
  integer,
  jsonb,
  unique,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ==================== BETTER AUTH TABLES ====================

export const user = pgTable(
  "user",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: boolean("emailVerified").default(false).notNull(),
    image: text("image"),
    createdAt: timestamp("createdAt", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updatedAt", { withTimezone: true })
      .defaultNow()
      .notNull(),

    // better-auth admin plugin fields
    role: text("role").default("user").notNull(), // 'user' | 'admin'
    banned: boolean("banned"),
    banReason: text("banReason"),
    banExpires: timestamp("banExpires", { withTimezone: true }),

    // Custom fields for SMS platform
    creditBalance: decimal("creditBalance", { precision: 12, scale: 2 })
      .default("0")
      .notNull(),
    webhookUrl: text("webhookUrl"),
  },
  (table) => ({
    emailIdx: index("user_email_idx").on(table.email),
    roleIdx: index("user_role_idx").on(table.role),
  }),
);

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expiresAt", { withTimezone: true }).notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("createdAt", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updatedAt", { withTimezone: true }).notNull(),
    ipAddress: text("ipAddress"),
    userAgent: text("userAgent"),
    userId: text("userId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    // better-auth admin plugin fields
    impersonatedBy: text("impersonatedBy"),
  },
  (table) => ({
    userIdIdx: index("session_user_id_idx").on(table.userId),
    tokenIdx: index("session_token_idx").on(table.token),
    expiresAtIdx: index("session_expires_at_idx").on(table.expiresAt),
  }),
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("accountId").notNull(),
    providerId: text("providerId").notNull(),
    userId: text("userId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("accessToken"),
    refreshToken: text("refreshToken"),
    idToken: text("idToken"),
    accessTokenExpiresAt: timestamp("accessTokenExpiresAt", {
      withTimezone: true,
    }),
    refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt", {
      withTimezone: true,
    }),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("createdAt", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updatedAt", { withTimezone: true }).notNull(),
  },
  (table) => ({
    userIdIdx: index("account_user_id_idx").on(table.userId),
    providerIdx: index("account_provider_idx").on(
      table.providerId,
      table.accountId,
    ),
  }),
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expiresAt", { withTimezone: true }).notNull(),
    createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    identifierIdx: index("verification_identifier_idx").on(table.identifier),
    expiresAtIdx: index("verification_expires_at_idx").on(table.expiresAt),
  }),
);

// ==================== BETTER AUTH API KEY PLUGIN ====================

export const apikey = pgTable(
  "apiKey",
  {
    id: text("id").primaryKey(),
    name: text("name"),
    start: text("start"),
    prefix: text("prefix"),
    key: text("key").notNull().unique(), // Hashed API key
    userId: text("userId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    refillInterval: integer("refillInterval"),
    refillAmount: integer("refillAmount"),
    lastRefillAt: timestamp("lastRefillAt", { withTimezone: true }),
    enabled: boolean("enabled").default(true).notNull(),
    rateLimitEnabled: boolean("rateLimitEnabled").default(true),
    rateLimitTimeWindow: integer("rateLimitTimeWindow"), // milliseconds
    rateLimitMax: integer("rateLimitMax"),
    requestCount: integer("requestCount").default(0),
    remaining: integer("remaining"),
    lastRequest: timestamp("lastRequest", { withTimezone: true }),
    expiresAt: timestamp("expiresAt", { withTimezone: true }),
    createdAt: timestamp("createdAt", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updatedAt", { withTimezone: true })
      .defaultNow()
      .notNull(),
    permissions: text("permissions"), // JSON string
    metadata: text("metadata"), // JSON string
  },
  (table) => ({
    userIdIdx: index("api_key_user_id_idx").on(table.userId),
    keyIdx: index("api_key_key_idx").on(table.key),
    enabledIdx: index("api_key_enabled_idx").on(table.enabled),
  }),
);

// ==================== SMS PLATFORM TABLES ====================

// Provider master table (minimal info - configs are hardcoded)
// Provider master table (minimal info - configs are hardcoded)
export const smsProviders = pgTable(
  "sms_providers",
  {
    id: text("id").primaryKey(),
    providerCode: text("providerCode").notNull().unique(), // 'onbuka', 'twilio'
    name: text("name").notNull(),
    isActive: boolean("isActive").default(true).notNull(),
    createdAt: timestamp("createdAt", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updatedAt", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    providerCodeIdx: index("sms_providers_code_idx").on(table.providerCode),
    activeIdx: index("sms_providers_active_idx").on(table.isActive),
  }),
);

// Pricing per SMS type per campaign (admin can change without deploy)
// Campaign-specific pricing overrides global pricing (campaignId = null)
export const providerPricing = pgTable(
  "provider_pricing",
  {
    id: text("id").primaryKey(),
    campaignId: text("campaignId").references(() => campaigns.id, {
      onDelete: "cascade",
    }), // null = global default
    providerCode: text("providerCode").notNull(), // 'onbuka', 'twilio'
    smsType: text("smsType").notNull(), // 'marketing', 'transactional', 'notification'
    baseCost: decimal("baseCost", { precision: 12, scale: 0 }).notNull(), // IDR per SMS (whole number) - provider cost
    finalPrice: decimal("finalPrice", { precision: 12, scale: 0 }).notNull(), // IDR per SMS (whole number) - selling price to customer
    isActive: boolean("isActive").default(true).notNull(),
    createdAt: timestamp("createdAt", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updatedAt", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    // Unique constraint: campaign + provider + smsType (campaignId can be null for global defaults)
    uniqueTriple: unique("campaign_provider_type_unique").on(
      table.campaignId,
      table.providerCode,
      table.smsType,
    ),
    campaignIdx: index("provider_pricing_campaign_idx").on(table.campaignId),
    providerIdx: index("provider_pricing_provider_idx").on(table.providerCode),
    typeIdx: index("provider_pricing_type_idx").on(table.smsType),
    activeIdx: index("provider_pricing_active_idx").on(table.isActive),
  }),
);

export const campaigns = pgTable(
  "campaigns",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    description: text("description"),
    regionCode: text("regionCode").notNull().unique(), // ISO code: 'ID', 'SG', 'MY'
    isActive: boolean("isActive").default(true).notNull(),
    createdAt: timestamp("createdAt", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updatedAt", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    regionCodeIdx: index("campaigns_region_code_idx").on(table.regionCode),
    activeIdx: index("campaigns_active_idx").on(table.isActive),
  }),
);

export const providerCampaigns = pgTable(
  "provider_campaigns",
  {
    id: text("id").primaryKey(),
    providerCode: text("providerCode").notNull(),
    campaignId: text("campaignId")
      .notNull()
      .references(() => campaigns.id, { onDelete: "cascade" }),
    priority: integer("priority").default(1).notNull(), // Lower = higher priority
    isActive: boolean("isActive").default(true).notNull(),
    createdAt: timestamp("createdAt", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    campaignIdx: index("provider_campaigns_campaign_idx").on(table.campaignId),
    providerIdx: index("provider_campaigns_provider_idx").on(
      table.providerCode,
    ),
    priorityIdx: index("provider_campaigns_priority_idx").on(table.priority),
    uniquePair: unique("provider_campaign_unique").on(
      table.providerCode,
      table.campaignId,
    ),
  }),
);

export const userCampaigns = pgTable(
  "user_campaigns",
  {
    id: text("id").primaryKey(),
    userId: text("userId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    campaignId: text("campaignId")
      .notNull()
      .references(() => campaigns.id, { onDelete: "cascade" }),
    grantedBy: text("grantedBy").references(() => user.id, {
      onDelete: "set null",
    }), // Admin who granted
    notes: text("notes"),
    grantedAt: timestamp("grantedAt", { withTimezone: true })
      .defaultNow()
      .notNull(),
    lastUsedAt: timestamp("lastUsedAt", { withTimezone: true }),
    createdAt: timestamp("createdAt", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    userIdx: index("user_campaigns_user_idx").on(table.userId),
    campaignIdx: index("user_campaigns_campaign_idx").on(table.campaignId),
    uniquePair: unique("user_campaign_unique").on(
      table.userId,
      table.campaignId,
    ),
  }),
);

export const smsMessages = pgTable(
  "sms_messages",
  {
    id: text("id").primaryKey(),
    userId: text("userId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    // campaignId: text('campaignId').references(() => campaigns.id, { onDelete: 'restrict' }),
    providerCode: text("providerCode"), // 'onbuka', 'twilio'
    batchId: text("batchId"),
    recipient: text("recipient").notNull(), // E.164 format: +628123456789
    message: text("message").notNull(),
    type: text("type").default("marketing").notNull(), // marketing, transactional, notification
    status: text("status").default("pending").notNull(), // pending, queued, sent, delivered, failed
    creditsUsed: decimal("creditsUsed", { precision: 10, scale: 4 }).notNull(),
    providerMessageId: text("providerMessageId"),
    providerStatus: text("providerStatus"),
    errorMessage: text("errorMessage"),
    sentAt: timestamp("sentAt", { withTimezone: true }),
    deliveredAt: timestamp("deliveredAt", { withTimezone: true }),
    failedAt: timestamp("failedAt", { withTimezone: true }),
    webhookSent: boolean("webhookSent").default(false),
    webhookSentAt: timestamp("webhookSentAt", { withTimezone: true }),
    creditsDeducted: boolean("creditsDeducted").default(false), // Track if credits deducted from user
    creditsDeductedAt: timestamp("creditsDeductedAt", { withTimezone: true }),
    attempts: integer("attempts").default(1).notNull(),
    createdAt: timestamp("createdAt", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updatedAt", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    userCreatedIdx: index("sms_messages_user_created_idx").on(
      table.userId,
      table.createdAt,
    ),
    // campaignIdx: index('sms_messages_campaign_idx').on(table.campaignId),
    providerIdx: index("sms_messages_provider_idx").on(table.providerCode),
    statusIdx: index("sms_messages_status_idx").on(table.status),
    batchIdx: index("sms_messages_batch_idx").on(table.batchId),
    recipientIdx: index("sms_messages_recipient_idx").on(table.recipient),
    createdIdx: index("sms_messages_created_idx").on(table.createdAt),
    providerMsgIdIdx: index("sms_messages_provider_msg_id_idx").on(
      table.providerMessageId,
    ),
    typeIdx: index("sms_messages_type_idx").on(table.type),
  }),
);

export const creditTransactions = pgTable(
  "credit_transactions",
  {
    id: text("id").primaryKey(),
    userId: text("userId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    transactionType: text("transactionType").notNull(), // top_up, deduction, refund, manual_adjustment
    amount: decimal("amount", { precision: 12, scale: 2 }).notNull(), // Can be negative for deductions
    balanceBefore: decimal("balanceBefore", {
      precision: 12,
      scale: 2,
    }).notNull(),
    balanceAfter: decimal("balanceAfter", {
      precision: 12,
      scale: 2,
    }).notNull(),
    referenceType: text("referenceType"), // payment, sms_message, admin_action
    referenceId: text("referenceId"),
    description: text("description"),
    createdBy: text("createdBy").references(() => user.id, {
      onDelete: "set null",
    }), // Admin ID if manual
    createdAt: timestamp("createdAt", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    userCreatedIdx: index("credit_transactions_user_created_idx").on(
      table.userId,
      table.createdAt,
    ),
    typeIdx: index("credit_transactions_type_idx").on(table.transactionType),
    referenceIdx: index("credit_transactions_reference_idx").on(
      table.referenceType,
      table.referenceId,
    ),
  }),
);

export const paymentTransactions = pgTable(
  "payment_transactions",
  {
    id: text("id").primaryKey(),
    userId: text("userId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    paymentGateway: text("paymentGateway").notNull(), // 'duitku', 'midtrans', etc.
    gatewayTransactionId: text("gatewayTransactionId").unique(),
    amountIdr: decimal("amountIdr", { precision: 12, scale: 0 }).notNull(), // IDR amount (whole number)
    creditsPurchased: decimal("creditsPurchased", {
      precision: 12,
      scale: 2,
    }).notNull(),
    status: text("status").default("pending").notNull(), // pending, success, failed, expired
    paymentMethod: text("paymentMethod"),
    paymentUrl: text("paymentUrl"),
    callbackData: jsonb("callbackData"),
    paidAt: timestamp("paidAt", { withTimezone: true }),
    expiredAt: timestamp("expiredAt", { withTimezone: true }),
    createdAt: timestamp("createdAt", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updatedAt", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    userIdx: index("payment_transactions_user_idx").on(table.userId),
    statusIdx: index("payment_transactions_status_idx").on(table.status),
    gatewayIdIdx: index("payment_transactions_gateway_id_idx").on(
      table.gatewayTransactionId,
    ),
  }),
);

export const smsBatches = pgTable(
  "sms_batches",
  {
    id: text("id").primaryKey(),
    userId: text("userId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    // campaignId: text('campaignId').notNull().references(() => campaigns.id, { onDelete: 'restrict' }),
    batchName: text("batchName"),
    totalMessages: integer("totalMessages").default(0).notNull(),
    successfulMessages: integer("successfulMessages").default(0).notNull(),
    failedMessages: integer("failedMessages").default(0).notNull(),
    pendingMessages: integer("pendingMessages").default(0).notNull(),
    totalCreditsUsed: decimal("totalCreditsUsed", { precision: 12, scale: 2 })
      .default("0")
      .notNull(),
    status: text("status").default("processing").notNull(), // processing, completed, failed
    source: text("source").notNull(), // 'web', 'api'
    startedAt: timestamp("startedAt", { withTimezone: true }),
    completedAt: timestamp("completedAt", { withTimezone: true }),
    createdAt: timestamp("createdAt", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    userIdx: index("sms_batches_user_idx").on(table.userId),
    // campaignIdx: index('sms_batches_campaign_idx').on(table.campaignId),
    statusIdx: index("sms_batches_status_idx").on(table.status),
  }),
);

// Provider Configuration table (region-specific credentials per provider)
// Stores encrypted API credentials for each provider-region combination
export const providerConfigs = pgTable(
  "provider_configs",
  {
    id: text("id").primaryKey(),
    providerCode: text("providerCode").notNull(), // 'onbuka', 'twilio', etc.
    regionCode: text("regionCode").notNull(), // 'ID', 'SG', 'MY', etc.
    name: text("name").notNull(), // Display name (e.g., "Onbuka Indonesia")
    // Encrypted credentials stored as JSONB
    // biome-ignore lint/suspicious/noExplicitAny: JSONB type - encrypted credentials stored as JSON
    config: jsonb("config").notNull().$type<any>(),
    isActive: boolean("isActive").default(true).notNull(),
    lastTestedAt: timestamp("lastTestedAt", { withTimezone: true }),
    lastTestStatus: text("lastTestStatus"), // 'success', 'failed', null
    lastTestError: text("lastTestError"),
    createdAt: timestamp("createdAt", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updatedAt", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    providerRegionUnique: unique("provider_region_unique").on(
      table.providerCode,
      table.regionCode,
    ),
    providerIdx: index("provider_configs_provider_idx").on(table.providerCode),
    regionIdx: index("provider_configs_region_idx").on(table.regionCode),
    activeIdx: index("provider_configs_active_idx").on(table.isActive),
  }),
);

// ==================== RELATIONS ====================

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  apiKeys: many(apikey),
  smsMessages: many(smsMessages),
  creditTransactions: many(creditTransactions),
  paymentTransactions: many(paymentTransactions),
  smsBatches: many(smsBatches),
  userCampaigns: many(userCampaigns),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const apikeyRelations = relations(apikey, ({ one, many }) => ({
  user: one(user, {
    fields: [apikey.userId],
    references: [user.id],
  }),
}));

export const smsProvidersRelations = relations(smsProviders, ({ many }) => ({
  smsMessages: many(smsMessages),
}));

export const providerPricingRelations = relations(
  providerPricing,
  ({ one }) => ({
    campaign: one(campaigns, {
      fields: [providerPricing.campaignId],
      references: [campaigns.id],
    }),
  }),
);

export const campaignsRelations = relations(campaigns, ({ many }) => ({
  providerCampaigns: many(providerCampaigns),
  userCampaigns: many(userCampaigns),
  smsMessages: many(smsMessages),
  smsBatches: many(smsBatches),
}));

export const providerCampaignsRelations = relations(
  providerCampaigns,
  ({ one }) => ({
    campaign: one(campaigns, {
      fields: [providerCampaigns.campaignId],
      references: [campaigns.id],
    }),
    // No provider relation - providerCode is used directly
  }),
);

export const userCampaignsRelations = relations(userCampaigns, ({ one }) => ({
  user: one(user, {
    fields: [userCampaigns.userId],
    references: [user.id],
  }),
  campaign: one(campaigns, {
    fields: [userCampaigns.campaignId],
    references: [campaigns.id],
  }),
  grantedByUser: one(user, {
    fields: [userCampaigns.grantedBy],
    references: [user.id],
  }),
}));

export const smsMessagesRelations = relations(smsMessages, ({ one, many }) => ({
  user: one(user, {
    fields: [smsMessages.userId],
    references: [user.id],
  }),
}));

export const creditTransactionsRelations = relations(
  creditTransactions,
  ({ one }) => ({
    user: one(user, {
      fields: [creditTransactions.userId],
      references: [user.id],
    }),
    createdByUser: one(user, {
      fields: [creditTransactions.createdBy],
      references: [user.id],
    }),
  }),
);

export const paymentTransactionsRelations = relations(
  paymentTransactions,
  ({ one }) => ({
    user: one(user, {
      fields: [paymentTransactions.userId],
      references: [user.id],
    }),
  }),
);

export const smsBatchesRelations = relations(smsBatches, ({ one }) => ({
  user: one(user, {
    fields: [smsBatches.userId],
    references: [user.id],
  }),
  // campaign: one(campaigns, {
  //     fields: [smsBatches.campaignId],
  //     references: [campaigns.id],
  // }),
}));

export const providerConfigsRelations = relations(providerConfigs, () => ({
  // No direct relations - provider configs are standalone
}));
