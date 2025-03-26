from typing import Optional
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, Field


class ProjectMemberBase(BaseModel):
    """Base schema for project member"""
    role: str = Field(default="Team Member")


class ProjectMemberCreate(ProjectMemberBase):
    """Schema for creating a project member"""
    user_id: UUID


class ProjectMemberUpdate(ProjectMemberBase):
    """Schema for updating a project member"""
    pass

# Define a model for role update
class RoleUpdate(BaseModel):
    role: str

class ProjectMemberResponse(ProjectMemberBase):
    """Schema for project member response"""
    id: UUID
    project_id: UUID
    user_id: UUID
    name: str
    email: str
    joined_at: datetime

    class Config:
        orm_mode = True