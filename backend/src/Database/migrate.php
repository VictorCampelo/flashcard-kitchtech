<?php

/**
 * Database Migration Script
 * 
 * Creates the flashcards table if it doesn't exist
 */

declare(strict_types=1);

require_once __DIR__ . '/../../vendor/autoload.php';

use App\Config\Environment;
use App\Database\Database;

// Load environment variables
Environment::load();

try {
    $db = Database::getConnection();
    
    echo "Running migrations...\n";
    
    // Create flashcards table (MySQL syntax)
    $sql = "
        CREATE TABLE IF NOT EXISTS flashcards (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            front VARCHAR(1000) NOT NULL,
            back VARCHAR(1000) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_created_at (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ";
    
    $db->exec($sql);
    echo "✓ Created flashcards table\n";
    
    echo "\n✅ Migration completed successfully!\n";
    
} catch (Exception $e) {
    echo "❌ Migration failed: " . $e->getMessage() . "\n";
    exit(1);
}
