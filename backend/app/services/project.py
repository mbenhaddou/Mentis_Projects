from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException, status
import uuid

from app.models.project import Project
from app.models.task import Task
from app.models.update import WeeklyUpdate
from app.models.project_member import ProjectMember
from app.schemas.project import ProjectCreate, ProjectUpdate


def get_project_by_id(db: Session, project_id: str) -> Optional[Project]:
    """
    Get a project by ID
    """
    if project_id is None or project_id == "null":
        return None
    return db.query(Project).filter(Project.id == project_id).first()


def get_projects(db: Session, skip: int = 0, limit: int = 100, status: Optional[str] = None) -> List[Project]:
    """
    Get a list of projects with optional filtering by status
    """
    query = db.query(Project)

    if status:
        query = query.filter(Project.status == status)

    return query.offset(skip).limit(limit).all()


def get_user_projects(db: Session, user_id: str, skip: int = 0, limit: int = 100) -> List[Project]:
    """
    Get projects where user is a member
    """
    return db.query(Project).join(
        ProjectMember, Project.id == ProjectMember.project_id
    ).filter(
        ProjectMember.user_id == user_id
    ).offset(skip).limit(limit).all()


def create_project(db: Session, project: ProjectCreate, user_id: str) -> Project:
    """
    Create a new project
    """
    # Create new project
    db_project = Project(
        id=uuid.uuid4(),
        name=project.name,
        description=project.description,
        start_date=project.start_date,
        end_date=project.end_date,
        status=project.status,
        created_by=user_id
    )

    db.add(db_project)
    db.commit()
    db.refresh(db_project)

    # Add creator as a project member (with ProjectManager role)
    db_project_member = ProjectMember(
        project_id=db_project.id,
        user_id=user_id,
        role="Project Manager"
    )

    db.add(db_project_member)

    # Add team members if provided
    if project.team_members:
        for member_id in project.team_members:
            # Skip if it's the creator (already added above)
            if str(member_id) == user_id:
                continue

            db_member = ProjectMember(
                project_id=db_project.id,
                user_id=member_id,
                role="Team Member"
            )
            db.add(db_member)

    db.commit()

    return db_project


def update_project(db: Session, project_id: str, project: ProjectUpdate) -> Project:
    """
    Update a project
    """
    db_project = get_project_by_id(db, project_id=project_id)
    if not db_project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    # Update project fields
    project_data = project.dict(exclude_unset=True)
    for key, value in project_data.items():
        setattr(db_project, key, value)

    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project


def delete_project(db: Session, project_id: str) -> None:
    """
    Delete a project
    """
    db_project = get_project_by_id(db, project_id=project_id)
    if not db_project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    db.delete(db_project)
    db.commit()


def calculate_project_progress(db: Session, project_id: str) -> int:
    """
    Calculate project progress based on completed tasks
    """
    # Get total tasks and completed tasks
    total_tasks = db.query(func.count(Task.id)).filter(
        Task.project_id == project_id
    ).scalar()

    completed_tasks = db.query(func.count(Task.id)).filter(
        Task.project_id == project_id,
        Task.status == "Done"
    ).scalar()

    # Calculate progress
    if total_tasks == 0:
        return 0

    progress = int((completed_tasks / total_tasks) * 100)
    return progress


def get_project_with_details(db: Session, project_id: str) -> Dict[str, Any]:
    """
    Get project with additional details (progress, team members, etc.)
    """
    project = get_project_by_id(db, project_id=project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    # Calculate progress
    progress = calculate_project_progress(db, project_id)

    # Get team members
    team_members = db.query(ProjectMember).filter(
        ProjectMember.project_id == project_id
    ).all()

    # Get task count
    task_count = db.query(func.count(Task.id)).filter(
        Task.project_id == project_id
    ).scalar()

    # Get updates count
    updates_count = db.query(func.count(WeeklyUpdate.id)).filter(
        WeeklyUpdate.project_id == project_id
    ).scalar()

    # Convert each ProjectMember to a dict. Adjust the fields as necessary.
    def convert_project_member(pm: ProjectMember) -> dict:
        return {
            "project_id": pm.project_id,
            "user_id": pm.user_id,
            "user_name": pm.user.name
            # include additional fields if needed
        }

    team_members_converted = [convert_project_member(pm) for pm in team_members]


    # Prepare response
    result = {
        **project.__dict__,
        "progress": progress,
        "team_members": team_members_converted,
        "task_count": task_count,
        "updates_count": updates_count
    }

    return result


def add_team_member(db: Session, project_id: str, user_id: str, role: str = "Team Member") -> ProjectMember:
    """
    Add a team member to a project
    """
    # Check if project exists
    project = get_project_by_id(db, project_id=project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    # Check if user is already a member
    existing_member = db.query(ProjectMember).filter(
        ProjectMember.project_id == project_id,
        ProjectMember.user_id == user_id
    ).first()

    if existing_member:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is already a team member"
        )

    # Add team member
    db_member = ProjectMember(
        project_id=project_id,
        user_id=user_id,
        role=role
    )

    db.add(db_member)
    db.commit()
    db.refresh(db_member)

    return db_member


def remove_team_member(db: Session, project_id: str, user_id: str) -> None:
    """
    Remove a team member from a project
    """
    # Get team member
    member = db.query(ProjectMember).filter(
        ProjectMember.project_id == project_id,
        ProjectMember.user_id == user_id
    ).first()

    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team member not found"
        )

    db.delete(member)
    db.commit()