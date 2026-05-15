import { useQuery } from "@tanstack/react-query";
import {
  Alert,
  Card,
  CardContent,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography
} from "@mui/material";
import { useState } from "react";

import { ApiError } from "@/services/api-client";
import { fetchActivity } from "@/services/activity";
import type { ActivityItem } from "@/types/domain";
import { formatDateTime } from "@/utils/formatters";

export function ActivityPage() {
  const [year, setYear] = useState<number | "">("" as number | "");
  const query = useQuery({
    queryKey: ["activity", year],
    queryFn: () => fetchActivity(year === "" ? undefined : year, 50),
    staleTime: 2 * 60_000,
    placeholderData: (previousData) => previousData,
    refetchOnMount: "always"
  });

  const items: ActivityItem[] = query.data ?? [];
  const errorMessage =
    query.error instanceof ApiError && query.error.status === 403
      ? "Logs are restricted to administrators."
      : "Unable to load logs.";

  return (
    <Stack spacing={2}>
      <Card>
        <CardContent>
          <Typography variant="h4">Logs</Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            See who changed what and when across expenses and calendar.
          </Typography>
          <TextField
            label="Filter by year (optional)"
            type="number"
            value={year}
            onChange={(event) => {
              const val = event.target.value;
              if (val === "") {
                setYear("");
              } else {
                const parsed = Number.parseInt(val, 10);
                if (Number.isFinite(parsed)) setYear(parsed);
              }
            }}
            sx={{ maxWidth: 220 }}
          />
        </CardContent>
      </Card>

      {query.isPending ? <Alert severity="info">Loading logs...</Alert> : null}
      {query.isError ? <Alert severity="error">{errorMessage}</Alert> : null}
      {!query.isPending && !query.isError && items.length === 0 ? (
        <Typography color="text.secondary">No logs recorded yet.</Typography>
      ) : null}

      {!query.isPending && !query.isError && items.length > 0 ? (
        <Card>
          <CardContent>
            <Table size="small" aria-label="Logs table">
              <TableHead>
                <TableRow>
                  <TableCell>Actor</TableCell>
                  <TableCell>Action</TableCell>
                  <TableCell>Year</TableCell>
                  <TableCell>When</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.actor.display_name}</TableCell>
                    <TableCell>{item.summary}</TableCell>
                    <TableCell>{item.planning_year ?? "-"}</TableCell>
                    <TableCell>{formatDateTime(item.created_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : null}
    </Stack>
  );
}
