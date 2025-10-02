<?php

declare(strict_types=1);

namespace App\Database;

use PDO;

/**
 * Seeder Manager
 * 
 * Manages database seeding operations
 */
class SeederManager
{
    private PDO $db;
    private string $seedersPath;
    
    public function __construct(PDO $db, string $seedersPath)
    {
        $this->db = $db;
        $this->seedersPath = $seedersPath;
    }
    
    /**
     * Run all seeders
     */
    public function seed(): array
    {
        $seederFiles = $this->getSeederFiles();
        $executed = [];
        
        foreach ($seederFiles as $file) {
            $seederClass = $this->loadSeeder($file);
            
            if ($seederClass) {
                echo "🌱 Seeding: {$file}\n";
                $seederClass->run($this->db);
                $executed[] = $file;
            }
        }
        
        return $executed;
    }
    
    /**
     * Get all seeder files sorted by name
     */
    private function getSeederFiles(): array
    {
        if (!is_dir($this->seedersPath)) {
            return [];
        }
        
        $files = scandir($this->seedersPath);
        $seederFiles = [];
        
        foreach ($files as $file) {
            if (preg_match('/\.php$/', $file)) {
                $seederFiles[] = $file;
            }
        }
        
        sort($seederFiles);
        return $seederFiles;
    }
    
    /**
     * Load seeder class from file
     */
    private function loadSeeder(string $file): ?object
    {
        $filePath = $this->seedersPath . '/' . $file;
        
        if (!file_exists($filePath)) {
            return null;
        }
        
        $seeder = require $filePath;
        
        if (!is_object($seeder) || !method_exists($seeder, 'run')) {
            throw new \Exception("Seeder {$file} must return an object with a run() method");
        }
        
        return $seeder;
    }
}
