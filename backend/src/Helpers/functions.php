<?php

/**
 * Helper Functions
 * 
 * Global utility functions
 */

declare(strict_types=1);

use App\Config\Environment;

if (!function_exists('env')) {
    /**
     * Get environment variable with default value
     */
    function env(string $key, mixed $default = null): mixed
    {
        return Environment::get($key, $default);
    }
}

if (!function_exists('json_response')) {
    /**
     * Send JSON response with proper headers
     */
    function json_response(array $data, int $statusCode = 200): void
    {
        http_response_code($statusCode);
        header('Content-Type: application/json; charset=UTF-8');
        echo json_encode($data);
        exit;
    }
}

if (!function_exists('dd')) {
    /**
     * Dump and die (for debugging)
     */
    function dd(mixed ...$vars): void
    {
        foreach ($vars as $var) {
            var_dump($var);
        }
        exit(1);
    }
}
