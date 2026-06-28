import logging

logger = logging.getLogger("app.email")


def send_verification_email(to_email: str, token: str, frontend_url: str) -> None:
    verify_link = f"{frontend_url}/verify-email?token={token}"
    logger.info("Verification link for %s: %s", to_email, verify_link)
