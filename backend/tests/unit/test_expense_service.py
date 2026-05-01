from datetime import date
from decimal import Decimal

import pytest

from app.core.errors import AppError
from app.models.expense import ExpenseStatus
from app.schemas.expense import ExpenseCreateRequest
from app.services.expense_service import ExpenseService


def test_target_date_must_match_year() -> None:
    with pytest.raises(AppError):
        ExpenseService._validate_target_date(2026, date(2027, 1, 1))


def test_totals_ignore_canceled() -> None:
    class Expense:
        def __init__(self, amount: str, status: ExpenseStatus) -> None:
            self.amount = Decimal(amount)
            self.status = status

    planned, purchased = ExpenseService.get_totals(
        [
            Expense("100", ExpenseStatus.planned),
            Expense("30", ExpenseStatus.canceled),
            Expense("70", ExpenseStatus.purchased),
        ]
    )
    assert planned == Decimal("100")
    assert purchased == Decimal("70")


def test_create_payload_requires_positive_amount() -> None:
    with pytest.raises(ValueError):
        ExpenseCreateRequest(title="Broken", amount=Decimal("0"), status=ExpenseStatus.planned)

