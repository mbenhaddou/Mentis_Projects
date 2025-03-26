from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func, distinct, extract, text
from datetime import datetime, timedelta

from app.models.project import Project
from app.models.user import User
from app.models.task import Task
from app.models.update import WeeklyUpdate
from app.models.project_member import ProjectMember


def get_project_analytics(db: Session) -> Dict[str, Any]:
    """
    Generate analytics data for projects

    Args:
        db: Database session

    Returns:
        Dictionary containing various project analytics metrics
    """
    # Get current date
    now = datetime.now()

    # Get project status distribution
    status_distribution = []
    for status in ['Active', 'Completed', 'On Hold']:
        count = db.query(func.count(Project.id)).filter(Project.status == status).scalar()
        status_distribution.append({"name": status, "value": count or 0})

    # Get monthly progress for the last 6 months
    monthly_progress = []
    for i in range(5, -1, -1):
        month_date = now - timedelta(days=30 * i)
        month_name = month_date.strftime("%b")

        # Get tasks completed in this month
        completed_tasks = db.query(func.count(Task.id)).filter(
            Task.status == "Done",
            extract('month', Task.updated_at) == month_date.month,
            extract('year', Task.updated_at) == month_date.year
        ).scalar() or 0

        # Get tasks added in this month
        added_tasks = db.query(func.count(Task.id)).filter(
            extract('month', Task.created_at) == month_date.month,
            extract('year', Task.created_at) == month_date.year
        ).scalar() or 0

        # Get active projects in this month
        active_projects = db.query(func.count(Project.id)).filter(
            Project.status == "Active",
            Project.start_date <= month_date,
            (Project.end_date >= month_date) | (Project.end_date.is_(None))
        ).scalar() or 0

        monthly_progress.append({
            "month": month_name,
            "completed": completed_tasks,
            "added": added_tasks,
            "activeProjects": active_projects
        })

    # Project delay risk assessment
    # This would typically involve complex logic based on:
    # - Project timeline vs progress
    # - Task completion rates
    # - Blockers reported in updates
    # Here's a simplified version
    projects = db.query(Project).filter(Project.status == "Active").all()
    delay_risk = []

    for project in projects:
        # Calculate a simple risk percentage based on:
        # - Time elapsed vs. progress made
        # - Number of blocked tasks
        today = datetime.now().date()

        if project.end_date and project.start_date:
            total_days = (project.end_date - project.start_date).days
            if total_days > 0:
                elapsed_days = (today - project.start_date).days
                project_progress_ratio = elapsed_days / total_days

                # Get task completion ratio
                total_tasks = db.query(func.count(Task.id)).filter(Task.project_id == project.id).scalar() or 1
                completed_tasks = db.query(func.count(Task.id)).filter(
                    Task.project_id == project.id,
                    Task.status == "Done"
                ).scalar() or 0

                task_completion_ratio = completed_tasks / total_tasks

                # If elapsed time exceeds progress, there's risk
                risk_percentage = int((project_progress_ratio - task_completion_ratio) * 100)
                risk_percentage = max(0, min(100, risk_percentage))  # Clamp between 0 and 100

                # Determine risk level
                risk_level = "Low"
                if risk_percentage > 30:
                    risk_level = "Medium"
                if risk_percentage > 60:
                    risk_level = "High"

                delay_risk.append({
                    "name": project.name,
                    "riskPercentage": risk_percentage,
                    "risk": risk_level
                })

    # Get activity timeline (updates, tasks, etc.) for the last 6 months
    activity_timeline = []
    for i in range(5, -1, -1):
        month_date = now - timedelta(days=30 * i)

        # Format date as YYYY-MM
        date_str = month_date.strftime("%Y-%m")

        # Count updates
        updates_count = db.query(func.count(WeeklyUpdate.id)).filter(
            extract('month', WeeklyUpdate.created_at) == month_date.month,
            extract('year', WeeklyUpdate.created_at) == month_date.year
        ).scalar() or 0

        # Count tasks created
        tasks_count = db.query(func.count(Task.id)).filter(
            extract('month', Task.created_at) == month_date.month,
            extract('year', Task.created_at) == month_date.year
        ).scalar() or 0

        # In a real system, you'd have a comments table
        # For this example, we'll use a placeholder value
        comments_count = int(updates_count * 0.8)  # Just an example ratio

        activity_timeline.append({
            "date": date_str,
            "updates": updates_count,
            "tasks": tasks_count,
            "comments": comments_count
        })

    return {
        "statusDistribution": status_distribution,
        "monthlyProgress": monthly_progress,
        "delayRisk": delay_risk,
        "activityTimeline": activity_timeline
    }


def get_user_analytics(db: Session) -> Dict[str, Any]:
    """
    Generate analytics data for users

    Args:
        db: Database session

    Returns:
        Dictionary containing various user analytics metrics
    """
    # Get user role distribution
    role_distribution = []
    for role in ['Admin', 'Manager', 'Contributor']:
        count = db.query(func.count(User.id)).filter(User.role == role).scalar()
        role_distribution.append({"name": role, "value": count or 0})

    # Get top contributors based on updates and completed tasks
    top_contributors_query = db.query(
        User.name,
        func.count(distinct(WeeklyUpdate.id)).label('updates'),
        func.count(distinct(Task.id)).label('tasks')
    ).outerjoin(
        WeeklyUpdate, User.id == WeeklyUpdate.user_id
    ).outerjoin(
        Task, (User.id == Task.assigned_to) & (Task.status == "Done")
    ).group_by(User.id, User.name).order_by(
        text('updates DESC, tasks DESC')
    ).limit(5)

    top_contributors = []
    for user_name, updates_count, tasks_count in top_contributors_query:
        top_contributors.append({
            "name": user_name,
            "updates": updates_count,
            "tasks": tasks_count
        })

    # Get user activity by day of week
    activity_by_day = []
    for day_num, day_name in enumerate(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
                                       0):
        # Count updates created on this day
        updates_count = db.query(func.count(WeeklyUpdate.id)).filter(
            extract('dow', WeeklyUpdate.created_at) == day_num + 1  # PostgreSQL days start from 1 (Sunday)
        ).scalar() or 0

        # Count tasks created on this day
        tasks_count = db.query(func.count(Task.id)).filter(
            extract('dow', Task.created_at) == day_num + 1
        ).scalar() or 0

        # For this example, we'll simulate comment counts
        comments_count = int(updates_count * 1.5)  # Just an example ratio

        activity_by_day.append({
            "day": day_name,
            "updates": updates_count,
            "comments": comments_count,
            "tasks": tasks_count
        })

    # Get project assignments per user
    project_assignments_query = db.query(
        User.id,
        User.name,
        User.role,
        func.count(distinct(ProjectMember.project_id)).label('project_count'),
        func.count(distinct(Task.id)).filter(Task.status != "Done").label('active_tasks')
    ).outerjoin(
        ProjectMember, User.id == ProjectMember.user_id
    ).outerjoin(
        Task, (User.id == Task.assigned_to) & (Task.status != "Done")
    ).group_by(User.id, User.name, User.role).order_by(text('project_count DESC')).limit(10)

    project_assignments = []
    for user_id, user_name, role, project_count, active_tasks in project_assignments_query:
        project_assignments.append({
            "name": user_name,
            "role": role,
            "projectCount": project_count,
            "activeTasks": active_tasks
        })

    return {
        "roleDistribution": role_distribution,
        "topContributors": top_contributors,
        "activityByDay": activity_by_day,
        "projectAssignments": project_assignments
    }