<?php

/**
 * API Routes
 * 
 * Define all API endpoints here
 */

declare(strict_types=1);

use App\Core\Router;
use App\Controllers\FlashcardController;

return function (Router $router) {
    // Flashcard RESTful resource (creates all 5 CRUD routes automatically)
    $router->resource('/api/flashcards', FlashcardController::class);
};
