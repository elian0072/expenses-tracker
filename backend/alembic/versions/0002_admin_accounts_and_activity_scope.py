"""admin accounts and activity scope

Revision ID: 0002_admin_accounts_and_activity_scope
Revises: 0001_initial_schema
Create Date: 2026-03-29
"""

import sqlalchemy as sa

from alembic import op

revision = "0002_admin_accounts_and_activity_scope"
down_revision = "0001_initial_schema"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()

    op.add_column(
        "household_members",
        sa.Column("is_admin", sa.Boolean(), nullable=False, server_default=sa.text("false")),
    )
    op.add_column(
        "household_members",
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP")),
    )
    op.create_index("ix_household_members_is_admin", "household_members", ["is_admin"], unique=False)

    if bind.dialect.name == "postgresql":
        for value in ("member_created", "member_updated", "member_deleted", "member_role_changed"):
            op.execute(f"ALTER TYPE activityaction ADD VALUE IF NOT EXISTS '{value}'")

    subject_type_enum = sa.Enum("expense", "member", name="activitysubjecttype")
    subject_type_enum.create(bind, checkfirst=True)
    op.add_column(
        "activity_records",
        sa.Column("subject_type", subject_type_enum, nullable=True),
    )
    op.add_column("activity_records", sa.Column("subject_id", sa.Uuid(), nullable=True))
    op.alter_column("activity_records", "planning_year", existing_type=sa.Integer(), nullable=True)
    op.create_index("ix_activity_records_subject_type", "activity_records", ["subject_type"], unique=False)
    op.create_index("ix_activity_records_subject_id", "activity_records", ["subject_id"], unique=False)


def downgrade() -> None:
    bind = op.get_bind()

    op.drop_index("ix_activity_records_subject_id", table_name="activity_records")
    op.drop_index("ix_activity_records_subject_type", table_name="activity_records")
    op.drop_column("activity_records", "subject_id")
    op.drop_column("activity_records", "subject_type")

    op.execute("UPDATE activity_records SET planning_year = 0 WHERE planning_year IS NULL")
    op.alter_column("activity_records", "planning_year", existing_type=sa.Integer(), nullable=False)

    if bind.dialect.name == "postgresql":
        sa.Enum(name="activitysubjecttype").drop(bind, checkfirst=True)

    op.drop_index("ix_household_members_is_admin", table_name="household_members")
    op.drop_column("household_members", "updated_at")
    op.drop_column("household_members", "is_admin")

