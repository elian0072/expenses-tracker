import type { ExpenseStatus } from "@/types/domain";

const eurFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR"
});

export function formatCurrencyEur(value: number | string): string {
  const parsed = typeof value === "number" ? value : Number.parseFloat(value);
  if (Number.isNaN(parsed)) return eurFormatter.format(0);
  return eurFormatter.format(parsed);
}

export function formatDateTime(value: string): string {
  return new Date(value).toLocaleString("fr-FR");
}

export function formatStatusLabel(status: ExpenseStatus): string {
  if (status === "planned") return "Planned";
  if (status === "purchased") return "Purchased";
  return "Canceled";
}
