export function calculateSubtotal(
  quantity: number,
  pricePerUnit: number,
): number {
  return Math.round(quantity * pricePerUnit * 100) / 100;
}

export function calculateDurationDays(
  quantityDispense: number,
  durationDays: number,
): number {
  return quantityDispense * durationDays;
}

export function calculateNextExpectedBuy(
  purchaseDate: Date | string,
  durationDays: number,
): Date {
  const d =
    typeof purchaseDate === "string" ? new Date(purchaseDate) : purchaseDate;
  const result = new Date(d);
  result.setDate(result.getDate() + durationDays);
  return result;
}

export function calculateConsumptionRate(
  actualDays: number,
  expectedDays: number,
): number {
  if (expectedDays === 0) return 0;
  return Math.round((actualDays / expectedDays) * 100) / 100;
}

export function calculateChangePercent(
  current: number,
  previous: number,
): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 10000) / 100;
}
