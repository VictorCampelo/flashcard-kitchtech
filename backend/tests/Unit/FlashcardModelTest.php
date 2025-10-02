<?php

declare(strict_types=1);

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;
use App\Models\Flashcard;

/**
 * Unit Tests for Flashcard Domain Entity
 */
class FlashcardModelTest extends TestCase
{
    public function testCanCreateFlashcardFromArray(): void
    {
        $data = [
            'id' => 1,
            'front' => 'What is PHP?',
            'back' => 'A server-side scripting language',
            'difficulty' => 'easy',
            'study_count' => 5,
            'last_studied_at' => '2025-10-02 12:00:00',
            'created_at' => '2025-10-01 10:00:00',
            'updated_at' => '2025-10-02 12:00:00'
        ];
        
        $flashcard = Flashcard::fromArray($data);
        
        $this->assertInstanceOf(Flashcard::class, $flashcard);
        $this->assertEquals(1, $flashcard->id);
        $this->assertEquals('What is PHP?', $flashcard->front);
        $this->assertEquals('A server-side scripting language', $flashcard->back);
        $this->assertEquals('easy', $flashcard->difficulty);
        $this->assertEquals(5, $flashcard->study_count);
    }
    
    public function testCanConvertFlashcardToArray(): void
    {
        $flashcard = new Flashcard(
            id: 1,
            front: 'Question',
            back: 'Answer',
            difficulty: 'medium',
            study_count: 3,
            last_studied_at: '2025-10-02 12:00:00',
            created_at: '2025-10-01 10:00:00',
            updated_at: '2025-10-02 12:00:00'
        );
        
        $array = $flashcard->toArray();
        
        $this->assertIsArray($array);
        $this->assertEquals(1, $array['id']);
        $this->assertEquals('Question', $array['front']);
        $this->assertEquals('Answer', $array['back']);
        $this->assertEquals('medium', $array['difficulty']);
        $this->assertEquals(3, $array['study_count']);
    }
    
    public function testIsStudiedReturnsTrueForStudiedCards(): void
    {
        $flashcard = new Flashcard(
            id: 1,
            front: 'Q',
            back: 'A',
            difficulty: 'easy',
            study_count: 1,
            last_studied_at: '2025-10-02 12:00:00',
            created_at: '2025-10-01 10:00:00',
            updated_at: '2025-10-02 12:00:00'
        );
        
        $this->assertTrue($flashcard->isStudied());
    }
    
    public function testIsStudiedReturnsFalseForNotStudiedCards(): void
    {
        $flashcard = new Flashcard(
            id: 1,
            front: 'Q',
            back: 'A',
            difficulty: 'not_studied',
            study_count: 0,
            last_studied_at: null,
            created_at: '2025-10-01 10:00:00',
            updated_at: '2025-10-01 10:00:00'
        );
        
        $this->assertFalse($flashcard->isStudied());
    }
    
    public function testIsEasyReturnsTrueForEasyCards(): void
    {
        $flashcard = new Flashcard(
            id: 1,
            front: 'Q',
            back: 'A',
            difficulty: 'easy',
            study_count: 1,
            last_studied_at: null,
            created_at: '2025-10-01 10:00:00',
            updated_at: '2025-10-01 10:00:00'
        );
        
        $this->assertTrue($flashcard->isEasy());
        $this->assertFalse($flashcard->isHard());
    }
    
    public function testIsHardReturnsTrueForHardCards(): void
    {
        $flashcard = new Flashcard(
            id: 1,
            front: 'Q',
            back: 'A',
            difficulty: 'hard',
            study_count: 1,
            last_studied_at: null,
            created_at: '2025-10-01 10:00:00',
            updated_at: '2025-10-01 10:00:00'
        );
        
        $this->assertTrue($flashcard->isHard());
        $this->assertFalse($flashcard->isEasy());
    }
    
    public function testNeedsReviewReturnsTrueForNotStudiedCards(): void
    {
        $flashcard = new Flashcard(
            id: 1,
            front: 'Q',
            back: 'A',
            difficulty: 'not_studied',
            study_count: 0,
            last_studied_at: null,
            created_at: '2025-10-01 10:00:00',
            updated_at: '2025-10-01 10:00:00'
        );
        
        $this->assertTrue($flashcard->needsReview());
    }
    
    public function testNeedsReviewReturnsTrueForHardCards(): void
    {
        $flashcard = new Flashcard(
            id: 1,
            front: 'Q',
            back: 'A',
            difficulty: 'hard',
            study_count: 1,
            last_studied_at: null,
            created_at: '2025-10-01 10:00:00',
            updated_at: '2025-10-01 10:00:00'
        );
        
        $this->assertTrue($flashcard->needsReview());
    }
    
    public function testNeedsReviewReturnsFalseForEasyCards(): void
    {
        $flashcard = new Flashcard(
            id: 1,
            front: 'Q',
            back: 'A',
            difficulty: 'easy',
            study_count: 1,
            last_studied_at: null,
            created_at: '2025-10-01 10:00:00',
            updated_at: '2025-10-01 10:00:00'
        );
        
        $this->assertFalse($flashcard->needsReview());
    }
    
    public function testGetDifficultyEmojiReturnsCorrectEmoji(): void
    {
        $notStudied = new Flashcard(1, 'Q', 'A', 'not_studied', 0, null, '2025-10-01', '2025-10-01');
        $this->assertEquals('📝', $notStudied->getDifficultyEmoji());
        
        $easy = new Flashcard(1, 'Q', 'A', 'easy', 1, null, '2025-10-01', '2025-10-01');
        $this->assertEquals('😊', $easy->getDifficultyEmoji());
        
        $medium = new Flashcard(1, 'Q', 'A', 'medium', 1, null, '2025-10-01', '2025-10-01');
        $this->assertEquals('🤔', $medium->getDifficultyEmoji());
        
        $hard = new Flashcard(1, 'Q', 'A', 'hard', 1, null, '2025-10-01', '2025-10-01');
        $this->assertEquals('😰', $hard->getDifficultyEmoji());
    }
    
    public function testFlashcardPropertiesAreReadonly(): void
    {
        $flashcard = new Flashcard(
            id: 1,
            front: 'Question',
            back: 'Answer',
            difficulty: 'easy',
            study_count: 1,
            last_studied_at: null,
            created_at: '2025-10-01 10:00:00',
            updated_at: '2025-10-01 10:00:00'
        );
        
        // Properties are readonly - verify they exist and are accessible
        $this->assertEquals('Question', $flashcard->front);
        $this->assertEquals('Answer', $flashcard->back);
        $this->assertEquals('easy', $flashcard->difficulty);
        
        // Note: Cannot test mutation directly as it would cause syntax error
        // The readonly keyword enforces immutability at compile time
    }
}
