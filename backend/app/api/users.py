from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID

from app.core.db import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.user import UserResponse, UserCreate, UserUpdate, UserRoleUpdate
from app.services.user import (
    create_user,
    get_user,
    get_users,
    update_user,
    delete_user,
    update_user_role
)

router = APIRouter()


@router.get("/", response_model=List[UserResponse])
def read_users(
        skip: int = 0,
        limit: int = 100,
        role: Optional[str] = None,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    """
    Get all users
    """
    return get_users(db=db, skip=skip, limit=limit, role=role)


@router.get("/{user_id}", response_model=UserResponse)
def read_user(
        user_id: UUID,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    """
    Get a specific user by ID
    """
    db_user = get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user


@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_new_user(
        user: UserCreate,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    """
    Create a new user
    """
    # Check if user has permission to create users
    if current_user.role not in ["Admin", "Manager"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )

    return create_user(db=db, user=user)


@router.put("/{user_id}", response_model=UserResponse)
def update_user_details(
        user_id: UUID,
        user: UserUpdate,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    """
    Update a user
    """
    # Check if user has permission or is updating their own details
    if current_user.role not in ["Admin", "Manager"] and str(current_user.id) != str(user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )

    db_user = get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")

    return update_user(db=db, user_id=user_id, user=user)


@router.put("/{user_id}/role", response_model=UserResponse)
def update_user_role_endpoint(
        user_id: UUID,
        role_update: UserRoleUpdate,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    """
    Update a user's role
    """
    # Only admins and managers can change roles
    if current_user.role not in ["Admin", "Manager"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )

    # Admins can change any role, managers can only make contributors
    if current_user.role == "Manager" and role_update.role not in ["Contributor"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Managers can only assign Contributor roles"
        )

    db_user = get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")

    # Prevent changing role of admin user if you're not an admin
    if db_user.role == "Admin" and current_user.role != "Admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot change role of admin users"
        )

    return update_user_role(db=db, user_id=user_id, role=role_update.role)


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user_endpoint(
        user_id: UUID,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    """
    Delete a user
    """
    # Only admins can delete users
    if current_user.role != "Admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )

    db_user = get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")

    # Prevent deleting other admin users
    if str(db_user.id) == str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot delete other admin users"
        )

    delete_user(db=db, user_id=user_id)
    return {"detail": "User successfully deleted"}