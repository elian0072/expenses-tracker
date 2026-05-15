export type ExpenseStatus = "planned" | "purchased" | "canceled";

export type CurrentUser = {
  id: string;
  email: string;
  display_name: string;
  is_admin: boolean;
  is_active: boolean;
};

export type UserProfile = CurrentUser & {
  last_login_at: string | null;
};

export type Expense = {
  id: string;
  title: string;
  amount: string;
  planning_year: number;
  target_date: string | null;
  notes: string | null;
  status: ExpenseStatus;
  version: number;
  created_at: string;
  updated_at: string;
};

export type YearSummary = {
  year: number;
  planned_total: string;
  purchased_total: string;
  canceled_count: number;
  expense_count: number;
};

export type ActivityItem = {
  id: string;
  actor: {
    id: string;
    display_name: string;
  };
  subject_type: "expense" | "member" | null;
  subject_id: string | null;
  expense_id: string | null;
  planning_year: number | null;
  action_type: string;
  summary: string;
  details: Record<string, unknown>;
  created_at: string;
};

export type AdminUser = {
  id: string;
  email: string;
  display_name: string;
  is_admin: boolean;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
};

export type RecurrenceRule = "none" | "daily" | "weekly" | "monthly";

export type CalendarEventCreator = {
  id: string;
  display_name: string;
};

export type CalendarEvent = {
  id: string;
  title: string;
  starts_at: string;
  ends_at: string;
  all_day: boolean;
  notes: string | null;
  recurrence_rule: RecurrenceRule;
  recurrence_end: string | null;
  version: number;
  created_by: CalendarEventCreator;
  created_at: string;
  updated_at: string;
};

export type CalendarEventOccurrence = {
  event_id: string;
  title: string;
  starts_at: string;
  ends_at: string;
  all_day: boolean;
  notes: string | null;
  recurrence_rule: RecurrenceRule;
  is_recurring: boolean;
  created_by: CalendarEventCreator;
  version: number;
};
