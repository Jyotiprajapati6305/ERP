from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.auth import (
    RegisterResponse,
    ResendVerificationRequest,
    TokenResponse,
    UserLogin,
    UserOut,
    UserRegister,
    VerifyEmailRequest,
)
from app.services.auth_service import (
    authenticate_user,
    issue_token,
    register_user,
    resend_verification,
    verify_user_email,
)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=RegisterResponse, status_code=201)
async def register(data: UserRegister, db: AsyncSession = Depends(get_db)):
    user = await register_user(db, data)
    return RegisterResponse(message="Account created. Check your email to verify your account.", user=UserOut.model_validate(user))


@router.post("/verify-email", response_model=UserOut)
async def verify_email(data: VerifyEmailRequest, db: AsyncSession = Depends(get_db)):
    user = await verify_user_email(db, data.token)
    return UserOut.model_validate(user)


@router.post("/resend-verification", status_code=204)
async def resend_verification_email(data: ResendVerificationRequest, db: AsyncSession = Depends(get_db)):
    await resend_verification(db, data.email)
    return None


@router.post("/login", response_model=TokenResponse)
async def login(data: UserLogin, db: AsyncSession = Depends(get_db)):
    user = await authenticate_user(db, data)
    token = issue_token(user)
    return TokenResponse(access_token=token, user=UserOut.model_validate(user))


@router.get("/me", response_model=UserOut)
async def me(current_user: User = Depends(get_current_user)):
    return UserOut.model_validate(current_user)


@router.post("/logout", status_code=204)
async def logout(current_user: User = Depends(get_current_user)):
    return None
