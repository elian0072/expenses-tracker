from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Annual Expense Tracker API"
    environment: str = "development"
    database_url: str = "sqlite:///./expenses.db"
    session_cookie_name: str = "expense_session"
    session_days: int = 7
    cors_origins: list[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]
    seed_admin_email: str = "owner@example.com"
    seed_admin_password: str = "change-me-please"
    seed_admin_display_name: str = "Household Owner"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
