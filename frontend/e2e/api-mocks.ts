import { Page } from "@playwright/test";

export interface Flashcard {
  id: number;
  front: string;
  back: string;
  difficulty: "not_studied" | "easy" | "medium" | "hard";
  study_count: number;
  last_studied_at: string | null;
  created_at: string;
  updated_at: string;
}

let mockFlashcards: Flashcard[] = [];
let nextId = 1;

/**
 * Setup API mocks for all flashcard endpoints
 */
export async function setupApiMocks(page: Page) {
  // Reset state
  mockFlashcards = [];
  nextId = 1;

  // Intercept all API calls to /api/flashcards
  await page.route("**/api/flashcards**", async (route) => {
    const url = route.request().url();
    const method = route.request().method();
    
    console.log(`[MOCK] Intercepted: ${method} ${url}`);

    // GET /api/flashcards - List all flashcards (with pagination)
    if (method === "GET" && url.includes("/flashcards")) {
      const urlObj = new URL(url);
      const page = parseInt(urlObj.searchParams.get('page') || '1');
      const perPage = parseInt(urlObj.searchParams.get('per_page') || '1000');
      
      const start = (page - 1) * perPage;
      const end = start + perPage;
      const paginatedData = mockFlashcards.slice(start, end);
      const total = mockFlashcards.length;
      const totalPages = Math.ceil(total / perPage);
      
      console.log(`[MOCK] Returning page ${page} with ${paginatedData.length} flashcards (total: ${total})`);
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: paginatedData,
          total: total,
          page: page,
          per_page: perPage,
          total_pages: totalPages
        }),
      });
      return;
    }

    // POST /api/flashcards - Create flashcard
    if (method === "POST" && url.endsWith("/flashcards")) {
      const data = route.request().postDataJSON();
      const newFlashcard: Flashcard = {
        id: nextId++,
        front: data.front,
        back: data.back,
        difficulty: "not_studied",
        study_count: 0,
        last_studied_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      mockFlashcards.push(newFlashcard);
      
      console.log(`[MOCK] Created flashcard #${newFlashcard.id}`);
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({ data: newFlashcard }),
      });
      return;
    }

    // PUT /api/flashcards/:id - Update flashcard
    if (method === "PUT" && url.includes("/flashcards/")) {
      const id = parseInt(url.split("/").pop() || "0");
      const data = route.request().postDataJSON();
      const index = mockFlashcards.findIndex((f) => f.id === id);

      if (index !== -1) {
        mockFlashcards[index] = {
          ...mockFlashcards[index],
          ...data,
          updated_at: new Date().toISOString(),
        };

        console.log(`[MOCK] Updated flashcard #${id}`);
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ data: mockFlashcards[index] }),
        });
      } else {
        await route.fulfill({
          status: 404,
          contentType: "application/json",
          body: JSON.stringify({ error: "Flashcard not found" }),
        });
      }
      return;
    }

    // DELETE /api/flashcards/:id
    if (method === "DELETE") {
      const urlParts = url.split("/");
      const lastPart = urlParts[urlParts.length - 1];
      const id = parseInt(lastPart);
      
      console.log(`[MOCK] DELETE request - URL: ${url}`);
      console.log(`[MOCK] Extracted ID: ${id} from lastPart: ${lastPart}`);
      console.log(`[MOCK] Current flashcards:`, mockFlashcards.map(f => ({ id: f.id, front: f.front })));
      
      if (isNaN(id)) {
        console.log(`[MOCK] Invalid ID, continuing to next route`);
        await route.continue();
        return;
      }
      
      const index = mockFlashcards.findIndex((f) => f.id === id);
      console.log(`[MOCK] Found at index: ${index}`);

      if (index !== -1) {
        const deleted = mockFlashcards.splice(index, 1)[0];
        console.log(`[MOCK] ✅ Deleted flashcard #${id} (${deleted.front}), remaining:`, mockFlashcards.length);
        await route.fulfill({
          status: 204,
          body: "",
        });
      } else {
        console.log(`[MOCK] ❌ Flashcard #${id} not found!`);
        await route.fulfill({
          status: 404,
          contentType: "application/json",
          body: JSON.stringify({ error: "Flashcard not found" }),
        });
      }
      return;
    }

    // If no route matched, continue with the request
    await route.continue();
  });
}

/**
 * Seed initial flashcards for testing
 */
export async function seedFlashcards(flashcards: Array<{ front: string; back: string }>) {
  mockFlashcards = flashcards.map((card) => ({
    id: nextId++,
    front: card.front,
    back: card.back,
    difficulty: 'not_studied' as const,
    study_count: 0,
    last_studied_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));
}

/**
 * Clear all mock flashcards
 */
export function clearMockFlashcards() {
  mockFlashcards = [];
  nextId = 1;
}

/**
 * Get current mock flashcards
 */
export function getMockFlashcards(): Flashcard[] {
  return [...mockFlashcards];
}
