import bcrypt
import os
from dotenv import load_dotenv

from app.models import User

load_dotenv()


def verify_password(stored_password, provided_password):
    """
    Comprehensive password verification with detailed logging
    """
    try:
        print(f"Raw stored password: {stored_password!r}")
        print(f"Password type: {type(stored_password)}")

        # TEMPORARY FIX: Check if the stored password is plain text
        # by seeing if it's missing the bcrypt format
        if isinstance(stored_password, str) and not stored_password.startswith('$2'):
            # This is a plain text password - do direct comparison
            print("WARNING: Plain text password detected! Security risk!")
            return stored_password == provided_password

        # Normal bcrypt verification path
        if isinstance(stored_password, str):
            stored_password = stored_password.encode('utf-8')

        if isinstance(provided_password, str):
            provided_password = provided_password.encode('utf-8')

        print(f"Processed stored password: {stored_password!r}")

        # Attempt verification
        result = bcrypt.checkpw(provided_password, stored_password)
        print(f"Verification result: {result}")
        return result
    except Exception as e:
        print(f"Unexpected error during password verification: {e}")
        print(f"Error type: {type(e)}")
        return False


# Debugging login function
def debug_login(session, email, password):
    """
    Detailed login debugging
    """
    try:
        # Find user
        user = session.query(User).filter_by(email=email).first()

        if not user:
            print(f"No user found with email: {email}")
            return None

        # Detailed user information
        print("User found:")
        print(f"Email: {user.email}")
        print(f"Password hash from DB: {user.password_hash}")

        # Verify password with detailed logging
        if verify_password(user.password_hash, password):
            print("Password verification successful")
            return user
        else:
            print("Password verification failed")
            return None

    except Exception as e:
        print(f"Login debugging error: {e}")
        return None


# Manual verification script
def manual_password_check(email, password):
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker

    # Create session (replace with your actual connection string)
    engine = create_engine(os.getenv("DATABASE_URL"))
    Session = sessionmaker(bind=engine)
    session = Session()

    try:
        # Attempt login with debugging
        result = debug_login(session, email, password)

        if result:
            print("Login would be successful")
        else:
            print("Login failed")

    finally:
        session.close()


# Use this in a Python shell or script
if __name__ == '__main__':
    manual_password_check('admin@gmail.com', 'AdminPassword123!')