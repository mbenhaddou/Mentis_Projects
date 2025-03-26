from datetime import datetime, timedelta
from operator import or_
from typing import List, Optional, Dict, Any
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import func, distinct
from sqlalchemy.orm import Session

from app.core.security import get_password_hash, verify_password
from app.models import WeeklyUpdate
from app.models.project import Project
from app.models.project_member import ProjectMember
from app.models.task import Task
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate
from app.schemas.user import UserProjectSummary, UserSkill


def get_users(db: Session, skip: int = 0, limit: int = 100, role: Optional[str] = None) -> List[User]:
    """
    Get users with optional filtering by role

    Args:
        db: Database session
        skip: Number of records to skip
        limit: Maximum number of records to return
        role: Optional role filter

    Returns:
        List of users
    """
    query = db.query(User)

    if role:
        query = query.filter(User.role == role)

    return query.offset(skip).limit(limit).all()


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """
    Get a user by email

    Args:
        db: Database session
        email: User email

    Returns:
        User or None if not found
    """
    return db.query(User).filter(User.email == email).first()


def get_user(db: Session, user_id: UUID) -> Optional[User]:
    """
    Get a user by ID

    Args:
        db: Database session
        user_id: User ID

    Returns:
        User or None if not found
    """
    return db.query(User).filter(User.id == user_id).first()


