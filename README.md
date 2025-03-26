# Mentis Project Tracker

A comprehensive web application designed to centralize, manage, and visualize project progress updates recorded weekly. This application replaces manual tracking in Excel, providing a collaborative dashboard, automation, and AI-powered insights.

![Mentis Project Tracker](https://via.placeholder.com/800x400?text=Mentis+Project+Tracker)

## Features

- **Project Management Dashboard**: Search, filter, and access all active projects
- **Individual Project Pages**: Timeline view, team assignment, document attachments
- **Weekly Update System**: Track progress with categorized updates (Completed, In Progress, Blocked)
- **Analytics & Reports**: Track progress trends, detect bottlenecks, and generate AI-powered summaries
- **Team Collaboration & Notifications**: Assign team members and get notified about deadlines
- **Import & Export**: Move data in and out of the system in PDF/Excel formats

## Tech Stack

### Backend
- **Framework**: FastAPI (Python)
- **Database**: PostgreSQL
- **ORM**: SQLAlchemy
- **Authentication**: JWT-based (OAuth 2.0)
- **AI Integration**: OpenAI API

### Frontend
- **Framework**: React.js
- **Styling**: TailwindCSS
- **UI Components**: shadcn/ui
- **State Management**: React Context API
- **Charts**: Recharts

## Getting Started

### Prerequisites
- Docker and Docker Compose (recommended)
- Node.js 18+ (for local frontend development)
- Python 3.10+ (for local backend development)
- PostgreSQL (if not using Docker)

### Quick Start with Docker

```bash
# Clone the repository
git clone https://github.com/yourusername/mentis-project-tracker.git
cd mentis-project-tracker

# Start all services
docker-compose -f docker/docker-compose.yml up -d

# Initialize the database (first run only)
docker-compose -f docker/docker-compose.yml --profile init up init-db

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Documentation: http://localhost:8000/docs
# PGAdmin: http://localhost:5050
```

### Manual Setup

#### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Initialize the database
python -m app.db_init
python -m app.seed_data  # Optional: add test data

# Start the server
uvicorn app.main:app --reload
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Project Structure

```
mentis-project-tracker/
├── backend/                # FastAPI backend
│   ├── alembic/            # Database migrations
│   ├── app/                # Application package
│   │   ├── api/            # API endpoints
│   │   ├── core/           # Core functionality
│   │   ├── models/         # Database models
│   │   ├── schemas/        # Pydantic schemas
│   │   ├── services/       # Business logic
│   │   └── main.py         # Application entry point
│   ├── tests/              # Test suite
│   └── requirements.txt    # Python dependencies
├── frontend/               # React frontend
│   ├── public/             # Static files
│   ├── src/                # Source code
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── App.jsx         # Main component
│   └── package.json        # npm dependencies
└── docker/                 # Docker configuration
    ├── backend.Dockerfile
    ├── frontend.Dockerfile
    └── docker-compose.yml
```

## Default Users

When using the seed data script, the following test users are created:

1. Admin
   - Email: admin@example.com
   - Password: Admin123!

2. Project Manager
   - Email: manager@example.com
   - Password: Manager123!

3. Team Member
   - Email: contributor@example.com
   - Password: Member123!

## Development

### Backend Development

- API documentation: http://localhost:8000/docs
- Database migrations: `alembic revision --autogenerate -m "description"`
- Apply migrations: `alembic upgrade head`
- Run tests: `pytest`

### Frontend Development

- Component library: shadcn/ui (https://ui.shadcn.com/)
- Styling: TailwindCSS (https://tailwindcss.com/)
- Run tests: `npm test`
- Build for production: `npm run build`

## Deployment

### Docker (Recommended)

```bash
docker-compose -f docker/docker-compose.yml -f docker/docker-compose.prod.yml up -d
```

### Manual Deployment

#### Backend

```bash
cd backend
pip install -r requirements.txt
gunicorn -w 4 -k uvicorn.workers.UvicornWorker app.main:app
```

#### Frontend

```bash
cd frontend
npm install
npm run build
# Serve using Nginx or another web server
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.