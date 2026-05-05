export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatCurrencyShort(amount: number): string {
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(1)}jt`;
  }
  if (amount >= 1_000) {
    return `${(amount / 1_000).toFixed(0)}rb`;
  }
  return amount.toString();
}

export function formatPhoneE164(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("0")) {
    return `+62${cleaned.slice(1)}`;
  }
  if (cleaned.startsWith("62")) {
    return `+${cleaned}`;
  }
  if (cleaned.startsWith("+")) {
    return cleaned;
  }
  return `+62${cleaned}`;
}

export function formatPhoneDisplay(phone: string): string {
  const e164 = formatPhoneE164(phone);
  // +628123456789 -> +62 812-3456-7890
  const digits = e164.replace(/\D/g, "");
  const country = digits.slice(0, 2);
  const rest = digits.slice(2);
  if (rest.length >= 8) {
    return `+${country} ${rest.slice(0, 3)}-${rest.slice(3, 7)}-${rest.slice(7)}`;
  }
  return `+${country} ${rest}`;
}
