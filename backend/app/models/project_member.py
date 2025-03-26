from sqlalchemy import Column, String, ForeignKey, DateTime, func, UniqueConstraint
from app.core.utils import UUID
from sqlalchemy.orm import relationship
import uuid

from app.core.db import Base


class ProjectMember(Base):
    __tablename__ = "project_members"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    role = Column(String, nullable=True)  # Project role (not the same as user role)
    joined_at = Column(DateTime(timezone=True), server_default=func.now())

    # Unique constraint to prevent duplicate memberships
    __table_args__ = (UniqueConstraint('project_id', 'user_id', name='unique_project_member'),)

    # Relationships
    project = relationship("Project")
    user = relationship("User")

    def __repr__(self):
        return f"<ProjectMember project_id={self.project_id} user_id={self.user_id}>"