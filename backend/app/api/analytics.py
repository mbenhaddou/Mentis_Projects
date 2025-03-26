from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, Any

from app.core.db import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.services.analytics import get_project_analytics, get_user_analytics

router = APIRouter()


@router.get("/projects/", response_model=Dict[str, Any])
def get_projects_analytics(
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    """
    Get project analytics data

    This endpoint returns comprehensive analytics for projects including:
    - Status distribution
    - Monthly progress
    - Delay risk assessment
    - Activity timeline

    Args:
        db: Database session
        current_user: Current authenticated user

    Returns:
        Dictionary containing project analytics data
    """
    # Verify user has permission to view analytics
    if current_user.role not in ["Admin", "Manager"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to access analytics data"
        )

    return get_project_analytics(db)


@router.get("/users/", response_model=Dict[str, Any])
def get_users_analytics(
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    """
    Get user analytics data

    This endpoint returns comprehensive analytics for users including:
    - Role distribution
    - Top contributors
    - Activity by day of week
    - Project assignments per user

    Args:
        db: Database session
        current_user: Current authenticated user

    Returns:
        Dictionary containing user analytics data
    """
    # Verify user has permission to view analytics
    if current_user.role not in ["Admin", "Manager"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to access analytics data"
        )

    return get_user_analytics(db)


@router.get("/dashboard/", response_model=Dict[str, Any])
def get_analytics_dashboard(
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    """
    Get complete analytics dashboard data

    This endpoint combines project and user analytics into a single response
    for more efficient dashboard loading.

    Args:
        db: Database session
        current_user: Current authenticated user

    Returns:
        Dictionary containing both project and user analytics
    """
    # Verify user has permission to view analytics
    if current_user.role not in ["Admin", "Manager"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to access analytics data"
        )

    # Get both project and user analytics
    project_analytics = get_project_analytics(db)
    user_analytics = get_user_analytics(db)

    return {
        "projects": project_analytics,
        "users": user_analytics
    }