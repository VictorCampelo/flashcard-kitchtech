<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Flashcard;
use App\Repositories\FlashcardRepository;

/**
 * Flashcard Service
 * 
 * Business logic layer for flashcard operations
 * Coordinates between controllers and repositories
 * Works with Flashcard domain entities
 */
class FlashcardService
{
    private FlashcardRepository $repository;
    
    private const VALID_DIFFICULTIES = ['not_studied', 'easy', 'medium', 'hard'];
    
    public function __construct(FlashcardRepository $repository)
    {
        $this->repository = $repository;
    }
    
    /**
     * Get all flashcards with optional filtering
     */
    public function getAllFlashcards(?string $filter = null, ?string $difficulty = null): array
    {
        if ($filter === 'study') {
            return $this->repository->findForStudy();
        }
        
        if ($difficulty) {
            $this->validateDifficulty($difficulty);
            return $this->repository->findByDifficulty($difficulty);
        }
        
        return $this->repository->findAll();
    }
    
    /**
     * Get flashcard by ID
     */
    public function getFlashcardById(int $id): ?Flashcard
    {
        return $this->repository->findById($id);
    }
    
    /**
     * Get flashcards prioritized for study
     */
    public function getFlashcardsForStudy(): array
    {
        return $this->repository->findForStudy();
    }
    
    /**
     * Get flashcards by difficulty level
     */
    public function getFlashcardsByDifficulty(string $difficulty): array
    {
        $this->validateDifficulty($difficulty);
        return $this->repository->findByDifficulty($difficulty);
    }
    
    /**
     * Create new flashcard
     */
    public function createFlashcard(array $data): Flashcard
    {
        $errors = $this->validateFlashcardData($data);
        
        if (!empty($errors)) {
            throw new \InvalidArgumentException(json_encode($errors));
        }
        
        $flashcard = $this->repository->create($data);
        
        if (!$flashcard) {
            throw new \RuntimeException('Failed to create flashcard');
        }
        
        return $flashcard;
    }
    
    /**
     * Update flashcard
     */
    public function updateFlashcard(int $id, array $data): Flashcard
    {
        if (!$this->repository->exists($id)) {
            throw new \RuntimeException('Flashcard not found');
        }
        
        $errors = $this->validateFlashcardData($data);
        
        if (!empty($errors)) {
            throw new \InvalidArgumentException(json_encode($errors));
        }
        
        $flashcard = $this->repository->update($id, $data);
        
        if (!$flashcard) {
            throw new \RuntimeException('Failed to update flashcard');
        }
        
        return $flashcard;
    }
    
    /**
     * Update flashcard difficulty after study
     */
    public function updateDifficulty(int $id, string $difficulty): Flashcard
    {
        if (!$this->repository->exists($id)) {
            throw new \RuntimeException('Flashcard not found');
        }
        
        $this->validateDifficulty($difficulty);
        
        $flashcard = $this->repository->updateDifficulty($id, $difficulty);
        
        if (!$flashcard) {
            throw new \RuntimeException('Failed to update difficulty');
        }
        
        return $flashcard;
    }
    
    /**
     * Delete flashcard
     */
    public function deleteFlashcard(int $id): bool
    {
        if (!$this->repository->exists($id)) {
            throw new \RuntimeException('Flashcard not found');
        }
        
        return $this->repository->delete($id);
    }
    
    /**
     * Get study statistics
     */
    public function getStudyStats(): array
    {
        return $this->repository->getStats();
    }
    
    /**
     * Validate flashcard data
     */
    private function validateFlashcardData(array $data): array
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
    
    /**
     * Validate difficulty level
     */
    private function validateDifficulty(string $difficulty): void
    {
        if (!in_array($difficulty, self::VALID_DIFFICULTIES)) {
            throw new \InvalidArgumentException(
                'Difficulty must be one of: ' . implode(', ', self::VALID_DIFFICULTIES)
            );
        }
    }
    
    /**
     * Get valid difficulty levels
     */
    public static function getValidDifficulties(): array
    {
        return self::VALID_DIFFICULTIES;
    }
}
