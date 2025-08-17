from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models import User
from schemas import User as UserSchema, UserUpdate
from routers.auth import get_current_user

router = APIRouter()


def require_admin(current_user: User = Depends(get_current_user)):
    """Dependency to require admin role"""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user


@router.get("/users", response_model=List[UserSchema])
def get_all_users(
    skip: int = 0,
    limit: int = 100,
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get all users (admin only)"""
    users = db.query(User).offset(skip).limit(limit).all()
    return users


@router.get("/users/{user_id}", response_model=UserSchema)
def get_user_by_id(
    user_id: int,
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get user by ID (admin only)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.put("/users/{user_id}", response_model=UserSchema)
def update_user(
    user_id: int,
    user_update: UserUpdate,
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Update user (admin only)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user_update.username is not None:
        user.username = user_update.username
    if user_update.email is not None:
        user.email = user_update.email
    if user_update.is_active is not None:
        user.is_active = user_update.is_active
    if user_update.broker_name is not None:
        user.broker_name = user_update.broker_name
    
    db.commit()
    db.refresh(user)
    return user


@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Delete user (admin only)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.role == "admin":
        raise HTTPException(status_code=400, detail="Cannot delete admin user")
    
    db.delete(user)
    db.commit()
    return {"message": "User deleted successfully"}


@router.get("/stats")
def get_admin_stats(
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get admin dashboard statistics"""
    total_users = db.query(User).count()
    active_users = db.query(User).filter(User.is_active == True).count()
    admin_users = db.query(User).filter(User.role == "admin").count()
    broker_users = db.query(User).filter(User.role == "broker").count()
    regular_users = db.query(User).filter(User.role == "user").count()
    
    return {
        "total_users": total_users,
        "active_users": active_users,
        "admin_users": admin_users,
        "broker_users": broker_users,
        "regular_users": regular_users
    }