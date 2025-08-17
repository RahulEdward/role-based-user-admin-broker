from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models import User
from schemas import User as UserSchema, UserUpdate
from routers.auth import get_current_user

router = APIRouter()


@router.get("/me", response_model=UserSchema)
def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information"""
    return current_user


@router.put("/me", response_model=UserSchema)
def update_current_user(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update current user information"""
    from utils.security import encrypt_data
    
    if user_update.username is not None:
        # Check if username is already taken
        existing_user = db.query(User).filter(
            User.username == user_update.username,
            User.id != current_user.id
        ).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Username already taken")
        current_user.username = user_update.username
    
    if user_update.email is not None:
        # Check if email is already taken
        existing_user = db.query(User).filter(
            User.email == user_update.email,
            User.id != current_user.id
        ).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already taken")
        current_user.email = user_update.email
    
    if user_update.broker_name is not None:
        current_user.broker_name = user_update.broker_name
    
    if user_update.api_key is not None:
        current_user.encrypted_api_key = encrypt_data(user_update.api_key)
    
    db.commit()
    db.refresh(current_user)
    return current_user


@router.get("/profile", response_model=UserSchema)
def get_user_profile(current_user: User = Depends(get_current_user)):
    """Get user profile with broker information"""
    return current_user