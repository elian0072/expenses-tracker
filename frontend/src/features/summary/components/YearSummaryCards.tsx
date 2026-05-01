import { Card, CardContent, Grid, Typography } from "@mui/material";

import { getSummaryMetrics } from "@/features/summary/selectors";
import type { YearSummary } from "@/types/domain";
import { formatCurrencyEur } from "@/utils/formatters";

export function YearSummaryCards({ summary }: { summary: YearSummary }) {
  const metrics = getSummaryMetrics(summary);

  return (
    <Grid container spacing={2}>
      {metrics.map((metric) => (
        <Grid key={metric.key} size={{ xs: 12, sm: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                {metric.label}
              </Typography>
              <Typography variant="h5">
                {typeof metric.value === "string" ? formatCurrencyEur(metric.value) : metric.value}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
