import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.business import BusinessCreate, BusinessOut
from app.services.business_service import create_business, get_business_for_owner, list_businesses

router = APIRouter(prefix="/businesses", tags=["businesses"])


@router.post("", response_model=BusinessOut, status_code=201)
async def create(
    data: BusinessCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    business = await create_business(db, current_user, data)
    return BusinessOut.model_validate(business)


@router.get("", response_model=list[BusinessOut])
async def list_mine(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    businesses = await list_businesses(db, current_user)
    return [BusinessOut.model_validate(b) for b in businesses]


@router.get("/{business_id}", response_model=BusinessOut)
async def get_one(
    business_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    business = await get_business_for_owner(db, current_user, business_id)
    return BusinessOut.model_validate(business)
