import click
from flask.cli import with_appcontext
from flask import current_app
import sys
import os

# Add project root to Python path
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.insert(0, project_root)

try:
    import bcrypt
except Exception as e:
    print(f"Import error: {e}")
    print(f"Python path: {sys.path}")
    raise

from app import db  # Adjust import based on your project structure
from app.models import User


def hash_password(password):
    # Ensure password is encoded to bytes
    if isinstance(password, str):
        password = password.encode('utf-8')

    # Generate a salt and hash the password
    return bcrypt.hashpw(password, bcrypt.gensalt())


@click.command('create-user')
@click.option('--username', prompt=True)
@click.option('--password', prompt=True, hide_input=True, confirmation_prompt=True)
@click.option('--email', prompt=True)
@click.option('--admin', is_flag=True, default=False)
@with_appcontext
def create_user_command(username, password, email, admin):
    """Create a new user."""
    # Check if user already exists
    existing_user = User.query.filter_by(username=username).first()
    if existing_user:
        click.echo(f'User {username} already exists.')
        return

    # Hash the password
    hashed_password = hash_password(password)

    # Create new user
    new_user = User(
        username=username,
        password_hash=hashed_password.decode('utf-8'),
        email=email,
        is_admin=admin
    )

    try:
        db.session.add(new_user)
        db.session.commit()
        click.echo(f'User {username} created successfully.')
    except Exception as e:
        db.session.rollback()
        click.echo(f'Error creating user: {e}')


# In your app/__init__.py or a similar initialization file
def init_app(app):
    app.cli.add_command(create_user_command)