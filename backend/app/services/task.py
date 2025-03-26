from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
import uuid

from app.models.task import Task
from app.models.project import Project
from app.models.user import User
from app.schemas.task import TaskCreate, TaskUpdate


def get_task(db: Session, task_id: str) -> Optional[Task]:
    """
    Get a task by ID
    """
    return db.query(Task).filter(Task.id == task_id).first()


def get_tasks_by_project(db: Session, project_id: str, skip: int = 0, limit: int = 100) -> List[Task]:
    """
    Get tasks for a project
    """
    return db.query(Task).filter(
        Task.project_id == project_id
    ).order_by(Task.due_date.asc()).offset(skip).limit(limit).all()


def get_tasks_by_user(db: Session, user_id: str, skip: int = 0, limit: int = 100) -> List[Task]:
    """
    Get tasks assigned to a user
    """
    return db.query(Task).filter(
        Task.assigned_to == user_id
    ).order_by(Task.due_date.asc()).offset(skip).limit(limit).all()


def create_task(db: Session, task: TaskCreate, created_by: str) -> Task:
    """
    Create a new task
    """
    # Check if project exists
    project = db.query(Project).filter(Project.id == task.project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    # Check if assigned user exists (if provided)
    if task.assigned_to:
        user = db.query(User).filter(User.id == task.assigned_to).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Assigned user not found"
            )

    # Create new task
    db_task = Task(
        id=uuid.uuid4(),
        project_id=task.project_id,
        title=task.title,
        description=task.description,
        assigned_to=task.assigned_to,
        due_date=task.due_date,
        status=task.status,
        priority=task.priority,
        created_by=created_by
    )

    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task


def update_task(db: Session, task_id: str, task: TaskUpdate) -> Task:
    """
    Update a task
    """
    db_task = get_task(db, task_id=task_id)
    if not db_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    # Check if assigned user exists (if provided)
    if task.assigned_to:
        user = db.query(User).filter(User.id == task.assigned_to).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Assigned user not found"
            )

    # Update task fields
    task_data = task.dict(exclude_unset=True)
    for key, value in task_data.items():
        setattr(db_task, key, value)

    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task


def delete_task(db: Session, task_id: str) -> None:
    """
    Delete a task
    """
    db_task = get_task(db, task_id=task_id)
    if not db_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    db.delete(db_task)
    db.commit()


def get_tasks_with_user_info(db: Session, project_id: str, skip: int = 0, limit: int = 100) -> List[dict]:
    """
    Get tasks with assignee info for a project
    """
    tasks = get_tasks_by_project(db, project_id, skip, limit)

    result = []
    for task in tasks:
        # Get assignee name if available
        assignee_name = None
        if task.assigned_to:
            assignee_name = db.query(User.name).filter(User.id == task.assigned_to).scalar()

        # Add to result
        task_dict = task.__dict__.copy()
        task_dict["assignee_name"] = assignee_name
        result.append(task_dict)

    return result