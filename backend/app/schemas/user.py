from pydantic import BaseModel, EmailStr, UUID4, validator
from typing import Optional, List
from datetime import datetime
import re


class UserBase(BaseModel):
    email: EmailStr
    name: str
    role: str

    # Make sure role is valid
    @validator('role')
    def role_must_be_valid(cls, v):
        valid_roles = ['Admin', 'Manager', 'Contributor']
        if v not in valid_roles:
            raise ValueError(f'Role must be one of {valid_roles}')
        return v

    # Make sure name is valid
    @validator('name')
    def name_must_be_valid(cls, v):
        if len(v) < 2:
            raise ValueError('Name must be at least 2 characters')
        if len(v) > 100:
            raise ValueError('Name must be at most 100 characters')
        if not re.match(r'^[a-zA-Z0-9\s\.\-_]+$', v):
            raise ValueError('Name contains invalid characters')
        return v


class UserCreate(UserBase):
    password: str

    # Make sure password is secure
    @validator('password')
    def password_must_be_secure(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        if not any(c.isupper() for c in v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not any(c.islower() for c in v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not any(c.isdigit() for c in v):
            raise ValueError('Password must contain at least one digit')
        return v


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    name: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None

    # Make sure role is valid
    @validator('role')
    def role_must_be_valid(cls, v):
        if v is not None:
            valid_roles = ['Admin', 'Manager', 'Contributor']
            if v not in valid_roles:
                raise ValueError(f'Role must be one of {valid_roles}')
        return v

    # Make sure name is valid
    @validator('name')
    def name_must_be_valid(cls, v):
        if v is not None:
            if len(v) < 2:
                raise ValueError('Name must be at least 2 characters')
            if len(v) > 100:
                raise ValueError('Name must be at most 100 characters')
            if not re.match(r'^[a-zA-Z0-9\s\.\-_]+$', v):
                raise ValueError('Name contains invalid characters')
        return v


class UserInDB(UserBase):
    id: UUID4
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


class UserResponse(UserBase):
    id: UUID4
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenPayload(BaseModel):
    sub: Optional[str] = None


from typing import Optional
from pydantic import BaseModel, EmailStr, Field, validator
from uuid import UUID


class UserBase(BaseModel):
    """Base schema for user"""
    email: EmailStr
    name: str
    role: Optional[str] = "Contributor"


# Create schemas for the project data that appears in user stats
class UserProjectSummary(BaseModel):
    id: UUID
    name: str
    status: str


# Create schema for user skills
class UserSkill(BaseModel):
    name: str
    level: Optional[int] = None


# Create schema for user stats response
class UserStatsResponse(BaseModel):
    user_id: UUID
    projects_count: int
    completed_tasks: int
    active_tasks: int
    recent_activity: int  # Activity count in the last 30 days
    active_projects: List[UserProjectSummary]
    skills: List[UserSkill]
    performance_score: Optional[int] = None
    last_active: Optional[datetime] = None

    class Config:
        orm_mode = True

class UserRoleUpdate(BaseModel):
    """Schema for updating a user's role"""
    role: str = Field(..., description="User role (Admin, Manager, Contributor)")

    @validator('role')
    def role_must_be_valid(cls, v):
        valid_roles = ["Admin", "Manager", "Contributor"]
        if v not in valid_roles:
            raise ValueError(f'Role must be one of: {", ".join(valid_roles)}')
        return v
