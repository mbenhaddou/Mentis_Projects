#!/usr/bin/env python3
"""
Script to create the directory structure and empty files for the Mentis Project Tracker.
This simplified version only creates empty files.
"""

import os
import sys
from pathlib import Path

# Root directory name (default is mentis-project-tracker)


def create_directory_structure():
    """Create the entire directory structure for the Mentis Project Tracker with empty files."""
    base_path = Path("/Users/mohamedmentis/Dropbox/Mac (2)/Documents/Mentis/Development/Projects/Mentis_Projects")


    # Directories to create
    directories = [
        # Frontend directories
        "frontend/public",
        "frontend/src/assets",
        "frontend/src/components/ui",
        "frontend/src/components/dashboard",
        "frontend/src/components/projects",
        "frontend/src/components/analytics",
        "frontend/src/components/layouts",
        "frontend/src/hooks",
        "frontend/src/lib",
        "frontend/src/pages",
        "frontend/src/services",
        "frontend/src/store",
        "frontend/src/contexts",

        # Backend directories
        "backend/app/api",
        "backend/app/core",
        "backend/app/models",
        "backend/app/schemas",
        "backend/app/services",
        "backend/alembic",
        "backend/tests",

        # Docker directory
        "docker",
    ]

    # Create all directories
    for directory in directories:
        os.makedirs(base_path / directory, exist_ok=True)
        print(f"Created directory: {base_path / directory}")

    # Files to create (empty)
    files = [
        # Root files
        "README.md",

        # Frontend files
        "frontend/package.json",
        "frontend/src/App.jsx",
        "frontend/src/main.jsx",
        "frontend/src/index.css",
        "frontend/src/services/api.js",
        "frontend/src/services/projectService.js",
        "frontend/.gitignore",
        "frontend/tailwind.config.js",
        "frontend/vite.config.js",
        "frontend/src/pages/Dashboard.jsx",
        "frontend/src/pages/ProjectDetail.jsx",
        "frontend/src/pages/Analytics.jsx",
        "frontend/src/pages/WeeklyUpdateForm.jsx",
        "frontend/src/pages/Login.jsx",
        "frontend/src/pages/Register.jsx",
        "frontend/src/pages/NotFound.jsx",
        "frontend/src/components/layouts/AuthLayout.jsx",
        "frontend/src/components/layouts/MainLayout.jsx",
        "frontend/src/contexts/AuthContext.jsx",

        # Backend files
        "backend/requirements.txt",
        "backend/app/main.py",
        "backend/app/core/db.py",
        "backend/app/core/config.py",
        "backend/app/core/security.py",
        "backend/app/models/__init__.py",
        "backend/app/models/project.py",
        "backend/app/models/user.py",
        "backend/app/models/task.py",
        "backend/app/models/update.py",
        "backend/app/api/__init__.py",
        "backend/app/api/auth.py",
        "backend/app/api/projects.py",
        "backend/app/api/updates.py",
        "backend/app/api/tasks.py",
        "backend/app/api/ai.py",
        "backend/app/schemas/__init__.py",
        "backend/app/schemas/project.py",
        "backend/app/schemas/user.py",
        "backend/app/schemas/task.py",
        "backend/app/schemas/update.py",
        "backend/app/services/__init__.py",
        "backend/app/services/project.py",
        "backend/app/services/user.py",
        "backend/app/services/task.py",
        "backend/app/services/update.py",
        "backend/app/services/ai.py",
        "backend/alembic/env.py",
        "backend/alembic/README",
        "backend/alembic.ini",
        "backend/db_schema.sql",

        # Docker files
        "docker/docker-compose.yml",
        "docker/frontend.Dockerfile",
        "docker/backend.Dockerfile",
        "docker/nginx.conf",
    ]

    # Create all empty files
    for file_path in files:
        open(base_path / file_path, "w").close()
        print(f"Created empty file: {base_path / file_path}")

    print(f"\nProject structure created successfully at '{base_path}'")


if __name__ == "__main__":
    create_directory_structure()