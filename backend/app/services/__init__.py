from app.services.user import get_user, get_user_by_email, get_users, create_user, update_user, delete_user, \
    authenticate_user
from app.services.project import get_project_by_id, get_projects, get_user_projects, create_project, update_project, \
    delete_project, calculate_project_progress, get_project_with_details, add_team_member, remove_team_member
from app.services.update import get_update, get_updates_by_project, create_update, update_update, delete_update, \
    get_latest_project_update, get_updates_with_user_info
from app.services.task import get_task, get_tasks_by_project, get_tasks_by_user, create_task, update_task, delete_task, \
    get_tasks_with_user_info
from app.services.document import get_document, get_documents_by_project, create_document, update_document, \
    delete_document, get_documents_with_user_info
from app.services.ai import generate_update_summary, predict_project_delay, generate_project_report

# Export all services
__all__ = [
    # User services
    "get_user", "get_user_by_email", "get_users", "create_user", "update_user", "delete_user", "authenticate_user",

    # Project services
    "get_project_by_id", "get_projects", "get_user_projects", "create_project", "update_project", "delete_project",
    "calculate_project_progress", "get_project_with_details", "add_team_member", "remove_team_member",

    # Update services
    "get_update", "get_updates_by_project", "create_update", "update_update", "delete_update",
    "get_latest_project_update", "get_updates_with_user_info",

    # Task services
    "get_task", "get_tasks_by_project", "get_tasks_by_user", "create_task", "update_task", "delete_task",
    "get_tasks_with_user_info",

    # Document services
    "get_document", "get_documents_by_project", "create_document", "update_document", "delete_document",
    "get_documents_with_user_info",

    # AI services
    "generate_update_summary", "predict_project_delay", "generate_project_report",
]