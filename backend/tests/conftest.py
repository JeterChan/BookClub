# backend/tests/conftest.py
import pytest
from typing import Generator, Any

from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool

from app.main import app
from app.db.session import get_session
from app.core.security import get_current_user, create_access_token
from app.models.user import User


@pytest.fixture(name="session")
def session_fixture() -> Generator[Session, Any, None]:
    """Create a temporary, in-memory SQLite database for tests."""
    engine = create_engine(
        "sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool
    )
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session
    SQLModel.metadata.drop_all(engine)


@pytest.fixture(name="client")
def client_fixture(session: Session) -> Generator[TestClient, Any, None]:
    """Create a TestClient that uses the in-memory database without auth."""
    def get_session_override() -> Session:
        return session

    app.dependency_overrides[get_session] = get_session_override
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()


@pytest.fixture(name="authenticated_client")
def authenticated_client_fixture(
    session: Session, test_user_for_auth: User
) -> Generator[TestClient, Any, None]:
    """Create an authenticated TestClient."""
    def get_session_override() -> Session:
        return session

    def get_current_user_override() -> dict:
        return {"sub": test_user_for_auth.email}

    app.dependency_overrides[get_session] = get_session_override
    app.dependency_overrides[get_current_user] = get_current_user_override
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()


@pytest.fixture(name="test_user_for_auth")
def test_user_for_auth_fixture(session: Session) -> User:
    """Create a test user for authentication purposes."""
    user = User(email="auth-user@example.com", display_name="Auth User", password_hash="not-a-real-hash")
    session.add(user)
    session.commit()
    return user


@pytest.fixture(name="auth_headers")
def auth_headers_fixture(test_user_for_auth: User) -> dict[str, str]:
    """Create authentication headers for a test user."""
    token = create_access_token(data={"sub": test_user_for_auth.email})
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture(name="test_user")
def test_user_fixture(session: Session) -> User:
    """Create a test user for general testing purposes."""
    from app.core.security import hash_password
    user = User(
        email="test@example.com",
        display_name="Test User",
        password_hash=hash_password("TestPassword123"),
        email_verified=True
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


@pytest.fixture(name="another_user")
def another_user_fixture(session: Session) -> User:
    """Create another test user for various scenarios."""
    from app.core.security import hash_password
    user = User(
        email="another@example.com",
        display_name="Another User",
        password_hash=hash_password("TestPassword456"),
        email_verified=True
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


@pytest.fixture(name="another_user")
def another_user_fixture(session: Session) -> User:
    """Create another test user for various scenarios."""
    from app.core.security import hash_password
    user = User(
        email="another@example.com",
        display_name="Another User",
        password_hash=hash_password("TestPassword456"),
        email_verified=True
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return user
