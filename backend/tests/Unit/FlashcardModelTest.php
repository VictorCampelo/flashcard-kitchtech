<?php

declare(strict_types=1);

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;
use App\Models\Flashcard;
use App\Database\Database;

/**
 * Unit Tests for Flashcard Model
 */
class FlashcardModelTest extends TestCase
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
        
        // Clear existing connection
        Database::disconnect();
        
        // Create fresh model
        $this->model = new Flashcard();
        
        // Clear test database
        $db = Database::getConnection();
        $db->exec('DROP TABLE IF EXISTS flashcards');
        
        // Run migration with MySQL syntax
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
    
    public function testCanCreateFlashcard(): void
    {
        $data = [
            'front' => 'What is PHP?',
            'back' => 'PHP is a server-side scripting language'
        ];
        
        $flashcard = $this->model->create($data);
        
        $this->assertIsArray($flashcard);
        $this->assertArrayHasKey('id', $flashcard);
        $this->assertEquals($data['front'], $flashcard['front']);
        $this->assertEquals($data['back'], $flashcard['back']);
    }
    
    public function testCanFindAllFlashcards(): void
    {
        // Create multiple flashcards
        $this->model->create(['front' => 'Q1', 'back' => 'A1']);
        $this->model->create(['front' => 'Q2', 'back' => 'A2']);
        $this->model->create(['front' => 'Q3', 'back' => 'A3']);
        
        $flashcards = $this->model->findAll();
        
        $this->assertCount(3, $flashcards);
    }
    
    public function testCanFindFlashcardById(): void
    {
        $created = $this->model->create(['front' => 'Question', 'back' => 'Answer']);
        
        $found = $this->model->findById((int) $created['id']);
        
        $this->assertIsArray($found);
        $this->assertEquals($created['id'], $found['id']);
        $this->assertEquals('Question', $found['front']);
    }
    
    public function testReturnsNullForNonExistentId(): void
    {
        $result = $this->model->findById(999);
        
        $this->assertNull($result);
    }
    
    public function testCanUpdateFlashcard(): void
    {
        $created = $this->model->create(['front' => 'Old Front', 'back' => 'Old Back']);
        
        $updated = $this->model->update((int) $created['id'], [
            'front' => 'New Front',
            'back' => 'New Back'
        ]);
        
        $this->assertIsArray($updated);
        $this->assertEquals('New Front', $updated['front']);
        $this->assertEquals('New Back', $updated['back']);
    }
    
    public function testUpdateReturnsNullForNonExistentId(): void
    {
        $result = $this->model->update(999, ['front' => 'Test', 'back' => 'Test']);
        
        $this->assertNull($result);
    }
    
    public function testCanDeleteFlashcard(): void
    {
        $created = $this->model->create(['front' => 'To Delete', 'back' => 'Will be removed']);
        
        $deleted = $this->model->delete((int) $created['id']);
        
        $this->assertTrue($deleted);
        
        // Verify it's gone
        $found = $this->model->findById((int) $created['id']);
        $this->assertNull($found);
    }
    
    public function testDeleteReturnsFalseForNonExistentId(): void
    {
        $result = $this->model->delete(999);
        
        $this->assertFalse($result);
    }
    
    public function testCanCountFlashcards(): void
    {
        $this->assertEquals(0, $this->model->count());
        
        $this->model->create(['front' => 'Q1', 'back' => 'A1']);
        $this->assertEquals(1, $this->model->count());
        
        $this->model->create(['front' => 'Q2', 'back' => 'A2']);
        $this->assertEquals(2, $this->model->count());
    }
}
