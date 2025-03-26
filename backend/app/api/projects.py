from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.project import ProjectCreate, ProjectResponse, ProjectUpdate, ProjectDetailResponse
from app.schemas.task import TaskResponse
from app.schemas.update import UpdateResponse
from app.services.project import (
    create_project, get_projects, get_user_projects, get_project_by_id,
    update_project, delete_project, get_project_with_details,
    add_team_member, remove_team_member, calculate_project_progress
)
from app.services.task import get_tasks_by_project
from app.services.update import get_updates_by_project

router = APIRouter()


@router.post("/", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def create_new_project(
        project: ProjectCreate,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    """
    Create a new project
    """
    return create_project(db=db, project=project, user_id=str(current_user.id))


@router.get("/", response_model=List[ProjectResponse])
def read_projects(
        skip: int = 0,
        limit: int = 100,
        status: Optional[str] = None,
        my_projects: bool = False,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    """
    Get all projects or filter by status
    """
    if my_projects:
        # Get projects where user is a member
        projects = get_user_projects(db, user_id=str(current_user.id), skip=skip, limit=limit)
    else:
        # Get all projects
        projects = get_projects(db, skip=skip, limit=limit, status=status)

    # Calculate progress for each project
    for project in projects:
        project.progress = calculate_project_progress(db, str(project.id))

    return projects


@router.get("/{project_id}", response_model=ProjectDetailResponse)
def read_project(
        project_id: str,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    """
    Get a specific project by ID
    """
    project_details = get_project_with_details(db, project_id=project_id)
    if not project_details:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    return project_details


@router.put("/{project_id}", response_model=ProjectResponse)
def update_project_details(
        project_id: str,
        project: ProjectUpdate,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    """
    Update a project
    """
    return update_project(db, project_id=project_id, project=project)


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project_endpoint(
        project_id: str,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    """
    Delete a project
    """
    delete_project(db, project_id=project_id)
    return {"detail": "Project successfully deleted"}


@router.get("/{project_id}/tasks", response_model=List[TaskResponse])
def read_project_tasks(
        project_id: str,
        skip: int = 0,
        limit: int = 100,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    """
    Get tasks for a project
    """
    # Check if project exists
    project = get_project_by_id(db, project_id=project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    return get_tasks_by_project(db, project_id=project_id, skip=skip, limit=limit)


@router.get("/{project_id}/updates", response_model=List[UpdateResponse])
def read_project_updates(
        project_id: str,
        skip: int = 0,
        limit: int = 100,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    """
    Get weekly updates for a project
    """
    # Check if project exists
    project = get_project_by_id(db, project_id=project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    return get_updates_by_project(db, project_id=project_id, skip=skip, limit=limit)


@router.post("/{project_id}/members/{user_id}", status_code=status.HTTP_201_CREATED)
def add_member_to_project(
        project_id: str,
        user_id: str,
        role: str = Query("Team Member", description="Member role in the project"),
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    """
    Add a team member to a project
    """
    return add_team_member(db, project_id=project_id, user_id=user_id, role=role)


@router.delete("/{project_id}/members/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_member_from_project(
        project_id: str,
        user_id: str,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    """
    Remove a team member from a project
    """
    remove_team_member(db, project_id=project_id, user_id=user_id)
    return {"detail": "Team member successfully removed"}