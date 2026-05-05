import {
  pgTable,
  text,
  boolean,
  timestamp,
  decimal,
  integer,
  date,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ==================== BETTER AUTH CORE TABLES ====================

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
    role: text("role").default("user").notNull(),
    banned: boolean("banned"),
    banReason: text("banReason"),
    banExpires: timestamp("banExpires", { withTimezone: true }),
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

    // better-auth organization plugin fields
    activeOrganizationId: text("activeOrganizationId"),
    activeTeamId: text("activeTeamId"),
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

// ==================== BETTER AUTH ORGANIZATION TABLES ====================

export const organization = pgTable(
  "organization",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").unique(),
    logo: text("logo"),
    metadata: text("metadata"),
    createdAt: timestamp("createdAt", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    slugIdx: index("organization_slug_idx").on(table.slug),
  }),
);

export const member = pgTable(
  "member",
  {
    id: text("id").primaryKey(),
    organizationId: text("organizationId")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    userId: text("userId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    role: text("role").notNull(), // 'owner' | 'admin' | 'member'
    createdAt: timestamp("createdAt", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    orgIdx: index("member_organization_idx").on(table.organizationId),
    userIdx: index("member_user_idx").on(table.userId),
  }),
);

export const invitation = pgTable(
  "invitation",
  {
    id: text("id").primaryKey(),
    organizationId: text("organizationId")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    role: text("role").notNull(),
    status: text("status").default("pending").notNull(), // 'pending' | 'accepted' | 'rejected' | 'canceled'
    expiresAt: timestamp("expiresAt", { withTimezone: true }).notNull(),
    inviterId: text("inviterId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("createdAt", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    orgIdx: index("invitation_organization_idx").on(table.organizationId),
    emailIdx: index("invitation_email_idx").on(table.email),
    statusIdx: index("invitation_status_idx").on(table.status),
    expiresAtIdx: index("invitation_expires_at_idx").on(table.expiresAt),
  }),
);

// ==================== DOMAIN TABLES (PRD v1.0) ====================

export const patient = pgTable(
  "patient",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    whatsappNumber: text("whatsapp_number"),
    birthDate: date("birth_date"),
    location: text("location"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    orgIdx: index("patient_organization_idx").on(table.organizationId),
    nameIdx: index("patient_name_idx").on(table.name),
    createdIdx: index("patient_created_idx").on(table.createdAt),
  }),
);

export const patientCondition = pgTable(
  "patient_condition",
  {
    id: text("id").primaryKey(),
    patientId: text("patient_id")
      .notNull()
      .references(() => patient.id, { onDelete: "cascade" }),
    condition: text("condition").notNull(),
    startDate: date("start_date"),
    endDate: date("end_date"),
    notes: text("notes"),
  },
  (table) => ({
    patientIdx: index("patient_condition_patient_idx").on(table.patientId),
  }),
);

export const drug = pgTable(
  "drug",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    category: text("category"),
    dispenseUnit: text("dispense_unit").notNull(), // e.g. 'tablet', 'bottle', 'sachet'
    packageUnit: text("package_unit").notNull(),   // e.g. 'box', 'strip'
    unitsPerPackage: integer("units_per_package").notNull(),
    durationPerDispenseUnit: integer("duration_per_dispense_unit"), // days per unit
    sellPricePerDispense: decimal("sell_price_per_dispense", {
      precision: 12,
      scale: 2,
    }).notNull(),
    buyPricePerPackage: decimal("buy_price_per_package", {
      precision: 12,
      scale: 2,
    }),
    isActive: boolean("is_active").default(true).notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    orgIdx: index("drug_organization_idx").on(table.organizationId),
    nameIdx: index("drug_name_idx").on(table.name),
    activeIdx: index("drug_active_idx").on(table.isActive),
    createdIdx: index("drug_created_idx").on(table.createdAt),
  }),
);

export const transaction = pgTable(
  "transaction",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    patientId: text("patient_id")
      .notNull()
      .references(() => patient.id, { onDelete: "cascade" }),
    purchaseDate: timestamp("purchase_date", { withTimezone: true })
      .defaultNow()
      .notNull(),
    patientCondition: text("patient_condition"),
    totalPrice: decimal("total_price", { precision: 12, scale: 2 }).notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    orgIdx: index("transaction_organization_idx").on(table.organizationId),
    patientIdx: index("transaction_patient_idx").on(table.patientId),
    purchaseDateIdx: index("transaction_purchase_date_idx").on(
      table.purchaseDate,
    ),
    createdIdx: index("transaction_created_idx").on(table.createdAt),
  }),
);

