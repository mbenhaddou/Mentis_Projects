.PHONY: help install-backend install-frontend start-backend start-frontend db-init db-migrate db-seed test-backend test-frontend docker-up docker-down

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# Backend commands
install-backend: ## Install backend dependencies
	cd backend && pip install -r requirements.txt

start-backend: ## Start backend development server
	cd backend && uvicorn app.main:app --reload

db-init: ## Initialize database
	cd backend && python -m app.db_init

db-migrate: ## Run database migrations
	cd backend && alembic upgrade head

db-seed: ## Seed database with test data
	cd backend && python -m app.seed_data

test-backend: ## Run backend tests
	cd backend && pytest

# Frontend commands
install-frontend: ## Install frontend dependencies
	cd frontend && npm install

start-frontend: ## Start frontend development server
	cd frontend && npm run dev

build-frontend: ## Build frontend for production
	cd frontend && npm run build

test-frontend: ## Run frontend tests
	cd frontend && npm test

# Docker commands
docker-up: ## Start all services with Docker
	docker-compose -f docker/docker-compose.yml up -d

docker-down: ## Stop all Docker services
	docker-compose -f docker/docker-compose.yml down

docker-init: ## Initialize database in Docker
	docker-compose -f docker/docker-compose.yml --profile init up init-db

# Combined commands
install: install-backend install-frontend ## Install all dependencies

start: ## Start both backend and frontend servers
	make -j 2 start-backend start-frontend

docker-clean: ## Remove all Docker volumes and containers
	docker-compose -f docker/docker-compose.yml down -v

# Production commands
prod-build: ## Build for production
	docker-compose -f docker/docker-compose.yml -f docker/docker-compose.prod.yml build

prod-up: ## Start production services
	docker-compose -f docker/docker-compose.yml -f docker/docker-compose.prod.yml up -d

prod-down: ## Stop production services
	docker-compose -f docker/docker-compose.yml -f docker/docker-compose.prod.yml down