"""Server-managed anonymous session identities."""

import hashlib
import hmac
import os
import secrets
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from pathlib import Path

from fastapi import Request, Response
from dotenv import load_dotenv

load_dotenv(dotenv_path=Path(__file__).parent.parent / ".env")

SESSION_COOKIE = "datadock_session"
SESSION_LIFETIME_SECONDS = 2 * 60 * 60
SESSION_SECRET = os.getenv("SESSION_SECRET") or os.getenv("DB_PASSWORD", "")
COOKIE_SECURE = os.getenv("SESSION_COOKIE_SECURE", "false").lower() == "true"


@dataclass(frozen=True)
class Session:
    session_id: str
    role_name: str
    schema_name: str
    role_password: str
    expires_at: datetime | None = None


def _session_password(session_id: str) -> str:
    return hmac.new(
        SESSION_SECRET.encode("utf-8"),
        f"password:{session_id}".encode("ascii"),
        hashlib.sha256,
    ).hexdigest()


def _signature(session_id: str) -> str:
    if not SESSION_SECRET:
        raise RuntimeError("SESSION_SECRET or DB_PASSWORD must be configured.")
    return hmac.new(
        SESSION_SECRET.encode("utf-8"),
        session_id.encode("ascii"),
        hashlib.sha256,
    ).hexdigest()


def _session_from_id(session_id: str, expires_at: datetime | None = None) -> Session:
    return Session(
        session_id=session_id,
        role_name=f"datadock_session_{session_id}",
        schema_name=f"datadock_session_{session_id}",
        role_password=_session_password(session_id),
        expires_at=expires_at,
    )


def _new_session() -> Session:
    return _session_from_id(
        secrets.token_hex(16),
        datetime.now(timezone.utc) + timedelta(seconds=SESSION_LIFETIME_SECONDS),
    )


def _read_cookie(request: Request) -> Session | None:
    token = request.cookies.get(SESSION_COOKIE)
    if not token:
        return None

    session_id, separator, signature = token.partition(".")
    if (
        not separator
        or len(session_id) != 32
        or any(character not in "0123456789abcdef" for character in session_id)
        or not hmac.compare_digest(signature, _signature(session_id))
    ):
        return None

    return _session_from_id(session_id)


def get_or_create_session(request: Request, response: Response) -> Session:
    session = _read_cookie(request)
    if session is None:
        session = _new_session()
    _set_cookie(response, session)
    return session


def create_new_session(response: Response) -> Session:
    session = _new_session()
    _set_cookie(response, session)
    return session


def _set_cookie(response: Response, session: Session) -> None:
    max_age = SESSION_LIFETIME_SECONDS
    if session.expires_at is not None:
        max_age = max(
            0,
            int((session.expires_at - datetime.now(timezone.utc)).total_seconds()),
        )
    response.set_cookie(
        key=SESSION_COOKIE,
        value=f"{session.session_id}.{_signature(session.session_id)}",
        max_age=max_age,
        httponly=True,
        secure=COOKIE_SECURE,
        samesite="lax",
        path="/",
    )
