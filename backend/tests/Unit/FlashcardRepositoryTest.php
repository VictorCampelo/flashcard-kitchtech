<?php

declare(strict_types=1);

namespace Tests\Unit;

use Tests\DatabaseTestCase;
use App\Repositories\FlashcardRepository;
use App\Models\Flashcard;
use App\Database\Database;

/**
 * Unit Tests for Flashcard Repository
 */
class FlashcardRepositoryTest extends DatabaseTestCase
{
    private FlashcardRepository $repository;
    
    protected function setUp(): void
    {
        parent::setUp();
        
        // Create repository with test database connection
        $this->repository = new FlashcardRepository(self::$db);
    }
    
    public function testFindAllReturnsFlashcardObjects(): void
    {
        // Create test data
        $this->repository->create(['front' => 'Q1', 'back' => 'A1']);
        $this->repository->create(['front' => 'Q2', 'back' => 'A2']);
        
        $flashcards = $this->repository->findAll();
        
        $this->assertIsArray($flashcards);
        $this->assertCount(2, $flashcards);
        $this->assertInstanceOf(Flashcard::class, $flashcards[0]);
        $this->assertInstanceOf(Flashcard::class, $flashcards[1]);
    }
    
    public function testFindByIdReturnsFlashcardObject(): void
    {
        $created = $this->repository->create(['front' => 'Question', 'back' => 'Answer']);
        
        $found = $this->repository->findById($created->id);
        
        $this->assertInstanceOf(Flashcard::class, $found);
        $this->assertEquals($created->id, $found->id);
        $this->assertEquals('Question', $found->front);
    }
    
    public function testFindByIdReturnsNullForNonExistent(): void
    {
        $result = $this->repository->findById(999);
        
        $this->assertNull($result);
    }
    
    public function testCreateReturnsFlashcardObject(): void
    {
        $flashcard = $this->repository->create([
            'front' => 'What is TDD?',
            'back' => 'Test-Driven Development'
        ]);
        
        $this->assertInstanceOf(Flashcard::class, $flashcard);
        $this->assertGreaterThan(0, $flashcard->id);
        $this->assertEquals('What is TDD?', $flashcard->front);
        $this->assertEquals('Test-Driven Development', $flashcard->back);
        $this->assertEquals('not_studied', $flashcard->difficulty);
        $this->assertEquals(0, $flashcard->study_count);
    }
    
    public function testUpdateReturnsUpdatedFlashcard(): void
    {
        $created = $this->repository->create(['front' => 'Old', 'back' => 'Old']);
        
        $updated = $this->repository->update($created->id, [
            'front' => 'New',
            'back' => 'New'
        ]);
        
        $this->assertInstanceOf(Flashcard::class, $updated);
        $this->assertEquals('New', $updated->front);
        $this->assertEquals('New', $updated->back);
    }
    
    public function testDeleteRemovesFlashcard(): void
    {
        $created = $this->repository->create(['front' => 'Test', 'back' => 'Test']);
        
        $deleted = $this->repository->delete($created->id);
        
        $this->assertTrue($deleted);
        $this->assertNull($this->repository->findById($created->id));
    }
    
    public function testUpdateDifficultyIncrementsStudyCount(): void
    {
        $created = $this->repository->create(['front' => 'Q', 'back' => 'A']);
        
        $updated = $this->repository->updateDifficulty($created->id, 'easy');
        
        $this->assertInstanceOf(Flashcard::class, $updated);
        $this->assertEquals('easy', $updated->difficulty);
        $this->assertEquals(1, $updated->study_count);
        $this->assertNotNull($updated->last_studied_at);
    }
    
    public function testFindByDifficultyReturnsFilteredResults(): void
    {
        $card1 = $this->repository->create(['front' => 'Q1', 'back' => 'A1']);
        $this->repository->updateDifficulty($card1->id, 'easy');
        
        $card2 = $this->repository->create(['front' => 'Q2', 'back' => 'A2']);
        $this->repository->updateDifficulty($card2->id, 'easy');
        
        $card3 = $this->repository->create(['front' => 'Q3', 'back' => 'A3']);
        $this->repository->updateDifficulty($card3->id, 'hard');
        
        $easyCards = $this->repository->findByDifficulty('easy');
        
        $this->assertCount(2, $easyCards);
        $this->assertInstanceOf(Flashcard::class, $easyCards[0]);
        $this->assertEquals('easy', $easyCards[0]->difficulty);
    }
    
    public function testFindForStudyPrioritizesCorrectly(): void
    {
        // Create cards with different difficulties
        $notStudied = $this->repository->create(['front' => 'Not Studied', 'back' => 'A']);
        
        $easy = $this->repository->create(['front' => 'Easy', 'back' => 'A']);
        $this->repository->updateDifficulty($easy->id, 'easy');
        
        $medium = $this->repository->create(['front' => 'Medium', 'back' => 'A']);
        $this->repository->updateDifficulty($medium->id, 'medium');
        
        $hard = $this->repository->create(['front' => 'Hard', 'back' => 'A']);
        $this->repository->updateDifficulty($hard->id, 'hard');
        
        $studyOrder = $this->repository->findForStudy();
        
        // Order: not_studied, hard, medium, easy
        $this->assertEquals('Not Studied', $studyOrder[0]->front);
        $this->assertEquals('Hard', $studyOrder[1]->front);
        $this->assertEquals('Medium', $studyOrder[2]->front);
        $this->assertEquals('Easy', $studyOrder[3]->front);
    }
    
    public function testGetStatsReturnsCorrectCounts(): void
    {
        $card1 = $this->repository->create(['front' => 'Q1', 'back' => 'A1']);
        $this->repository->updateDifficulty($card1->id, 'easy');
        
        $card2 = $this->repository->create(['front' => 'Q2', 'back' => 'A2']);
        $this->repository->updateDifficulty($card2->id, 'medium');
        
        $card3 = $this->repository->create(['front' => 'Q3', 'back' => 'A3']);
        $this->repository->updateDifficulty($card3->id, 'hard');
        
        $this->repository->create(['front' => 'Q4', 'back' => 'A4']); // not_studied
        
        $stats = $this->repository->getStats();
        
        $this->assertEquals(4, $stats['total']);
        $this->assertEquals(1, $stats['not_studied']);
        $this->assertEquals(1, $stats['easy']);
        $this->assertEquals(1, $stats['medium']);
        $this->assertEquals(1, $stats['hard']);
        $this->assertEquals(3, $stats['total_studies']);
    }
    
    public function testExistsReturnsTrueForExistingCard(): void
    {
        $created = $this->repository->create(['front' => 'Q', 'back' => 'A']);
        
        $this->assertTrue($this->repository->exists($created->id));
    }
    
    public function testExistsReturnsFalseForNonExistentCard(): void
    {
        $this->assertFalse($this->repository->exists(999));
    }
}
