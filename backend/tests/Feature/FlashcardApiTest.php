<?php

declare(strict_types=1);

namespace Tests\Feature;

use PHPUnit\Framework\TestCase;
use App\Models\Flashcard;
use App\Database\Database;

/**
 * Feature Tests for Flashcard API
 * 
 * Note: These tests validate the business logic.
 * Full HTTP integration tests would require additional tooling.
 */
class FlashcardApiTest extends TestCase
{
    private Flashcard $model;
    
    protected function setUp(): void
    {
        parent::setUp();
        
        // Use test database configuration
        $_ENV['DB_HOST'] = $_ENV['TEST_DB_HOST'] ?? 'localhost';
        $_ENV['DB_PORT'] = $_ENV['TEST_DB_PORT'] ?? '3306';
        $_ENV['DB_NAME'] = $_ENV['TEST_DB_NAME'] ?? 'flashcards_test';
        $_ENV['DB_USER'] = $_ENV['TEST_DB_USER'] ?? 'root';
        $_ENV['DB_PASSWORD'] = $_ENV['TEST_DB_PASSWORD'] ?? '';
        $_ENV['DB_CHARSET'] = 'utf8mb4';
        $_ENV['APP_ENV'] = 'testing';
        
        Database::disconnect();
        
        $this->model = new Flashcard();
        
        // Setup test database
        $db = Database::getConnection();
        $db->exec('DROP TABLE IF EXISTS flashcards');
        
        $sql = "
            CREATE TABLE IF NOT EXISTS flashcards (
                id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                front VARCHAR(1000) NOT NULL,
                back VARCHAR(1000) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_created_at (created_at)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ";
        $db->exec($sql);
    }
    
    protected function tearDown(): void
    {
        Database::disconnect();
        parent::tearDown();
    }
    
    public function testCanCreateAndRetrieveFlashcard(): void
    {
        // Create
        $created = $this->model->create([
            'front' => 'What is TDD?',
            'back' => 'Test-Driven Development'
        ]);
        
        $this->assertNotNull($created);
        $this->assertArrayHasKey('id', $created);
        
        // Retrieve
        $retrieved = $this->model->findById((int) $created['id']);
        
        $this->assertEquals($created['id'], $retrieved['id']);
        $this->assertEquals('What is TDD?', $retrieved['front']);
        $this->assertEquals('Test-Driven Development', $retrieved['back']);
    }
    
    public function testCanListMultipleFlashcards(): void
    {
        // Create test data
        $flashcards = [
            ['front' => 'Q1', 'back' => 'A1'],
            ['front' => 'Q2', 'back' => 'A2'],
            ['front' => 'Q3', 'back' => 'A3']
        ];
        
        $ids = [];
        foreach ($flashcards as $data) {
            $created = $this->model->create($data);
            $ids[] = $created['id'];
        }
        
        // List all
        $all = $this->model->findAll();
        
        $this->assertCount(3, $all);
        // Most recent first (highest ID should be first)
        $this->assertEquals($ids[2], $all[0]['id']);
        $this->assertEquals('Q3', $all[0]['front']);
    }
    
    public function testCanUpdateFlashcardContent(): void
    {
        // Create original
        $original = $this->model->create([
            'front' => 'Original Question',
            'back' => 'Original Answer'
        ]);
        
        // Update
        $updated = $this->model->update((int) $original['id'], [
            'front' => 'Updated Question',
            'back' => 'Updated Answer'
        ]);
        
        $this->assertNotNull($updated);
        $this->assertEquals('Updated Question', $updated['front']);
        $this->assertEquals('Updated Answer', $updated['back']);
        
        // Verify persistence
        $retrieved = $this->model->findById((int) $original['id']);
        $this->assertEquals('Updated Question', $retrieved['front']);
    }
    
    public function testCanDeleteFlashcard(): void
    {
        // Create
        $flashcard = $this->model->create([
            'front' => 'Temporary',
            'back' => 'Will be deleted'
        ]);
        
        $id = (int) $flashcard['id'];
        
        // Verify it exists
        $this->assertNotNull($this->model->findById($id));
        
        // Delete
        $deleted = $this->model->delete($id);
        $this->assertTrue($deleted);
        
        // Verify it's gone
        $this->assertNull($this->model->findById($id));
    }
    
    public function testDeleteNonExistentReturnssFalse(): void
    {
        $result = $this->model->delete(99999);
        $this->assertFalse($result);
    }
    
    public function testUpdateNonExistentReturnsNull(): void
    {
        $result = $this->model->update(99999, [
            'front' => 'Test',
            'back' => 'Test'
        ]);
        
        $this->assertNull($result);
    }
    
    public function testFlashcardsHaveTimestamps(): void
    {
        $flashcard = $this->model->create([
            'front' => 'Test',
            'back' => 'Test'
        ]);
        
        $this->assertArrayHasKey('created_at', $flashcard);
        $this->assertArrayHasKey('updated_at', $flashcard);
        $this->assertNotEmpty($flashcard['created_at']);
        $this->assertNotEmpty($flashcard['updated_at']);
    }
}
