import type { PatientFeatures } from "@repo/types";

export async function extractFeatures(
  _patientId: string,
  _catalogItemId: string,
  _orgId: string,
): Promise<PatientFeatures> {
  // Stub — will be implemented in Phase 2 with real analytics queries
  return {
    daysSinceLastBuy: 0,
    catalogItemDurationDays: 30,
    consumptionRate: 1.0,
    totalPurchasesLifetime: 1,
    avgIntervalBetweenBuys: 30,
    purchaseStreak: 1,
    ignoreRateLast3Months: 0,
    previousOutcome: null,
    patientCondition: "umum",
    catalogItemCategory: "obat",
    catalogItemPrice: 0,
    patientAge: null,
  };
}
