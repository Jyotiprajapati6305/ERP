import logging

import httpx

from app.core.config import settings

logger = logging.getLogger("app.email")

RESEND_API_URL = "https://api.resend.com/emails"


def send_verification_email(to_email: str, token: str, frontend_url: str) -> None:
    verify_link = f"{frontend_url}/verify-email?token={token}"

    if not settings.RESEND_API_KEY:
        logger.warning("RESEND_API_KEY not set; verification link for %s: %s", to_email, verify_link)
        return

    try:
        response = httpx.post(
            RESEND_API_URL,
            headers={"Authorization": f"Bearer {settings.RESEND_API_KEY}"},
            json={
                "from": settings.EMAIL_FROM,
                "to": [to_email],
                "subject": "Verify your BusinessFlow account",
                "html": (
                    f"<p>Welcome to BusinessFlow!</p>"
                    f'<p><a href="{verify_link}">Click here to verify your account</a></p>'
                    f"<p>This link expires in {settings.VERIFICATION_TOKEN_EXPIRE_MINUTES // 60} hours.</p>"
                ),
            },
            timeout=10.0,
        )
        response.raise_for_status()
    except httpx.HTTPError:
        logger.exception("Failed to send verification email to %s", to_email)
