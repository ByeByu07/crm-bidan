// Domain models for BidanCRM

export type PatientCondition = string;

export type DrugCategory = string;

export type DispenseUnit =
  | "tablet"
  | "kapsul"
  | "botol"
  | "ampul"
  | "strip"
  | "sachet"
  | "tube";

export type PackageUnit = "box" | "strip" | "botol" | "blister" | "dus";

export type NotificationStatus = "pending" | "sent" | "failed" | "skipped";

export type NotificationOutcome = "bought" | "ignored" | "no_response" | null;

export interface Patient {
  id: string;
  organizationId: string;
  name: string;
  whatsappNumber: string;
  birthDate?: Date | null;
  location?: string | null;
  notes?: string | null;
  createdAt: Date;
}

export interface Condition {
  id: string;
  organizationId: string;
  name: string;
  createdAt: Date;
}

export interface DrugCategoryItem {
  id: string;
  organizationId: string;
  name: string;
  createdAt: Date;
}

export interface PatientConditionRecord {
  id: string;
  patientId: string;
  condition: PatientCondition;
  startDate: Date;
  endDate?: Date | null;
  notes?: string | null;
}

export interface Drug {
  id: string;
  organizationId: string;
  name: string;
  category: DrugCategory;
  dispenseUnit: DispenseUnit;
  packageUnit: PackageUnit;
  unitsPerPackage: number;
  durationPerDispenseUnit: number; // days per 1 dispense unit
  sellPricePerDispense: number; // decimal(12,2)
  buyPricePerPackage: number; // decimal(12,2)
  isActive: boolean;
  notes?: string | null;
  createdAt: Date;
}

export interface Transaction {
  id: string;
  organizationId: string;
  patientId: string;
  purchaseDate: Date;
  patientCondition: PatientCondition;
  totalPrice: number; // decimal(12,2)
  notes?: string | null;
  createdAt: Date;
}

export interface SaleItem {
  id: string;
  transactionId: string;
  drugId: string;
  quantityDispense: number;
  pricePerDispense: number; // snapshot at time of sale
  subtotal: number; // auto: qty * price
  durationDays: number; // auto: qty * duration_per_dispense_unit
  nextExpectedBuy: Date; // auto: purchase_date + duration_days
  actualNextBuy?: Date | null; // filled when patient buys same drug again
  consumptionRate?: number | null; // auto: actual_days / duration_days
}

export interface NotificationLog {
  id: string;
  saleItemId: string;
  patientId: string;
  organizationId: string;
  scheduledDate: Date; // = sale_item.next_expected_buy
  status: NotificationStatus;
  sentAt?: Date | null;
  outcome: NotificationOutcome;
  waMessage: string;
  createdAt: Date;
}

// Dashboard types

export type SalesPeriod = "1m" | "3m" | "6m";

export interface SalesChartDataPoint {
  label: string; // "2025-05" for monthly, "2025-05-06" for daily
  revenue: number;
  transactionCount: number;
  changePercent?: number | null;
}

/** @deprecated Use SalesChartDataPoint instead */
export type MonthlySalesData = SalesChartDataPoint;

export interface TopProduct {
  drugId: string;
  drugName: string;
  revenue: number;
  unitsSold: number;
}

export interface DashboardSalesData {
  currentRevenue: number;
  previousRevenue: number;
  revenueChangePercent: number;
  transactionCount: number;
  previousTransactionCount: number;
  transactionChangePercent: number;
  activePatients: number;
  previousActivePatients: number;
  activePatientsChangePercent: number;
  chartData: SalesChartDataPoint[];
  topProducts: TopProduct[];
  period: SalesPeriod;
}

export interface NotificationQueue {
  today: number;
  overdue: number;
  thisWeek: number;
  scheduled: NotificationLogItem[];
  sentPending: NotificationLogItem[];
  completedToday: NotificationLogItem[];
}

export interface NotificationLogItem extends NotificationLog {
  patientName: string;
  whatsappNumber: string;
}

export interface PatientTransactionHistory {
  transactionId: string;
  purchaseDate: Date;
  patientCondition: string | null;
  totalPrice: number;
  notes: string | null;
  items: {
    drugName: string;
    quantityDispense: number;
    pricePerDispense: number;
    subtotal: number;
    durationDays: number | null;
  }[];
}

// Services

export interface NotificationPayload {
  phone: string;
  message: string;
}

export interface NotificationResult {
  status: "sent" | "failed";
  url?: string;
}

export interface PatientFeatures {
  daysSinceLastBuy: number;
  drugDurationDays: number;
  consumptionRate: number;
  totalPurchasesLifetime: number;
  avgIntervalBetweenBuys: number;
  purchaseStreak: number;
  ignoreRateLast3Months: number;
  previousOutcome: NotificationOutcome;
  patientCondition: PatientCondition;
  drugCategory: DrugCategory;
  drugPrice: number;
  patientAge?: number | null;
}

export interface PredictionService {
  predict(features: PatientFeatures): Promise<number>; // 0.0 - 1.0
}

export interface NotificationService {
  send(payload: NotificationPayload): Promise<NotificationResult>;
}
