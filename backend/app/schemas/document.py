from pydantic import BaseModel, UUID4, Field
from typing import Optional
from datetime import datetime


class DocumentBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    file_type: Optional[str] = None
    file_size: Optional[int] = None


class DocumentCreate(DocumentBase):
    project_id: UUID4
    file_path: str


class DocumentUpdate(BaseModel):
    name: Optional[str] = None


class DocumentInDB(DocumentBase):
    id: UUID4
    project_id: UUID4
    file_path: str
    uploaded_by: UUID4
    uploaded_at: datetime

    class Config:
        orm_mode = True


class DocumentResponse(DocumentBase):
    id: UUID4
    project_id: UUID4
    file_path: str
    uploaded_by: UUID4
    uploaded_at: datetime

    class Config:
        orm_mode = True


class DocumentWithUserResponse(DocumentResponse):
    uploader_name: str  # Calculated field

    class Config:
        orm_mode = True