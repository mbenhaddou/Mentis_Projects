from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID

from app.core.db import get_db
from app.core.security import get_current_user
from app.models import ProjectMember
from app.models.user import User
from app.schemas.project_member import ProjectMemberCreate, ProjectMemberResponse, ProjectMemberUpdate, RoleUpdate
from app.services.project_member import (
    add_member_to_project,
    get_project_members,
    update_project_member,
    remove_member_from_project,
    is_user_project_manager
)

router = APIRouter()




@router.put("/{project_id}/members/{user_id}/role", status_code=status.HTTP_200_OK)
def update_project_member_role(
        project_id: UUID,
        user_id: UUID,
        role_data: RoleUpdate,
        db: Session = Depends(get_db)
):
    """Update a team member's role in a project"""
    # Find the project member
    member = db.query(ProjectMember).filter(
        ProjectMember.project_id == project_id,
        ProjectMember.user_id == user_id
    ).first()

    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Member not found in this project"
        )

    # Validate the role if needed
    valid_roles = ["Project Manager", "Team Member", "Observer"]
    if role_data.role not in valid_roles:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid role. Must be one of: {', '.join(valid_roles)}"
        )

    # Update the role
    member.role = role_data.role
    db.add(member)
    db.commit()
    db.refresh(member)

    # Return the updated member
    return {
        "id": member.id,
        "user_id": member.user_id,
        "project_id": member.project_id,
        "role": member.role
    }

@router.get("/{project_id}/members", response_model=List[ProjectMemberResponse])
def read_project_members(
        project_id: UUID,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    """Get all members of a project"""
    return get_project_members(db=db, project_id=project_id)


@router.post("/{project_id}/members", response_model=ProjectMemberResponse, status_code=status.HTTP_201_CREATED)
def add_project_member(
        project_id: UUID,
        member: ProjectMemberCreate,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    """Add a member to a project"""
    # Check if current user has necessary permissions
    if current_user.role not in ["Admin", "Manager"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to manage project members"
        )

    return add_member_to_project(
        db=db,
        project_id=project_id,
        user_id=member.user_id,
        role=member.role
    )


@router.delete("/{project_id}/members/{user_id}", status_code=status.HTTP_200_OK)
def remove_project_member(
        project_id: UUID,
        user_id: UUID,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    """Remove a member from a project"""
    # Check if current user has necessary permissions
    if current_user.role not in ["Admin", "Manager"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to manage project members"
        )

    success = remove_member_from_project(db=db, project_id=project_id, user_id=user_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Member not found in project"
        )

    return {"detail": "Member removed from project"}