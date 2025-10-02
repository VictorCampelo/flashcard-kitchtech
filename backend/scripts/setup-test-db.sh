#!/bin/sh

# Setup Test Database
# This script creates the test database and grants permissions

echo "Creating test database..."

docker-compose exec mysql mysql -u root -proot_secret -e "
CREATE DATABASE IF NOT EXISTS flashcards_test;
GRANT ALL PRIVILEGES ON flashcards_test.* TO 'flashcard_user'@'%';
FLUSH PRIVILEGES;
" 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✓ Test database 'flashcards_test' created successfully"
    echo "✓ Permissions granted to 'flashcard_user'"
else
    echo "✗ Failed to create test database"
    exit 1
fi
