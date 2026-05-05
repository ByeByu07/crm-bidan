import type { PredictionService, PatientFeatures } from "@repo/types";

export const ruleBasedPredictor: PredictionService = {
  async predict(features: PatientFeatures): Promise<number> {
    // Simple rule-based MVP predictor
    // Returns a score 0.0 - 1.0 (higher = more likely to buy)

    let score = 0.5;

    // If days since last buy is close to expected duration, more likely to buy
    const ratio = features.daysSinceLastBuy / features.drugDurationDays;
    if (ratio >= 0.8 && ratio <= 1.2) {
      score += 0.2;
    } else if (ratio > 1.5) {
      score -= 0.1;
    }

    // High consumption rate = reliable buyer
    if (features.consumptionRate > 0.9) {
      score += 0.15;
    } else if (features.consumptionRate < 0.5) {
      score -= 0.15;
    }

    // More total purchases = more loyal
    if (features.totalPurchasesLifetime >= 5) {
      score += 0.1;
    }

    // High ignore rate = less likely
    if (features.ignoreRateLast3Months > 0.5) {
      score -= 0.2;
    }

    // Previous outcome influence
    if (features.previousOutcome === "bought") {
      score += 0.1;
    } else if (features.previousOutcome === "ignored") {
      score -= 0.1;
    }

    return Math.max(0, Math.min(1, score));
  },
};
