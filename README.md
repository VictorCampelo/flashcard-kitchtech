# Flashcard App

A full-stack flashcard application with spaced repetition learning system.

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Backend**: PHP (Custom MVC Framework)
- **Database**: MySQL 8.0
- **Containerization**: Docker + Docker Compose

## Quick Start

### Prerequisites

- Docker and Docker Compose installed
- Git

### Running with Docker Compose

1. Clone the repository:
```bash
git clone <repository-url>
cd flashcard-app
```

2. Copy the environment files:
```bash
# Backend
cp backend/.env.example backend/.env

# Frontend
cp frontend/.env.example frontend/.env
```

3. Start all services:

**Development Mode** (default - with hot-reload):
```bash
docker-compose up -d
```
Access: http://localhost:5173

**Production Mode** (optimized build with Nginx):
Edit `docker-compose.yml` and change the frontend dockerfile:
```yaml
frontend:
  build:
    dockerfile: Dockerfile.prod  # Change from Dockerfile.dev
  ports:
    - "3000:80"  # Change from "5173:5173"
```

Then run:
```bash
docker-compose up -d --build
```
Access: http://localhost:3000

4. Access the application:
   - **Frontend (Dev)**: http://localhost:5173
   - **Frontend (Prod)**: http://localhost:3000
   - **Backend API**: http://localhost:8000
   - **MySQL**: localhost:3306

5. Stop all services:
```bash
docker-compose down
```

### Development Setup

#### Backend Only
```bash
cd backend
cp .env.example .env
docker-compose up -d
```

#### Frontend Only
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

## Environment Variables

### Backend `.env`
Located at `backend/.env`. Copy from `backend/.env.example`:
- `DB_HOST`: Database host (use `mysql` for Docker)
- `DB_PORT`: Database port (default: 3306)
- `DB_NAME`: Database name
- `DB_USER`: Database user
- `DB_PASSWORD`: Database password
- `MYSQL_ROOT_PASSWORD`: MySQL root password
- `CORS_ORIGIN`: Allowed CORS origins
- `SEED_DATABASE`: Seed database on startup (true/false)

