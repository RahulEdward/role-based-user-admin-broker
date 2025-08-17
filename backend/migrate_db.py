#!/usr/bin/env python3
"""
Database migration script to add new columns
"""
import sqlite3
from config import settings

def migrate_database():
    """Add missing columns to existing database"""
    db_path = settings.database_url.replace("sqlite:///./", "")
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check if columns exist and add them if they don't
        cursor.execute("PRAGMA table_info(users)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'pin_number' not in columns:
            cursor.execute("ALTER TABLE users ADD COLUMN pin_number VARCHAR(10)")
            print("Added pin_number column")
        
        if 'broker_session_active' not in columns:
            cursor.execute("ALTER TABLE users ADD COLUMN broker_session_active BOOLEAN DEFAULT 0")
            print("Added broker_session_active column")
        
        conn.commit()
        conn.close()
        print("Database migration completed successfully")
        
    except Exception as e:
        print(f"Migration error: {e}")

if __name__ == "__main__":
    migrate_database()