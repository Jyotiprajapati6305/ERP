import uuid

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.business import Business
from app.models.settings import BusinessSettings
from app.models.user import User
from app.schemas.business import INDUSTRY_TYPES, OPTIONAL_MODULES, BusinessCreate


async def create_business(db: AsyncSession, owner: User, data: BusinessCreate) -> Business:
    if data.industry_type not in INDUSTRY_TYPES:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid industry_type")

    business = Business(
        user_id=owner.id,
        name=data.business_name,
        logo=data.logo,
        industry_type=data.industry_type,
        gst_number=data.gst_number,
        phone=data.phone,
        email=data.email,
        address=data.address,
        currency=data.currency,
        timezone=data.timezone,
    )
    db.add(business)
    await db.flush()

    settings = BusinessSettings(
        business_id=business.id,
        ai_enabled=False,
        ai_chat_enabled=False,
        ai_insights_enabled=False,
        modules_enabled={m: (m in data.enabled_modules) for m in OPTIONAL_MODULES + data.enabled_modules},
    )
    db.add(settings)
    await db.commit()
    await db.refresh(business)
    return business


async def list_businesses(db: AsyncSession, owner: User) -> list[Business]:
    result = await db.scalars(select(Business).where(Business.user_id == owner.id))
    return list(result.all())


async def get_business_for_owner(db: AsyncSession, owner: User, business_id: uuid.UUID) -> Business:
    business = await db.scalar(
        select(Business).where(Business.id == business_id, Business.user_id == owner.id)
    )
    if business is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Business not found")
    return business
