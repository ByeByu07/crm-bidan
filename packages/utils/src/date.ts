import {
  addDays as dateFnsAddDays,
  format as dateFnsFormat,
  differenceInDays,
  startOfDay,
  isAfter,
  isBefore,
  isSameDay,
} from "date-fns";

const WIB_OFFSET = 7; // UTC+7

export function toWIB(date: Date): Date {
  return new Date(date.getTime() + WIB_OFFSET * 60 * 60 * 1000);
}

export function fromWIB(date: Date): Date {
  return new Date(date.getTime() - WIB_OFFSET * 60 * 60 * 1000);
}

export function addDays(date: Date, days: number): Date {
  return dateFnsAddDays(date, days);
}

export function formatDate(
  date: Date | string,
  pattern = "dd MMM yyyy",
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return dateFnsFormat(d, pattern);
}

export function formatDateTime(
  date: Date | string,
  pattern = "dd MMM yyyy HH:mm",
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return dateFnsFormat(d, pattern);
}

export function daysBetween(a: Date | string, b: Date | string): number {
  const da = typeof a === "string" ? new Date(a) : a;
  const db = typeof b === "string" ? new Date(b) : b;
  return differenceInDays(startOfDay(db), startOfDay(da));
}

export function isOverdue(date: Date | string): boolean {
  const d = typeof date === "string" ? new Date(date) : date;
  return isBefore(startOfDay(d), startOfDay(new Date()));
}

export function isToday(date: Date | string): boolean {
  const d = typeof date === "string" ? new Date(date) : date;
  return isSameDay(d, new Date());
}

export function startOfToday(): Date {
  return startOfDay(new Date());
}
