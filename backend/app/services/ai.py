from typing import Dict, List, Any, Optional
import os
from openai import OpenAI
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.update import WeeklyUpdate
from app.models.task import Task
from app.models.project import Project

# Initialize OpenAI client
client = OpenAI(api_key=settings.OPENAI_API_KEY)


def generate_update_summary(update_notes: str) -> Optional[str]:
    """
    Generate an AI summary from weekly update notes
    """
    if not settings.OPENAI_API_KEY:
        return None

    try:
        response = client.chat.completions.create(
            model=settings.AI_MODEL,
            messages=[
                {"role": "system",
                 "content": "You are an assistant that summarizes weekly project updates. Create a concise, professional summary highlighting key achievements, challenges, and next steps."},
                {"role": "user", "content": f"Summarize this project update: {update_notes}"}
            ],
            max_tokens=150
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Error generating AI summary: {e}")
        return None


def predict_project_delay(db: Session, project_id: str) -> Dict[str, Any]:
    """
    Analyze project updates and tasks to predict potential delays
    """
    if not settings.OPENAI_API_KEY:
        return {"analysis": "AI analysis not available", "risk_level": "Unknown"}

    # Get project information
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        return {"analysis": "Project not found", "risk_level": "Unknown"}

    # Get recent updates
    updates = db.query(WeeklyUpdate).filter(
        WeeklyUpdate.project_id == project_id
    ).order_by(WeeklyUpdate.date.desc()).limit(5).all()

    # Get tasks with their status
    tasks = db.query(Task).filter(
        Task.project_id == project_id
    ).all()

    # Calculate task statistics
    total_tasks = len(tasks)
    completed_tasks = sum(1 for task in tasks if task.status == "Done")
    in_progress_tasks = sum(1 for task in tasks if task.status == "In Progress")
    pending_tasks = sum(1 for task in tasks if task.status == "Pending")

    # Prepare data for analysis
    updates_text = "\n".join([f"Date: {update.date}, Status: {update.status}\n{update.notes}" for update in updates])
    project_info = f"Project: {project.name}\nDescription: {project.description}\nStart date: {project.start_date}\nEnd date: {project.end_date}\nStatus: {project.status}"
    tasks_info = f"Total tasks: {total_tasks}\nCompleted: {completed_tasks}\nIn progress: {in_progress_tasks}\nPending: {pending_tasks}"

    # Combine all information
    analysis_input = f"{project_info}\n\n{tasks_info}\n\nRecent updates:\n{updates_text}"

    try:
        response = client.chat.completions.create(
            model=settings.AI_MODEL,
            messages=[
                {"role": "system",
                 "content": "You are an AI specialized in project management. Analyze this project information and identify potential risks of delay. Provide a percentage risk of delay and detailed explanation."},
                {"role": "user", "content": f"Analyze for delay risks: {analysis_input}"}
            ],
            max_tokens=500
        )

        analysis = response.choices[0].message.content.strip()

        # Determine risk level based on analysis content
        risk_level = "Medium"  # Default
        if "high risk" in analysis.lower() or "significant risk" in analysis.lower():
            risk_level = "High"
        elif "low risk" in analysis.lower() or "minimal risk" in analysis.lower():
            risk_level = "Low"

        return {
            "analysis": analysis,
            "risk_level": risk_level
        }
    except Exception as e:
        print(f"Error predicting delays: {e}")
        return {"analysis": "Unable to generate prediction", "risk_level": "Unknown"}


def generate_project_report(db: Session, project_id: str) -> Optional[str]:
    """
    Generate a comprehensive project status report
    """
    if not settings.OPENAI_API_KEY:
        return None

    # Get project information
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        return None

    # Get recent updates
    updates = db.query(WeeklyUpdate).filter(
        WeeklyUpdate.project_id == project_id
    ).order_by(WeeklyUpdate.date.desc()).limit(5).all()

    # Get tasks with their status
    tasks = db.query(Task).filter(
        Task.project_id == project_id
    ).all()

    # Calculate task statistics
    total_tasks = len(tasks)
    completed_tasks = sum(1 for task in tasks if task.status == "Done")
    in_progress_tasks = sum(1 for task in tasks if task.status == "In Progress")
    pending_tasks = sum(1 for task in tasks if task.status == "Pending")

    # Calculate completion percentage
    completion_percentage = 0
    if total_tasks > 0:
        completion_percentage = int((completed_tasks / total_tasks) * 100)

    # Prepare data for report
    updates_text = "\n".join([f"Date: {update.date}, Status: {update.status}\n{update.notes}" for update in updates])
    project_info = f"Project: {project.name}\nDescription: {project.description}\nStart date: {project.start_date}\nEnd date: {project.end_date}\nStatus: {project.status}\nCompletion: {completion_percentage}%"
    tasks_info = f"Total tasks: {total_tasks}\nCompleted: {completed_tasks}\nIn progress: {in_progress_tasks}\nPending: {pending_tasks}"

    # Combine all information
    report_input = f"{project_info}\n\n{tasks_info}\n\nRecent updates:\n{updates_text}"

    try:
        response = client.chat.completions.create(
            model=settings.AI_MODEL,
            messages=[
                {"role": "system",
                 "content": "You are an AI specialized in project management reporting. Create a professional, comprehensive project status report based on the data provided. Include achievements, challenges, current status, and next steps."},
                {"role": "user", "content": f"Generate status report for: {report_input}"}
            ],
            max_tokens=1000
        )

        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Error generating project report: {e}")
        return None