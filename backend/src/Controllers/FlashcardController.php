<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Models\Flashcard;

/**
 * Flashcard Controller
 * 
 * Handles HTTP requests for flashcard endpoints
 */
class FlashcardController extends BaseController
{
    private Flashcard $model;
    
    public function __construct()
    {
        $this->model = new Flashcard();
    }
    
    /**
     * GET /api/flashcards - List all flashcards
     */
    public function index(): void
    {
        try {
            $flashcards = $this->model->findAll();
            $this->sendSuccess([
                'data' => $flashcards,
                'count' => count($flashcards)
            ]);
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
            $flashcard = $this->model->findById($flashcardId);
            
            if (!$flashcard) {
                $this->sendError('Flashcard not found', 404);
            }
            
            $this->sendSuccess($flashcard);
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
            $errors = $this->validateFlashcard($data);
            
            if (!empty($errors)) {
                $this->sendValidationError($errors);
            }
            
            $flashcard = $this->model->create($data);
            $this->sendSuccess($flashcard, 201, 'Flashcard created successfully');
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
            $errors = $this->validateFlashcard($data);
            
            if (!empty($errors)) {
                $this->sendValidationError($errors);
            }
            
            $flashcard = $this->model->update($flashcardId, $data);
            
            if (!$flashcard) {
                $this->sendError('Flashcard not found', 404);
            }
            
            $this->sendSuccess($flashcard, 200, 'Flashcard updated successfully');
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
            $deleted = $this->model->delete($flashcardId);
            
            if (!$deleted) {
                $this->sendError('Flashcard not found', 404);
            }
            
            $this->sendSuccess(null, 200, 'Flashcard deleted successfully');
        } catch (\Exception $e) {
            $this->sendError('Failed to delete flashcard', 500, $e);
        }
    }
    
    /**
     * Validate flashcard data
     */
    private function validateFlashcard(array $data): array
    {
        $errors = [];
        
        if (!isset($data['front']) || trim($data['front']) === '') {
            $errors['front'] = 'Front side is required';
        } elseif (strlen($data['front']) > 1000) {
            $errors['front'] = 'Front side must not exceed 1000 characters';
        }
        
        if (!isset($data['back']) || trim($data['back']) === '') {
            $errors['back'] = 'Back side is required';
        } elseif (strlen($data['back']) > 1000) {
            $errors['back'] = 'Back side must not exceed 1000 characters';
        }
        
        return $errors;
    }
}
