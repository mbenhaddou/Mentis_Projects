from sqlalchemy import Column, String, Text, Date, ForeignKey, DateTime, func
from app.core.utils import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import ARRAY
import uuid

from app.core.db import Base


class WeeklyUpdate(Base):
    __tablename__ = "weekly_updates"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    date = Column(Date, nullable=False)
    status = Column(String, nullable=False)  # Completed, In Progress, Blocked
    notes = Column(Text, nullable=False)
    ai_summary = Column(Text, nullable=True)
    linked_task_ids = Column(ARRAY(UUID(as_uuid=True)), nullable=True, default=[])  # Add this line
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    project = relationship("Project", back_populates="weekly_updates")
    user = relationship("User")

    def __repr__(self):
        return f"<WeeklyUpdate {self.date} - {self.status}>"