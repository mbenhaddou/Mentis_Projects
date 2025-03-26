"""
Basic tests for API endpoints.
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.core.db import Base, get_db
from app.models import User
from app.core.security import get_password_hash

# Create test database in memory
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)


TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create test client
client = TestClient(app)

# Test user credentials
TEST_USER_EMAIL = "test@example.com"
TEST_USER_PASSWORD = "Password123!"


@pytest.fixture(scope="function")
def test_db():
    # Create the database tables
    Base.metadata.create_all(bind=engine)

    # Create a test user
    db = TestingSessionLocal()
    user = User(
        email=TEST_USER_EMAIL,
        name="Test User",
        password_hash=get_password_hash(TEST_USER_PASSWORD),
        role="Admin",
        is_active=True
    )
    db.add(user)
    db.commit()
    db.close()

    # Override the get_db dependency
    def override_get_db():
        try:
            db = TestingSessionLocal()
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db

    yield  # Run the test

    # Cleanup - drop all tables
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def test_token(test_db):
    # Get authentication token
    response = client.post(
        "/api/auth/login",
        data={
            "username": TEST_USER_EMAIL,
            "password": TEST_USER_PASSWORD
        }
    )
    return response.json()["access_token"]


def test_read_root():
    """Test root endpoint"""
    response = client.get("/")
    assert response.status_code == 200
    assert "message" in response.json()


def test_health_check():
    """Test health check endpoint"""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}


def test_login(test_db):
    """Test login endpoint"""
    response = client.post(
        "/api/auth/login",
        data={
            "username": TEST_USER_EMAIL,
            "password": TEST_USER_PASSWORD
        }
    )
    assert response.status_code == 200
    assert "access_token" in response.json()
    assert "token_type" in response.json()
    assert response.json()["token_type"] == "bearer"


def test_login_wrong_password(test_db):
    """Test login with wrong password"""
    response = client.post(
        "/api/auth/login",
        data={
            "username": TEST_USER_EMAIL,
            "password": "WrongPassword"
        }
    )
    assert response.status_code == 401
    assert "detail" in response.json()


def test_get_current_user(test_db, test_token):
    """Test get current user endpoint"""
    response = client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {test_token}"}
    )
    assert response.status_code == 200
    assert response.json()["email"] == TEST_USER_EMAIL


def test_unauthorized_access(test_db):
    """Test unauthorized access to protected endpoint"""
    response = client.get("/api/auth/me")
    assert response.status_code == 401
    assert "detail" in response.json()


def test_create_project(test_db, test_token):
    """Test create project endpoint"""
    response = client.post(
        "/api/projects/",
        headers={"Authorization": f"Bearer {test_token}"},
        json={
            "name": "Test Project",
            "description": "A test project",
            "start_date": "2023-01-01",
            "end_date": "2023-12-31",
            "status": "Active"
        }
    )
    assert response.status_code == 201
    assert response.json()["name"] == "Test Project"
    assert "id" in response.json()


def test_get_projects(test_db, test_token):
    """Test get projects endpoint"""
    # First create a project
    client.post(
        "/api/projects/",
        headers={"Authorization": f"Bearer {test_token}"},
        json={
            "name": "Test Project",
            "description": "A test project",
            "start_date": "2023-01-01",
            "end_date": "2023-12-31",
            "status": "Active"
        }
    )

    # Get projects
    response = client.get(
        "/api/projects/",
        headers={"Authorization": f"Bearer {test_token}"}
    )
    assert response.status_code == 200
    assert isinstance(response.json(), list)
    assert len(response.json()) > 0
    assert response.json()[0]["name"] == "Test Project"