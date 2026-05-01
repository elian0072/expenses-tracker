from decimal import Decimal

from app.models.expense import ExpenseEntry, ExpenseStatus
from app.services.year_summary_service import YearSummaryService


def test_year_summary_aggregates_values(member) -> None:
    from app.db.session import SessionLocal

    with SessionLocal() as db:
        db.add_all(
            [
                ExpenseEntry(
                    title="Expense A",
                    amount=Decimal("100"),
                    planning_year=2026,
                    status=ExpenseStatus.planned,
                    created_by_id=member.id,
                    updated_by_id=member.id,
                ),
                ExpenseEntry(
                    title="Expense B",
                    amount=Decimal("50"),
                    planning_year=2026,
                    status=ExpenseStatus.purchased,
                    created_by_id=member.id,
                    updated_by_id=member.id,
                ),
                ExpenseEntry(
                    title="Expense C",
                    amount=Decimal("10"),
                    planning_year=2026,
                    status=ExpenseStatus.canceled,
                    created_by_id=member.id,
                    updated_by_id=member.id,
                ),
            ]
        )
        db.commit()
        summary = YearSummaryService(db).build_summary(2026)

    assert summary.planned_total == Decimal("100")
    assert summary.purchased_total == Decimal("50")
    assert summary.canceled_count == 1
    assert summary.expense_count == 3

