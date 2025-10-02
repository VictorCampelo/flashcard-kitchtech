<?php

/**
 * Entry Point - Flashcard API
 * 
 * This is the main entry point for all API requests.
 * Handles CORS, routing, and error handling.
 */

declare(strict_types=1);

// Autoload dependencies
require_once __DIR__ . '/../vendor/autoload.php';

use App\Config\Environment;
use App\Core\Router;

// Load environment variables
Environment::load();

// Set error handling based on environment
if (Environment::isDebug()) {
    error_reporting(E_ALL);
    ini_set('display_errors', '1');
} else {
    error_reporting(0);
    ini_set('display_errors', '0');
}

// Set content type
header('Content-Type: application/json; charset=UTF-8');

// Handle CORS
$allowedOrigins = explode(',', Environment::get('CORS_ORIGIN', 'http://localhost:5173'));
$requestOrigin = $_SERVER['HTTP_ORIGIN'] ?? '';
$corsOrigin = in_array($requestOrigin, $allowedOrigins) ? $requestOrigin : $allowedOrigins[0];

header("Access-Control-Allow-Origin: {$corsOrigin}");
header("Access-Control-Allow-Methods: " . 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
header("Access-Control-Allow-Headers: " . 'Content-Type,Authorization');
header("Access-Control-Max-Age: 3600");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    // Initialize router and load routes
    $router = new Router();
    $loadRoutes = require __DIR__ . '/../src/Routes/api.php';
    $loadRoutes($router);
    
    // Dispatch route
    $router->dispatch();
    
} catch (\Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Internal Server Error',
        'message' => Environment::isDebug() ? $e->getMessage() : 'Something went wrong'
    ]);
}
