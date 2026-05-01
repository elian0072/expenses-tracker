import type { YearSummary } from "@/types/domain";

export type SummaryMetric = {
  key: string;
  label: string;
  value: string | number;
};

export function getSummaryMetrics(summary: YearSummary): SummaryMetric[] {
  return [
    { key: "planned", label: "Planned Total", value: summary.planned_total },
    { key: "purchased", label: "Purchased Total", value: summary.purchased_total },
    { key: "canceled", label: "Canceled Items", value: summary.canceled_count },
    { key: "count", label: "Total Items", value: summary.expense_count }
  ];
}
