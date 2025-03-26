# run_alembic.py
import os
import sys
import subprocess

# Add the project root to the Python path
project_root = os.path.abspath(os.path.dirname(__file__))
sys.path.insert(0, project_root)

# Run Alembic command with proper environment
cmd = ["alembic", "revision", "--autogenerate", "-m", "Add linked_task_ids to weekly_updates"]
subprocess.run(cmd, env=os.environ)

cmd = ["alembic", "upgrade", "head"]
subprocess.run(cmd, env=os.environ)