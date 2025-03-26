from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, Any

from app.core.db import get_db
from app.core.security import get_current_user
from app.core.config import settings
from app.models.user import User
from app.services.ai import predict_project_delay, generate_project_report
from app.services.project import get_project_by_id

router = APIRouter()


@router.post("/predict-delay/{project_id}", response_model=Dict[str, Any])
def predict_delay(
        project_id: str,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    """
    Predict potential project delays using AI analysis
    """
    if not settings.OPENAI_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI services are not available"
        )

    # Check if project exists
    project = get_project_by_id(db, project_id=project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    return predict_project_delay(db, project_id=project_id)


@router.post("/generate-report/{project_id}", response_model=Dict[str, str])
def generate_report(
        project_id: str,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    """
    Generate a comprehensive project status report using AI
    """
    if not settings.OPENAI_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI services are not available"
        )

    # Check if project exists
    project = get_project_by_id(db, project_id=project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    report = generate_project_report(db, project_id=project_id)
    if not report:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to generate report"
        )

    return {"report": report}