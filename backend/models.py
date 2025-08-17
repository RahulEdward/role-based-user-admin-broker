from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from sqlalchemy.sql import func
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(20), default="user", nullable=False)  # user, broker, admin
    is_active = Column(Boolean, default=True)
    
    # Broker specific fields
    broker_name = Column(String(50), default="angel")
    encrypted_api_key = Column(Text)
    
    # Broker session data (cleared on logout)
    client_id = Column(String(100))
    pin_number = Column(String(10))  # Store temporarily for session
    access_token = Column(Text)
    feed_token = Column(Text)
    broker_session_active = Column(Boolean, default=False)
    
    # 2FA
    totp_secret = Column(String(32))
    is_2fa_enabled = Column(Boolean, default=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())