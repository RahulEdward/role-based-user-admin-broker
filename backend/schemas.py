from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from enum import Enum


class UserRole(str, Enum):
    USER = "user"
    BROKER = "broker"
    ADMIN = "admin"


class UserBase(BaseModel):
    username: str
    email: EmailStr
    role: UserRole = UserRole.USER


class UserCreate(UserBase):
    password: str
    broker_name: str = "angel"
    api_key: str


class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    is_active: Optional[bool] = None
    broker_name: Optional[str] = None
    api_key: Optional[str] = None


class User(UserBase):
    id: int
    is_active: bool
    broker_name: str
    is_2fa_enabled: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


class UserLogin(BaseModel):
    username: str
    password: str


class BrokerLogin(BaseModel):
    client_id: str
    pin: str
    totp_token: str


class Token(BaseModel):
    access_token: str
    token_type: str
    user: User


class TokenData(BaseModel):
    username: Optional[str] = None


class TOTPSetup(BaseModel):
    secret: str
    qr_code: str


class TOTPVerify(BaseModel):
    token: str