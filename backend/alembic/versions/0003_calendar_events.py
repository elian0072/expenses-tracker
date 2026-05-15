"""calendar events

Revision ID: 0003_calendar_events
Revises: 0002_admin_accounts_and_activity_scope
Create Date: 2026-05-15
"""

import sqlalchemy as sa

from alembic import op

revision = "0003_calendar_events"
down_revision = "0002_admin_accounts_and_activity_scope"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()

    recurrence_enum = sa.Enum("none", "daily", "weekly", "monthly", name="recurrencerule")
    recurrence_enum.create(bind, checkfirst=True)

    op.create_table(
        "calendar_events",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("starts_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("ends_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("all_day", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("recurrence_rule", recurrence_enum, nullable=False, server_default="none"),
        sa.Column("recurrence_end", sa.Date(), nullable=True),
        sa.Column("version", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("created_by_id", sa.Uuid(), nullable=False),
        sa.Column("updated_by_id", sa.Uuid(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.ForeignKeyConstraint(["created_by_id"], ["household_members.id"], ondelete="RESTRICT"),
        sa.ForeignKeyConstraint(["updated_by_id"], ["household_members.id"], ondelete="RESTRICT"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_calendar_events_starts_at", "calendar_events", ["starts_at"], unique=False)
    op.create_index("ix_calendar_events_created_by_id", "calendar_events", ["created_by_id"], unique=False)

    if bind.dialect.name == "postgresql":
        op.execute("ALTER TYPE activitysubjecttype ADD VALUE IF NOT EXISTS 'calendar_event'")


def downgrade() -> None:
    bind = op.get_bind()

    op.drop_index("ix_calendar_events_created_by_id", table_name="calendar_events")
    op.drop_index("ix_calendar_events_starts_at", table_name="calendar_events")
    op.drop_table("calendar_events")

    sa.Enum(name="recurrencerule").drop(bind, checkfirst=True)
