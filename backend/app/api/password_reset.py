from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.schemas.password_reset import PasswordResetRequest, PasswordReset
from app.services.password_reset import create_password_reset_token, reset_password, send_reset_email

router = APIRouter()


@router.post("/request-reset", status_code=status.HTTP_202_ACCEPTED)
async def request_password_reset(
        reset_request: PasswordResetRequest,
        background_tasks: BackgroundTasks,
        db: Session = Depends(get_db)
):
    """
    Request a password reset

    This endpoint will:
    1. Create a reset token for the user
    2. Send an email with a link to reset password

    Note: Always returns 202 Accepted to prevent email enumeration,
    even if the email doesn't exist in the system
    """
    token = create_password_reset_token(db, email=reset_request.email)

    # Only send email if user exists (token will be None otherwise)
    if token:
        # Send email in the background to avoid blocking
        background_tasks.add_task(send_reset_email, reset_request.email, token)

    return {"message": "If your email is registered in our system, you will receive a password reset link."}


@router.post("/reset", status_code=status.HTTP_200_OK)
async def perform_password_reset(
        reset_data: PasswordReset,
        db: Session = Depends(get_db)
):
    """
    Reset a password using a valid token
    """
    success = reset_password(db, token=reset_data.token, new_password=reset_data.new_password)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired token"
        )

    return {"message": "Password has been reset successfully. Please log in with your new password."}