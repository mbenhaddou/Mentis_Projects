from pydantic import BaseModel, UUID4, validator, Field
from typing import Optional, List
from datetime import date, datetime


class ProjectBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    start_date: date
    end_date: date
    status: str = Field(..., description="Project status: Active, Completed, On Hold")

    # Validate status
    @validator('status')
    def status_must_be_valid(cls, v):
        valid_statuses = ['Active', 'Completed', 'On Hold']
        if v not in valid_statuses:
            raise ValueError(f'Status must be one of {valid_statuses}')
        return v

    # Validate dates
    @validator('end_date')
    def end_date_must_be_after_start_date(cls, v, values):
        if 'start_date' in values and v < values['start_date']:
            raise ValueError('End date must be after start date')
        return v


class ProjectCreate(ProjectBase):
    team_members: Optional[List[UUID4]] = []


class ProjectUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    status: Optional[str] = None

    # Validate status
    @validator('status')
    def status_must_be_valid(cls, v):
        if v is not None:
            valid_statuses = ['Active', 'Completed', 'On Hold']
            if v not in valid_statuses:
                raise ValueError(f'Status must be one of {valid_statuses}')
        return v

    # Validate dates
    @validator('end_date')
    def end_date_must_be_after_start_date(cls, v, values):
        if v is not None and 'start_date' in values and values['start_date'] is not None and v < values['start_date']:
            raise ValueError('End date must be after start date')
        return v


class ProjectInDB(ProjectBase):
    id: UUID4
    created_by: Optional[UUID4] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


class ProjectResponse(ProjectBase):
    id: UUID4
    created_by: Optional[UUID4] = None
    created_at: datetime
    updated_at: datetime
    progress: Optional[int] = 0  # Calculated field

    class Config:
        orm_mode = True


class ProjectDetailResponse(ProjectResponse):
    team_members: List[dict] = []  # List of user info dicts
    task_count: int = 0
    updates_count: int = 0

    class Config:
        orm_mode = True