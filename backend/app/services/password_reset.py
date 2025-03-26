import uuid
import os
from datetime import datetime, timedelta
from typing import Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from jose import jwt

from app.core.config import settings
from app.core.security import get_password_hash
from app.models.user import User
from app.models.password_reset import PasswordResetToken
from app.services.user import get_user_by_email


def create_password_reset_token(db: Session, email: str) -> Optional[str]:
    """
    Create a password reset token for the user

    Args:
        db: Database session
        email: User email

    Returns:
        Reset token or None if user not found
    """
    # Find user
    user = get_user_by_email(db, email=email)
    if not user:
        return None

    # Create a reset token that expires in 24 hours
    token = str(uuid.uuid4())
    expires_at = datetime.utcnow() + timedelta(hours=24)

    # Store the token in the database
    db_token = PasswordResetToken(
        user_id=user.id,
        token=token,
        expires_at=expires_at
    )

    # Delete any existing tokens for this user
    db.query(PasswordResetToken).filter(PasswordResetToken.user_id == user.id).delete()

    # Add new token
    db.add(db_token)
    db.commit()
    db.refresh(db_token)

    return token


def verify_password_reset_token(db: Session, token: str) -> Optional[User]:
    """
    Verify a password reset token

    Args:
        db: Database session
        token: Reset token

    Returns:
        User if token is valid, None otherwise
    """
    # Get token from database
    db_token = db.query(PasswordResetToken).filter(PasswordResetToken.token == token).first()

    # Check if token exists and is not expired
    if not db_token or db_token.expires_at < datetime.utcnow():
        return None

    # Get user
    user = db.query(User).filter(User.id == db_token.user_id).first()
    return user


def reset_password(db: Session, token: str, new_password: str) -> bool:
    """
    Reset user password

    Args:
        db: Database session
        token: Reset token
        new_password: New password

    Returns:
        True if password was reset, False otherwise
    """
    # Verify token and get user
    user = verify_password_reset_token(db, token)
    if not user:
        return False

    # Get hash as a proper string, not bytes representation
    password_hash = get_password_hash(new_password)

    # Ensure we're storing a string, not bytes or bytes representation
    if isinstance(password_hash, bytes):
        password_hash = password_hash.decode('utf-8')

    # Update password
    user.password_hash = password_hash

    # Delete used token
    db.query(PasswordResetToken).filter(PasswordResetToken.token == token).delete()

    db.add(user)
    db.commit()

    return True

def send_reset_email(email: str, token: str) -> bool:
    """
    Send password reset email

    Args:
        email: User email
        token: Reset token

    Returns:
        True if email was sent, False otherwise
    """
    # In development, just print the reset link
    if settings.ENVIRONMENT == 'development':
        reset_link = f"{settings.FRONTEND_URL}/reset-password?token={token}"
        print(f"Password reset link for {email}: {reset_link}")
        return True

    # In production, send an actual email
    try:
        # Import email sending package only when needed
        import smtplib
        from email.mime.text import MIMEText
        from email.mime.multipart import MIMEMultipart

        reset_link = f"{settings.FRONTEND_URL}/reset-password?token={token}"

        message = MIMEMultipart()
        message["From"] = settings.MAIL_FROM
        message["To"] = email
        message["Subject"] = "Reset Your Password - Mentis Project Tracker"

        body = f"""
        <html>
            <body>
                <h2>Reset Your Password</h2>
                <p>You have requested to reset your password for your Mentis Project Tracker account.</p>
                <p>Please click the link below to reset your password. This link will expire in 24 hours.</p>
                <p><a href="{reset_link}">Reset Password</a></p>
                <p>If you did not request this password reset, please ignore this email.</p>
                <p>Regards,<br>The Mentis Team</p>
            </body>
        </html>
        """

        message.attach(MIMEText(body, "html"))

        # Connect to SMTP server and send email
        with smtplib.SMTP(settings.MAIL_SERVER, settings.MAIL_PORT) as server:
            if settings.MAIL_USE_TLS:
                server.starttls()
            if settings.MAIL_USERNAME and settings.MAIL_PASSWORD:
                server.login(settings.MAIL_USERNAME, settings.MAIL_PASSWORD)
            server.sendmail(settings.MAIL_FROM, email, message.as_string())

        return True

    except Exception as e:
        print(f"Error sending email: {e}")
        return False