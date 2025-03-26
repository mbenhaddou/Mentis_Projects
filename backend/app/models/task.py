from sqlalchemy import Column, String, Text, Date, ForeignKey, DateTime, func
from app.core.utils import UUID
from sqlalchemy.orm import relationship
import uuid

from app.core.db import Base


class Task(Base):
    __tablename__ = "tasks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    assigned_to = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    due_date = Column(Date, nullable=True)
    status = Column(String, nullable=False)  # Pending, In Progress, Done
    priority = Column(String, nullable=True)  # Low, Medium, High
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    project = relationship("Project", back_populates="tasks")
    assignee = relationship("User", foreign_keys=[assigned_to])
    creator = relationship("User", foreign_keys=[created_by])

    def __repr__(self):
        return f"<Task {self.title}>"