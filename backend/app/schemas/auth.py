from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)


class CurrentUser(BaseModel):
    id: UUID
    email: EmailStr
    display_name: str
    is_admin: bool
    is_active: bool


class SessionInfo(BaseModel):
    token: str
    expires_at: datetime
