import pytest
from sqlmodel import Session
from sqlalchemy.exc import IntegrityError
from app.services.user_service import UserService
from app.models.user import UserCreate

@pytest.fixture
def user_service(session: Session):
    return UserService(session)

def test_create_user_success(session: Session, user_service: UserService):
    """Test successful user creation"""
    user_data = UserCreate(
        email="newuser@example.com", 
        password="ValidPassword123", 
        display_name="New User"
    )
    user = user_service.create(user_data)
    
    assert user.id is not None
    assert user.email == "newuser@example.com"
    assert user.password_hash != "ValidPassword123"  # Should be hashed
    assert user.email_verified is False  # Default

def test_create_user_duplicate_email_fails_on_db_constraint(session: Session, user_service: UserService):
    """Test creating user with existing email fails"""
    # Create first user
    user_data = UserCreate(email="dup@example.com", password="ValidPassword123", display_name="First")
    user_service.create(user_data)
    
    # Try creating second with same email
    user_data_2 = UserCreate(email="dup@example.com", password="ValidPassword123", display_name="Second")
    
    with pytest.raises(IntegrityError):
        user_service.create(user_data_2)
    
    session.rollback() # Clean up transaction

def test_get_by_email(session: Session, user_service: UserService):
    """Test getting user by email"""
    user_data = UserCreate(email="get@example.com", password="ValidPassword123", display_name="Get Me")
    created = user_service.create(user_data)
    
    found = user_service.get_by_email("get@example.com")
    assert found is not None
    assert found.id == created.id

def test_get_by_email_not_found(user_service: UserService):
    """Test getting non-existent user"""
    found = user_service.get_by_email("nonexistent@example.com")
    assert found is None

def test_update_profile(session: Session, user_service: UserService):
    """Test updating user profile"""
    # Create
    user_data = UserCreate(email="update@example.com", password="ValidPassword123", display_name="Old Name")
    user = user_service.create(user_data)
    
    # Update
    updated_user = user_service.update_profile(user=user, display_name="New Name", bio="New Bio")
    
    assert updated_user.display_name == "New Name"
    assert updated_user.bio == "New Bio"
    assert updated_user.email == "update@example.com" # Unchanged

def test_authenticate_unverified_user(session: Session, user_service: UserService):
    """Test unverified email user cannot login"""
    user_data = UserCreate(email="unverified@example.com", password="ValidPassword123", display_name="Unverified")
    user_service.create(user_data)
    # user.email_verified is False by default
    
    with pytest.raises(ValueError, match="請先完成 Email 驗證"):
        user_service.authenticate("unverified@example.com", "ValidPassword123")

def test_authenticate_verified_user(session: Session, user_service: UserService):
    """Test verified email user can login"""
    user_data = UserCreate(email="verified@example.com", password="ValidPassword123", display_name="Verified")
    user = user_service.create(user_data)
    
    # Manually verify
    user.email_verified = True
    session.add(user)
    session.commit()
    session.refresh(user)

    authenticated_user = user_service.authenticate("verified@example.com", "ValidPassword123")
    assert authenticated_user is not None
    assert authenticated_user.id == user.id

def test_authenticate_wrong_password(session: Session, user_service: UserService):
    """Test wrong password returns None"""
    user_data = UserCreate(email="wrong@example.com", password="ValidPassword123", display_name="Verified")
    user = user_service.create(user_data)
    user.email_verified = True
    session.add(user)
    session.commit()

    result = user_service.authenticate("wrong@example.com", "WrongPassword")
    assert result is None