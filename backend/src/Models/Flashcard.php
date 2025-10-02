<?php

declare(strict_types=1);

namespace App\Models;

use App\Database\Database;
use PDO;

/**
 * Flashcard Model
 * 
 * Handles CRUD operations for flashcards
 */
class Flashcard
{
    private PDO $db;
    
    public function __construct()
    {
        $this->db = Database::getConnection();
    }
    
    /**
     * Get all flashcards
     */
    public function findAll(): array
    {
        $stmt = $this->db->query("
            SELECT id, front, back, created_at, updated_at 
            FROM flashcards 
            ORDER BY created_at DESC, id DESC
        ");
        
        return $stmt->fetchAll();
    }
    
    /**
     * Find flashcard by ID
     */
    public function findById(int $id): ?array
    {
        $stmt = $this->db->prepare("
            SELECT id, front, back, created_at, updated_at 
            FROM flashcards 
            WHERE id = :id
        ");
        
        $stmt->execute(['id' => $id]);
        $result = $stmt->fetch();
        
        return $result ?: null;
    }
    
    /**
     * Create new flashcard
     */
    public function create(array $data): array
    {
        $stmt = $this->db->prepare("
            INSERT INTO flashcards (front, back) 
            VALUES (:front, :back)
        ");
        
        $stmt->execute([
            'front' => $data['front'],
            'back' => $data['back']
        ]);
        
        $id = (int) $this->db->lastInsertId();
        
        return $this->findById($id);
    }
    
    /**
     * Update existing flashcard
     */
    public function update(int $id, array $data): ?array
    {
        // Check if flashcard exists
        if (!$this->findById($id)) {
            return null;
        }
        
        $stmt = $this->db->prepare("
            UPDATE flashcards 
            SET front = :front, back = :back
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
     * Delete flashcard
     */
    public function delete(int $id): bool
    {
        // Check if flashcard exists
        if (!$this->findById($id)) {
            return false;
        }
        
        $stmt = $this->db->prepare("DELETE FROM flashcards WHERE id = :id");
        $stmt->execute(['id' => $id]);
        
        return true;
    }
    
    /**
     * Count total flashcards
     */
    public function count(): int
    {
        $stmt = $this->db->query("SELECT COUNT(*) as total FROM flashcards");
        $result = $stmt->fetch();
        
        return (int) $result['total'];
    }
}
