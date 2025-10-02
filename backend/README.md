# Backend - Flashcard API

**Author:** Victor Campelo  
**Email:** victor_campelo@outlook.com  
**Last Updated:** 2025-10-02

Pure PHP REST API for flashcard management with MySQL.

---

## 📑 Table of Contents

1. [Quick Start](#-quick-start)
2. [Project Structure](#-project-structure)
3. [Migration System](#-migration-system)
4. [Database Seeding](#-database-seeding)
5. [Architecture Decisions](#-architecture-decisions)
6. [Docker Commands](#-useful-docker-commands)
7. [Testing](#-testing)
8. [Vendor Directory](#-vendor-directory)
9. [Environment Variables](#-environment-variables)
10. [API Endpoints](#-api-endpoints)

---

## 🚀 Quick Start

### Via Docker (Recommended)

```powershell
# 1. Navigate to backend folder
cd backend

# 2. Copy environment file
Copy-Item .env.example .env

# 3. Start MySQL + Backend
docker-compose up --build

# 4. Access API
# http://localhost:8000/api/flashcards
```

**What happens automatically:**
- ✅ MySQL 8.0 starts and waits to become "healthy"
- ✅ Backend waits for MySQL using `wait-for-mysql.sh`
- ✅ Composer installs dependencies (`vendor/`)
- ✅ Migrations run automatically
- ✅ Seeders populate database with sample data
- ✅ Apache starts on port 8000

### Local Development (Without Docker)

```powershell
# 1. Install dependencies
composer install

# 2. Copy environment file
Copy-Item .env.example .env

# 3. Configure .env with local MySQL
# DB_HOST=localhost
# DB_PORT=3306
# DB_NAME=flashcards_db
# DB_USER=your_user
# DB_PASSWORD=your_password

# 4. Run migrations
php migrate up

# 5. Start server
php -S localhost:8000 -t public
```

---

## 🔄 Migration System

### Overview

The flashcard app now includes a **professional migration system** with version control, history tracking, and rollback support.

### Quick Commands

```powershell
# Run all pending migrations
php migrate up

# Check migration status
php migrate status

# Rollback last batch
php migrate down

# Rollback 2 batches
php migrate down 2

# Reset all migrations (requires --force)
php migrate reset --force
```

### Migration Files

Migrations are stored in `backend/migrations/`:

```
migrations/
├── 2024_01_01_000000_create_flashcards_table.php
└── 2025_10_02_000000_add_study_fields_to_flashcards.php
```

### Creating New Migrations

**File naming:** `YYYY_MM_DD_HHMMSS_description.php`

**Template:**
```php
<?php

use PDO;

class YourMigrationName
{
    public function up(PDO $db): void
    {
        // Forward migration
        $sql = "ALTER TABLE flashcards ADD COLUMN new_field VARCHAR(255)";
        $db->exec($sql);
    }
    
    public function down(PDO $db): void
    {
        // Rollback migration
        $sql = "ALTER TABLE flashcards DROP COLUMN new_field";
        $db->exec($sql);
    }
}
```

### Migration Features

- ✅ **Version Control** - Track all schema changes
- ✅ **Batch System** - Organized rollbacks
- ✅ **History Tracking** - `migrations` table stores execution history
- ✅ **Transactions** - Safe, atomic migrations
- ✅ **Status Checking** - See pending/executed migrations
- ✅ **Rollback Support** - Undo migrations safely

**Migration Manager Features:**
- Automatic class name detection from filenames
- Supports timestamps with time component (YYYY_MM_DD_HHMMSS)
- Transaction safety with rollback on errors
- Batch tracking for organized rollbacks

---

## 🌱 Database Seeding

### Overview

The seeding system populates the database with sample data for development and testing.

### Quick Commands

```powershell
# Run all seeders
php src/Database/seed.php

# Fresh seed (truncate tables first)
php src/Database/seed.php --fresh

# Docker: Run seeders in container
docker-compose exec backend php src/Database/seed.php
```

### Automatic Seeding

Seeders run automatically on container startup if `SEED_DATABASE=true` in docker-compose.yml (default).

To disable automatic seeding:
```yaml
environment:
  - SEED_DATABASE=false
```

### Seeder Files

Seeders are stored in `backend/seeders/`:

```
seeders/
└── FlashcardSeeder.php  # Sample flashcard data
```

### Creating New Seeders

**File naming:** `YourSeederName.php`

**Template:**
```php
<?php

return new class {
    public function run(PDO $db): void
    {
        $stmt = $db->prepare("INSERT INTO table_name (column) VALUES (:value)");
        $stmt->execute(['value' => 'data']);
        
        echo "   ✓ Inserted X records\n";
    }
};
```

### Sample Data Included

The `FlashcardSeeder` includes 16 flashcards covering:
- Programming concepts (closures, REST, dependency injection)
- Database concepts (primary keys, normalization, JOINs)
- Web development (CORS, authentication, JWT)
- Docker & DevOps
- Git & version control
- Testing (unit testing, TDD)

---

## 📁 Project Structure

```
backend/
├── docker-compose.yml          # Docker orchestration (MySQL + Backend)
├── Dockerfile                  # Backend container image
├── .dockerignore               # Files ignored in build
│
├── composer.json               # PHP dependencies
├── composer.lock               # Version lock
├── vendor/                     # Installed dependencies (gitignored)
│
├── .env                        # Environment variables (gitignored)
├── .env.example                # Variables template
├── .gitignore                  # Files ignored by Git
│
├── phpunit.xml                 # PHPUnit configuration
│
├── public/                     # Web root (DocumentRoot)
│   ├── index.php               # API entry point
│   └── .htaccess               # Apache rewrite rules
│
├── src/                        # Source code
│   ├── Config/                 # Configuration
│   │   └── Environment.php     # .env loader
│   │
│   ├── Controllers/            # API endpoints
│   │   ├── BaseController.php  # Base controller (JSON response)
│   │   └── FlashcardController.php # Flashcard CRUD + Study Mode
│   │
│   ├── Core/                   # Application core
│   │   └── Router.php          # Routing system
│   │
│   ├── Database/               # Connection and migrations
│   │   ├── Database.php        # PDO Singleton
│   │   ├── MigrationManager.php # Migration system
│   │   ├── SeederManager.php   # Seeder system
│   │   ├── migrate.php         # Migration CLI tool
│   │   └── seed.php            # Seeder CLI tool
│   │
│   ├── Helpers/                # Helper functions
│   │   └── functions.php       # Global helpers
│   │
│   ├── Models/                 # Data logic
│   │   └── Flashcard.php       # Flashcard model (with study features)
│   │
│   └── Routes/                 # Route definitions
│       ├── api.php             # Main API routes
│       └── flashcardRoutes.php # Flashcard resource routes
│
├── migrations/                 # Database migrations
│   ├── 2024_01_01_000000_create_flashcards_table.php
│   └── 2025_10_02_000000_add_study_fields_to_flashcards.php
│
├── seeders/                    # Database seeders
│   └── FlashcardSeeder.php     # Sample flashcard data
│
├── API_ROUTES.md               # API documentation
│
├── scripts/                    # Helper scripts
│   ├── docker-entrypoint.sh    # Container entrypoint
│   ├── wait-for-mysql.sh       # Wait for MySQL to be ready
│   └── setup-test-db.sh        # Test database setup
│
├── tests/                      # Automated tests
│   ├── Unit/                   # Unit tests
│   │   └── FlashcardModelTest.php
│   └── Feature/                # Integration tests
│       └── FlashcardApiTest.php
│
└── README.md                   # This file
```

---

## 🏗️ Architecture Decisions

### 1. **Why Pure PHP?**

**Decision:** Don't use heavy frameworks (Laravel, Symfony, CodeIgniter).

**Reasons:**
- ✅ **Simplicity:** Less overhead, more control
- ✅ **Performance:** No unnecessary layers
- ✅ **Learning:** Understand PHP fundamentals
- ✅ **Portability:** Easy deployment on any Apache/Nginx server
- ✅ **Project requirement:** Specification required pure PHP

**Trade-offs:**
- ❌ No ORM (we use pure PDO)
- ❌ No CLI tools (artisan, console)
- ❌ Manual implementation of routing, validation, etc.

---

### 2. **Why MySQL instead of SQLite?**

**Decision:** Migrate from SQLite to MySQL 8.0.

**Reasons:**
- ✅ **Concurrency:** Supports multiple simultaneous connections
- ✅ **Production:** Ready for real environments
- ✅ **Transactions:** Full ACID compliance
- ✅ **Scalability:** Better performance with large volumes
- ✅ **Docker:** Easy orchestration with docker-compose

**Trade-offs:**
- ❌ More complex setup (requires MySQL container)
- ❌ More resources (memory, CPU)

---

### 3. **Simplified MVC Architecture**

**Pattern:** Model-View-Controller (no View, since it's a REST API).

```
Request → Router → Controller → Model → Database
                      ↓
                   Response (JSON)
```

**Components:**

#### **Router** (`src/Core/Router.php`)
- Maps URLs to Controllers
- Supports HTTP methods (GET, POST, PUT, DELETE)
- Extracts route parameters (`/api/flashcards/{id}`)

#### **Controllers** (`src/Controllers/`)
- Receive HTTP requests
- Validate input
- Call Models
- Return JSON

#### **Models** (`src/Models/`)
- Business logic
- Database interaction (PDO)
- Data validation

#### **Database** (`src/Database/`)
- PDO Singleton
- Connection pooling
- Migrations

---

### 4. **Design Patterns Used**

#### **Singleton** (Database)
```php
// Ensures a single PDO connection
$db = Database::getConnection();
```

#### **Dependency Injection** (Controllers)
```php
// Model injected into Controller
public function __construct(Flashcard $model) {
    $this->model = $model;
}
```

#### **Repository Pattern** (Models)
```php
// Model as data repository
$flashcards = $model->findAll();
$flashcard = $model->findById($id);
```

#### **PSR-4 Autoloading**
```php
// Automatic autoload via Composer
use App\Models\Flashcard;
use App\Controllers\FlashcardController;
```

---

### 5. **Security Implementation**

#### **Prepared Statements (SQL Injection)**
```php
$stmt = $db->prepare('SELECT * FROM flashcards WHERE id = :id');
$stmt->execute(['id' => $id]);
```

#### **CORS Headers**
```php
header('Access-Control-Allow-Origin: ' . $_ENV['CORS_ORIGIN']);
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
```

#### **Input Validation**
```php
if (empty($data['front']) || empty($data['back'])) {
    return $this->error('Front and back are required', 400);
}
```

#### **Environment Variables**
```php
// Credentials never hardcoded
$_ENV['DB_PASSWORD']  // Loaded from .env
```

---

## 🐳 Useful Docker Commands

### Container Management

```powershell
# Start containers (build + start)
docker-compose up --build

# Start in background (detached)
docker-compose up -d

docker compose up mysql -d
docker compose up backend -d

# Stop containers
docker-compose down

# Stop and remove volumes (⚠️ deletes database data)
docker-compose down -v

# Rebuild without cache
docker-compose build --no-cache

# View container status
docker-compose ps

# View logs in real-time
docker-compose logs -f

# View backend logs only
docker-compose logs -f backend

# View MySQL logs only
docker-compose logs -f mysql

# Restart backend only
docker-compose restart backend

# View resource usage
docker stats
```

### Access Containers

```powershell
# Enter backend container (bash)
docker exec -it flashcard-backend bash

# Enter MySQL (CLI)
docker exec -it flashcard-mysql mysql -u flashcard_user -pflashcard_secret flashcards_db

# View PHP info
docker exec flashcard-backend php -i

# View PHP version
docker exec flashcard-backend php -v

# View installed extensions
docker exec flashcard-backend php -m
```

### Composer in Container

```powershell
# Install dependencies (generate vendor/)
docker exec flashcard-backend composer install

# Install production only
docker exec flashcard-backend composer install --no-dev

# Add new dependency
docker exec flashcard-backend composer require vendor/package

# Remove dependency
docker exec flashcard-backend composer remove vendor/package

# Update dependencies
docker exec flashcard-backend composer update

# View installed packages
docker exec flashcard-backend composer show

# Validate composer.json
docker exec flashcard-backend composer validate

# Regenerate autoload
docker exec flashcard-backend composer dump-autoload
```

### Migrations and Database

```powershell
# Run migrations
docker exec flashcard-backend php migrate up

# Check migration status
docker exec flashcard-backend php migrate status

# Rollback last batch
docker exec flashcard-backend php migrate down

# Rollback 2 batches
docker exec flashcard-backend php migrate down 2

# Reset all migrations (⚠️ requires --force)
docker exec flashcard-backend php migrate reset --force

# Check MySQL connection
docker exec flashcard-backend php -r "new PDO('mysql:host=mysql;dbname=flashcards_db', 'flashcard_user', 'flashcard_secret'); echo 'OK';"

# Execute SQL query
docker exec flashcard-mysql mysql -u flashcard_user -pflashcard_secret flashcards_db -e "SELECT * FROM flashcards;"

# Database dump
docker exec flashcard-mysql mysqldump -u flashcard_user -pflashcard_secret flashcards_db > backup.sql

# Restore database
docker exec -i flashcard-mysql mysql -u flashcard_user -pflashcard_secret flashcards_db < backup.sql
```

### Tests in Container

```powershell
# Run all tests
docker exec flashcard-backend composer test

# Run with coverage
docker exec flashcard-backend composer test:coverage

# Run linter
docker exec flashcard-backend composer lint

# Run unit tests only
docker exec flashcard-backend ./vendor/bin/phpunit --testsuite Unit

# Run feature tests only
docker exec flashcard-backend ./vendor/bin/phpunit --testsuite Feature
```

---

## 🧪 Testing

### Test Structure

```
tests/
├── Unit/                       # Unit tests
│   └── FlashcardModelTest.php  # Tests Model in isolation
└── Feature/                    # Integration tests
    └── FlashcardApiTest.php    # Tests complete flows
```

### What is being tested?

#### **Unit Tests** (`tests/Unit/FlashcardModelTest.php`)

Test the **Flashcard Model** in isolation:

**CRUD Operations:**
1. ✅ **testCanCreateFlashcard** - Flashcard creation
2. ✅ **testCanFindAllFlashcards** - List all
3. ✅ **testCanFindFlashcardById** - Find by ID
4. ✅ **testReturnsNullForNonExistentId** - Non-existent ID returns null
5. ✅ **testCanUpdateFlashcard** - Flashcard update
6. ✅ **testUpdateReturnsNullForNonExistentId** - Update non-existent ID
7. ✅ **testCanDeleteFlashcard** - Flashcard deletion
8. ✅ **testDeleteReturnsFalseForNonExistentId** - Delete non-existent ID
9. ✅ **testCanCountFlashcards** - Flashcard count

**Study Mode Features:**
10. ✅ **testNewFlashcardHasDefaultDifficulty** - Default difficulty values
11. ✅ **testCanUpdateDifficulty** - Difficulty updates
12. ✅ **testUpdateDifficultyIncrementsStudyCount** - Study count increment
13. ✅ **testCanFindByDifficulty** - Filter by difficulty
14. ✅ **testCanGetStudyStats** - Study statistics
15. ✅ **testFindForStudyPrioritizesHardCards** - Study prioritization

**Coverage:** Complete CRUD + Study Mode + edge cases (16 tests)

#### **Feature Tests** (`tests/Feature/FlashcardApiTest.php`)

Test **complete API flows**:

1. ✅ **testCanCreateAndRetrieveFlashcard** - Create and retrieve
2. ✅ **testCanListMultipleFlashcards** - List multiple (ordering)
3. ✅ **testCanUpdateFlashcardContent** - Update and verify persistence
4. ✅ **testCanDeleteFlashcard** - Delete and verify removal
5. ✅ **testDeleteNonExistentReturnssFalse** - Delete non-existent ID
6. ✅ **testUpdateNonExistentReturnsNull** - Update non-existent ID
7. ✅ **testFlashcardsHaveTimestamps** - Automatic timestamps

**Coverage:** User flows + validations

### Running Tests

```powershell
# All tests
composer test

# With HTML coverage
composer test:coverage

# Unit tests only
./vendor/bin/phpunit --testsuite Unit

# Feature tests only
./vendor/bin/phpunit --testsuite Feature

# Specific test
./vendor/bin/phpunit tests/Unit/FlashcardModelTest.php

# With details (testdox)
./vendor/bin/phpunit --testdox

# In Docker container
docker exec flashcard-backend composer test
```

### Test Configuration

**File:** `phpunit.xml`

```xml
<phpunit>
    <testsuites>
        <testsuite name="Unit">
            <directory>tests/Unit</directory>
        </testsuite>
        <testsuite name="Feature">
            <directory>tests/Feature</directory>
        </testsuite>
    </testsuites>
    
    <php>
        <env name="APP_ENV" value="testing"/>
        <env name="TEST_DB_NAME" value="flashcards_test"/>
    </php>
</phpunit>
```

**Test Database:**
- Uses separate database: `flashcards_test`
- Recreated in each test (setUp/tearDown)
- Does not affect development data

---

## 📦 Vendor Directory

### What is it?

The `vendor/` directory contains all **PHP dependencies** installed by Composer.

**Analogy:** It's like `node_modules/` in Node.js.

### How to Generate

```powershell
# Inside container (recommended)
docker exec flashcard-backend composer install

# Locally (requires PHP 8.1+ and Composer)
composer install
```

### Structure

```
vendor/
├── autoload.php                    # PSR-4 Autoloader
├── composer/                       # Composer metadata
│   ├── autoload_psr4.php          # Namespace mapping
│   ├── autoload_classmap.php      # Class map
│   └── installed.json             # Installed packages
├── phpunit/phpunit/                # Testing framework
├── squizlabs/php_codesniffer/      # PSR-12 Linter
└── sebastian/                      # PHPUnit dependencies
```

### Project Dependencies

**Production (`require`):**
```json
{
  "php": ">=8.1",
  "ext-pdo": "*",           // PDO database abstraction
  "ext-pdo_mysql": "*",     // MySQL driver for PDO
  "ext-json": "*",          // JSON manipulation
  "ext-mbstring": "*"       // Multibyte string support (UTF-8)
}
```

**Development (`require-dev`):**
```json
{
  "phpunit/phpunit": "^10.5",              // Unit testing framework
  "squizlabs/php_codesniffer": "^3.7"      // Code style checker (PSR-12)
}
```

### Why is it in .gitignore?

```gitignore
/vendor/    # ❌ DO NOT COMMIT
```

**Reasons:**
1. **Size:** 20-50 MB (many files)
2. **Regenerable:** `composer install` recreates everything
3. **Lock file:** `composer.lock` ensures identical versions
4. **Collaboration:** Avoids conflicts between operating systems

### PSR-4 Autoload

```json
"autoload": {
  "psr-4": {
    "App\\": "src/"
  },
  "files": [
    "src/Helpers/functions.php"
  ]
}
```

**Mapping:**
- `App\Models\Flashcard` → `src/Models/Flashcard.php`
- `App\Controllers\FlashcardController` → `src/Controllers/FlashcardController.php`
- `App\Database\Database` → `src/Database/Database.php`

**Regenerate autoload:**
```powershell
composer dump-autoload
```

### Useful Commands

```powershell
# Install dependencies (prod + dev)
composer install

# Install production only
composer install --no-dev --optimize-autoloader

# Add new dependency
composer require vendor/package

# Add dev dependency
composer require --dev vendor/package

# Remove dependency
composer remove vendor/package

# Update all
composer update

# View installed packages
composer show

# View outdated packages
composer outdated

# Validate composer.json
composer validate

# Run scripts
composer test          # PHPUnit tests
composer lint          # Code sniffer
composer lint:fix      # Fix code style
composer migrate       # Database migrations
composer serve         # Start local server
```

---

## 🔧 Environment Variables

### `.env` File

Copy `.env.example` to `.env` and configure:

```env
# Application
APP_ENV=development
APP_DEBUG=true

# Database
DB_HOST=mysql
DB_PORT=3306
DB_NAME=flashcards_db
DB_USER=flashcard_user
DB_PASSWORD=flashcard_secret
DB_CHARSET=utf8mb4

# MySQL Root (Docker only)
MYSQL_ROOT_PASSWORD=root_secret
MYSQL_PORT=3306

# Backend
BACKEND_PORT=8000

# CORS
CORS_ORIGIN=http://localhost:5173
CORS_METHODS=GET,POST,PUT,DELETE,OPTIONS
CORS_HEADERS=Content-Type,Authorization
```

### Main Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `APP_ENV` | Environment (development/production/testing) | `development` |
| `APP_DEBUG` | Enable debug mode | `true` |
| `DB_HOST` | MySQL host | `mysql` (Docker) |
| `DB_PORT` | MySQL port | `3306` |
| `DB_NAME` | Database name | `flashcards_db` |
| `DB_USER` | Database user | `flashcard_user` |
| `DB_PASSWORD` | Database password | `flashcard_secret` |
| `DB_CHARSET` | Database charset | `utf8mb4` |
| `MYSQL_ROOT_PASSWORD` | MySQL root password (Docker) | `root_secret` |
| `BACKEND_PORT` | Backend port | `8000` |
| `CORS_ORIGIN` | Allowed CORS origin | `http://localhost:5173` |

---

## 📚 API Endpoints

### Base URL

```
http://localhost:8000/api
```

> 📖 **Complete API Documentation:** See [API_ROUTES.md](./API_ROUTES.md) for detailed endpoint documentation.

### Route Organization

**CRUD Routes** (Flashcard Management):
- `GET /api/flashcards` - List all flashcards
- `GET /api/flashcards/{id}` - Get single flashcard
- `POST /api/flashcards` - Create flashcard
- `PUT /api/flashcards/{id}` - Update flashcard
- `DELETE /api/flashcards/{id}` - Delete flashcard

**Study Mode Routes**:
- `GET /api/study/flashcards` - Get flashcards for study (prioritized)
- `GET /api/study/stats` - Get study statistics
- `PATCH /api/study/flashcards/{id}/difficulty` - Update difficulty after study

**Filter Routes**:
- `GET /api/flashcards/filter/difficulty/{difficulty}` - Filter by difficulty

### Quick Examples

#### **GET /api/flashcards**
List all flashcards (ordered by creation date, most recent first).

> **Note:** For study mode, use `/api/study/flashcards` which returns cards prioritized by difficulty.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "front": "What is PHP?",
      "back": "A programming language",
      "difficulty": "not_studied",
      "study_count": 0,
      "last_studied_at": null,
      "created_at": "2025-10-01 21:00:00",
      "updated_at": "2025-10-01 21:00:00"
    }
  ],
  "count": 1
}
```

#### **GET /api/flashcards/{id}**
Get a flashcard by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "front": "What is PHP?",
    "back": "A programming language",
    "created_at": "2025-10-01 21:00:00",
    "updated_at": "2025-10-01 21:00:00"
  }
}
```

#### **POST /api/flashcards**
Create a new flashcard.

**Request Body:**
```json
{
  "front": "What is PHP?",
  "back": "A programming language"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "front": "What is PHP?",
    "back": "A programming language",
    "created_at": "2025-10-01 21:00:00",
    "updated_at": "2025-10-01 21:00:00"
  }
}
```

#### **PUT /api/flashcards/{id}**
Update an existing flashcard.

**Request Body:**
```json
{
  "front": "What is PHP 8?",
  "back": "A modern programming language"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "front": "What is PHP 8?",
    "back": "A modern programming language",
    "created_at": "2025-10-01 21:00:00",
    "updated_at": "2025-10-01 21:05:00"
  }
}
```

#### **DELETE /api/flashcards/{id}**
Delete a flashcard.

**Response:**
```json
{
  "success": true,
  "message": "Flashcard deleted successfully"
}
```

### Testing the API

**PowerShell:**
```powershell
# GET - List all
Invoke-RestMethod -Uri http://localhost:8000/api/flashcards -Method GET

# POST - Create
$body = @{ front = "Test"; back = "Answer" } | ConvertTo-Json
Invoke-RestMethod -Uri http://localhost:8000/api/flashcards -Method POST -Body $body -ContentType "application/json"

# PUT - Update
$body = @{ front = "Updated"; back = "New answer" } | ConvertTo-Json
Invoke-RestMethod -Uri http://localhost:8000/api/flashcards/1 -Method PUT -Body $body -ContentType "application/json"

# DELETE - Delete
Invoke-RestMethod -Uri http://localhost:8000/api/flashcards/1 -Method DELETE
```

**curl:**
```bash
# GET
curl http://localhost:8000/api/flashcards

# POST
curl -X POST http://localhost:8000/api/flashcards \
  -H "Content-Type: application/json" \
  -d '{"front":"Test","back":"Answer"}'

# PUT
curl -X PUT http://localhost:8000/api/flashcards/1 \
  -H "Content-Type: application/json" \
  -d '{"front":"Updated","back":"New answer"}'

# DELETE
curl -X DELETE http://localhost:8000/api/flashcards/1
```

---

## 🚀 Future Improvements

### Features
- [ ] Authentication (JWT)
- [ ] Search and filters
- [ ] Categories/Tags
- [ ] Pagination
- [ ] Rate limiting
- [ ] Soft deletes

### Infrastructure
- [ ] Redis for caching
- [ ] Nginx instead of Apache
- [ ] CI/CD (GitHub Actions)
- [ ] Monitoring (Prometheus)
- [ ] Structured logging

### Testing
- [ ] Complete HTTP integration tests
- [ ] Load testing (Apache Bench)
- [ ] Mutation testing (Infection)

---

## 📖 Additional Documentation

- **Complete API:** `/docs/api-documentation.md`
- **Architecture:** `/docs/ARCHITECTURE.md`
- **General Setup:** `/docs/SETUP-GUIDE.md`
- **Troubleshooting:** `/docs/ERRORS-EXPLAINED.md`

---

## 📝 Recent Updates (2025-10-02)

### ✅ Fixed Issues
- ✅ **Migration System:** Fixed class name detection for timestamps with time components
- ✅ **MySQL Compatibility:** Replaced `NULLS FIRST` with MySQL-compatible syntax
- ✅ **Test Database:** Added study fields to test schema
- ✅ **Transaction Safety:** Added `inTransaction()` check before rollback
- ✅ **Route Organization:** Reorganized routes into logical groups (CRUD, Study, Filter)
- ✅ **PHPUnit:** All 22 tests passing successfully

### 🗂️ File Cleanup
-        "migrate": "php migrate up",
        "migrate:status": "php migrate status",
        "migrate:rollback": "php migrate down"
**Email:** victor_campelo@outlook.com  
**GitHub:** [kitchtech/flashcard-app](https://github.com/kitchtech/flashcard-app)  
**Last Updated:** 2025-10-02
