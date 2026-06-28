from fastapi import HTTPException, status
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import create_access_token, hash_password, verify_password
from app.models.user import User
from app.schemas.auth import UserLogin, UserRegister


async def register_user(db: AsyncSession, data: UserRegister) -> User:
    existing = await db.scalar(
        select(User).where(or_(User.email == data.email, User.mobile_number == data.mobile_number))
    )
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email or mobile number already registered")

    user = User(
        name=data.name,
        email=data.email,
        mobile_number=data.mobile_number,
        password_hash=hash_password(data.password),
        is_verified=True,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


async def authenticate_user(db: AsyncSession, data: UserLogin) -> User:
    user = await db.scalar(select(User).where(User.email == data.email))
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    return user


def issue_token(user: User) -> str:
    return create_access_token(user.id)
