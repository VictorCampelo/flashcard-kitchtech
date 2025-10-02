#!/bin/bash
set -e

echo "🚀 Starting backend entrypoint..."

# Ensure we're in the correct directory
cd /var/www/html

# Install/update composer dependencies (only if needed for development with volume bind)
if [ ! -d "vendor" ] || [ ! -f "vendor/autoload.php" ]; then
    echo "📦 Installing composer dependencies..."
    composer install --no-interaction --optimize-autoloader
    echo "✅ Dependencies installed"
fi

# Use wait-for-mysql script
/usr/local/bin/wait-for-mysql.sh "$DB_HOST" "$DB_USER" "$DB_PASSWORD" echo "MySQL ready"

# Create test database if it doesn't exist (using root credentials from env)
echo "📊 Setting up test database..."
if [ -n "$MYSQL_ROOT_PASSWORD" ]; then
    # Create temporary SQL file
    cat > /tmp/create_test_db.sql <<'SQLEOF'
CREATE DATABASE IF NOT EXISTS flashcards_test;
GRANT ALL PRIVILEGES ON flashcards_test.* TO 'flashcard_user'@'%';
FLUSH PRIVILEGES;
SQLEOF
    
    # Execute SQL file
    mysql -h"$DB_HOST" -uroot -p"$MYSQL_ROOT_PASSWORD" --skip-ssl < /tmp/create_test_db.sql && echo "✅ Test database created and permissions granted" || echo "⚠️  Test database setup failed"
    
    # Clean up
    rm -f /tmp/create_test_db.sql
else
    echo "⚠️  MYSQL_ROOT_PASSWORD not set, skipping test database creation"
fi

echo "Running migrations..."

# Run migrations using the migration manager
php /var/www/html/src/Database/migrate.php up

echo "✅ Migrations completed"

# Run seeders (only if SEED_DATABASE is set to true)
if [ "${SEED_DATABASE:-false}" = "true" ]; then
    echo "Running seeders..."
    php /var/www/html/src/Database/seed.php
    echo "✅ Seeders completed"
fi

echo "🚀 Starting Apache"

# Execute the main container command
exec "$@"
