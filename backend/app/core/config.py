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