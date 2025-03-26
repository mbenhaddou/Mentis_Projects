from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.document import DocumentResponse, DocumentUpdate, DocumentCreate
from app.services.document import (
    create_document, get_document, get_documents_by_project,
    update_document, delete_document
)

router = APIRouter()


@router.post("/projects/{project_id}/documents", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(
        project_id: str,
        file: UploadFile = File(...),
        name: str = Form(None),
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    """
    Upload a document for a project
    """
    # Use filename if name not provided
    document_name = name or file.filename

    # Create document model
    document = DocumentCreate(
        project_id=project_id,
        name=document_name,
        file_path=""  # Will be set by service
    )

    return create_document(
        db=db,
        document=document,
        uploaded_file=file,
        uploaded_by=str(current_user.id)
    )


@router.get("/projects/{project_id}/documents", response_model=List[DocumentResponse])
def get_project_documents(
        project_id: str,
        skip: int = 0,
        limit: int = 100,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    """
    Get all documents for a project
    """
    return get_documents_by_project(db, project_id=project_id, skip=skip, limit=limit)


@router.get("/documents/{document_id}", response_model=DocumentResponse)
def get_document_by_id(
        document_id: str,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    """
    Get a specific document by ID
    """
    document = get_document(db, document_id=document_id)
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )

    return document


@router.put("/documents/{document_id}", response_model=DocumentResponse)
def update_document_details(
        document_id: str,
        document: DocumentUpdate,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    """
    Update a document (name only)
    """
    db_document = get_document(db, document_id=document_id)
    if not db_document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )

    return update_document(db, document_id=document_id, document=document)


@router.delete("/documents/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_document_endpoint(
        document_id: str,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    """
    Delete a document
    """
    db_document = get_document(db, document_id=document_id)
    if not db_document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )

    delete_document(db, document_id=document_id)
    return {"detail": "Document successfully deleted"}