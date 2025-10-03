# Flashcard App

A full-stack flashcard application with spaced repetition learning system.

🌐 **Live Demo**: [https://flashcard.rhyffy.online](https://flashcard.rhyffy.online)

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Backend**: PHP (Custom MVC Framework)
- **Database**: MySQL 8.0
- **Containerization**: Docker + Docker Compose
- **Deployment**: Nginx + Ubuntu Server

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
- ✅ **Pagination** - Efficient data loading with customizable page sizes
- ✅ Progress tracking
- ✅ Responsive design
- ✅ RESTful API with pagination support
- ✅ Docker containerization
- ✅ Unit and E2E testing (260+ tests)
- ✅ Database migrations with rollback support
- ✅ Database seeding for development
- ✅ Hot-reload development mode
- ✅ Production-ready builds
- ✅ Nginx reverse proxy for production

## Testing

### Backend Tests
The backend includes comprehensive PHPUnit tests with **100% passing rate**:

**Test Coverage:**
- ✅ **43 tests** passing
- ✅ **111 assertions**
- ✅ **Unit Tests** (`tests/Unit/`): Repository and model testing
- ✅ **Feature Tests** (`tests/Feature/`): Complete API integration testing
- ✅ **Automatic Test Database**: `flashcards_test` created automatically on startup

**Run tests:**
```bash
# All tests
docker-compose exec backend composer test

# With coverage report (HTML)
docker-compose exec backend composer test:coverage

# Specific test suite
docker-compose exec backend ./vendor/bin/phpunit --testsuite Unit
docker-compose exec backend ./vendor/bin/phpunit --testsuite Feature

# Single test file
docker-compose exec backend ./vendor/bin/phpunit tests/Unit/FlashcardRepositoryTest.php
```

**Test Database Setup:**
The test database is automatically created via the Docker entrypoint script:
- Database `flashcards_test` created on first startup
- Permissions granted to `flashcard_user`
- Migrations run automatically
- Clean state for each test run

### Frontend Tests
The frontend includes Vitest unit tests and Playwright E2E tests with **100% passing rate**:

**Test Coverage:**
- ✅ **204 unit tests** passing (Vitest)
- ✅ **13 E2E tests** passing (Playwright)
- ✅ Component testing with React Testing Library
- ✅ Service layer and custom hooks testing
- ✅ Pagination component with 32 comprehensive tests
- ✅ Complete user workflow testing

**Unit Tests** (Vitest):
- ✅ Component rendering and interactions
- ✅ Custom hooks (useFlashcards, useToggle)
- ✅ Service layer (API calls)
- ✅ Form validation and error handling
- ✅ Modal interactions

**E2E Tests** (Playwright):
- ✅ Flashcard CRUD operations
- ✅ Modal interactions (create, edit, delete with confirmation)
- ✅ Form validation
- ✅ Empty states and error handling
- ✅ Refresh functionality
- ✅ Complete user workflows

**Run tests:**
```bash
# Unit tests (watch mode)
docker-compose exec frontend npm test

# Unit tests (run once)
docker-compose exec frontend npm run test:run

# Unit tests with coverage
docker-compose exec frontend npm run test:coverage

# E2E tests (headless)
docker-compose exec frontend npm run test:e2e

# E2E tests (UI mode - interactive)
docker-compose exec frontend npm run test:e2e:ui

# E2E tests (headed - see browser)
docker-compose exec frontend npm run test:e2e:headed

# Specific E2E test file
docker-compose exec frontend npm run test:e2e home.spec.ts
```

**Test Results Summary:**
```
Backend:  43/43 tests passing ✅
Frontend: 204/204 unit tests passing ✅
E2E:      13/13 tests passing ✅
Total:    260/260 tests passing ✅
```

## API Documentation

The backend provides a RESTful API with the following endpoints:

**CRUD Operations:**
- `GET /api/flashcards` - List all flashcards (with pagination)
  - Query params: `?page=1&per_page=10` (default: page=1, per_page=10, max: 100)
  - Filters: `?filter=study` or `?difficulty=easy|medium|hard|not_studied`
- `GET /api/flashcards/{id}` - Get single flashcard
- `POST /api/flashcards` - Create flashcard
- `PUT /api/flashcards/{id}` - Update flashcard
- `DELETE /api/flashcards/{id}` - Delete flashcard

**Study Mode:**
- `GET /api/study/flashcards` - Get flashcards for study (prioritized)
- `GET /api/study/stats` - Get study statistics
- `PATCH /api/study/flashcards/{id}/difficulty` - Update difficulty

**Pagination Examples:**
```bash
# Get first page with 10 items
curl http://localhost:8000/api/flashcards?page=1&per_page=10

# Get second page with 20 items
curl http://localhost:8000/api/flashcards?page=2&per_page=20

# Get easy flashcards with pagination
curl http://localhost:8000/api/flashcards?difficulty=easy&page=1&per_page=10

# Get study-prioritized flashcards with pagination
curl http://localhost:8000/api/flashcards?filter=study&page=1&per_page=10
```

**Pagination Response Format:**
```json
{
  "success": true,
  "data": [...],
  "total": 50,
  "page": 1,
  "per_page": 10,
  "total_pages": 5
}
```

For complete API documentation, see [`backend/API_ROUTES.md`](backend/API_ROUTES.md)

## Architecture & Design Decisions

### Backend Architecture

**Technology Choices:**
- **Pure PHP 8.1+**: Chosen to demonstrate deep understanding of PHP fundamentals without framework dependencies
- **Custom MVC Pattern**: Implemented from scratch to show architectural design skills
- **MySQL 8.0 with PDO**: Reliable, performant, and widely supported relational database
- **Custom Migration System**: Version-controlled database schema changes with rollback support

**Design Patterns:**
- **Repository Pattern**: Abstracts data access logic from business logic
- **Service Layer**: Encapsulates business logic and orchestrates operations
- **Dependency Injection**: Manual DI for loose coupling and testability
- **RESTful API**: Standard HTTP methods and status codes for predictable API behavior

**Trade-offs:**
- ✅ **Pros**: Full control over architecture, no framework overhead, educational value
- ⚠️ **Cons**: More boilerplate code, manual implementation of common features
- 🎯 **Decision**: Prioritized learning and demonstration of core concepts over rapid development

### Frontend Architecture

**Technology Choices:**
- **React 18 + TypeScript**: Type-safe, component-based architecture with excellent ecosystem
- **Vite 5**: Lightning-fast HMR and optimized production builds
- **Custom State Management**: Context API + hooks for lightweight state management
- **Axios**: Promise-based HTTP client with interceptors for centralized error handling

**Design Patterns:**
- **Component Composition**: Reusable, testable UI components
- **Custom Hooks**: Encapsulated business logic (useFlashcards, useToggle)
- **Separation of Concerns**: Services layer for API calls, components for UI
- **Error Boundaries**: Graceful error handling and user feedback

**Trade-offs:**
- ✅ **Pros**: Type safety, excellent DX, fast builds, modern tooling
- ⚠️ **Cons**: No state management library (Redux/Zustand) for complex state
- 🎯 **Decision**: Context API sufficient for current app complexity, can scale later

### Data Storage & Management

**Database Design:**
- **Single Table Approach**: `flashcards` table with all necessary fields
- **Study Tracking**: Built-in fields for difficulty, study count, and last studied date
- **Timestamps**: Created/updated timestamps for audit trail
- **Indexes**: Optimized queries with proper indexing on frequently queried fields

**Migration Strategy:**
- **Version Control**: Each migration tracked in `migrations` table
- **Rollback Support**: Down migrations for safe schema changes
- **Automatic Execution**: Migrations run automatically on container startup
- **Test Database**: Separate `flashcards_test` database created automatically

### Infrastructure & DevOps

**Docker Architecture:**
- **Multi-container Setup**: Separate containers for frontend, backend, and database
- **Volume Persistence**: MySQL data persisted across container restarts
- **Health Checks**: MySQL health check ensures database ready before backend starts
- **Network Isolation**: Custom bridge network for secure inter-container communication

**Development Workflow:**
- **Hot Reload**: Both frontend (Vite HMR) and backend (volume mounts) support live reloading
- **Environment Variables**: Separate .env files for configuration management
- **Database Seeding**: Automatic seeding in development for quick setup
- **Test Automation**: Separate test database created automatically via entrypoint script

**Trade-offs:**
- ✅ **Pros**: Consistent environment, easy setup, production-like development
- ⚠️ **Cons**: Docker overhead, requires Docker knowledge
- 🎯 **Decision**: Benefits of containerization outweigh complexity for team collaboration

## Future Work & Improvements

With additional time, the following features and enhancements could be implemented:

### High Priority

**1. Authentication & Authorization**
- 🔐 **JWT Authentication**: Implement JSON Web Token-based authentication
- 👤 **User Management**: User registration, login, and profile management
- 🔒 **Protected Routes**: Secure API endpoints and frontend routes
- 📧 **Email Verification**: Email confirmation for new accounts
- 🔑 **Password Reset**: Forgot password functionality with email tokens

**2. Pagination & Performance**
- 📄 **API Pagination**: ⚠️ *Partially implemented* - Backend supports pagination with `?paginated=true&page=1&limit=10`, needs frontend integration
- 🔍 **Search & Filtering**: Advanced search with full-text search capabilities
- ⚡ **Caching Layer**: Redis for caching frequently accessed data
- 🗜️ **Response Compression**: Gzip compression for API responses
- 📊 **Database Indexing**: Additional indexes for complex queries

**3. Enhanced Study Features**
- 🧠 **Spaced Repetition Algorithm**: Implement SM-2 or Anki-style algorithm
- 📈 **Study Analytics**: Detailed statistics and progress tracking
- 🎯 **Study Goals**: Daily/weekly study goals and streaks
- 🏆 **Achievements**: Gamification with badges and rewards
- 📅 **Study Scheduler**: Remind users when to review cards

### Medium Priority

**4. Collaborative Features**
- 👥 **Deck Sharing**: Share flashcard decks with other users
- 🌐 **Public Decks**: Browse and import community-created decks
- 💬 **Comments & Ratings**: Rate and comment on shared decks
- 🤝 **Study Groups**: Collaborative study sessions

**5. Rich Content Support**
- 🖼️ **Image Upload**: Support images in flashcards
- 🎵 **Audio Support**: Add audio pronunciation for language learning
- 📹 **Video Embeds**: Embed YouTube or other video content
- ✍️ **Rich Text Editor**: Markdown or WYSIWYG editor for card content
- 🎨 **Card Templates**: Customizable card layouts and themes

**6. Mobile & PWA**
- 📱 **Progressive Web App**: Offline support and mobile optimization
- 📲 **Native Mobile Apps**: React Native or Flutter mobile applications
- 🔔 **Push Notifications**: Study reminders and notifications
- 📴 **Offline Mode**: Study without internet connection

### Low Priority

**7. Advanced Features**
- 🤖 **AI-Generated Cards**: Use AI to generate flashcards from text/PDFs
- 🗣️ **Text-to-Speech**: Audio pronunciation for cards
- 🌍 **Internationalization**: Multi-language support (i18n)
- 🎨 **Themes**: Dark mode and customizable UI themes
- 📊 **Export/Import**: Export decks to Anki, Quizlet, or CSV formats

**8. DevOps & Infrastructure**
- 🚀 **CI/CD Pipeline**: GitHub Actions for automated testing and deployment
- 📦 **Kubernetes**: Container orchestration for scalability
- 🔍 **Monitoring**: Application performance monitoring (APM)
- 📝 **Logging**: Centralized logging with ELK stack
- 🔐 **Security Hardening**: OWASP security best practices, rate limiting

**9. Code Quality & Documentation**
- 📚 **API Documentation**: OpenAPI/Swagger documentation
- 🧪 **Increased Test Coverage**: Aim for 90%+ code coverage
- 🔄 **E2E Test Automation**: Complete user journey testing
- 📖 **Developer Documentation**: Architecture diagrams, contribution guidelines
- 🎯 **Performance Testing**: Load testing and optimization

### Technical Debt & Refactoring

- 🏗️ **State Management**: Migrate to Redux Toolkit or Zustand for complex state
- 🔧 **Backend Framework**: Consider migrating to Laravel or Symfony for larger scale
- 🗄️ **Database Optimization**: Query optimization, read replicas
- 🧹 **Code Cleanup**: Refactor duplicated code, improve naming conventions
- 📦 **Dependency Updates**: Keep dependencies up-to-date and secure

## Production Deployment

### Live Application

🌐 **Production URL**: [https://flashcard.rhyffy.online](https://flashcard.rhyffy.online)

**Server Details:**
- **OS**: Ubuntu Server
- **Web Server**: Nginx (reverse proxy)
- **SSL**: Let's Encrypt (Certbot)
- **Domain**: flashcard.rhyffy.online (Hostinger DNS)

### Deployment Architecture

```
Internet → Nginx (Port 80/443)
           ↓
           ├─→ Backend API (127.0.0.1:8000) → Docker Container
           └─→ Frontend (127.0.0.1:5173) → Docker Container
                                           ↓
                                    MySQL (127.0.0.1:3306) → Docker Container
```

### Deployment Steps

1. **Configure DNS in Hostinger**
   - Add A record: `@` → `SERVER IP`
   - Add A record: `www` → `SERVER IP`
   - Wait 24-48 hours for DNS propagation

2. **Install Nginx on Ubuntu Server**
   ```bash
   sudo apt update && sudo apt install nginx
   ```

3. **Configure Nginx**
   ```bash
   sudo nano /etc/nginx/sites-available/flashcard-app
   ```
   
   Add configuration:
   ```nginx
   upstream backend_api {
       server 127.0.0.1:8000;
       keepalive 32;
   }

   upstream frontend_dev {
       server 127.0.0.1:5173;
       keepalive 32;
   }

   server {
       listen 80;
       server_name www.flashcard.rhyffy.online;
       return 301 https://flashcard.rhyffy.online$request_uri;
   }

   server {
       listen 80;
       server_name flashcard.rhyffy.online;

       location /api/ {
           proxy_pass http://backend_api/api/;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }

       location / {
           proxy_pass http://frontend_dev;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

4. **Enable Nginx Configuration**
   ```bash
   sudo ln -s /etc/nginx/sites-available/flashcard-app /etc/nginx/sites-enabled/
   sudo rm /etc/nginx/sites-enabled/default
   sudo nginx -t
   sudo systemctl reload nginx
   ```

5. **Install SSL Certificate**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d flashcard.rhyffy.online -d www.flashcard.rhyffy.online
   ```

6. **Start Docker Containers**
   ```bash
   cd ~/flashcard-kitchtech
   docker-compose up -d
   ```

7. **Verify Deployment**
   ```bash
   # Test DNS
   nslookup flashcard.rhyffy.online
   
   # Test application
   curl https://flashcard.rhyffy.online
   
   # Check containers
   docker-compose ps
   ```

### Monitoring & Maintenance

```bash
# View application logs
docker-compose logs -f

# Check Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Restart services
docker-compose restart
sudo systemctl restart nginx

# Update application
git pull
docker-compose up -d --build
```

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

## Author

**Victor Campelo**  
Email: victor_campelo@outlook.com

## License

MIT
