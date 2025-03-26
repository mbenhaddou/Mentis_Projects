# Mentis Project Tracker - Backend

This is the backend for the Mentis Project Tracker application, built with FastAPI and PostgreSQL.

## Features

- RESTful API for project management
- JWT authentication
- PostgreSQL database with SQLAlchemy ORM
- OpenAI integration for AI-powered features
- File upload and management
- Database migrations with Alembic

## Requirements

- Python 3.10+
- PostgreSQL
- OpenAI API key (optional, for AI features)

## Setup

### 1. Create a virtual environment

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Set up environment variables

Create a `.env` file in the root directory with the following variables:

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/mentis
SECRET_KEY=your-secret-key-here
OPENAI_API_KEY=your-openai-api-key  # Optional
```

### 4. Initialize the database

First, create a PostgreSQL database:

```bash
createdb mentis
```

Then, initialize the database schema:

```bash
python -m app.db_init
```

Alternatively, you can use Alembic for migrations:

```bash
alembic upgrade head
```

### 5. Seed the database with test data (optional)

```bash
python -m app.seed_data
```

## Running the Application

### Development server

```bash
uvicorn app.main:app --reload
```

The API will be available at http://localhost:8000.

API documentation will be available at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### Production server

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## Project Structure

- `app/`: Main application package
  - `api/`: API endpoints
  - `core/`: Core functionality (config, security, database)
  - `models/`: SQLAlchemy database models
  - `schemas/`: Pydantic schemas for validation
  - `services/`: Business logic
  - `main.py`: Application entry point
- `alembic/`: Database migrations
- `tests/`: Test suite
- `uploads/`: File upload directory

## Testing

Run tests with pytest:

```bash
pytest
```

## API Endpoints

### Authentication

- `POST /api/auth/register`: Register a new user
- `POST /api/auth/login`: Login and get JWT token
- `GET /api/auth/me`: Get current user info
- `POST /api/auth/refresh`: Refresh JWT token

### Projects

- `GET /api/projects/`: Get all projects
- `POST /api/projects/`: Create a new project
- `GET /api/projects/{id}`: Get a specific project
- `PUT /api/projects/{id}`: Update a project
- `DELETE /api/projects/{id}`: Delete a project
- `GET /api/projects/{id}/tasks`: Get tasks for a project
- `GET /api/projects/{id}/updates`: Get updates for a project
- `POST /api/projects/{id}/members/{user_id}`: Add a team member
- `DELETE /api/projects/{id}/members/{user_id}`: Remove a team member

### Weekly Updates

- `POST /api/projects/{id}/updates`: Create a weekly update
- `GET /api/updates/{id}`: Get a specific update
- `PUT /api/updates/{id}`: Update a weekly update
- `DELETE /api/updates/{id}`: Delete a weekly update
- `POST /api/updates/{id}/generate-summary`: Generate AI summary

### Tasks

- `POST /api/tasks/`: Create a new task
- `GET /api/tasks/`: Get tasks (filtered by project or assigned user)
- `GET /api/tasks/{id}`: Get a specific task
- `PUT /api/tasks/{id}`: Update a task
- `DELETE /api/tasks/{id}`: Delete a task
- `POST /api/tasks/{id}/assign`: Assign a task to a user

### Documents

- `POST /api/projects/{id}/documents`: Upload a document
- `GET /api/projects/{id}/documents`: Get documents for a project
- `GET /api/documents/{id}`: Get a specific document
- `PUT /api/documents/{id}`: Update a document
- `DELETE /api/documents/{id}`: Delete a document

### AI

- `POST /api/ai/predict-delay/{id}`: Predict project delay using AI
- `POST /api/ai/generate-report/{id}`: Generate project report using AI

## Default Users

When seeding the database, the following test users are created:

1. Admin
   - Email: admin@example.com
   - Password: Admin123!
   - Role: Admin

2. Project Manager
   - Email: manager@example.com
   - Password: Manager123!
   - Role: Manager

3. Team Member
   - Email: contributor@example.com
   - Password: Member123!
   - Role: Contributor

## Docker Support

The application can be run using Docker:

```bash
# Build the image
docker build -t mentis-backend -f docker/backend.Dockerfile .

# Run the container
docker run -p 8000:8000 \
  -e DATABASE_URL=postgresql://postgres:postgres@host.docker.internal:5432/mentis \
  -e SECRET_KEY=your-secret-key \
  mentis-backend
```

For development with Docker Compose:

```bash
docker-compose -f docker/docker-compose.yml up -d
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request