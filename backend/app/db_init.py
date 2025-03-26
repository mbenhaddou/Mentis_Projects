"""
Database initialization script.
Run this to create all tables in the database.
"""

from app.core.db import Base, engine

def init_db():
    # Create all tables
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully.")

if __name__ == "__main__":
    init_db()