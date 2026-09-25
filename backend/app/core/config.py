# ==========================================================
# Application Configuration
# ==========================================================

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):

    # ======================================================
    # Application
    # ======================================================

    PROJECT_NAME: str = "Elderly Care AI"

    # ======================================================
    # Database
    # ======================================================

    DATABASE_URL: str

    # ======================================================
    # Authentication
    # ======================================================

    SECRET_KEY: str

    ALGORITHM: str = "HS256"

    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    # ======================================================
    # Gemini AI
    # ======================================================

    GEMINI_API_KEY: str

    # ======================================================
    # Invitation email delivery
    # ======================================================

    APP_BASE_URL: str = "http://localhost:3000"
    SMTP_HOST: str | None = None
    SMTP_PORT: int = 587
    SMTP_USERNAME: str | None = None
    SMTP_PASSWORD: str | None = None
    SMTP_FROM_EMAIL: str | None = None
    SMTP_USE_TLS: bool = True

    # Medication schedules are interpreted in the care team's local timezone.
    MEDICATION_REMINDER_TIMEZONE: str = "Asia/Kolkata"

    # ======================================================
    # Environment Configuration
    # ======================================================

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


# ==========================================================
# Singleton
# ==========================================================

settings = Settings()
