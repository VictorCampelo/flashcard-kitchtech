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
