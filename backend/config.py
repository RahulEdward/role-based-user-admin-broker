from pydantic_settings import BaseSettings
from typing import Optional
import os


class Settings(BaseSettings):
    database_url: str = "sqlite:///./stockauth.db"
    secret_key: str = "your-secret-key-change-this-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    encryption_key: str = "your-32-byte-encryption-key-change-this"
    
    # Angel Broker API settings
    angel_api_url: str = "https://apiconnect.angelbroking.com"
    
    class Config:
        env_file = ".env"


settings = Settings()