<?php

declare(strict_types=1);

namespace App\Models;

/**
 * Flashcard Domain Entity
 * 
 * Represents a flashcard in the domain model.
 * Immutable value object with typed properties.
 */
class Flashcard
{
    public function __construct(
        public readonly int $id,
        public readonly string $front,
        public readonly string $back,
        public readonly string $difficulty,
        public readonly int $study_count,
        public readonly ?string $last_studied_at,
        public readonly string $created_at,
        public readonly string $updated_at
    ) {}
    
    /**
     * Create Flashcard from database array
     */
    public static function fromArray(array $data): self
    {
        return new self(
            id: (int) $data['id'],
            front: $data['front'],
            back: $data['back'],
            difficulty: $data['difficulty'] ?? 'not_studied',
            study_count: (int) ($data['study_count'] ?? 0),
            last_studied_at: $data['last_studied_at'] ?? null,
            created_at: $data['created_at'],
            updated_at: $data['updated_at']
        );
    }
    
    /**
     * Convert Flashcard to array (for JSON serialization)
     */
    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'front' => $this->front,
            'back' => $this->back,
            'difficulty' => $this->difficulty,
            'study_count' => $this->study_count,
            'last_studied_at' => $this->last_studied_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
    
    /**
     * Check if flashcard has been studied
     */
    public function isStudied(): bool
    {
        return $this->difficulty !== 'not_studied';
    }
    
    /**
     * Check if flashcard is easy
     */
    public function isEasy(): bool
    {
        return $this->difficulty === 'easy';
    }
    
    /**
     * Check if flashcard is hard
     */
    public function isHard(): bool
    {
        return $this->difficulty === 'hard';
    }
    
    /**
     * Get difficulty level as emoji
     */
    public function getDifficultyEmoji(): string
    {
        return match($this->difficulty) {
            'not_studied' => '📝',
            'easy' => '😊',
            'medium' => '🤔',
            'hard' => '😰',
            default => '❓'
        };
    }
    
    /**
     * Check if needs review (not studied or hard)
     */
    public function needsReview(): bool
    {
        return $this->difficulty === 'not_studied' || $this->difficulty === 'hard';
    }
}
