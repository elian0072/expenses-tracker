from datetime import date, datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, Field, model_validator

from app.models.expense import ExpenseStatus


class ExpenseCreateRequest(BaseModel):
    title: str = Field(min_length=1)
    amount: Decimal = Field(gt=0)
    status: ExpenseStatus
    target_date: date | None = None
    notes: str | None = None


class ExpenseUpdateRequest(BaseModel):
    version: int = Field(ge=1)
    title: str | None = None
    amount: Decimal | None = Field(default=None, gt=0)
    status: ExpenseStatus | None = None
    target_date: date | None = None
    notes: str | None = None


class ExpenseResponse(BaseModel):
    id: UUID
    title: str
    amount: Decimal
    planning_year: int
    target_date: date | None
    notes: str | None
    status: ExpenseStatus
    version: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ExpenseListResponse(BaseModel):
    year: int
    items: list[ExpenseResponse]


class YearSummaryResponse(BaseModel):
    year: int
    planned_total: Decimal
    purchased_total: Decimal
    canceled_count: int
    expense_count: int


class PlanningYearPath(BaseModel):
    year: int

    @model_validator(mode="after")
    def validate_year(self) -> "PlanningYearPath":
        if self.year < 2000 or self.year > 2100:
            raise ValueError("year must be between 2000 and 2100")
        return self

