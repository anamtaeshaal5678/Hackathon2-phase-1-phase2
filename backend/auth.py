from fastapi import Depends, HTTPException, status, Request
from sqlmodel import Session, select
from database import get_session
from models import Session as DbSession, User
from datetime import datetime, timezone

async def get_current_user(request: Request, session: Session = Depends(get_session)) -> User:
    # Better Auth usually stores the token in a cookie named "better-auth.session_token"
    # or creates a Bearer token. Let's check both for robustness.
    
    print(f"--- Auth Debug ---")
    print(f"Cookies: {request.cookies}")
    print(f"Headers: {dict(request.headers)}")
    
    token = request.cookies.get("better-auth.session_token")
    if not token:
        # Check Authorization header
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]

    # Better Auth cookies might be signed (format: token.signature)
    # We need to strip the signature to match the DB
    if token and "." in token:
        token = token.split(".")[0]
    
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )

    # Validate token against Session table
    statement = select(DbSession).where(DbSession.token == token)
    db_session = session.exec(statement).first()
    
    if not db_session:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid session",
        )
        
    # Ensure both are offset-aware UTC
    now = datetime.now(timezone.utc)
    # If db_session.expiresAt is naive (it shouldn't be with SQLModel + SQLite ISO strings, but just in case)
    expires_at = db_session.expiresAt
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)

    if expires_at < now:
        print(f"!!! Session EXPIRED: {expires_at} < {now} !!!", flush=True)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired",
        )

    # Fetch User
    statement_user = select(User).where(User.id == db_session.userId)
    user = session.exec(statement_user).first()
    
    if not user:
        print(f"!!! User NOT FOUND for session userId: {db_session.userId} !!!")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
        
    return user
