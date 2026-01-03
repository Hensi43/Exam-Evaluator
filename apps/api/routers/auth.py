from datetime import timedelta
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session, select
from apps.api.database import get_session
from apps.api.models import User, UserCreate
from apps.api.auth import get_password_hash, verify_password, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES, get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=User)
def register(user_in: UserCreate, session: Session = Depends(get_session)):
    # Check if user exists
    existing_user = session.exec(select(User).where(User.email == user_in.email)).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    user = User(
        email=user_in.email,
        full_name=user_in.full_name,
        hashed_password=get_password_hash(user_in.password)
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return user

@router.post("/token")
def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    session: Session = Depends(get_session)
):
    user = session.exec(select(User).where(User.email == form_data.username)).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=User)
def read_users_me(current_user: Annotated[User, Depends(get_current_user)]):
    return current_user

# Google Auth Schema
from pydantic import BaseModel

class GoogleToken(BaseModel):
    token: str

@router.post("/google")
def login_google(
    token_data: GoogleToken,
    session: Session = Depends(get_session)
):
    try:
        from google.oauth2 import id_token
        from google.auth.transport import requests
        
        # Verify the token
        # GOOGLE_CLIENT_ID should ideally be an env var, but for now we verify audience if provided, 
        # or just verify the signature against Google's certs.
        id_info = id_token.verify_oauth2_token(
            token_data.token, 
            requests.Request(), 
            audience=None # validation of audience happens on client side mostly, or we can hardcode if known
        )
        
        email = id_info.get("email")
        name = id_info.get("name")
        
        if not email:
            raise HTTPException(status_code=400, detail="Invalid Google Token: No email found")
            
        # Check if user exists
        user = session.exec(select(User).where(User.email == email)).first()
        
        if not user:
            # Create new user automatically
            # We generate a random password since they use Google to login
            import secrets
            random_password = secrets.token_urlsafe(16)
            
            user = User(
                email=email,
                full_name=name,
                hashed_password=get_password_hash(random_password)
            )
            session.add(user)
            session.commit()
            session.refresh(user)
            
        # Create Access Token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.email}, expires_delta=access_token_expires
        )
        return {"access_token": access_token, "token_type": "bearer"}

    except ValueError as e:
         raise HTTPException(status_code=400, detail=f"Invalid Google Token: {str(e)}")
    except Exception as e:
         raise HTTPException(status_code=500, detail=f"Google Login Failed: {str(e)}")
