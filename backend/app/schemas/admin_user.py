from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field


class UserSummary(BaseModel):
    id: UUID
    email: EmailStr
    display_name: str
    is_admin: bool
    is_active: bool
    last_login_at: datetime | None
    created_at: datetime

    class Config:
        from_attributes = True


class AdminUserListResponse(BaseModel):
    items: list[UserSummary]


class UserCreateRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    display_name: str = Field(min_length=1)
    is_admin: bool = False
    is_active: bool = True


class UserUpdateRequest(BaseModel):
    email: EmailStr | None = None
    password: str | None = Field(default=None, min_length=8)
    display_name: str | None = Field(default=None, min_length=1)
    is_admin: bool | None = None
    is_active: bool | None = None

