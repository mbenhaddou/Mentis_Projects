from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.update import UpdateCreate, UpdateResponse, UpdateUpdate
from app.services.update import create_update, get_update, update_update, delete_update
from app.services.ai import generate_update_summary

router = APIRouter()


@router.post("/{project_id}/updates", response_model=UpdateResponse, status_code=status.HTTP_201_CREATED)
def create_project_update(
        project_id: str,
        update: UpdateCreate,
        generate_ai_summary: bool = Query(True, description="Generate AI summary for the update"),
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    """
    Create a new weekly update for a project
    """
    # Create update
    db_update = create_update(
        db=db,
        update=update,
        project_id=project_id,
        user_id=str(current_user.id)
    )

    # Generate AI summary if requested
    if generate_ai_summary:
        ai_summary = generate_update_summary(update.notes)
        if ai_summary:
            # Update the record with AI summary
            update_data = UpdateUpdate(ai_summary=ai_summary)
            db_update = update_update(db, update_id=str(db_update.id), update=update_data)

    return db_update


@router.get("/updates/{update_id}", response_model=UpdateResponse)
def read_update(
        update_id: str,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    """
    Get a specific update by ID
    """
    db_update = get_update(db, update_id=update_id)
    if not db_update:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Update not found"
        )

    return db_update


@router.put("/updates/{update_id}", response_model=UpdateResponse)
def update_project_update(
        update_id: str,
        update: UpdateUpdate,
        regenerate_ai_summary: bool = Query(False, description="Regenerate AI summary for the update"),
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    """
    Update a weekly update
    """
    # Check if update exists
    db_update = get_update(db, update_id=update_id)
    if not db_update:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Update not found"
        )

    # Regenerate AI summary if requested and notes are updated
    if regenerate_ai_summary and update.notes:
        ai_summary = generate_update_summary(update.notes)
        if ai_summary:
            update.ai_summary = ai_summary

    return update_update(db, update_id=update_id, update=update)


@router.delete("/updates/{update_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project_update(
        update_id: str,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    """
    Delete a weekly update
    """
    # Check if update exists
    db_update = get_update(db, update_id=update_id)
    if not db_update:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Update not found"
        )

    delete_update(db, update_id=update_id)
    return {"detail": "Update successfully deleted"}


@router.post("/updates/{update_id}/generate-summary", response_model=UpdateResponse)
def generate_update_ai_summary(
        update_id: str,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    """
    Generate or regenerate AI summary for an update
    """
    # Check if update exists
    db_update = get_update(db, update_id=update_id)
    if not db_update:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Update not found"
        )

    # Generate AI summary
    ai_summary = generate_update_summary(db_update.notes)
    if not ai_summary:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to generate AI summary"
        )

    # Update the record with AI summary
    update_data = UpdateUpdate(ai_summary=ai_summary)
    db_update = update_update(db, update_id=update_id, update=update_data)

    return db_update