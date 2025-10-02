<?php

declare(strict_types=1);

namespace App\Database;

use PDO;
use Exception;

/**
 * Migration Manager
 * 
 * Handles database migrations with history tracking and rollback support
 */
class MigrationManager
{
    private PDO $db;
    private string $migrationsPath;
    
    public function __construct(PDO $db, string $migrationsPath)
    {
        $this->db = $db;
        $this->migrationsPath = $migrationsPath;
        $this->ensureMigrationsTable();
    }
    
    /**
     * Create migrations tracking table
     */
    private function ensureMigrationsTable(): void
    {
        $sql = "
            CREATE TABLE IF NOT EXISTS migrations (
                id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                migration VARCHAR(255) NOT NULL UNIQUE,
                batch INT NOT NULL,
                executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_batch (batch)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ";
        
        $this->db->exec($sql);
    }
    
    /**
     * Run pending migrations
     */
    public function migrate(): array
    {
        $executed = [];
        $migrations = $this->getPendingMigrations();
        
        if (empty($migrations)) {
            return $executed;
        }
        
        $batch = $this->getNextBatchNumber();
        
        foreach ($migrations as $migration) {
            try {
                // Note: DDL statements (CREATE, ALTER, DROP) cause implicit commits in MySQL
                // so we don't wrap them in transactions
                $instance = $this->loadMigration($migration);
                $instance->up($this->db);
                
                $this->recordMigration($migration, $batch);
                $executed[] = $migration;
                
            } catch (Exception $e) {
                throw new Exception("Migration failed: {$migration} - " . $e->getMessage());
            }
        }
        
        return $executed;
    }
    
    /**
     * Rollback last batch of migrations
     */
    public function rollback(int $steps = 1): array
    {
        $rolledBack = [];
        
        for ($i = 0; $i < $steps; $i++) {
            $migrations = $this->getLastBatchMigrations();
            
            if (empty($migrations)) {
                break;
            }
            
            foreach (array_reverse($migrations) as $migration) {
                try {
                    // Note: DDL statements cause implicit commits, no transaction needed
                    $instance = $this->loadMigration($migration['migration']);
                    $instance->down($this->db);
                    
                    $this->removeMigration($migration['migration']);
                    $rolledBack[] = $migration['migration'];
                    
                } catch (Exception $e) {
                    throw new Exception("Rollback failed: {$migration['migration']} - " . $e->getMessage());
                }
            }
        }
        
        return $rolledBack;
    }
    
    /**
     * Reset all migrations
     */
    public function reset(): array
    {
        $allMigrations = $this->getExecutedMigrations();
        $rolledBack = [];
        
        foreach (array_reverse($allMigrations) as $migration) {
            try {
                // Note: DDL statements cause implicit commits, no transaction needed
                $instance = $this->loadMigration($migration['migration']);
                $instance->down($this->db);
                
                $this->removeMigration($migration['migration']);
                $rolledBack[] = $migration['migration'];
                
            } catch (Exception $e) {
                throw new Exception("Reset failed: {$migration['migration']} - " . $e->getMessage());
            }
        }
        
        return $rolledBack;
    }
    
    /**
     * Get migration status
     */
    public function status(): array
    {
        $allFiles = $this->getAllMigrationFiles();
        $executed = $this->getExecutedMigrations();
        $executedNames = array_column($executed, 'migration');
        
        $status = [];
        
        foreach ($allFiles as $file) {
            $name = pathinfo($file, PATHINFO_FILENAME);
            $isExecuted = in_array($name, $executedNames);
            
            $status[] = [
                'migration' => $name,
                'status' => $isExecuted ? 'executed' : 'pending',
                'batch' => $isExecuted ? $this->getBatchNumber($name) : null,
            ];
        }
        
        return $status;
    }
    
    /**
     * Get pending migrations
     */
    private function getPendingMigrations(): array
    {
        $allFiles = $this->getAllMigrationFiles();
        $executed = $this->getExecutedMigrations();
        $executedNames = array_column($executed, 'migration');
        
        $pending = [];
        
        foreach ($allFiles as $file) {
            $name = pathinfo($file, PATHINFO_FILENAME);
            if (!in_array($name, $executedNames)) {
                $pending[] = $name;
            }
        }
        
        sort($pending);
        return $pending;
    }
    
    /**
     * Get all migration files
     */
    private function getAllMigrationFiles(): array
    {
        if (!is_dir($this->migrationsPath)) {
            return [];
        }
        
        $files = glob($this->migrationsPath . '/*.php');
        sort($files);
        
        return $files;
    }
    
    /**
     * Get executed migrations
     */
    private function getExecutedMigrations(): array
    {
        $stmt = $this->db->query("
            SELECT migration, batch, executed_at 
            FROM migrations 
            ORDER BY id ASC
        ");
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    /**
     * Get last batch migrations
     */
    private function getLastBatchMigrations(): array
    {
        $stmt = $this->db->query("
            SELECT migration, batch 
            FROM migrations 
            WHERE batch = (SELECT MAX(batch) FROM migrations)
            ORDER BY id DESC
        ");
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    /**
     * Get next batch number
     */
    private function getNextBatchNumber(): int
    {
        $stmt = $this->db->query("SELECT MAX(batch) as max_batch FROM migrations");
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        return ($result['max_batch'] ?? 0) + 1;
    }
    
    /**
     * Get batch number for migration
     */
    private function getBatchNumber(string $migration): ?int
    {
        $stmt = $this->db->prepare("SELECT batch FROM migrations WHERE migration = :migration");
        $stmt->execute(['migration' => $migration]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        return $result ? (int) $result['batch'] : null;
    }
    
    /**
     * Load migration instance
     */
    private function loadMigration(string $name): object
    {
        $file = $this->migrationsPath . '/' . $name . '.php';
        
        if (!file_exists($file)) {
            throw new Exception("Migration file not found: {$file}");
        }
        
        require_once $file;
        
        // Convert filename to class name (e.g., 2024_01_01_create_flashcards_table -> CreateFlashcardsTable)
        $className = $this->getClassName($name);
        
        if (!class_exists($className)) {
            throw new Exception("Migration class not found: {$className}");
        }
        
        return new $className();
    }
    
    /**
     * Convert migration filename to class name
     */
    private function getClassName(string $filename): string
    {
        // Remove timestamp prefix (e.g., 2024_01_01_ or 2024_01_01_000000_)
        $parts = explode('_', $filename);
        
        // Find where the actual name starts (after date/time parts)
        $nameStart = 0;
        for ($i = 0; $i < count($parts); $i++) {
            if (is_numeric($parts[$i]) && strlen($parts[$i]) === 4) {
                // Found year, skip year, month, day
                $nameStart = $i + 3;
                
                // Check if there's a time component (6-digit number like 000000)
                if (isset($parts[$nameStart]) && is_numeric($parts[$nameStart]) && strlen($parts[$nameStart]) === 6) {
                    $nameStart++; // Skip the time component too
                }
                break;
            }
        }
        
        $nameParts = array_slice($parts, $nameStart);
        
        // Convert to PascalCase
        $className = implode('', array_map('ucfirst', $nameParts));
        
        return $className;
    }
    
    /**
     * Record migration execution
     */
    private function recordMigration(string $migration, int $batch): void
    {
        $stmt = $this->db->prepare("
            INSERT INTO migrations (migration, batch) 
            VALUES (:migration, :batch)
        ");
        
        $stmt->execute([
            'migration' => $migration,
            'batch' => $batch,
        ]);
    }
    
    /**
     * Remove migration record
     */
    private function removeMigration(string $migration): void
    {
        $stmt = $this->db->prepare("DELETE FROM migrations WHERE migration = :migration");
        $stmt->execute(['migration' => $migration]);
    }
}
