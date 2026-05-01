"""initial schema

Revision ID: 0001_initial_schema
Revises:
Create Date: 2026-03-28
"""

import sqlalchemy as sa

from alembic import op

revision = "0001_initial_schema"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "household_members",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("display_name", sa.String(length=120), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.Column("last_login_at", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_household_members_email", "household_members", ["email"], unique=True)

    op.create_table(
        "user_sessions",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("member_id", sa.Uuid(), nullable=False),
        sa.Column("session_token", sa.String(length=255), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("revoked_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("last_seen_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.Column("user_agent", sa.String(length=255), nullable=True),
        sa.ForeignKeyConstraint(["member_id"], ["household_members.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_user_sessions_session_token", "user_sessions", ["session_token"], unique=True)

    op.create_table(
        "expense_entries",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("title", sa.String(length=160), nullable=False),
        sa.Column("amount", sa.Numeric(12, 2), nullable=False),
        sa.Column("planning_year", sa.Integer(), nullable=False),
        sa.Column("target_date", sa.Date(), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("status", sa.Enum("planned", "purchased", "canceled", name="expensestatus"), nullable=False),
        sa.Column("version", sa.Integer(), nullable=False),
        sa.Column("created_by_id", sa.Uuid(), nullable=False),
        sa.Column("updated_by_id", sa.Uuid(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.ForeignKeyConstraint(["created_by_id"], ["household_members.id"], ondelete="RESTRICT"),
        sa.ForeignKeyConstraint(["updated_by_id"], ["household_members.id"], ondelete="RESTRICT"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_expense_entries_planning_year", "expense_entries", ["planning_year"], unique=False)
    op.create_index("ix_expense_entries_status", "expense_entries", ["status"], unique=False)
    op.create_unique_constraint("uq_expense_version", "expense_entries", ["id", "version"])

    op.create_table(
        "activity_records",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("actor_id", sa.Uuid(), nullable=False),
        sa.Column("expense_id", sa.Uuid(), nullable=True),
        sa.Column("planning_year", sa.Integer(), nullable=False),
        sa.Column(
            "action_type",
            sa.Enum("created", "updated", "deleted", "status_changed", name="activityaction"),
            nullable=False,
        ),
        sa.Column("summary", sa.String(length=255), nullable=False),
        sa.Column("details", sa.JSON(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.ForeignKeyConstraint(["actor_id"], ["household_members.id"], ondelete="RESTRICT"),
        sa.ForeignKeyConstraint(["expense_id"], ["expense_entries.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_activity_records_planning_year", "activity_records", ["planning_year"], unique=False)
    op.create_index("ix_activity_records_created_at", "activity_records", ["created_at"], unique=False)
    op.create_index("ix_activity_records_action_type", "activity_records", ["action_type"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_activity_records_action_type", table_name="activity_records")
    op.drop_index("ix_activity_records_created_at", table_name="activity_records")
    op.drop_index("ix_activity_records_planning_year", table_name="activity_records")
    op.drop_table("activity_records")
    op.drop_constraint("uq_expense_version", "expense_entries", type_="unique")
    op.drop_index("ix_expense_entries_status", table_name="expense_entries")
    op.drop_index("ix_expense_entries_planning_year", table_name="expense_entries")
    op.drop_table("expense_entries")
    op.drop_index("ix_user_sessions_session_token", table_name="user_sessions")
    op.drop_table("user_sessions")
    op.drop_index("ix_household_members_email", table_name="household_members")
    op.drop_table("household_members")

