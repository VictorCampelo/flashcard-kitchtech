#!/usr/bin/env php
<?php

/**
 * Seeder CLI Tool
 * 
 * Usage:
 *   php seed.php              - Run all seeders
 *   php seed.php --fresh      - Drop all data and reseed
 */

declare(strict_types=1);

require_once __DIR__ . '/../../vendor/autoload.php';

use App\Config\Environment;
use App\Database\Database;
use App\Database\SeederManager;

// Load environment variables
Environment::load();

$fresh = in_array('--fresh', $argv);

try {
    $db = Database::getConnection();
    $seedersPath = __DIR__ . '/../../seeders';
    $manager = new SeederManager($db, $seedersPath);
    
    echo "🌱 Database Seeder\n";
    echo str_repeat('=', 50) . "\n\n";
    
    if ($fresh) {
        echo "⚠️  Fresh seeding - truncating tables...\n\n";
        
        // Disable foreign key checks
        $db->exec('SET FOREIGN_KEY_CHECKS = 0');
        
        // Truncate tables
        $db->exec('TRUNCATE TABLE flashcards');
        
        // Re-enable foreign key checks
        $db->exec('SET FOREIGN_KEY_CHECKS = 1');
        
        echo "✓ Tables truncated\n\n";
    }
    
    echo "Running seeders...\n\n";
    $executed = $manager->seed();
    
    if (empty($executed)) {
        echo "✓ No seeders found\n";
    } else {
        echo "\n✅ Seeded " . count($executed) . " file(s)\n";
    }
    
    echo "\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    exit(1);
}
