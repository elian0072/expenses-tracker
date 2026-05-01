import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { Chip, IconButton, Stack, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";

import type { AdminUser } from "@/types/domain";
import { formatDateTime } from "@/utils/formatters";

export function UsersTable({
  users,
  onEdit,
  onDelete
}: {
  users: AdminUser[];
  onEdit: (user: AdminUser) => void;
  onDelete: (user: AdminUser) => void;
}) {
  return (
    <Table size="small" aria-label="Users administration table">
      <TableHead>
        <TableRow>
          <TableCell>Email</TableCell>
          <TableCell>Display Name</TableCell>
          <TableCell>Role</TableCell>
          <TableCell>Status</TableCell>
          <TableCell>Last Login</TableCell>
          <TableCell align="right">Actions</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id} hover>
            <TableCell>{user.email}</TableCell>
            <TableCell>{user.display_name}</TableCell>
            <TableCell>
              {user.is_admin ? <Chip label="Admin" size="small" color="primary" /> : <Chip label="Member" size="small" />}
            </TableCell>
            <TableCell>
              {user.is_active ? <Chip label="Active" size="small" color="success" /> : <Chip label="Inactive" size="small" />}
            </TableCell>
            <TableCell>{user.last_login_at ? formatDateTime(user.last_login_at) : "Never"}</TableCell>
            <TableCell align="right">
              <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                <IconButton size="small" aria-label={`Edit ${user.email}`} onClick={() => onEdit(user)}>
                  <EditOutlinedIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" color="error" aria-label={`Delete ${user.email}`} onClick={() => onDelete(user)}>
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </Stack>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

