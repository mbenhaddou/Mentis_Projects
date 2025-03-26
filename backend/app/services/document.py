from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
import uuid
import os
import shutil
from pathlib import Path

from app.models.document import Document
from app.models.project import Project
from app.models.user import User
from app.schemas.document import DocumentCreate, DocumentUpdate
from app.core.config import settings

# Define upload directory
UPLOAD_DIR = Path("uploads")


def get_document(db: Session, document_id: str) -> Optional[Document]:
    """
    Get a document by ID
    """
    return db.query(Document).filter(Document.id == document_id).first()


def get_documents_by_project(db: Session, project_id: str, skip: int = 0, limit: int = 100) -> List[Document]:
    """
    Get documents for a project
    """
    return db.query(Document).filter(
        Document.project_id == project_id
    ).order_by(Document.uploaded_at.desc()).offset(skip).limit(limit).all()


def create_document(db: Session, document: DocumentCreate, uploaded_file, uploaded_by: str) -> Document:
    """
    Create a new document
    """
    # Check if project exists
    project = db.query(Project).filter(Project.id == document.project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    # Create upload directory if it doesn't exist
    project_upload_dir = UPLOAD_DIR / str(document.project_id)
    project_upload_dir.mkdir(parents=True, exist_ok=True)

    # Generate unique filename
    file_extension = os.path.splitext(uploaded_file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = project_upload_dir / unique_filename

    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(uploaded_file.file, buffer)

    # Get file size
    file_size = os.path.getsize(file_path)

    # Create document record
    db_document = Document(
        id=uuid.uuid4(),
        project_id=document.project_id,
        name=document.name or uploaded_file.filename,
        file_path=str(file_path),
        file_type=uploaded_file.content_type,
        file_size=file_size,
        uploaded_by=uploaded_by
    )

    db.add(db_document)
    db.commit()
    db.refresh(db_document)
    return db_document


def update_document(db: Session, document_id: str, document: DocumentUpdate) -> Document:
    """
    Update a document (name only)
    """
    db_document = get_document(db, document_id=document_id)
    if not db_document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )

    # Update document fields
    document_data = document.dict(exclude_unset=True)
    for key, value in document_data.items():
        setattr(db_document, key, value)

    db.add(db_document)
    db.commit()
    db.refresh(db_document)
    return db_document


def delete_document(db: Session, document_id: str) -> None:
    """
    Delete a document
    """
    db_document = get_document(db, document_id=document_id)
    if not db_document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )

    # Delete file if it exists
    if os.path.exists(db_document.file_path):
        os.remove(db_document.file_path)

    db.delete(db_document)
    db.commit()


def get_documents_with_user_info(db: Session, project_id: str, skip: int = 0, limit: int = 100) -> List[dict]:
    """
    Get documents with uploader info for a project
    """
    documents = get_documents_by_project(db, project_id, skip, limit)

    result = []
    for document in documents:
        # Get uploader name
        uploader_name = db.query(User.name).filter(User.id == document.uploaded_by).scalar()

        # Add to result
        document_dict = document.__dict__.copy()
        document_dict["uploader_name"] = uploader_name
        result.append(document_dict)

    return result