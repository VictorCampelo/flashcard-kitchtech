<?php

declare(strict_types=1);

namespace Tests;

use PHPUnit\Framework\TestCase;
use App\Database\Database;
use PDO;

/**
 * Base Test Case for Database Tests
 * 
 * Manages test database lifecycle:
 * - Creates temporary database once before all tests
 * - Resets tables between individual tests
 * - Destroys database after all tests complete
 */
abstract class DatabaseTestCase extends TestCase
{
    protected static PDO $db;
    private static bool $databaseInitialized = false;
    
    /**
     * Setup test database once before all tests in the class
     */
    public static function setUpBeforeClass(): void
    {
        parent::setUpBeforeClass();
        
        if (!self::$databaseInitialized) {
            self::setupTestEnvironment();
            self::createTables();
            self::$databaseInitialized = true;
        }
    }
    
    /**
     * Clean up test database after all tests complete
     */
    public static function tearDownAfterClass(): void
    {
        if (self::$databaseInitialized) {
            self::cleanupTables();
            Database::disconnect();
            self::$databaseInitialized = false;
        }
        
        parent::tearDownAfterClass();
    }
    
    /**
     * Reset database state before each test
     */
    protected function setUp(): void
    {
        parent::setUp();
        
        self::setupTestEnvironment();
        Database::disconnect();
        self::$db = Database::getConnection();
        
        // Clear all data between tests (truncate is faster than drop/create)
        self::$db->exec('SET FOREIGN_KEY_CHECKS = 0');
        self::$db->exec('TRUNCATE TABLE flashcards');
        self::$db->exec('SET FOREIGN_KEY_CHECKS = 1');
    }
    
    /**
     * Disconnect after each test
     */
    protected function tearDown(): void
    {
        Database::disconnect();
        parent::tearDown();
    }
    
    /**
     * Configure test environment variables
     */
    private static function setupTestEnvironment(): void
    {
        $_ENV['DB_HOST'] = $_ENV['TEST_DB_HOST'] ?? 'mysql';
        $_ENV['DB_PORT'] = $_ENV['TEST_DB_PORT'] ?? '3306';
        $_ENV['DB_NAME'] = $_ENV['TEST_DB_NAME'] ?? 'flashcards_test';
        $_ENV['DB_USER'] = $_ENV['TEST_DB_USER'] ?? 'flashcard_user';
        $_ENV['DB_PASSWORD'] = $_ENV['TEST_DB_PASSWORD'] ?? 'flashcard_secret';
        $_ENV['DB_CHARSET'] = 'utf8mb4';
        $_ENV['APP_ENV'] = 'testing';
    }
    
    /**
     * Create required tables in test database
     */
    private static function createTables(): void
    {
        Database::disconnect();
        $db = Database::getConnection();
        
        // Drop table if exists for clean state
        $db->exec('DROP TABLE IF EXISTS flashcards');
        
        $sql = "
            CREATE TABLE flashcards (
                id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                front VARCHAR(1000) NOT NULL,
                back VARCHAR(1000) NOT NULL,
                difficulty ENUM('not_studied', 'easy', 'medium', 'hard') DEFAULT 'not_studied',
                study_count INT UNSIGNED DEFAULT 0,
                last_studied_at TIMESTAMP NULL DEFAULT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_created_at (created_at),
                INDEX idx_difficulty (difficulty),
                INDEX idx_last_studied (last_studied_at)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ";
        
        $db->exec($sql);
        
        echo "✓ Test tables created\n";
    }
    
    /**
     * Clean up tables after all tests
     */
    private static function cleanupTables(): void
    {
        try {
            $db = Database::getConnection();
            $db->exec('DROP TABLE IF EXISTS flashcards');
            echo "✓ Test tables cleaned up\n";
        } catch (\PDOException $e) {
            // Suppress errors during cleanup
            echo "⚠ Warning: Could not clean up test tables: " . $e->getMessage() . "\n";
        }
    }
}
