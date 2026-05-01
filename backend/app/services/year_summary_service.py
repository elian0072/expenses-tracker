from dataclasses import dataclass
from decimal import Decimal

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.expense import ExpenseEntry, ExpenseStatus


@dataclass
class YearSummary:
    year: int
    planned_total: Decimal
    purchased_total: Decimal
    canceled_count: int
    expense_count: int


class YearSummaryService:
    def __init__(self, db: Session) -> None:
        self.db = db

    def build_summary(self, year: int) -> YearSummary:
        rows = list(
            self.db.execute(
                select(
                    ExpenseEntry.status,
                    func.coalesce(func.sum(ExpenseEntry.amount), 0),
                    func.count(ExpenseEntry.id),
                ).where(ExpenseEntry.planning_year == year).group_by(ExpenseEntry.status)
            )
        )
        planned_total = Decimal(0)
        purchased_total = Decimal(0)
        canceled_count = 0
        expense_count = 0

        for status, amount_sum, count in rows:
            expense_count += int(count)
            if status == ExpenseStatus.planned:
                planned_total = Decimal(amount_sum)
            elif status == ExpenseStatus.purchased:
                purchased_total = Decimal(amount_sum)
            elif status == ExpenseStatus.canceled:
                canceled_count = int(count)

        return YearSummary(
            year=year,
            planned_total=planned_total,
            purchased_total=purchased_total,
            canceled_count=canceled_count,
            expense_count=expense_count,
        )

