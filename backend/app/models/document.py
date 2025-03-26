from sqlalchemy import Column, String, Integer, ForeignKey, DateTime, func
from app.core.utils import UUID
from sqlalchemy.orm import relationship
import uuid

from app.core.db import Base


class Document(Base):
    __tablename__ = "documents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    file_type = Column(String, nullable=True)
    file_size = Column(Integer, nullable=True)  # in bytes
    uploaded_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    project = relationship("Project")
    uploader = relationship("User")

    def __repr__(self):
        return f"<Document {self.name}>"