export const saleItem = pgTable(
  "sale_item",
  {
    id: text("id").primaryKey(),
    transactionId: text("transaction_id")
      .notNull()
      .references(() => transaction.id, { onDelete: "cascade" }),
    drugId: text("drug_id")
      .notNull()
      .references(() => drug.id, { onDelete: "cascade" }),
    quantityDispense: integer("quantity_dispense").notNull(),
    pricePerDispense: decimal("price_per_dispense", {
      precision: 12,
      scale: 2,
    }).notNull(),
    subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull(),
    durationDays: integer("duration_days"),
    nextExpectedBuy: timestamp("next_expected_buy", { withTimezone: true }),
    actualNextBuy: timestamp("actual_next_buy", { withTimezone: true }),
    consumptionRate: decimal("consumption_rate", { precision: 10, scale: 4 }), // units per day
  },
  (table) => ({
    transactionIdx: index("sale_item_transaction_idx").on(table.transactionId),
    drugIdx: index("sale_item_drug_idx").on(table.drugId),
    nextExpectedIdx: index("sale_item_next_expected_idx").on(
      table.nextExpectedBuy,
    ),
  }),
);

export const notificationLog = pgTable(
  "notification_log",
  {
    id: text("id").primaryKey(),
    saleItemId: text("sale_item_id")
      .notNull()
      .references(() => saleItem.id, { onDelete: "cascade" }),
    patientId: text("patient_id")
      .notNull()
      .references(() => patient.id, { onDelete: "cascade" }),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    scheduledDate: timestamp("scheduled_date", { withTimezone: true }).notNull(),
    status: text("status").default("pending").notNull(), // 'pending' | 'sent' | 'failed' | 'skipped'
    sentAt: timestamp("sent_at", { withTimezone: true }),
    outcome: text("outcome"), // 'purchased' | 'not_purchased' | 'no_response' | 'rescheduled'
    waMessage: text("wa_message"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    orgIdx: index("notification_log_organization_idx").on(
      table.organizationId,
    ),
    patientIdx: index("notification_log_patient_idx").on(table.patientId),
    saleItemIdx: index("notification_log_sale_item_idx").on(table.saleItemId),
    scheduledIdx: index("notification_log_scheduled_idx").on(
      table.scheduledDate,
    ),
    statusIdx: index("notification_log_status_idx").on(table.status),
    createdIdx: index("notification_log_created_idx").on(table.createdAt),
  }),
);

// ==================== RELATIONS ====================

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  members: many(member),
  invitationsSent: many(invitation),
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

export const organizationRelations = relations(
  organization,
  ({ many }) => ({
    members: many(member),
    invitations: many(invitation),
    patients: many(patient),
    drugs: many(drug),
    transactions: many(transaction),
    notificationLogs: many(notificationLog),
  }),
);

export const memberRelations = relations(member, ({ one }) => ({
  organization: one(organization, {
    fields: [member.organizationId],
    references: [organization.id],
  }),
  user: one(user, {
    fields: [member.userId],
    references: [user.id],
  }),
}));

export const invitationRelations = relations(invitation, ({ one }) => ({
  organization: one(organization, {
    fields: [invitation.organizationId],
    references: [organization.id],
  }),
  inviter: one(user, {
    fields: [invitation.inviterId],
    references: [user.id],
  }),
}));

export const patientRelations = relations(patient, ({ one, many }) => ({
  organization: one(organization, {
    fields: [patient.organizationId],
    references: [organization.id],
  }),
  conditions: many(patientCondition),
  transactions: many(transaction),
  notificationLogs: many(notificationLog),
}));

export const patientConditionRelations = relations(
  patientCondition,
  ({ one }) => ({
    patient: one(patient, {
      fields: [patientCondition.patientId],
      references: [patient.id],
    }),
  }),
);

export const drugRelations = relations(drug, ({ one, many }) => ({
  organization: one(organization, {
    fields: [drug.organizationId],
    references: [organization.id],
  }),
  saleItems: many(saleItem),
}));

export const transactionRelations = relations(transaction, ({ one, many }) => ({
  organization: one(organization, {
    fields: [transaction.organizationId],
    references: [organization.id],
  }),
  patient: one(patient, {
    fields: [transaction.patientId],
    references: [patient.id],
  }),
  saleItems: many(saleItem),
}));

export const saleItemRelations = relations(saleItem, ({ one, many }) => ({
  transaction: one(transaction, {
    fields: [saleItem.transactionId],
    references: [transaction.id],
  }),
  drug: one(drug, {
    fields: [saleItem.drugId],
    references: [drug.id],
  }),
  notificationLogs: many(notificationLog),
}));

export const notificationLogRelations = relations(
  notificationLog,
  ({ one }) => ({
    saleItem: one(saleItem, {
      fields: [notificationLog.saleItemId],
      references: [saleItem.id],
    }),
    patient: one(patient, {
      fields: [notificationLog.patientId],
      references: [patient.id],
    }),
    organization: one(organization, {
      fields: [notificationLog.organizationId],
      references: [organization.id],
    }),
  }),
);
