from typing import Callable, List, Optional
from fastapi import Depends, HTTPException, Header, Query, Request, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import User, UserRole


def get_current_user(
    request: Request,
    authorization: Optional[str] = Header(None),
    token_query: Optional[str] = Query(None, alias="token"),
    db: Session = Depends(get_db),
) -> User:
    token = None

    # Check Authorization header (e.g. Bearer demo-token-1-12345678)
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
    elif authorization:
        token = authorization
    elif token_query:
        token = token_query

    if not token:
        # Check authorization from header case-insensitive
        for key, value in request.headers.items():
            if key.lower() == "authorization":
                if value.startswith("Bearer "):
                    token = value.split(" ")[1]
                else:
                    token = value
                break

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized: Authentication token required",
        )

    # Parse token format demo-token-{user_id}-{timestamp} or lookup active user
    user_id = None
    if token.startswith("demo-token-"):
        parts = token.split("-")
        if len(parts) >= 3 and parts[2].isdigit():
            user_id = int(parts[2])

    if user_id:
        user = db.get(User, user_id)
        if user and user.is_active:
            return user

    # Fallback search default active user if token exists or return first admin/manager for demo tokens
    user = db.query(User).filter(User.is_active == True).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized: User account not found or inactive",
        )
    return user


def require_roles(*allowed_roles: UserRole) -> Callable:
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Forbidden: Action not allowed for role '{current_user.role}'",
            )
        return current_user

    return role_checker
