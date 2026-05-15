import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography
} from "@mui/material";

import type { CalendarEventOccurrence, CurrentUser } from "@/types/domain";

function formatDateTime(iso: string, allDay: boolean): string {
  const d = new Date(iso);
  const dateStr = d.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
  if (allDay) return dateStr;
  const timeStr = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return `${dateStr} ${timeStr}`;
}

export function EventDetailDialog({
  event,
  currentUser,
  onEdit,
  onDelete,
  onClose
}: {
  event: CalendarEventOccurrence;
  currentUser: CurrentUser;
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  const canDelete = currentUser.is_admin || currentUser.id === event.created_by.id;

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Typography variant="h6" component="span" sx={{ flex: 1 }}>
          {event.title}
        </Typography>
        <IconButton onClick={onClose} size="small" aria-label="Close">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={1}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              When
            </Typography>
            <Typography variant="body2">
              {formatDateTime(event.starts_at, event.all_day)} —{" "}
              {formatDateTime(event.ends_at, event.all_day)}
            </Typography>
          </Box>
          {event.notes ? (
            <Box>
              <Typography variant="caption" color="text.secondary">
                Notes
              </Typography>
              <Typography variant="body2">{event.notes}</Typography>
            </Box>
          ) : null}
          <Box>
            <Typography variant="caption" color="text.secondary">
              Created by
            </Typography>
            <Typography variant="body2">{event.created_by.display_name}</Typography>
          </Box>
          {event.is_recurring ? (
            <Typography variant="caption" color="text.secondary">
              ↻ Recurring ({event.recurrence_rule})
            </Typography>
          ) : null}
        </Stack>
      </DialogContent>
      <DialogActions>
        {canDelete ? (
          <Button color="error" variant="outlined" startIcon={<DeleteIcon />} onClick={onDelete}>
            Delete
          </Button>
        ) : null}
        <Button variant="contained" startIcon={<EditIcon />} onClick={onEdit}>
          Edit
        </Button>
      </DialogActions>
    </Dialog>
  );
}
