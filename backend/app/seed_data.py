"""
Seed script to populate the database with initial test data.
"""

import uuid
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from app.core.db import SessionLocal
from app.core.security import get_password_hash
from app.models import User, Project, WeeklyUpdate, Task, ProjectMember


def create_users(db: Session):
    """Create initial users"""
    users = [
        {
            "id": uuid.uuid4(),
            "email": "admin@example.com",
            "name": "Admin User",
            "password_hash": get_password_hash("Admin123!"),
            "role": "Admin",
            "is_active": True
        },
        {
            "id": uuid.uuid4(),
            "email": "manager@example.com",
            "name": "Project Manager",
            "password_hash": get_password_hash("Manager123!"),
            "role": "Manager",
            "is_active": True
        },
        {
            "id": uuid.uuid4(),
            "email": "contributor@example.com",
            "name": "Team Member",
            "password_hash": get_password_hash("Member123!"),
            "role": "Contributor",
            "is_active": True
        }
    ]

    # Check if users already exist
    if db.query(User).count() > 0:
        print("Users already exist. Skipping user creation.")
        return

    # Add users to database
    for user_data in users:
        user = User(**user_data)
        db.add(user)

    db.commit()
    print(f"Created {len(users)} users")
    return users


def create_projects(db: Session):
    """Create initial projects"""
    # Get admin user
    admin = db.query(User).filter(User.email == "admin@example.com").first()
    if not admin:
        print("Admin user not found. Skipping project creation.")
        return

    today = datetime.now().date()

    projects = [
        {
            "id": uuid.uuid4(),
            "name": "Website Redesign",
            "description": "Redesign the company website with new branding and improved user experience.",
            "start_date": today - timedelta(days=30),
            "end_date": today + timedelta(days=60),
            "status": "Active",
            "created_by": admin.id
        },
        {
            "id": uuid.uuid4(),
            "name": "Mobile App Development",
            "description": "Build a cross-platform mobile app for customer engagement.",
            "start_date": today - timedelta(days=15),
            "end_date": today + timedelta(days=90),
            "status": "Active",
            "created_by": admin.id
        },
        {
            "id": uuid.uuid4(),
            "name": "Data Migration",
            "description": "Migrate legacy data to new cloud-based system.",
            "start_date": today - timedelta(days=45),
            "end_date": today + timedelta(days=15),
            "status": "On Hold",
            "created_by": admin.id
        }
    ]

    # Check if projects already exist
    if db.query(Project).count() > 0:
        print("Projects already exist. Skipping project creation.")
        return

    # Add projects to database
    project_objects = []
    for project_data in projects:
        project = Project(**project_data)
        db.add(project)
        project_objects.append(project)

    db.commit()
    print(f"Created {len(projects)} projects")
    return project_objects


def create_project_members(db: Session):
    """Assign users to projects"""
    # Get users
    admin = db.query(User).filter(User.email == "admin@example.com").first()
    manager = db.query(User).filter(User.email == "manager@example.com").first()
    contributor = db.query(User).filter(User.email == "contributor@example.com").first()

    if not all([admin, manager, contributor]):
        print("Not all users found. Skipping project member creation.")
        return

    # Get projects
    projects = db.query(Project).all()
    if not projects:
        print("No projects found. Skipping project member creation.")
        return

    # Check if project members already exist
    if db.query(ProjectMember).count() > 0:
        print("Project members already exist. Skipping project member creation.")
        return

    # Add members to projects
    members = []
    for project in projects:
        # Admin is already a member as creator
        members.append(
            ProjectMember(
                id=uuid.uuid4(),
                project_id=project.id,
                user_id=admin.id,
                role="Project Manager"
            )
        )

        # Add manager and contributor to all projects
        members.append(
            ProjectMember(
                id=uuid.uuid4(),
                project_id=project.id,
                user_id=manager.id,
                role="Project Manager"
            )
        )

        members.append(
            ProjectMember(
                id=uuid.uuid4(),
                project_id=project.id,
                user_id=contributor.id,
                role="Team Member"
            )
        )

    # Filter out duplicates (admin is already added as creator)
    unique_members = {}
    for member in members:
        key = f"{member.project_id}_{member.user_id}"
        if key not in unique_members:
            unique_members[key] = member

    # Add members to database
    for member in unique_members.values():
        db.add(member)

    db.commit()
    print(f"Created {len(unique_members)} project members")


