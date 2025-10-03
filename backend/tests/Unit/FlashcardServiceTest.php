<?php

declare(strict_types=1);

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;
use App\Services\FlashcardService;
use App\Repositories\FlashcardRepository;
use App\Models\Flashcard;

/**
 * Unit Tests for Flashcard Service
 * Uses mocked repository to test business logic in isolation
 */
class FlashcardServiceTest extends TestCase
{
    /**
     * Creates a properly typed mock of FlashcardRepository
     * 
     * @return FlashcardRepository&\PHPUnit\Framework\MockObject\MockObject
     */
    private function createRepositoryMock(): FlashcardRepository
    {
        /** @var FlashcardRepository&\PHPUnit\Framework\MockObject\MockObject $mock */
        $mock = $this->createMock(FlashcardRepository::class);
        return $mock;
    }

    public function testGetAllFlashcardsReturnsAllWhenNoFilter(): void
    {
        $mockRepo = $this->createRepositoryMock();
        $mockRepo->expects($this->once())
            ->method('findAll')
            ->willReturn([
                new Flashcard(1, 'Q1', 'A1', 'easy', 1, null, '2025-10-01', '2025-10-01'),
                new Flashcard(2, 'Q2', 'A2', 'hard', 1, null, '2025-10-01', '2025-10-01'),
            ]);
        
        $service = new FlashcardService($mockRepo);
        $result = $service->getAllFlashcards();
        
        $this->assertCount(2, $result);
    }
    
    public function testGetAllFlashcardsWithStudyFilterCallsFindForStudy(): void
    {
        $mockRepo = $this->createRepositoryMock();
        $mockRepo->expects($this->once())
            ->method('findForStudy')
            ->willReturn([]);
        
        $service = new FlashcardService($mockRepo);
        $service->getAllFlashcards('study');
    }
    
    public function testGetAllFlashcardsWithDifficultyFilterCallsFindByDifficulty(): void
    {
        $mockRepo = $this->createRepositoryMock();
        $mockRepo->expects($this->once())
            ->method('findByDifficulty')
            ->with('easy')
            ->willReturn([]);
        
        $service = new FlashcardService($mockRepo);
        $service->getAllFlashcards(null, 'easy');
    }
    
    public function testCreateFlashcardThrowsExceptionForEmptyFront(): void
    {
        $mockRepo = $this->createRepositoryMock();
        $service = new FlashcardService($mockRepo);
        
        $this->expectException(\InvalidArgumentException::class);
        $service->createFlashcard(['front' => '', 'back' => 'Answer']);
    }
    
    public function testCreateFlashcardThrowsExceptionForEmptyBack(): void
    {
        $mockRepo = $this->createRepositoryMock();
        $service = new FlashcardService($mockRepo);
        
        $this->expectException(\InvalidArgumentException::class);
        $service->createFlashcard(['front' => 'Question', 'back' => '']);
    }
    
    public function testCreateFlashcardThrowsExceptionForTooLongFront(): void
    {
        $mockRepo = $this->createRepositoryMock();
        $service = new FlashcardService($mockRepo);
        
        $longText = str_repeat('a', 1001);
        
        $this->expectException(\InvalidArgumentException::class);
        $service->createFlashcard(['front' => $longText, 'back' => 'Answer']);
    }
    
    public function testCreateFlashcardCallsRepositoryWithValidData(): void
    {
        $mockRepo = $this->createRepositoryMock();
        $mockRepo->expects($this->once())
            ->method('create')
            ->with(['front' => 'Question', 'back' => 'Answer'])
            ->willReturn(new Flashcard(1, 'Question', 'Answer', 'not_studied', 0, null, '2025-10-01', '2025-10-01'));
        
        $service = new FlashcardService($mockRepo);
        $result = $service->createFlashcard(['front' => 'Question', 'back' => 'Answer']);
        
        $this->assertInstanceOf(Flashcard::class, $result);
    }
    
    public function testUpdateFlashcardThrowsExceptionIfNotExists(): void
    {
        $mockRepo = $this->createRepositoryMock();
        $mockRepo->expects($this->once())
            ->method('exists')
            ->with(999)
            ->willReturn(false);
        
        $service = new FlashcardService($mockRepo);
        
        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessage('Flashcard not found');
        $service->updateFlashcard(999, ['front' => 'Q', 'back' => 'A']);
    }
    
    public function testUpdateFlashcardValidatesData(): void
    {
        $mockRepo = $this->createRepositoryMock();
        $mockRepo->expects($this->once())
            ->method('exists')
            ->with(1)
            ->willReturn(true);
        
        $service = new FlashcardService($mockRepo);
        
        $this->expectException(\InvalidArgumentException::class);
        $service->updateFlashcard(1, ['front' => '', 'back' => 'A']);
    }
    
