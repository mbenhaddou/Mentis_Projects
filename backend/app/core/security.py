from datetime import datetime, timedelta
from typing import Any, Union
import bcrypt

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.db import get_db
from app.models.user import User

# Password context for hashing and verifying
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 scheme for token retrieval
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def create_access_token(subject: Union[str, Any], expires_delta: timedelta = None) -> str:
    """
    Create a JWT access token
    """
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    # JWT payload
    to_encode = {"exp": expire, "sub": str(subject)}

    # Encode token with secret key and algorithm
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def verify_password(provided_password, stored_password):
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


def get_password_hash(password: str) -> str:
    """
    Hash a password
    """
    if isinstance(password, str):
        password = password.encode('utf-8')

    # Hash the password
    hashed = bcrypt.hashpw(password, bcrypt.gensalt())

    # Convert to string for database storage
    if isinstance(hashed, bytes):
        hashed = hashed.decode('utf-8')

    print(f"Generated new hash: {hashed}")
    return hashed

async def get_current_user(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    """
    Get current user from token
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        # Decode JWT token
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    # Get user from database
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception

    return user


async def get_current_active_user(current_user: User = Depends(get_current_user)):
    """
    Get current active user
    """
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user