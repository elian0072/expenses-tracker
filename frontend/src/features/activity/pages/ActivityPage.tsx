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
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState<number>(currentYear);
  const query = useQuery({
    queryKey: ["activity", year],
    queryFn: () => fetchActivity(year, 50),
    staleTime: 2 * 60_000,
    placeholderData: (previousData) => previousData,
    refetchOnMount: "always"
  });

  const items: ActivityItem[] = query.data ?? [];
  const errorMessage =
    query.error instanceof ApiError && query.error.status === 403
      ? "Activity history is restricted to administrators."
      : "Unable to load activity history.";

  return (
    <Stack spacing={2}>
      <Card>
        <CardContent>
          <Typography variant="h4">Activity History</Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            See who changed what and when.
          </Typography>
          <TextField
            label="Year"
            type="number"
            value={year}
            onChange={(event) => {
              const parsed = Number.parseInt(event.target.value, 10);
              if (Number.isFinite(parsed)) {
                setYear(parsed);
              }
            }}
            sx={{ maxWidth: 220 }}
          />
        </CardContent>
      </Card>

      {query.isPending ? <Alert severity="info">Loading activity...</Alert> : null}
      {query.isError ? <Alert severity="error">{errorMessage}</Alert> : null}
      {!query.isPending && !query.isError && items.length === 0 ? (
        <Typography color="text.secondary">No activity recorded for this year yet.</Typography>
      ) : null}

      {!query.isPending && !query.isError && items.length > 0 ? (
        <Card>
          <CardContent>
            <Table size="small" aria-label="Activity history table">
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
