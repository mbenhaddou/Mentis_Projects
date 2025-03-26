from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_
from uuid import UUID

from app.models.project_member import ProjectMember
from app.models.project import Project
from app.models.user import User


def get_project_members(db: Session, project_id: UUID) -> List[dict]:
    """
    Get all members of a project with their user details

    Args:
        db: Database session
        project_id: Project ID

    Returns:
        List of project members with user details
    """
    # Join ProjectMember and User tables to get user details
    members = db.query(
        ProjectMember, User
    ).join(
        User, ProjectMember.user_id == User.id
    ).filter(
        ProjectMember.project_id == project_id
    ).all()

    # Format the response
    result = []
    for member, user in members:
        result.append({
            "id": user.id,
            "project_id": member.project_id,
            "user_id": user.id,
            "name": user.name,
            "email": user.email,
            "role": member.role,
            "joined_at": member.joined_at
        })

    return result


def add_member_to_project(
    db: Session,
    project_id: UUID,
    user_id: UUID,
    role: str = "Team Member"
) -> dict:
    """
    Add a member to a project

    Args:
        db: Database session
        project_id: Project ID
        user_id: User ID
        role: Role in project

    Returns:
        New project member with user details
    """
    # Check if user is already a member of the project
    existing = db.query(ProjectMember).filter(
        and_(
            ProjectMember.project_id == project_id,
            ProjectMember.user_id == user_id
        )
    ).first()

    if existing:
        raise ValueError("User is already a member of this project")

    # Get user details
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise ValueError("User not found")

    # Create new project member
    new_member = ProjectMember(
        project_id=project_id,
        user_id=user_id,
        role=role
    )

    db.add(new_member)
    db.commit()
    db.refresh(new_member)

    # Return member with user details
    return {
        "id": user.id,
        "project_id": new_member.project_id,
        "user_id": user.id,
        "name": user.name,
        "email": user.email,
        "role": new_member.role,
        "joined_at": new_member.joined_at
    }


def update_project_member(
    db: Session,
    project_id: UUID,
    user_id: UUID,
    role: str
) -> dict:
    """
    Update a project member's role

    Args:
        db: Database session
        project_id: Project ID
        user_id: User ID
        role: New role

    Returns:
        Updated project member with user details
    """
    # Find the member
    member = db.query(ProjectMember).filter(
        and_(
            ProjectMember.project_id == project_id,
            ProjectMember.user_id == user_id
        )
    ).first()

    if not member:
        raise ValueError("User is not a member of this project")

    # Get user details
    user = db.query(User).filter(User.id == user_id).first()

    # Update role
    member.role = role
    db.add(member)
    db.commit()
    db.refresh(member)

    # Return member with user details
    return {
        "id": user.id,
        "project_id": member.project_id,
        "user_id": user.id,
        "name": user.name,
        "email": user.email,
        "role": member.role,
        "joined_at": member.joined_at
    }


def remove_member_from_project(
    db: Session,
    project_id: UUID,
    user_id: UUID
) -> bool:
    """
    Remove a member from a project

    Args:
        db: Database session
        project_id: Project ID
        user_id: User ID

    Returns:
        True if successful, False otherwise
    """
    # Find the member
    result = db.query(ProjectMember).filter(
        and_(
            ProjectMember.project_id == project_id,
            ProjectMember.user_id == user_id
        )
    ).delete()

    db.commit()

    return result > 0


def is_user_project_manager(
    db: Session,
    project_id: UUID,
    user_id: UUID
) -> bool:
    """
    Check if a user is a project manager for a project

    Args:
        db: Database session
        project_id: Project ID
        user_id: User ID

    Returns:
        True if user is a project manager, False otherwise
    """
    # Check if user created the project
    project = db.query(Project).filter(
        and_(
            Project.id == project_id,
            Project.created_by == user_id
        )
    ).first()

    if project:
        return True

    # Check if user has Project Manager role in the project
    member = db.query(ProjectMember).filter(
        and_(
            ProjectMember.project_id == project_id,
            ProjectMember.user_id == user_id,
            ProjectMember.role == "Project Manager"
        )
    ).first()

    return member is not None