from fastapi import APIRouter

from app.api.auth import router as auth_router
from app.api.projects import router as projects_router
from app.api.updates import router as updates_router
from app.api.tasks import router as tasks_router
from app.api.documents import router as documents_router
from app.api.ai import router as ai_router
from app.api.users import router as users_router  # Import the users router
from app.api.password_reset import router as password_reset_router
from app.api.project_members import router as project_members_router
from app.api.analytics import router as analytics_router
from app.api.team import router as team_router

# Main API router
api_router = APIRouter()

# Include all routers with proper prefixes
api_router.include_router(auth_router, prefix="/auth", tags=["Authentication"])
api_router.include_router(projects_router, prefix="/projects", tags=["Projects"])
api_router.include_router(updates_router, prefix="/projects", tags=["Updates"])
api_router.include_router(tasks_router, prefix="/tasks", tags=["Tasks"])
api_router.include_router(documents_router, prefix="", tags=["Documents"])
api_router.include_router(ai_router, prefix="/ai", tags=["AI"])
api_router.include_router(users_router, prefix="/users", tags=["Users"])  # New users endpoint
api_router.include_router(password_reset_router, prefix="/password", tags=["Password Reset"])
api_router.include_router(project_members_router, prefix="/projects", tags=["Project Members"])
api_router.include_router(team_router, prefix="/team", tags=["Team"])
api_router.include_router(analytics_router, prefix="/analytics", tags=["Analytics"])