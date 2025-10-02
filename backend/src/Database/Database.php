<?php

declare(strict_types=1);

namespace App\Database;

use PDO;
use PDOException;

/**
 * Database Connection Manager
 * 
 * Provides singleton PDO connection with MySQL
 */
class Database
{
    private static ?PDO $connection = null;
    
    /**
     * Get database connection (singleton pattern)
     */
    public static function getConnection(): PDO
    {
        if (self::$connection === null) {
            self::connect();
        }
        
        return self::$connection;
    }
    
    /**
     * Establish database connection
     */
    private static function connect(): void
    {
        try {
            $dbHost = $_ENV['DB_HOST'] ?? 'localhost';
            $dbPort = $_ENV['DB_PORT'] ?? '3306';
            $dbName = $_ENV['DB_NAME'] ?? 'flashcards_db';
            $dbUser = $_ENV['DB_USER'] ?? 'root';
            $dbPassword = $_ENV['DB_PASSWORD'] ?? '';
            $dbCharset = $_ENV['DB_CHARSET'] ?? 'utf8mb4';
            
            // Create MySQL connection
            $dsn = "mysql:host={$dbHost};port={$dbPort};dbname={$dbName};charset={$dbCharset}";
            self::$connection = new PDO($dsn, $dbUser, $dbPassword, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES {$dbCharset}"
            ]);
            
        } catch (PDOException $e) {
            error_log("Database connection failed: " . $e->getMessage());
            throw new \RuntimeException("Could not connect to database: " . $e->getMessage());
        }
    }
    
    /**
     * Close connection (for testing purposes)
     */
    public static function disconnect(): void
    {
        self::$connection = null;
    }
    
    /**
     * Begin transaction
     */
    public static function beginTransaction(): bool
    {
        return self::getConnection()->beginTransaction();
    }
    
    /**
     * Commit transaction
     */
    public static function commit(): bool
    {
        return self::getConnection()->commit();
    }
    
    /**
     * Rollback transaction
     */
    public static function rollback(): bool
    {
        return self::getConnection()->rollBack();
    }
}
