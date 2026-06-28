import uuid

from sqlalchemy import JSON, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class BusinessSettings(Base):
    __tablename__ = "business_settings"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    business_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("businesses.id"), nullable=False, unique=True, index=True
    )

    ai_enabled: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    ai_chat_enabled: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    ai_insights_enabled: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    modules_enabled: Mapped[dict] = mapped_column(JSON, default=dict)

    business: Mapped["Business"] = relationship(back_populates="settings")