### Frontend `.env`
Located at `frontend/.env`. Copy from `frontend/.env.example`:
- `VITE_API_URL`: Backend API URL (default: http://localhost:8000/api)
- `VITE_APP_NAME`: Application name
- `VITE_APP_VERSION`: Application version

## Available Scripts

### Frontend (Local)
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run test` - Run unit tests
- `npm run test:e2e` - Run E2E tests with Playwright
- `npm run lint` - Lint code

### Frontend (Docker)
```bash
# Run unit tests
docker-compose exec frontend npm test

# Run unit tests with coverage
docker-compose exec frontend npm run test:coverage

# Run E2E tests
docker-compose exec frontend npm run test:e2e

# Run E2E tests in UI mode
docker-compose exec frontend npm run test:e2e:ui

# Run E2E tests in headed mode
docker-compose exec frontend npm run test:e2e:headed

# Lint code
docker-compose exec frontend npm run lint

# Fix linting issues
docker-compose exec frontend npm run lint:fix
```

### Backend (Local)
- `composer test` - Run PHPUnit tests
- `composer test:coverage` - Run tests with coverage
- `php migrate up` - Run migrations
- `php src/Database/seed.php` - Run seeders

### Backend (Docker)
```bash
# Run all tests
docker-compose exec backend composer test

# Run tests with coverage
docker-compose exec backend composer test:coverage

# Run unit tests only
docker-compose exec backend ./vendor/bin/phpunit --testsuite Unit

# Run feature tests only
docker-compose exec backend ./vendor/bin/phpunit --testsuite Feature

# Run migrations
docker-compose exec backend php migrate up

# Check migration status
docker-compose exec backend php migrate status

# Rollback migrations
docker-compose exec backend php migrate down

# Run seeders
docker-compose exec backend php src/Database/seed.php

# Fresh seed (truncate and reseed)
docker-compose exec backend php src/Database/seed.php --fresh
```

## Docker Commands

### Container Management
```bash
# Build and start all services
docker-compose up --build

# Start in detached mode
docker-compose up -d

# Stop all services
docker-compose down

# Stop and remove volumes (⚠️ deletes database data)
docker-compose down -v

# View logs (all services)
docker-compose logs -f

# View logs (specific service)
docker-compose logs -f frontend
docker-compose logs -f backend
docker-compose logs -f mysql

# Rebuild specific service
docker-compose up -d --build frontend
docker-compose up -d --build backend

# Restart specific service
docker-compose restart frontend
docker-compose restart backend

# View container status
docker-compose ps

# View resource usage
docker stats
```

### Access Containers
```bash
# Frontend shell
docker exec -it flashcard-frontend sh

# Backend shell
docker exec -it flashcard-backend bash

# MySQL CLI
docker exec -it flashcard-mysql mysql -u flashcard_user -pflashcard_secret flashcards_db

# Execute SQL query
docker exec flashcard-mysql mysql -u flashcard_user -pflashcard_secret flashcards_db -e "SELECT * FROM flashcards;"
```

### Database Operations
```bash
# Database dump
docker exec flashcard-mysql mysqldump -u flashcard_user -pflashcard_secret flashcards_db > backup.sql

# Restore database
docker exec -i flashcard-mysql mysql -u flashcard_user -pflashcard_secret flashcards_db < backup.sql

# Create test database
docker-compose exec backend bash scripts/setup-test-db.sh
```

## Project Structure

```
flashcard-app/
├── backend/              # PHP backend
│   ├── public/          # Public web root
│   ├── migrations/      # Database migrations
│   ├── seeders/         # Database seeders
│   └── tests/           # PHPUnit tests
├── frontend/            # React frontend
│   ├── src/            # Source code
│   ├── e2e/            # Playwright E2E tests
│   └── public/         # Static assets
└── docker-compose.yml  # Docker orchestration
```

## Features

- ✅ Create, edit, and delete flashcards
- ✅ Spaced repetition learning algorithm
- ✅ Progress tracking
- ✅ Responsive design
- ✅ RESTful API
- ✅ Docker containerization
- ✅ Unit and E2E testing
- ✅ Database migrations with rollback support
- ✅ Database seeding for development
- ✅ Hot-reload development mode
- ✅ Production-ready builds

## Testing

### Backend Tests
The backend includes comprehensive PHPUnit tests:

**Unit Tests** (`tests/Unit/`):
- ✅ Flashcard Model CRUD operations (9 tests)
- ✅ Study Mode features (6 tests)
- **Total**: 16 unit tests

**Feature Tests** (`tests/Feature/`):
- ✅ Complete API flows (7 tests)
- ✅ Integration testing

**Run tests:**
```bash
# All tests
docker-compose exec backend composer test

# With coverage report
docker-compose exec backend composer test:coverage

# Specific test suite
docker-compose exec backend ./vendor/bin/phpunit --testsuite Unit
docker-compose exec backend ./vendor/bin/phpunit --testsuite Feature
```

### Frontend Tests
The frontend includes Vitest unit tests and Playwright E2E tests:

**Unit Tests**:
- Component testing with React Testing Library
- Service layer testing
- Custom hooks testing

**E2E Tests** (`e2e/`):
- ✅ Flashcard CRUD operations
- ✅ Accessibility testing
- ✅ User workflows

**Run tests:**
```bash
# Unit tests
docker-compose exec frontend npm test

# E2E tests (requires frontend running)
docker-compose exec frontend npm run test:e2e

# E2E with UI
docker-compose exec frontend npm run test:e2e:ui
```

## API Documentation

The backend provides a RESTful API with the following endpoints:

**CRUD Operations:**
- `GET /api/flashcards` - List all flashcards
- `GET /api/flashcards/{id}` - Get single flashcard
- `POST /api/flashcards` - Create flashcard
- `PUT /api/flashcards/{id}` - Update flashcard
- `DELETE /api/flashcards/{id}` - Delete flashcard

**Study Mode:**
- `GET /api/study/flashcards` - Get flashcards for study (prioritized)
- `GET /api/study/stats` - Get study statistics
- `PATCH /api/study/flashcards/{id}/difficulty` - Update difficulty

**Filters:**
- `GET /api/flashcards/filter/difficulty/{difficulty}` - Filter by difficulty

For complete API documentation, see [`backend/API_ROUTES.md`](backend/API_ROUTES.md)

## Architecture

### Backend
- **Framework**: Pure PHP 8.1+ (no frameworks)
- **Pattern**: MVC (Model-View-Controller)
- **Database**: MySQL 8.0 with PDO
- **Migrations**: Custom migration system with version control
- **Testing**: PHPUnit 10.5
- **Code Style**: PSR-12

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite 5
- **Routing**: React Router 6
- **HTTP Client**: Axios
- **Testing**: Vitest + Playwright
- **Styling**: CSS Modules

### Infrastructure
- **Containerization**: Docker + Docker Compose
- **Web Server**: Apache (backend), Nginx (frontend prod)
- **Development**: Hot-reload for both frontend and backend

## Troubleshooting

### Backend won't start
```bash
# Check backend logs
docker-compose logs backend

# Verify MySQL is healthy
docker-compose ps

# Restart backend
docker-compose restart backend
```

### Frontend won't start
```bash
# Check frontend logs
docker-compose logs frontend

# Rebuild frontend
docker-compose up -d --build frontend
```

### Database issues
```bash
# Reset database (⚠️ deletes all data)
docker-compose down -v
docker-compose up -d

# Run migrations manually
docker-compose exec backend php migrate up

# Reseed database
docker-compose exec backend php src/Database/seed.php --fresh
```

### Port conflicts
If ports 3306, 5173, or 8000 are already in use, you can change them in `docker-compose.yml`:
```yaml
ports:
  - "3307:3306"  # MySQL
  - "8001:80"    # Backend
  - "5174:5173"  # Frontend
```

## Additional Documentation

- **Backend Documentation**: [`backend/README.md`](backend/README.md)
- **API Routes**: [`backend/API_ROUTES.md`](backend/API_ROUTES.md)
- **Frontend Documentation**: [`frontend/README.md`](frontend/README.md) (if exists)

## Author

**Victor Campelo**  
Email: victor_campelo@outlook.com

## License

MIT
