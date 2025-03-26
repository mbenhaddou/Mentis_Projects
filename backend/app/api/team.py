from datetime import datetime, timedelta
from typing import List, Dict, Any
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.security import get_current_user
from app.models.project import Project
from app.models.project_member import ProjectMember
from app.models.task import Task
from app.models.user import User
from app.schemas.user import UserResponse
from app.services.user import get_users, get_user

router = APIRouter()


@router.get("/", response_model=List[UserResponse])
def read_team_members(
        skip: int = 0,
        limit: int = 100,
        role: Optional[str] = None,
        search: Optional[str] = None,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    """
    Get all team members with optional filtering

    Args:
        skip: Number of records to skip
        limit: Maximum number of records to return
        role: Filter by user role
        search: Search in name or email
        db: Database session
        current_user: Current authenticated user

    Returns:
        List of team members
    """
    return get_users(db=db, skip=skip, limit=limit, role=role, search=search)


@router.get("/{user_id}", response_model=UserResponse)
def read_team_member(
        user_id: str,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    """
    Get a specific team member by ID

    Args:
        user_id: User ID
        db: Database session
        current_user: Current authenticated user

    Returns:
        Team member details
    """
    user = get_user(db=db, user_id=user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user


from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from uuid import UUID

from app.core.db import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.project import Project
from app.models.task import Task
from app.models.project_member import ProjectMember
from datetime import datetime, timedelta
from sqlalchemy import func, and_


@router.get("/{user_id}/stats", response_model=Dict[str, Any])
def get_user_stats(
        user_id: UUID,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    """
    Get detailed statistics for a specific user

    Args:
        user_id: User ID
        db: Database session
        current_user: Current authenticated user

    Returns:
        Dictionary with user statistics and metrics
    """
    # Verify the user exists
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Get current date for calculations
    now = datetime.now()
    thirty_days_ago = now - timedelta(days=30)

    # Count projects the user is a member of
    projects_count = db.query(func.count(ProjectMember.project_id)) \
                         .filter(ProjectMember.user_id == user_id) \
                         .scalar() or 0

    # Count completed tasks
    completed_tasks = db.query(func.count(Task.id)) \
                          .filter(Task.assigned_to == user_id, Task.status == "Done") \
                          .scalar() or 0

    # Count active tasks
    active_tasks = db.query(func.count(Task.id)) \
                       .filter(Task.assigned_to == user_id, Task.status != "Done") \
                       .scalar() or 0

    # Get recent activity count
    recent_activity = db.query(func.count(Task.id)) \
                          .filter(
        Task.assigned_to == user_id,
        Task.updated_at >= thirty_days_ago
    ) \
                          .scalar() or 0

    # Get active projects
    active_projects_query = db.query(
        Project.id,
        Project.name,
        Project.status
    ) \
        .join(ProjectMember, ProjectMember.project_id == Project.id) \
        .filter(
        ProjectMember.user_id == user_id,
        Project.status == "Active"
    ) \
        .limit(5)

    active_projects = []
    for p_id, p_name, p_status in active_projects_query:
        active_projects.append({
            "id": str(p_id),
            "name": p_name,
            "status": p_status
        })

    # For skills, we'll use mock data for now
    # In a production system, you would have a skills table linked to users
    skills = [
        {"name": "Project Management", "level": 3},
        {"name": "Development", "level": 4},
        {"name": "Communication", "level": 3}
    ]

    # Calculate a simple performance score
    performance_score = None
    if completed_tasks + active_tasks > 0:
        performance_score = min(100, int((completed_tasks / (completed_tasks + active_tasks)) * 100))

    # Get last active timestamp
    last_active_task = db.query(Task) \
        .filter(Task.assigned_to == user_id) \
        .order_by(Task.updated_at.desc()) \
        .first()

    last_active = last_active_task.updated_at if last_active_task else None

    # Construct the response
    return {
        "user_id": str(user_id),
        "projects_count": projects_count,
        "completed_tasks": completed_tasks,
        "active_tasks": active_tasks,
        "recent_activity": recent_activity,
        "active_projects": active_projects,
        "skills": skills,
        "performance_score": performance_score,
        "last_active": last_active
    }