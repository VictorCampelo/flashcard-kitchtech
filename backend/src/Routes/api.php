<?php

/**
 * API Routes
 * 
 * Main API router - imports all resource routes
 */

declare(strict_types=1);

use App\Core\Router;
use App\Controllers\HealthController;

return function (Router $router) {
    // ============================================
    // HEALTH CHECK
    // ============================================
    $router->get('/api/health', 'App\Controllers\HealthController@check');
    
    // ============================================
    // RESOURCE ROUTES
    // ============================================
    
    // Flashcard routes
    $flashcardRoutes = require __DIR__ . '/flashcardRoutes.php';
    $flashcardRoutes($router);
    
    // Future: Add more resource routes here
    // $userRoutes = require __DIR__ . '/user.routes.php';
    // $userRoutes($router);
};