def create_user(db: Session, user: UserCreate) -> User:
    """
    Create a new user

    Args:
        db: Database session
        user: User data

    Returns:
        Created user
    """
    # Check if email already exists
    existing_user = get_user_by_email(db, email=user.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Hash the password
    hashed_password = get_password_hash(user.password)

    # Create new user
    db_user = User(
        email=user.email,
        name=user.name,
        password_hash=hashed_password,
        role=user.role
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return db_user


def update_user(db: Session, user_id: UUID, user: UserUpdate) -> User:
    """
    Update a user

    Args:
        db: Database session
        user_id: User ID
        user: User data to update

    Returns:
        Updated user
    """
    # Get user
    db_user = get_user(db, user_id=user_id)
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Update fields
    update_data = user.dict(exclude_unset=True)

    # If password is being updated, hash it
    if "password" in update_data:
        update_data["password_hash"] = get_password_hash(update_data.pop("password"))

    for field, value in update_data.items():
        setattr(db_user, field, value)

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return db_user


def update_user_role(db: Session, user_id: UUID, role: str) -> User:
    """
    Update a user's role

    Args:
        db: Database session
        user_id: User ID
        role: New role

    Returns:
        Updated user
    """
    # Get user
    db_user = get_user(db, user_id=user_id)
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Validate role
    valid_roles = ["Admin", "Manager", "Contributor"]
    if role not in valid_roles:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid role. Must be one of: {', '.join(valid_roles)}"
        )

    # Update role
    db_user.role = role

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return db_user


def delete_user(db: Session, user_id: str):
    """
    Delete a user with cascade deletion of related records

    Args:
        db: Database session
        user_id: User ID to delete

    Returns:
        Boolean indicating success
    """
    db_user = get_user(db, user_id)
    if not db_user:
        return False

    try:
        # Cleanup related records before deleting the user

        # 1. Delete weekly updates created by this user
        deleted_updates = db.query(WeeklyUpdate).filter(WeeklyUpdate.user_id == user_id).delete()
        print(f"Deleted {deleted_updates} weekly updates for user {user_id}")

        # 2. Delete project memberships for this user
        deleted_memberships = db.query(ProjectMember).filter(ProjectMember.user_id == user_id).delete()
        print(f"Deleted {deleted_memberships} project memberships for user {user_id}")

        # 3. Set assigned_to to NULL for tasks assigned to this user
        updated_tasks = db.query(Task).filter(Task.assigned_to == user_id).update({"assigned_to": None})
        print(f"Updated {updated_tasks} tasks assigned to user {user_id}")

        # 4. Set created_by to NULL for tasks created by this user
        updated_creator_tasks = db.query(Task).filter(Task.created_by == user_id).update({"created_by": None})
        print(f"Updated {updated_creator_tasks} tasks created by user {user_id}")

        # 5. Set created_by to NULL for projects created by this user
        updated_projects = db.query(Project).filter(Project.created_by == user_id).update({"created_by": None})
        print(f"Updated {updated_projects} projects created by user {user_id}")

        # 6. Now delete the user
        db.delete(db_user)
        db.commit()
        return True
    except Exception as e:
        db.rollback()
        print(f"Error deleting user: {str(e)}")
        raise
def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    """
    Authenticate a user

    Args:
        db: Database session
        email: User email
        password: Plain password

    Returns:
        User if authentication successful, None otherwise
    """
    user = get_user_by_email(db, email=email)

    if not user:
        return None

    if not verify_password(password, user.password_hash):
        return None

    return user

def search_users(db: Session, query: str, limit: int = 10) -> List[User]:
    """
    Search for users by name or email

    Args:
        db: Database session
        query: Search query
        limit: Maximum number of results

    Returns:
        List of matching users
    """
    return db.query(User).filter(
        or_(
            User.name.ilike(f"%{query}%"),
            User.email.ilike(f"%{query}%")
        )
    ).limit(limit).all()

def get_user_stats(db: Session, user_id: str) -> Dict[str, Any]:
    """
    Get statistics for a specific user

    Args:
        db: Database session
        user_id: User ID to get stats for

    Returns:
        Dictionary with user statistics
    """
    # Get user to ensure they exist
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return None

    # Current date for calculations
    now = datetime.now()
    thirty_days_ago = now - timedelta(days=30)

    # Get projects count where user is a member
    projects_count = db.query(func.count(distinct(ProjectMember.project_id))) \
                         .filter(ProjectMember.user_id == user_id) \
                         .scalar() or 0

    # Get completed tasks count
    completed_tasks = db.query(func.count(Task.id)) \
                          .filter(
        Task.assigned_to == user_id,
        Task.status == "Done"
    ).scalar() or 0

    # Get active tasks count
    active_tasks = db.query(func.count(Task.id)) \
                       .filter(
        Task.assigned_to == user_id,
        Task.status != "Done"
    ).scalar() or 0

    # Get recent activity (tasks updated in last 30 days)
    recent_activity = db.query(func.count(Task.id)) \
                          .filter(
        Task.assigned_to == user_id,
        Task.updated_at >= thirty_days_ago
    ).scalar() or 0

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
        .limit(10)

    active_projects = []
    for p_id, p_name, p_status in active_projects_query:
        active_projects.append(
            UserProjectSummary(
                id=p_id,
                name=p_name,
                status=p_status
            )
        )

    # Mock skills for now - in a real system, you'd have a skills table
    # This is just example data
    skills = [
        UserSkill(name="Project Management", level=80),
        UserSkill(name="Development", level=75),
        UserSkill(name="UI/UX Design", level=65)
    ]

    # Calculate a basic performance score
    # This is a simple calculation - in reality you'd have a more sophisticated algorithm
    if completed_tasks > 0:
        performance_score = min(100, int((completed_tasks / (completed_tasks + active_tasks)) * 100))
    else:
        performance_score = 50  # default middle score

    # Get last active timestamp - using the most recent task update
    last_active_query = db.query(Task.updated_at) \
        .filter(Task.assigned_to == user_id) \
        .order_by(Task.updated_at.desc()) \
        .first()

    last_active = last_active_query[0] if last_active_query else None

    # Construct the response
    return {
        "user_id": user_id,
        "projects_count": projects_count,
        "completed_tasks": completed_tasks,
        "active_tasks": active_tasks,
        "recent_activity": recent_activity,
        "active_projects": active_projects,
        "skills": skills,
        "performance_score": performance_score,
        "last_active": last_active
    }