from pydantic import BaseModel, UUID4, validator, Field
from typing import Optional
from datetime import date, datetime


class TaskBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    assigned_to: Optional[UUID4] = None
    due_date: Optional[date] = None
    status: str = Field(..., description="Task status: Pending, In Progress, Done")
    priority: Optional[str] = Field(None, description="Task priority: Low, Medium, High")

    # Validate status
    @validator('status')
    def status_must_be_valid(cls, v):
        valid_statuses = ['Pending', 'In Progress', 'Done']
        if v not in valid_statuses:
            raise ValueError(f'Status must be one of {valid_statuses}')
        return v

    # Validate priority
    @validator('priority')
    def priority_must_be_valid(cls, v):
        if v is not None:
            valid_priorities = ['Low', 'Medium', 'High']
            if v not in valid_priorities:
                raise ValueError(f'Priority must be one of {valid_priorities}')
        return v


class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    due_date: Optional[date] = None
    assigned_to: Optional[UUID4] = None
    status: str
    priority: Optional[str] = None
    project_id: UUID4  # This is required


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    assigned_to: Optional[UUID4] = None
    due_date: Optional[date] = None
    status: Optional[str] = None
    priority: Optional[str] = None

    # Validate status
    @validator('status')
    def status_must_be_valid(cls, v):
        if v is not None:
            valid_statuses = ['Pending', 'In Progress', 'Done']
            if v not in valid_statuses:
                raise ValueError(f'Status must be one of {valid_statuses}')
        return v

    # Validate priority
    @validator('priority')
    def priority_must_be_valid(cls, v):
        if v is not None:
            valid_priorities = ['Low', 'Medium', 'High']
            if v not in valid_priorities:
                raise ValueError(f'Priority must be one of {valid_priorities}')
        return v


class TaskInDB(TaskBase):
    id: UUID4
    project_id: UUID4
    created_by: Optional[UUID4] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


class TaskResponse(TaskBase):
    id: UUID4
    project_id: UUID4
    created_by: Optional[UUID4] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


class TaskWithUserResponse(TaskResponse):
    assignee_name: Optional[str] = None  # Calculated field

    class Config:
        orm_mode = True