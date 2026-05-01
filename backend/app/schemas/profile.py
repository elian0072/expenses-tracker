from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field


class ProfileResponse(BaseModel):
    id: UUID
    email: EmailStr
    display_name: str
    is_admin: bool
    is_active: bool
    last_login_at: datetime | None

    class Config:
        from_attributes = True


class ProfileUpdateRequest(BaseModel):
    email: EmailStr | None = None
    display_name: str | None = Field(default=None, min_length=1)
