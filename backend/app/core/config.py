"""
Application configuration and settings.
Manages environment variables and app-wide settings.
"""
import os
from typing import List
from dotenv import load_dotenv

load_dotenv()


class Settings:
    """Application settings loaded from environment variables."""
    
    # App Info
    APP_NAME: str = "AI Twin Analytics API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = os.getenv("DEBUG", "False").lower() == "true"
    
    # API Settings
    API_V1_PREFIX: str = "/api"
    
    # CORS Settings
    CORS_ORIGINS: List[str] = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000").split(",")
    
    # Database Settings
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./ai_twin_analytics.db")
    
    # Server Settings
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))


# Create global settings instance
settings = Settings()
