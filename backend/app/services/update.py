from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
import uuid

from app.models.update import WeeklyUpdate
from app.models.project import Project
from app.schemas.update import UpdateCreate, UpdateUpdate


def get_update(db: Session, update_id: str) -> Optional[WeeklyUpdate]:
    """
    Get an update by ID
    """
    return db.query(WeeklyUpdate).filter(WeeklyUpdate.id == update_id).first()


def get_updates_by_project(db: Session, project_id: str, skip: int = 0, limit: int = 100) -> List[WeeklyUpdate]:
    """
    Get updates for a project
    """
    return db.query(WeeklyUpdate).filter(
        WeeklyUpdate.project_id == project_id
    ).order_by(WeeklyUpdate.date.desc()).offset(skip).limit(limit).all()


def create_update(db: Session, update: UpdateCreate, project_id: str, user_id: str) -> WeeklyUpdate:
    """
    Create a new update
    """
    # Check if project exists
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    # Create new update
    db_update = WeeklyUpdate(
        id=uuid.uuid4(),
        project_id=project_id,
        user_id=user_id,
        date=update.date,
        status=update.status,
        notes=update.notes,
        linked_task_ids=update.linked_task_ids  # Add this line
    )

    db.add(db_update)
    db.commit()
    db.refresh(db_update)
    return db_update

def update_update(db: Session, update_id: str, update: UpdateUpdate) -> WeeklyUpdate:
    """
    Update an update
    """
    db_update = get_update(db, update_id=update_id)
    if not db_update:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Update not found"
        )

    # Update fields
    update_data = update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_update, key, value)

    db.add(db_update)
    db.commit()
    db.refresh(db_update)
    return db_update


def delete_update(db: Session, update_id: str) -> None:
    """
    Delete an update
    """
    db_update = get_update(db, update_id=update_id)
    if not db_update:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Update not found"
        )

    db.delete(db_update)
    db.commit()


def get_latest_project_update(db: Session, project_id: str) -> Optional[WeeklyUpdate]:
    """
    Get the latest update for a project
    """
    return db.query(WeeklyUpdate).filter(
        WeeklyUpdate.project_id == project_id
    ).order_by(WeeklyUpdate.date.desc()).first()


def get_updates_with_user_info(db: Session, project_id: str, skip: int = 0, limit: int = 100) -> List[dict]:
    """
    Get updates with user info for a project
    """
    updates = get_updates_by_project(db, project_id, skip, limit)

    result = []
    for update in updates:
        # Get user name
        user_name = db.query(User.name).filter(User.id == update.user_id).scalar()

        # Add to result
        update_dict = update.__dict__.copy()
        update_dict["user_name"] = user_name
        result.append(update_dict)

    return result