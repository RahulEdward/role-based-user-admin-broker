#!/usr/bin/env python3
"""
Initialize database with admin user
"""
from sqlalchemy.orm import Session
from database import engine, SessionLocal
from models import Base, User
from utils.security import get_password_hash


def create_admin_user():
    """Create default admin user"""
    db = SessionLocal()
    
    try:
        # Check if admin user already exists
        admin_user = db.query(User).filter(User.role == "admin").first()
        if admin_user:
            print("Admin user already exists")
            return
        
        # Create admin user
        admin_user = User(
            username="admin",
            email="admin@stockmarket.com",
            hashed_password=get_password_hash("admin123"),
            role="admin",
            is_active=True,
            broker_name="angel"
        )
        
        db.add(admin_user)
        db.commit()
        print("Admin user created successfully")
        print("Username: admin")
        print("Password: admin123")
        print("Please change the password after first login!")
        
    except Exception as e:
        print(f"Error creating admin user: {e}")
        db.rollback()
    finally:
        db.close()


def init_database():
    """Initialize database tables"""
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully")
    
    print("Creating admin user...")
    create_admin_user()


if __name__ == "__main__":
    init_database()