<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Models\Flashcard;
use PDO;

/**
 * Flashcard Repository
 * 
 * Handles all database operations for flashcards
 * Data Access Layer - no business logic here
 * Returns Flashcard domain entities
 */
class FlashcardRepository
{
    private PDO $db;
    
    public function __construct(PDO $db)
    {
        $this->db = $db;
    }
    
    /**
     * Find all flashcards
     * @return Flashcard[]
     */
    public function findAll(): array
    {
        $stmt = $this->db->query("
            SELECT * FROM flashcards 
            ORDER BY created_at DESC
        ");
        
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        return array_map(fn($data) => Flashcard::fromArray($data), $results);
    }
    
    /**
     * Find flashcard by ID
     */
    public function findById(int $id): ?Flashcard
    {
        $stmt = $this->db->prepare("
            SELECT * FROM flashcards 
            WHERE id = :id
        ");
        
        $stmt->execute(['id' => $id]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        return $result ? Flashcard::fromArray($result) : null;
    }
    
    /**
     * Find flashcards by difficulty level
     * @return Flashcard[]
     */
    public function findByDifficulty(string $difficulty): array
    {
        $stmt = $this->db->prepare("
            SELECT * FROM flashcards 
            WHERE difficulty = :difficulty
            ORDER BY created_at DESC
        ");
        
        $stmt->execute(['difficulty' => $difficulty]);
        
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        return array_map(fn($data) => Flashcard::fromArray($data), $results);
    }
    
    /**
     * Find flashcards prioritized for study
     * Orders by: not_studied first, then hard, medium, easy
     * Within each difficulty, prioritizes least studied cards
     * @return Flashcard[]
     */
    public function findForStudy(): array
    {
        $stmt = $this->db->query("
            SELECT * FROM flashcards
            ORDER BY 
                CASE difficulty
                    WHEN 'not_studied' THEN 1
                    WHEN 'hard' THEN 2
                    WHEN 'medium' THEN 3
                    WHEN 'easy' THEN 4
                END,
                study_count ASC,
                CASE 
                    WHEN last_studied_at IS NULL THEN 1
                    ELSE 0
                END DESC,
                last_studied_at ASC
        ");
        
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        return array_map(fn($data) => Flashcard::fromArray($data), $results);
    }
    
    /**
     * Create new flashcard
     */
    public function create(array $data): ?Flashcard
    {
        $stmt = $this->db->prepare("
            INSERT INTO flashcards (front, back, created_at, updated_at)
            VALUES (:front, :back, NOW(), NOW())
        ");
        
        $stmt->execute([
            'front' => $data['front'],
            'back' => $data['back']
        ]);
        
        $id = (int) $this->db->lastInsertId();
        
        return $this->findById($id);
    }
    
    /**
     * Update flashcard
     */
    public function update(int $id, array $data): ?Flashcard
    {
        $stmt = $this->db->prepare("
            UPDATE flashcards 
            SET front = :front, 
                back = :back, 
                updated_at = NOW()
            WHERE id = :id
        ");
        
        $stmt->execute([
            'id' => $id,
            'front' => $data['front'],
            'back' => $data['back']
        ]);
        
        return $this->findById($id);
    }
    
    /**
     * Update flashcard difficulty and study tracking
     */
    public function updateDifficulty(int $id, string $difficulty): ?Flashcard
    {
        $stmt = $this->db->prepare("
            UPDATE flashcards 
            SET difficulty = :difficulty,
                study_count = study_count + 1,
                last_studied_at = NOW(),
                updated_at = NOW()
            WHERE id = :id
        ");
        
        $stmt->execute([
            'id' => $id,
            'difficulty' => $difficulty
        ]);
        
        return $this->findById($id);
    }
    
    /**
     * Delete flashcard
     */
    public function delete(int $id): bool
    {
        $stmt = $this->db->prepare("
            DELETE FROM flashcards 
            WHERE id = :id
        ");
        
        $stmt->execute(['id' => $id]);
        
        return $stmt->rowCount() > 0;
    }
    
    /**
     * Get study statistics
     */
    public function getStats(): array
    {
        $stmt = $this->db->query("
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN difficulty = 'not_studied' THEN 1 ELSE 0 END) as not_studied,
                SUM(CASE WHEN difficulty = 'easy' THEN 1 ELSE 0 END) as easy,
                SUM(CASE WHEN difficulty = 'medium' THEN 1 ELSE 0 END) as medium,
                SUM(CASE WHEN difficulty = 'hard' THEN 1 ELSE 0 END) as hard,
                SUM(study_count) as total_studies,
                ROUND(AVG(study_count), 1) as avg_studies_per_card
            FROM flashcards
        ");
        
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Convert string numbers to integers
        return [
            'total' => (int) $result['total'],
            'not_studied' => (int) $result['not_studied'],
            'easy' => (int) $result['easy'],
            'medium' => (int) $result['medium'],
            'hard' => (int) $result['hard'],
            'total_studies' => (int) $result['total_studies'],
            'avg_studies_per_card' => (float) $result['avg_studies_per_card']
        ];
    }
    
    /**
     * Check if flashcard exists
     */
    public function exists(int $id): bool
    {
        return $this->findById($id) !== null;
    }
}
