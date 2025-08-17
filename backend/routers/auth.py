from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta

from database import get_db
from models import User
from schemas import UserCreate, User as UserSchema, Token, BrokerLogin, TOTPSetup, TOTPVerify
from utils.security import (
    verify_password, get_password_hash, create_access_token, 
    encrypt_data, generate_totp_secret, generate_qr_code, verify_totp
)
from config import settings

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")



def get_user_by_username(db: Session, username: str):
    return db.query(User).filter(User.username == username).first()

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

def authenticate_user(db: Session, username: str, password: str):
    user = get_user_by_username(db, username)
    if not user:
        user = get_user_by_email(db, username)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    from utils.security import verify_token
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    username = verify_token(token)
    if username is None:
        raise credentials_exception
        
    user = get_user_by_username(db, username=username)
    if user is None:
        raise credentials_exception
    return user

@router.post("/register", response_model=UserSchema)
def register(user: UserCreate, db: Session = Depends(get_db)):
    # Check if user exists
    db_user = get_user_by_username(db, username=user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    db_user = get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user
    hashed_password = get_password_hash(user.password)
    encrypted_api_key = encrypt_data(user.api_key)
    
    db_user = User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password,
        role="user",  # Default role for new registrations
        broker_name=user.broker_name,
        encrypted_api_key=encrypted_api_key
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user

@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check if user is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account is disabled"
        )
    
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user": user
    }


@router.post("/setup-2fa", response_model=TOTPSetup)
def setup_2fa(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Setup 2FA for the current user"""
    if current_user.is_2fa_enabled:
        raise HTTPException(status_code=400, detail="2FA is already enabled")
    
    secret = generate_totp_secret()
    qr_code = generate_qr_code(current_user.username, secret)
    
    # Store the secret temporarily (user needs to verify before enabling)
    current_user.totp_secret = secret
    db.commit()
    
    return {"secret": secret, "qr_code": qr_code}


@router.post("/verify-2fa")
def verify_2fa(
    totp_data: TOTPVerify, 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    """Verify and enable 2FA"""
    if not current_user.totp_secret:
        raise HTTPException(status_code=400, detail="2FA setup not initiated")
    
    if not verify_totp(current_user.totp_secret, totp_data.token):
        raise HTTPException(status_code=400, detail="Invalid TOTP token")
    
    current_user.is_2fa_enabled = True
    db.commit()
    
    return {"message": "2FA enabled successfully"}


@router.get("/debug-2fa")
def debug_2fa(current_user: User = Depends(get_current_user)):
    """Debug endpoint to get current TOTP code"""
    if not current_user.totp_secret:
        raise HTTPException(status_code=400, detail="2FA not setup")
    
    import pyotp
    totp = pyotp.TOTP(current_user.totp_secret)
    current_code = totp.now()
    
    return {
        "secret": current_user.totp_secret,
        "current_code": current_code,
        "username": current_user.username
    }


@router.post("/broker-login")
def broker_login(
    broker_data: BrokerLogin,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Handle broker login with Client ID, PIN, TOTP and API Key from database"""
    
    # Check if user has API key stored
    if not current_user.encrypted_api_key:
        raise HTTPException(status_code=400, detail="API Key not found. Please update your profile.")
    
    # Verify 2FA is enabled and token is valid
    if not current_user.is_2fa_enabled:
        raise HTTPException(status_code=400, detail="2FA must be enabled for broker access")
    
    if not current_user.totp_secret:
        raise HTTPException(status_code=400, detail="2FA not properly configured")
    
    if not verify_totp(current_user.totp_secret, broker_data.totp_token):
        raise HTTPException(status_code=400, detail="Invalid 2FA token")
    
    # Decrypt API key for broker authentication
    from utils.security import decrypt_data
    try:
        api_key = decrypt_data(current_user.encrypted_api_key)
    except Exception:
        raise HTTPException(status_code=400, detail="Failed to decrypt API key")
    
    # Store broker session data
    current_user.client_id = broker_data.client_id
    current_user.pin_number = broker_data.pin  # Store temporarily for session
    
    # Simulate Angel Broker API authentication
    # In real implementation, you would call Angel Broker API with:
    # - client_id, pin, totp_token, api_key
    # Here we simulate successful authentication and token generation
    
    import time
    import hashlib
    
    # Generate simulated tokens (in real app, these come from Angel Broker)
    session_id = hashlib.md5(f"{current_user.client_id}{time.time()}".encode()).hexdigest()
    current_user.access_token = f"angel_access_token_{session_id}"
    current_user.feed_token = f"angel_feed_token_{session_id}"
    current_user.broker_session_active = True
    
    db.commit()
    
    return {
        "message": "Broker authentication successful",
        "access_token": current_user.access_token,
        "feed_token": current_user.feed_token,
        "client_id": current_user.client_id,
        "broker_session_active": True
    }


@router.post("/logout")
def logout_user(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Logout user and clear all broker session data"""
    
    # Clear all broker session data
    current_user.client_id = None
    current_user.pin_number = None
    current_user.access_token = None
    current_user.feed_token = None
    current_user.broker_session_active = False
    
    db.commit()
    
    return {
        "message": "Logged out successfully. All broker session data cleared."
    }