import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "Mentis Project Tracker"
    PROJECT_DESCRIPTION: str = "A web application designed to centralize, manage, and visualize project progress"
    API_V1_STR: str = "/api/v1"

    # Security settings
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Database settings
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/mentis")

    # AI settings
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    AI_MODEL: str = "gpt-3.5-turbo"

    # CORS settings
    BACKEND_CORS_ORIGINS: list[str] = ["http://localhost:5173", "http://localhost:8000"]
    # Environment
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")

    # Frontend URL for links in emails
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173")

    # Email settings
    MAIL_SERVER: str = os.getenv("MAIL_SERVER", "")
    MAIL_PORT: int = int(os.getenv("MAIL_PORT", "587"))
    MAIL_USERNAME: str = os.getenv("MAIL_USERNAME", "")
    MAIL_PASSWORD: str = os.getenv("MAIL_PASSWORD", "")
    MAIL_FROM: str = os.getenv("MAIL_FROM", "noreply@example.com")
    MAIL_USE_TLS: bool = os.getenv("MAIL_USE_TLS", "True").lower() == "true"

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
