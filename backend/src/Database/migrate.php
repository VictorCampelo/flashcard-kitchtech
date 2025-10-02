#!/usr/bin/env php
<?php

/**
 * Migration CLI Tool
 * 
 * Usage:
 *   php migrate up              - Run pending migrations
 *   php migrate down [steps]    - Rollback migrations (default: 1 step)
 *   php migrate reset           - Rollback all migrations
 *   php migrate status          - Show migration status
 */

declare(strict_types=1);

require_once __DIR__ . '/../../vendor/autoload.php';

use App\Config\Environment;
use App\Database\Database;
use App\Database\MigrationManager;

// Load environment variables
Environment::load();

$command = $argv[1] ?? 'status';
$arg = $argv[2] ?? null;

try {
    $db = Database::getConnection();
    $migrationsPath = __DIR__ . '/../../migrations';
    $manager = new MigrationManager($db, $migrationsPath);
    
    echo "🔧 Migration Manager\n";
    echo str_repeat('=', 50) . "\n\n";
    
    switch ($command) {
        case 'up':
        case 'migrate':
            echo "Running migrations...\n\n";
            $executed = $manager->migrate();
            
            if (empty($executed)) {
                echo "✓ No pending migrations\n";
            } else {
                foreach ($executed as $migration) {
                    echo "✓ Executed: {$migration}\n";
                }
                echo "\n✅ Migrated " . count($executed) . " migration(s)\n";
            }
            break;
            
        case 'down':
        case 'rollback':
            $steps = $arg ? (int) $arg : 1;
            echo "Rolling back {$steps} batch(es)...\n\n";
            
            $rolledBack = $manager->rollback($steps);
            
            if (empty($rolledBack)) {
                echo "✓ No migrations to rollback\n";
            } else {
                foreach ($rolledBack as $migration) {
                    echo "✓ Rolled back: {$migration}\n";
                }
                echo "\n✅ Rolled back " . count($rolledBack) . " migration(s)\n";
            }
            break;
            
        case 'reset':
            echo "Resetting all migrations...\n\n";
            
            if (!isset($argv[2]) || $argv[2] !== '--force') {
                echo "⚠️  This will rollback ALL migrations!\n";
                echo "Use 'php migrate reset --force' to confirm\n";
                exit(1);
            }
            
            $rolledBack = $manager->reset();
            
            if (empty($rolledBack)) {
                echo "✓ No migrations to reset\n";
            } else {
                foreach ($rolledBack as $migration) {
                    echo "✓ Rolled back: {$migration}\n";
                }
                echo "\n✅ Reset " . count($rolledBack) . " migration(s)\n";
            }
            break;
            
        case 'status':
            $status = $manager->status();
            
            if (empty($status)) {
                echo "No migrations found\n";
            } else {
                echo "Migration Status:\n\n";
                
                $maxLength = max(array_map(fn($s) => strlen($s['migration']), $status));
                
                foreach ($status as $item) {
                    $name = str_pad($item['migration'], $maxLength);
                    $statusIcon = $item['status'] === 'executed' ? '✓' : '○';
                    $batch = $item['batch'] ? " (batch {$item['batch']})" : '';
                    
                    echo "{$statusIcon} {$name}  {$item['status']}{$batch}\n";
                }
                
                $executed = count(array_filter($status, fn($s) => $s['status'] === 'executed'));
                $pending = count($status) - $executed;
                
                echo "\n";
                echo "Total: " . count($status) . " migrations\n";
                echo "Executed: {$executed}\n";
                echo "Pending: {$pending}\n";
            }
            break;
            
        default:
            echo "Unknown command: {$command}\n\n";
            echo "Available commands:\n";
            echo "  up, migrate         Run pending migrations\n";
            echo "  down, rollback [n]  Rollback n batches (default: 1)\n";
            echo "  reset --force       Rollback all migrations\n";
            echo "  status              Show migration status\n";
            exit(1);
    }
    
    echo "\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    exit(1);
}
