<?php

declare(strict_types=1);

namespace App\Config;

/**
 * Environment Configuration Loader
 * 
 * Loads and manages environment variables
 */
class Environment
{
    private static bool $loaded = false;
    
    /**
     * Load environment variables from .env file
     */
    public static function load(string $path = null): void
    {
        if (self::$loaded) {
            return;
        }
        
        $envFile = $path ?? __DIR__ . '/../../.env';
        
        if (!file_exists($envFile)) {
            return;
        }
        
        $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        
        foreach ($lines as $line) {
            // Skip comments
            if (strpos(trim($line), '#') === 0) {
                continue;
            }
            
            // Parse key=value
            if (strpos($line, '=') !== false) {
                [$key, $value] = explode('=', $line, 2);
                $key = trim($key);
                $value = trim($value);
                
                // Remove quotes if present
                $value = trim($value, '"\'');
                
                // Set environment variable
                $_ENV[$key] = $value;
                putenv("{$key}={$value}");
            }
        }
        
        self::$loaded = true;
    }
    
    /**
     * Get environment variable with default value
     */
    public static function get(string $key, mixed $default = null): mixed
    {
        return $_ENV[$key] ?? getenv($key) ?: $default;
    }
    
    /**
     * Get environment variable as boolean
     */
    public static function getBool(string $key, bool $default = false): bool
    {
        $value = self::get($key);
        
        if ($value === null) {
            return $default;
        }
        
        return filter_var($value, FILTER_VALIDATE_BOOLEAN);
    }
    
    /**
     * Get environment variable as integer
     */
    public static function getInt(string $key, int $default = 0): int
    {
        $value = self::get($key);
        
        if ($value === null) {
            return $default;
        }
        
        return (int) $value;
    }
    
    /**
     * Check if running in debug mode
     */
    public static function isDebug(): bool
    {
        return self::getBool('APP_DEBUG', false);
    }
    
    /**
     * Check if running in production
     */
    public static function isProduction(): bool
    {
        return self::get('APP_ENV', 'production') === 'production';
    }
}
