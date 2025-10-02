<?php

/**
 * Flashcard Routes
 * 
 * All routes related to flashcard resource
 */

declare(strict_types=1);

use App\Core\Router;
use App\Controllers\FlashcardController;

return function (Router $router) {
    // ============================================
    // FLASHCARD COLLECTION ROUTES
    // ============================================
    $router->get('/api/flashcards', FlashcardController::class . '@index');           // GET /api/flashcards - List all
    $router->post('/api/flashcards', FlashcardController::class . '@store');          // POST /api/flashcards - Create new
    
    // ============================================
    // STUDY STATISTICS (Collection-level)
    // ============================================
    $router->get('/api/flashcards/stats', FlashcardController::class . '@stats');     // GET /api/flashcards/stats - Study statistics
    
    // ============================================
    // FLASHCARD RESOURCE ROUTES (specific flashcard)
    // ============================================
    $router->get('/api/flashcards/{id}', FlashcardController::class . '@show');       // GET /api/flashcards/{id} - Get one
    $router->put('/api/flashcards/{id}', FlashcardController::class . '@update');     // PUT /api/flashcards/{id} - Update
    $router->delete('/api/flashcards/{id}', FlashcardController::class . '@destroy'); // DELETE /api/flashcards/{id} - Delete
    
    // ============================================
    // STUDY SUB-RESOURCE (actions on specific flashcard)
    // ============================================
    $router->patch('/api/flashcards/{id}/difficulty', FlashcardController::class . '@updateDifficulty'); // PATCH /api/flashcards/{id}/difficulty - Update difficulty
};
