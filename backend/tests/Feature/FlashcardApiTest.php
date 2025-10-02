<?php

declare(strict_types=1);

namespace Tests\Feature;

use Tests\DatabaseTestCase;
use App\Repositories\FlashcardRepository;

/**
 * Feature Tests for Flashcard API
 * 
 * Note: These tests validate the business logic.
 * Full HTTP integration tests would require additional tooling.
 */
class FlashcardApiTest extends DatabaseTestCase
{
    private FlashcardRepository $repository;
    
    protected function setUp(): void
    {
        parent::setUp();
        
        $this->repository = new FlashcardRepository(self::$db);
    }
    
    public function testCanCreateAndRetrieveFlashcard(): void
    {
        // Create
        $created = $this->repository->create([
            'front' => 'What is TDD?',
            'back' => 'Test-Driven Development'
        ]);
        
        $this->assertNotNull($created);
        $this->assertGreaterThan(0, $created->id);
        
        // Retrieve
        $retrieved = $this->repository->findById($created->id);
        
        $this->assertEquals($created->id, $retrieved->id);
        $this->assertEquals('What is TDD?', $retrieved->front);
        $this->assertEquals('Test-Driven Development', $retrieved->back);
    }
    

    public function testCanUpdateFlashcardContent(): void
    {
        // Create original
        $original = $this->repository->create([
            'front' => 'Original Question',
            'back' => 'Original Answer'
        ]);
        
        // Update
        $updated = $this->repository->update($original->id, [
            'front' => 'Updated Question',
            'back' => 'Updated Answer'
        ]);
        
        $this->assertNotNull($updated);
        $this->assertEquals('Updated Question', $updated->front);
        $this->assertEquals('Updated Answer', $updated->back);
        
        // Verify persistence
        $retrieved = $this->repository->findById($original->id);
        $this->assertEquals('Updated Question', $retrieved->front);
    }
    
    public function testCanDeleteFlashcard(): void
    {
        // Create
        $flashcard = $this->repository->create([
            'front' => 'Temporary',
            'back' => 'Will be deleted'
        ]);
        
        $id = $flashcard->id;
        
        // Verify it exists
        $this->assertNotNull($this->repository->findById($id));
        
        // Delete
        $deleted = $this->repository->delete($id);
        $this->assertTrue($deleted);
        
        // Verify it's gone
        $this->assertNull($this->repository->findById($id));
    }
    
    public function testDeleteNonExistentReturnssFalse(): void
    {
        $result = $this->repository->delete(99999);
        $this->assertFalse($result);
    }
    
    public function testUpdateNonExistentReturnsNull(): void
    {
        $result = $this->repository->update(99999, [
            'front' => 'Test',
            'back' => 'Test'
        ]);
        
        $this->assertNull($result);
    }
    
    public function testFlashcardsHaveTimestamps(): void
    {
        $flashcard = $this->repository->create([
            'front' => 'Test',
            'back' => 'Test'
        ]);
        
        $this->assertNotEmpty($flashcard->created_at);
        $this->assertNotEmpty($flashcard->updated_at);
    }
}
