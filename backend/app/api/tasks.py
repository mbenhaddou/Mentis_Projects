from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import ValidationError
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.task import TaskCreate, TaskResponse, TaskUpdate
from app.services.task import (
    create_task, get_task, get_tasks_by_project, get_tasks_by_user,
    update_task, delete_task
)

router = APIRouter()


@router.post("/", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_new_task(
        task: TaskCreate,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    """
    Create a new task
    """

    try:
        print(f"Received task data: {task.dict()}")
        # Process task
        return create_task(db=db, task=task, created_by=str(current_user.id))
    except ValidationError as e:
        print(f"Validation error: {e.json()}")
        raise
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        raise




@router.get("/", response_model=List[TaskResponse])
def read_tasks(
        project_id: Optional[str] = None,
        assigned_to_me: bool = False,
        status: Optional[str] = None,
        skip: int = 0,
        limit: int = 100,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    """
    Get tasks filtered by project or assigned user
    """
    if assigned_to_me:
        # Get tasks assigned to current user
        tasks = get_tasks_by_user(db, user_id=str(current_user.id), skip=skip, limit=limit)
    elif project_id:
        # Get tasks for a specific project
        tasks = get_tasks_by_project(db, project_id=project_id, skip=skip, limit=limit)
    else:
        # Invalid request - need either project_id or assigned_to_me
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either project_id or assigned_to_me parameter is required"
        )

    # Filter by status if provided
    if status and tasks:
        tasks = [task for task in tasks if task.status == status]

    return tasks


@router.get("/{task_id}", response_model=TaskResponse)
def read_task(
        task_id: str,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    """
    Get a specific task by ID
    """
    task = get_task(db, task_id=task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    return task


@router.put("/{task_id}", response_model=TaskResponse)
def update_task_details(
        task_id: str,
        task: TaskUpdate,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    """
    Update a task
    """
    db_task = get_task(db, task_id=task_id)
    if not db_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    return update_task(db, task_id=task_id, task=task)


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task_endpoint(
        task_id: str,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    """
    Delete a task
    """
    db_task = get_task(db, task_id=task_id)
    if not db_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    delete_task(db, task_id=task_id)
    return {"detail": "Task successfully deleted"}


@router.post("/{task_id}/assign", response_model=TaskResponse)
def assign_task(
        task_id: str,
        user_id: Optional[str] = None,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    """
    Assign a task to a user or self (if user_id not provided)
    """
    db_task = get_task(db, task_id=task_id)
    if not db_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    # Assign to self if user_id not provided
    if not user_id:
        user_id = str(current_user.id)

    # Update task
    task_update = TaskUpdate(assigned_to=user_id)
    return update_task(db, task_id=task_id, task=task_update)