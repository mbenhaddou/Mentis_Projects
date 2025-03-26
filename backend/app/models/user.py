from sqlalchemy import Column, String, Boolean, DateTime, func
from app.core.utils import UUID
import uuid

from app.core.db import Base, engine



class User(Base):
    __tablename__ = "users"

    id = Column(
        UUID(as_uuid=True) if engine.dialect.name == 'postgresql' else String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()) if engine.dialect.name != 'postgresql' else uuid.uuid4()
    )
    email = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    name = Column(String, nullable=False)
    role = Column(String, nullable=False)  # Admin, Manager, Contributor
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    def __repr__(self):
        return f"<User {self.email}>"