import secrets
from datetime import datetime, timedelta, timezone

from fastapi import HTTPException, status
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.security import create_access_token, hash_password, verify_password
from app.models.user import User
from app.schemas.auth import UserLogin, UserRegister
from app.services.email_service import send_verification_email


async def register_user(db: AsyncSession, data: UserRegister) -> User:
    existing = await db.scalar(
        select(User).where(or_(User.email == data.email, User.mobile_number == data.mobile_number))
    )
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email or mobile number already registered")

    token = secrets.token_urlsafe(32)
    expires = datetime.now(timezone.utc) + timedelta(minutes=settings.VERIFICATION_TOKEN_EXPIRE_MINUTES)

    user = User(
        name=data.name,
        email=data.email,
        mobile_number=data.mobile_number,
        password_hash=hash_password(data.password),
        is_verified=False,
        verification_token=token,
        verification_token_expires=expires,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    send_verification_email(user.email, token, settings.FRONTEND_URL)
    return user


async def verify_user_email(db: AsyncSession, token: str) -> User:
    user = await db.scalar(select(User).where(User.verification_token == token))
    if not user or not user.verification_token_expires:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired verification token")

    if user.verification_token_expires < datetime.now(timezone.utc):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired verification token")

    user.is_verified = True
    user.verification_token = None
    user.verification_token_expires = None
    await db.commit()
    await db.refresh(user)
    return user


async def resend_verification(db: AsyncSession, email: str) -> None:
    user = await db.scalar(select(User).where(User.email == email))
    if not user or user.is_verified:
        return

    token = secrets.token_urlsafe(32)
    user.verification_token = token
    user.verification_token_expires = datetime.now(timezone.utc) + timedelta(
        minutes=settings.VERIFICATION_TOKEN_EXPIRE_MINUTES
    )
    await db.commit()
    send_verification_email(user.email, token, settings.FRONTEND_URL)


async def authenticate_user(db: AsyncSession, data: UserLogin) -> User:
    user = await db.scalar(select(User).where(User.email == data.email))
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    if not user.is_verified:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Please verify your email before signing in")
    return user


def issue_token(user: User) -> str:
    return create_access_token(user.id)
