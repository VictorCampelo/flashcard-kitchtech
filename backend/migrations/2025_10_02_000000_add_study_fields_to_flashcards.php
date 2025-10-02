<?php

use PDO;

/**
 * Add Study Fields to Flashcards Table Migration
 * 
 * Adds difficulty rating, study count, and last studied timestamp
 */
class AddStudyFieldsToFlashcards
{
    /**
     * Run the migration
     */
    public function up(PDO $db): void
    {
        $sql = "
            ALTER TABLE flashcards
            ADD COLUMN difficulty ENUM('not_studied', 'easy', 'medium', 'hard') DEFAULT 'not_studied' AFTER back,
            ADD COLUMN study_count INT UNSIGNED DEFAULT 0 AFTER difficulty,
            ADD COLUMN last_studied_at TIMESTAMP NULL DEFAULT NULL AFTER study_count,
            ADD INDEX idx_difficulty (difficulty),
            ADD INDEX idx_last_studied (last_studied_at);
        ";
        
        $db->exec($sql);
    }
    
    /**
     * Reverse the migration
     */
    public function down(PDO $db): void
    {
        $sql = "
            ALTER TABLE flashcards
            DROP INDEX idx_last_studied,
            DROP INDEX idx_difficulty,
            DROP COLUMN last_studied_at,
            DROP COLUMN study_count,
            DROP COLUMN difficulty;
        ";
        
        $db->exec($sql);
    }
}
