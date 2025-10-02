<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Services\FlashcardService;
use App\Repositories\FlashcardRepository;
use App\Database\Database;

/**
 * Flashcard Controller
 * 
 * Handles HTTP requests for flashcard CRUD and study mode operations
 * Delegates business logic to FlashcardService
 */
class FlashcardController extends BaseController
{
    private FlashcardService $service;

    public function __construct()
    {
        $db = Database::getConnection();
        $repository = new FlashcardRepository($db);
        $this->service = new FlashcardService($repository);
    }

    // ============================================
    // CRUD OPERATIONS
    // ============================================

    /**
     * GET /api/flashcards - List all flashcards
     * Supports query parameters:
     * - ?filter=study - Get flashcards prioritized for study
     * - ?difficulty=easy|medium|hard|not_studied - Filter by difficulty
     */
    public function index(): void
    {
        try {
            $filter = $_GET['filter'] ?? null;
            $difficulty = $_GET['difficulty'] ?? null;
            
            $flashcards = $this->service->getAllFlashcards($filter, $difficulty);
            
            // Convert Flashcard objects to arrays for JSON
            $data = array_map(fn($f) => $f->toArray(), $flashcards);
            
            $this->sendSuccess([
                'data' => $data,
                'count' => count($data)
            ]);
        } catch (\InvalidArgumentException $e) {
            $this->sendError($e->getMessage(), 400);
        } catch (\Exception $e) {
            $this->sendError('Failed to fetch flashcards', 500, $e);
        }
    }

    /**
     * GET /api/flashcards/{id} - Get single flashcard
     */
    public function show(string $id): void
    {
        try {
            $flashcardId = $this->validateId($id);
            $flashcard = $this->service->getFlashcardById($flashcardId);
            
            if (!$flashcard) {
                $this->sendError('Flashcard not found', 404);
                return;
            }
            
            $this->sendSuccess($flashcard->toArray());
        } catch (\Exception $e) {
            $this->sendError('Failed to fetch flashcard', 500, $e);
        }
    }

    /**
     * POST /api/flashcards - Create new flashcard
     */
    public function store(): void
    {
        try {
            $data = $this->getRequestBody();
            $flashcard = $this->service->createFlashcard($data);
            
            $this->sendSuccess($flashcard->toArray(), 201, 'Flashcard created successfully');
        } catch (\InvalidArgumentException $e) {
            $errors = json_decode($e->getMessage(), true);
            $this->sendValidationError($errors);
        } catch (\Exception $e) {
            $this->sendError('Failed to create flashcard', 500, $e);
        }
    }

    /**
     * PUT /api/flashcards/{id} - Update flashcard
     */
    public function update(string $id): void
    {
        try {
            $flashcardId = $this->validateId($id);
            $data = $this->getRequestBody();
            $flashcard = $this->service->updateFlashcard($flashcardId, $data);
            
            $this->sendSuccess($flashcard->toArray(), 200, 'Flashcard updated successfully');
        } catch (\InvalidArgumentException $e) {
            $errors = json_decode($e->getMessage(), true);
            $this->sendValidationError($errors);
        } catch (\RuntimeException $e) {
            $this->sendError($e->getMessage(), 404);
        } catch (\Exception $e) {
            $this->sendError('Failed to update flashcard', 500, $e);
        }
    }
    
    /**
     * DELETE /api/flashcards/{id} - Delete flashcard
     */
    public function destroy(string $id): void
    {
        try {
            $flashcardId = $this->validateId($id);
            $this->service->deleteFlashcard($flashcardId);
            
            $this->sendSuccess(null, 200, 'Flashcard deleted successfully');
        } catch (\RuntimeException $e) {
            $this->sendError($e->getMessage(), 404);
        } catch (\Exception $e) {
            $this->sendError('Failed to delete flashcard', 500, $e);
        }
    }
    
    // ============================================
    // STUDY OPERATIONS
    // ============================================

    /**
     * PATCH /api/flashcards/{id}/difficulty - Update flashcard difficulty after study
     */
    public function updateDifficulty(string $id): void
    {
        try {
            $flashcardId = $this->validateId($id);
            $data = $this->getRequestBody();
            
            if (!isset($data['difficulty'])) {
                $this->sendValidationError(['difficulty' => 'Difficulty is required']);
                return;
            }
            
            $flashcard = $this->service->updateDifficulty($flashcardId, $data['difficulty']);
            
            $this->sendSuccess($flashcard->toArray(), 200, 'Difficulty updated successfully');
        } catch (\InvalidArgumentException $e) {
            $this->sendValidationError(['difficulty' => $e->getMessage()]);
        } catch (\RuntimeException $e) {
            $this->sendError($e->getMessage(), 404);
        } catch (\Exception $e) {
            $this->sendError('Failed to update difficulty', 500, $e);
        }
    }

    /**
     * GET /api/flashcards/stats - Get study statistics
     */
    public function stats(): void
    {
        try {
            $stats = $this->service->getStudyStats();
            $this->sendSuccess($stats);
        } catch (\Exception $e) {
            $this->sendError('Failed to fetch statistics', 500, $e);
        }
    }
}
