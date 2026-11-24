import hashlib
import secrets
import time
from typing import Annotated

from fastapi import APIRouter, Depends, Header, HTTPException, Request, Response
from pydantic import BaseModel, EmailStr, Field, StringConstraints
from sqlalchemy import delete, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from database import get_db
from models import Account, AccountSession

COOKIE = "codebuddy_session"
AUTH_PREFIX = "/api/auth"
SESSION_SECONDS = 7 * 24 * 60 * 60
PASSWORD_ITERATIONS = 600_000
DB = Annotated[Session, Depends(get_db)]


class Credentials(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class Signup(Credentials):
    name: Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=60)]
    password: str = Field(min_length=8, max_length=128)


class Profile(BaseModel):
    name: str
    email: str

    model_config = {"from_attributes": True}


def require_auth_header(x_codebuddy_auth: Annotated[str | None, Header()] = None):
    if x_codebuddy_auth != "1":
        raise HTTPException(403, "Invalid account request.")


router = APIRouter(prefix=AUTH_PREFIX, tags=["accounts"])
write_request = [Depends(require_auth_header)]


def password_digest(password: str, salt: bytes) -> str:
    return hashlib.pbkdf2_hmac(
        "sha256", password.encode(), salt, PASSWORD_ITERATIONS
    ).hex()


def token_digest(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


def revoke_session(db: Session, request: Request):
    token = request.cookies.get(COOKIE)
    if token:
        db.execute(delete(AccountSession).where(AccountSession.token_hash == token_digest(token)))


def start_session(db: Session, account: Account, request: Request, response: Response):
    revoke_session(db, request)
    token = secrets.token_urlsafe(32)
    db.add(AccountSession(
        token_hash=token_digest(token),
        account_id=account.id,
        expires_at=int(time.time()) + SESSION_SECONDS,
    ))
    db.commit()
    response.headers["Cache-Control"] = "no-store"
    if COOKIE in request.cookies:
        response.delete_cookie(COOKIE, path=AUTH_PREFIX)
    response.set_cookie(
        COOKIE,
        token,
        max_age=SESSION_SECONDS,
        path="/",
        httponly=True,
        secure=request.url.scheme == "https" or request.headers.get("x-forwarded-proto") == "https",
        samesite="lax",
    )


@router.post("/signup", status_code=201, response_model=Profile, dependencies=write_request)
def signup(data: Signup, request: Request, response: Response, db: DB):
    salt = secrets.token_bytes(16)
    account = Account(
        name=data.name,
        email=data.email.casefold(),
        password_hash=f"{salt.hex()}:{password_digest(data.password, salt)}",
    )
    db.add(account)
    try:
        db.flush()
    except IntegrityError:
        db.rollback()
        raise HTTPException(409, "An account already exists with that email.") from None
    start_session(db, account, request, response)
    return account


@router.post("/login", response_model=Profile, dependencies=write_request)
def login(data: Credentials, request: Request, response: Response, db: DB):
    account = db.scalar(select(Account).where(Account.email == data.email.casefold()))
    # Always derive a digest so unknown addresses follow the same password check.
    salt, expected = account.password_hash.split(":") if account else ("00" * 16, "0" * 64)
    valid = secrets.compare_digest(password_digest(data.password, bytes.fromhex(salt)), expected)
    if account is None or not valid:
        raise HTTPException(401, "Email or password is incorrect.")
    start_session(db, account, request, response)
    return account


def session_account(request: Request, db: DB) -> Account | None:
    token = request.cookies.get(COOKIE)
    if not token:
        return None
    return db.scalar(
        select(Account)
        .join(AccountSession)
        .where(
            AccountSession.token_hash == token_digest(token),
            AccountSession.expires_at > int(time.time()),
        )
    )


@router.get("/me", response_model=Profile | None)
def profile(request: Request, response: Response, db: DB):
    response.headers["Cache-Control"] = "no-store"
    return session_account(request, db)


@router.post("/logout", status_code=204, dependencies=write_request)
def logout(request: Request, response: Response, db: DB):
    revoke_session(db, request)
    db.commit()
    response.delete_cookie(COOKIE, path=AUTH_PREFIX)
    response.delete_cookie(COOKIE, path="/")