def create_tasks(db: Session):
    """Create initial tasks"""
    # Get users
    manager = db.query(User).filter(User.email == "manager@example.com").first()
    contributor = db.query(User).filter(User.email == "contributor@example.com").first()

    if not all([manager, contributor]):
        print("Not all users found. Skipping task creation.")
        return

    # Get projects
    projects = db.query(Project).all()
    if not projects:
        print("No projects found. Skipping task creation.")
        return

    # Check if tasks already exist
    if db.query(Task).count() > 0:
        print("Tasks already exist. Skipping task creation.")
        return

    today = datetime.now().date()

    # Create tasks for each project
    tasks = []
    for i, project in enumerate(projects):
        # Project 1: Website Redesign
        if i == 0:
            tasks.extend([
                {
                    "id": uuid.uuid4(),
                    "project_id": project.id,
                    "title": "Create wireframes",
                    "description": "Create wireframes for all pages based on requirements",
                    "assigned_to": contributor.id,
                    "due_date": today + timedelta(days=7),
                    "status": "In Progress",
                    "priority": "High",
                    "created_by": manager.id
                },
                {
                    "id": uuid.uuid4(),
                    "project_id": project.id,
                    "title": "Design homepage",
                    "description": "Design the homepage based on approved wireframes",
                    "assigned_to": contributor.id,
                    "due_date": today + timedelta(days=14),
                    "status": "Pending",
                    "priority": "Medium",
                    "created_by": manager.id
                },
                {
                    "id": uuid.uuid4(),
                    "project_id": project.id,
                    "title": "Implement responsive design",
                    "description": "Ensure all pages are responsive on mobile devices",
                    "assigned_to": contributor.id,
                    "due_date": today + timedelta(days=21),
                    "status": "Pending",
                    "priority": "Medium",
                    "created_by": manager.id
                }
            ])

        # Project 2: Mobile App Development
        elif i == 1:
            tasks.extend([
                {
                    "id": uuid.uuid4(),
                    "project_id": project.id,
                    "title": "Design UI components",
                    "description": "Create UI component library for the mobile app",
                    "assigned_to": contributor.id,
                    "due_date": today + timedelta(days=10),
                    "status": "In Progress",
                    "priority": "High",
                    "created_by": manager.id
                },
                {
                    "id": uuid.uuid4(),
                    "project_id": project.id,
                    "title": "Implement authentication",
                    "description": "Implement user authentication flow",
                    "assigned_to": contributor.id,
                    "due_date": today + timedelta(days=20),
                    "status": "Pending",
                    "priority": "High",
                    "created_by": manager.id
                }
            ])

        # Project 3: Data Migration
        else:
            tasks.extend([
                {
                    "id": uuid.uuid4(),
                    "project_id": project.id,
                    "title": "Data analysis",
                    "description": "Analyze current data structure",
                    "assigned_to": contributor.id,
                    "due_date": today - timedelta(days=10),
                    "status": "Done",
                    "priority": "High",
                    "created_by": manager.id
                },
                {
                    "id": uuid.uuid4(),
                    "project_id": project.id,
                    "title": "Create migration script",
                    "description": "Develop script to migrate data to new system",
                    "assigned_to": contributor.id,
                    "due_date": today + timedelta(days=5),
                    "status": "In Progress",
                    "priority": "High",
                    "created_by": manager.id
                }
            ])

    # Add tasks to database
    for task_data in tasks:
        task = Task(**task_data)
        db.add(task)

    db.commit()
    print(f"Created {len(tasks)} tasks")


def create_weekly_updates(db: Session):
    """Create initial weekly updates"""
    # Get users
    manager = db.query(User).filter(User.email == "manager@example.com").first()

    if not manager:
        print("Manager user not found. Skipping weekly update creation.")
        return

    # Get projects
    projects = db.query(Project).all()
    if not projects:
        print("No projects found. Skipping weekly update creation.")
        return

    # Check if updates already exist
    if db.query(WeeklyUpdate).count() > 0:
        print("Weekly updates already exist. Skipping weekly update creation.")
        return

    today = datetime.now().date()

    # Create updates for each project
    updates = []
    for i, project in enumerate(projects):
        # Project 1: Website Redesign
        if i == 0:
            updates.extend([
                {
                    "id": uuid.uuid4(),
                    "project_id": project.id,
                    "user_id": manager.id,
                    "date": today - timedelta(days=7),
                    "status": "In Progress",
                    "notes": "Started work on wireframes. Initial designs look promising. Need to finalize the color palette.",
                    "ai_summary": "Progress made on wireframes with initial designs completed. Next steps include finalizing the color palette."
                },
                {
                    "id": uuid.uuid4(),
                    "project_id": project.id,
                    "user_id": manager.id,
                    "date": today,
                    "status": "In Progress",
                    "notes": "Completed wireframes for all main pages. Started working on the responsive design for mobile devices. Need input from stakeholders on the navigation menu.",
                    "ai_summary": "Wireframes completed for main pages. Mobile responsive design in progress. Awaiting stakeholder input on navigation."
                }
            ])

        # Project 2: Mobile App Development
        elif i == 1:
            updates.extend([
                {
                    "id": uuid.uuid4(),
                    "project_id": project.id,
                    "user_id": manager.id,
                    "date": today - timedelta(days=7),
                    "status": "In Progress",
                    "notes": "Started designing UI components. Working on authentication flow. Need to finalize API integration approach.",
                    "ai_summary": "UI component design and authentication flow in progress. API integration approach needs finalization."
                }
            ])

        # Project 3: Data Migration
        else:
            updates.extend([
                {
                    "id": uuid.uuid4(),
                    "project_id": project.id,
                    "user_id": manager.id,
                    "date": today - timedelta(days=14),
                    "status": "In Progress",
                    "notes": "Started data analysis. Found some inconsistencies in the legacy data that need to be addressed before migration.",
                    "ai_summary": "Data analysis in progress. Legacy data inconsistencies identified that require resolution before migration."
                },
                {
                    "id": uuid.uuid4(),
                    "project_id": project.id,
                    "user_id": manager.id,
                    "date": today - timedelta(days=7),
                    "status": "Blocked",
                    "notes": "Migration planning is blocked due to missing access to production database. Waiting for security team to provide credentials.",
                    "ai_summary": "Migration blocked due to pending production database access from security team."
                }
            ])

    # Add updates to database
    for update_data in updates:
        update = WeeklyUpdate(**update_data)
        db.add(update)

    db.commit()
    print(f"Created {len(updates)} weekly updates")


def seed_data():
    """Main function to seed data"""
    db = SessionLocal()
    try:
        create_users(db)
        create_projects(db)
        create_project_members(db)
        create_tasks(db)
        create_weekly_updates(db)

        print("Data seeding completed successfully.")
    finally:
        db.close()


if __name__ == "__main__":
    seed_data()