<?php

use PDO;

/**
 * Create Flashcards Table Migration
 */
class CreateFlashcardsTable
{
    /**
     * Run the migration
     */
    public function up(PDO $db): void
    {
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
    }
    
    /**
     * Reverse the migration
     */
    public function down(PDO $db): void
    {
        $db->exec("DROP TABLE IF EXISTS flashcards");
    }
}