    public function testUpdateDifficultyThrowsExceptionForInvalidDifficulty(): void
    {
        $mockRepo = $this->createRepositoryMock();
        $mockRepo->expects($this->once())
            ->method('exists')
            ->with(1)
            ->willReturn(true);
        
        $service = new FlashcardService($mockRepo);
        
        $this->expectException(\InvalidArgumentException::class);
        $service->updateDifficulty(1, 'invalid');
    }
    
    public function testUpdateDifficultyAcceptsValidDifficulties(): void
    {
        $mockRepo = $this->createRepositoryMock();
        $mockRepo->expects($this->once())
            ->method('exists')
            ->with(1)
            ->willReturn(true);
        
        $mockRepo->expects($this->once())
            ->method('updateDifficulty')
            ->with(1, 'easy')
            ->willReturn(new Flashcard(1, 'Q', 'A', 'easy', 1, null, '2025-10-01', '2025-10-01'));
        
        $service = new FlashcardService($mockRepo);
        $result = $service->updateDifficulty(1, 'easy');
        
        $this->assertInstanceOf(Flashcard::class, $result);
        $this->assertEquals('easy', $result->difficulty);
    }
    
    public function testDeleteFlashcardThrowsExceptionIfNotExists(): void
    {
        $mockRepo = $this->createRepositoryMock();
        $mockRepo->expects($this->once())
            ->method('exists')
            ->with(999)
            ->willReturn(false);
        
        $service = new FlashcardService($mockRepo);
        
        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessage('Flashcard not found');
        $service->deleteFlashcard(999);
    }
    
    public function testDeleteFlashcardCallsRepository(): void
    {
        $mockRepo = $this->createRepositoryMock();
        $mockRepo->expects($this->once())
            ->method('exists')
            ->with(1)
            ->willReturn(true);
        
        $mockRepo->expects($this->once())
            ->method('delete')
            ->with(1)
            ->willReturn(true);
        
        $service = new FlashcardService($mockRepo);
        $result = $service->deleteFlashcard(1);
        
        $this->assertTrue($result);
    }
    
    public function testGetValidDifficultiesReturnsArray(): void
    {
        $difficulties = FlashcardService::getValidDifficulties();
        
        $this->assertIsArray($difficulties);
        $this->assertContains('not_studied', $difficulties);
        $this->assertContains('easy', $difficulties);
        $this->assertContains('medium', $difficulties);
        $this->assertContains('hard', $difficulties);
    }
    
    public function testGetAllFlashcardsPaginatedReturnsCorrectStructure(): void
    {
        $mockRepo = $this->createRepositoryMock();
        $mockRepo->expects($this->once())
            ->method('findAllPaginated')
            ->with(1, 10, null, null)
            ->willReturn([
                'data' => [
                    new Flashcard(1, 'Q1', 'A1', 'easy', 1, null, '2025-10-01', '2025-10-01'),
                    new Flashcard(2, 'Q2', 'A2', 'hard', 1, null, '2025-10-01', '2025-10-01'),
                ],
                'total' => 2,
                'page' => 1,
                'per_page' => 10,
                'total_pages' => 1
            ]);
        
        $service = new FlashcardService($mockRepo);
        $result = $service->getAllFlashcardsPaginated(1, 10);
        
        $this->assertIsArray($result);
        $this->assertArrayHasKey('data', $result);
        $this->assertArrayHasKey('total', $result);
        $this->assertArrayHasKey('page', $result);
        $this->assertArrayHasKey('per_page', $result);
        $this->assertArrayHasKey('total_pages', $result);
        
        $this->assertCount(2, $result['data']);
        $this->assertEquals(2, $result['total']);
        $this->assertEquals(1, $result['page']);
    }
    
    public function testGetAllFlashcardsPaginatedThrowsExceptionForInvalidPage(): void
    {
        $mockRepo = $this->createRepositoryMock();
        $service = new FlashcardService($mockRepo);
        
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('Page must be greater than 0');
        $service->getAllFlashcardsPaginated(0, 10);
    }
    
    public function testGetAllFlashcardsPaginatedThrowsExceptionForInvalidPerPage(): void
    {
        $mockRepo = $this->createRepositoryMock();
        $service = new FlashcardService($mockRepo);
        
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('Per page must be between 1 and 100');
        $service->getAllFlashcardsPaginated(1, 101);
    }
    
    public function testGetAllFlashcardsPaginatedValidatesDifficulty(): void
    {
        $mockRepo = $this->createRepositoryMock();
        $service = new FlashcardService($mockRepo);
        
        $this->expectException(\InvalidArgumentException::class);
        $service->getAllFlashcardsPaginated(1, 10, null, 'invalid');
    }
}
