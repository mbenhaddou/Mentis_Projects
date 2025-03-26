from uuid import UUID

from pydantic import BaseModel, UUID4, validator, Field
from typing import Optional, List
from datetime import date, datetime


class UpdateBase(BaseModel):
    date: date
    status: str = Field(..., description="Update status: Completed, In Progress, Blocked")
    notes: str = Field(..., min_length=1)

    # Validate status
    @validator('status')
    def status_must_be_valid(cls, v):
        valid_statuses = ['Completed', 'In Progress', 'Blocked']
        if v not in valid_statuses:
            raise ValueError(f'Status must be one of {valid_statuses}')
        return v


class UpdateCreate(UpdateBase):
    generate_ai_summary: Optional[bool] = True
    linked_task_ids: Optional[List[UUID]] = []




class   UpdateUpdate(BaseModel):
    date: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None
    ai_summary: Optional[str] = None

    # Validate status
    @validator('status')
    def status_must_be_valid(cls, v):
        if v is not None:
            valid_statuses = ['Completed', 'In Progress', 'Blocked']
            if v not in valid_statuses:
                raise ValueError(f'Status must be one of {valid_statuses}')
        return v


class UpdateInDB(UpdateBase):
    id: UUID4
    project_id: UUID4
    user_id: UUID4
    ai_summary: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


class UpdateResponse(UpdateBase):
    id: UUID4
    project_id: UUID4
    user_id: UUID4
    ai_summary: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    linked_task_ids: Optional[List[UUID4]] = []  # Add this line

    class Config:
        orm_mode = True


class UpdateWithUserResponse(UpdateResponse):
    user_name: str  # Calculated field

    class Config:
        orm_mode = True