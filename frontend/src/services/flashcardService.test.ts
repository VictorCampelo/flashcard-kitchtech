import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import type { Flashcard } from '../types/flashcard';
import FlashcardService from './flashcardService';

// Mock the api module
vi.mock('./api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

import api from './api';

// Type the mocked API methods
const mockedApi = {
  get: api.get as Mock,
  post: api.post as Mock,
  put: api.put as Mock,
  delete: api.delete as Mock,
};

describe('FlashcardService', () => {
  const mockFlashcard: Flashcard = {
    id: 1,
    front: 'Test Question',
    back: 'Test Answer',
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    it('fetches all flashcards successfully', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: [mockFlashcard],
          count: 1,
        },
      };

      mockedApi.get.mockResolvedValue(mockResponse);

      const result = await FlashcardService.getAll();

      expect(result).toEqual([mockFlashcard]);
      expect(mockedApi.get).toHaveBeenCalledWith('/flashcards');
    });

    it('throws error when API call fails', async () => {
      mockedApi.get.mockRejectedValue(new Error('Network error'));

      await expect(FlashcardService.getAll()).rejects.toThrow('Network error');
    });
  });

  describe('getById', () => {
    it('fetches flashcard by ID successfully', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: mockFlashcard,
        },
      };

      mockedApi.get.mockResolvedValue(mockResponse);

      const result = await FlashcardService.getById(1);

      expect(result).toEqual(mockFlashcard);
      expect(mockedApi.get).toHaveBeenCalledWith('/flashcards/1');
    });

    it('throws error when flashcard not found', async () => {
      mockedApi.get.mockRejectedValue(new Error('Not found'));

      await expect(FlashcardService.getById(999)).rejects.toThrow('Not found');
    });
  });

  describe('create', () => {
    it('creates flashcard successfully', async () => {
      const newFlashcard = {
        front: 'New Question',
        back: 'New Answer',
      };

      const mockResponse = {
        data: {
          success: true,
          data: {
            id: 2,
            ...newFlashcard,
            created_at: '2025-01-01T00:00:00.000Z',
            updated_at: '2025-01-01T00:00:00.000Z',
          },
        },
      };

      mockedApi.post.mockResolvedValue(mockResponse);

      const result = await FlashcardService.create(newFlashcard);

      expect(result.front).toBe('New Question');
      expect(result.back).toBe('New Answer');
      expect(mockedApi.post).toHaveBeenCalledWith('/flashcards', newFlashcard);
    });

    it('throws error when creation fails', async () => {
      mockedApi.post.mockRejectedValue(new Error('Validation error'));

      await expect(
        FlashcardService.create({ front: '', back: '' })
      ).rejects.toThrow('Validation error');
    });
  });

  describe('update', () => {
    it('updates flashcard successfully', async () => {
      const updateData = {
        front: 'Updated Question',
        back: 'Updated Answer',
      };

      const mockResponse = {
        data: {
          success: true,
          data: {
            id: 1,
            ...updateData,
            created_at: '2025-01-01T00:00:00.000Z',
            updated_at: '2025-01-01T01:00:00.000Z',
          },
        },
      };

      mockedApi.put.mockResolvedValue(mockResponse);

      const result = await FlashcardService.update(1, updateData);

      expect(result.front).toBe('Updated Question');
      expect(result.back).toBe('Updated Answer');
      expect(mockedApi.put).toHaveBeenCalledWith('/flashcards/1', updateData);
    });

    it('throws error when update fails', async () => {
      mockedApi.put.mockRejectedValue(new Error('Not found'));

      await expect(
        FlashcardService.update(999, { front: 'Test', back: 'Test' })
      ).rejects.toThrow('Not found');
    });
  });

  describe('delete', () => {
    it('deletes flashcard successfully', async () => {
      mockedApi.delete.mockResolvedValue({ data: { success: true } });

      await FlashcardService.delete(1);

      expect(mockedApi.delete).toHaveBeenCalledWith('/flashcards/1');
    });

    it('throws error when deletion fails', async () => {
      mockedApi.delete.mockRejectedValue(new Error('Not found'));

      await expect(FlashcardService.delete(999)).rejects.toThrow('Not found');
    });
  });
});
