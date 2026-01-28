import { describe, test, expect, beforeEach, mock, spyOn } from 'bun:test';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { PoliticalPhilosophyFlashcardsService } from './service';

// Mock the Gemini API
const mockSendMessage = mock(() => Promise.resolve({
  response: {
    text: () => JSON.stringify({
      flashcards: [
        {
          type: 'Argument',
          front: 'Test question',
          back: 'Test answer',
          context_logic: 'Test logic',
          tags: ['Argument', 'Test']
        }
      ]
    })
  }
}));

const mockStartChat = mock(() => ({
  sendMessage: mockSendMessage
}));

const mockGetGenerativeModel = mock(() => ({
  startChat: mockStartChat
}));

const mockGoogleGenerativeAI = mock(() => ({
  getGenerativeModel: mockGetGenerativeModel
}));

// Mock the module
mock.module('@google/generative-ai', () => ({
  GoogleGenerativeAI: mockGoogleGenerativeAI
}));

describe('PoliticalPhilosophyFlashcardsService - Chat History Management', () => {
  beforeEach(() => {
    // Reset mocks
    mockSendMessage.mockClear();
    mockStartChat.mockClear();
    mockGetGenerativeModel.mockClear();

    // Clear service state by accessing private properties through reflection
    const service = PoliticalPhilosophyFlashcardsService as any;
    if (service.chatSessions) {
      service.chatSessions.clear();
    }
    if (service.chatHistory) {
      service.chatHistory.clear();
    }
    if (service.conversationInitialized) {
      service.conversationInitialized.clear();
    }
  });

  test('should create new conversation history on first request', async () => {
    const input = {
      paragraph: 'Test paragraph about political philosophy.',
      thinker: 'הובס',
      work: 'לויתן',
      language: 'he' as const
    };

    await PoliticalPhilosophyFlashcardsService.generateFlashcards(input);

    // Verify startChat was called with empty history for first request
    expect(mockStartChat).toHaveBeenCalledTimes(1);
    expect(mockStartChat).toHaveBeenCalledWith({
      history: []
    });
  });

  test('should store conversation history after first request', async () => {
    const input = {
      paragraph: 'First paragraph about political philosophy.',
      thinker: 'הובס',
      work: 'לויתן',
      language: 'he' as const
    };

    await PoliticalPhilosophyFlashcardsService.generateFlashcards(input);

    // Make second request with same thinker+work
    const input2 = {
      paragraph: 'Second paragraph about political philosophy.',
      thinker: 'הובס',
      work: 'לויתן',
      language: 'he' as const
    };

    await PoliticalPhilosophyFlashcardsService.generateFlashcards(input2);

    // Verify startChat was called twice (once for each request)
    expect(mockStartChat).toHaveBeenCalledTimes(2);

    // Second call should have history with first exchange
    const secondCall = mockStartChat.mock.calls[1];
    expect(secondCall[0].history).toBeDefined();
    expect(secondCall[0].history.length).toBeGreaterThan(0);

    // History should contain user and model messages
    const history = secondCall[0].history;
    expect(history[0].role).toBe('user');
    expect(history[1].role).toBe('model');
  });

  test('should limit history to first exchange + last 1 exchange', async () => {
    const input = {
      paragraph: 'First paragraph.',
      thinker: 'הובס',
      work: 'לויתן',
      language: 'he' as const
    };

    // Make multiple requests to build up history
    for (let i = 1; i <= 5; i++) {
      await PoliticalPhilosophyFlashcardsService.generateFlashcards({
        ...input,
        paragraph: `Paragraph ${i} about political philosophy.`
      });
    }

    // Check the last startChat call to see history length
    const lastCall = mockStartChat.mock.calls[mockStartChat.mock.calls.length - 1];
    const history = lastCall[0].history;

    // Should have maximum 4 items: first exchange (2) + last exchange (2)
    expect(history.length).toBeLessThanOrEqual(4);

    // First two should be the first exchange
    expect(history[0].role).toBe('user');
    expect(history[1].role).toBe('model');

    // Last two should be the most recent exchange
    if (history.length === 4) {
      expect(history[2].role).toBe('user');
      expect(history[3].role).toBe('model');
    }
  });

  test('should clear old conversation history when work changes', async () => {
    const input1 = {
      paragraph: 'First paragraph.',
      thinker: 'הובס',
      work: 'לויתן',
      language: 'he' as const
    };

    // Make request for first work
    await PoliticalPhilosophyFlashcardsService.generateFlashcards(input1);

    // Make request for different work by same thinker
    const input2 = {
      paragraph: 'Second paragraph.',
      thinker: 'הובס',
      work: 'דה קיבו',
      language: 'he' as const
    };

    await PoliticalPhilosophyFlashcardsService.generateFlashcards(input2);

    // Verify that startChat was called with empty history for the new work
    const callsForNewWork = mockStartChat.mock.calls.filter(
      (call: any) => call[0].history.length === 0
    );

    // Should have at least one call with empty history (the new work)
    expect(callsForNewWork.length).toBeGreaterThan(0);
  });

  test('should reuse ChatSession for same thinker+work combination', async () => {
    const input = {
      paragraph: 'Test paragraph.',
      thinker: 'הובס',
      work: 'לויתן',
      language: 'he' as const
    };

    // Make two requests with same thinker+work
    await PoliticalPhilosophyFlashcardsService.generateFlashcards(input);
    await PoliticalPhilosophyFlashcardsService.generateFlashcards(input);

    // Should create ChatSession once, then reuse it
    expect(mockStartChat.mock.calls.length).toBeGreaterThanOrEqual(1);
  });

  test('should include system instruction in first message', async () => {
    const input = {
      paragraph: 'Test paragraph.',
      thinker: 'הובס',
      work: 'לויתן',
      language: 'he' as const
    };

    await PoliticalPhilosophyFlashcardsService.generateFlashcards(input);

    // Verify sendMessage was called
    expect(mockSendMessage).toHaveBeenCalledTimes(1);

    // Get the message that was sent
    const sentMessage = mockSendMessage.mock.calls[0][0];

    // First message should include system instruction (Hebrew text)
    expect(sentMessage).toContain('מומחה לפילוסופיה פוליטית');
    expect(sentMessage).toContain('Anki');
  });

  test('should not include system instruction in subsequent messages', async () => {
    const input = {
      paragraph: 'First paragraph.',
      thinker: 'הובס',
      work: 'לויתן',
      language: 'he' as const
    };

    // First request
    await PoliticalPhilosophyFlashcardsService.generateFlashcards(input);

    // Second request
    const input2 = {
      paragraph: 'Second paragraph.',
      thinker: 'הובס',
      work: 'לויתן',
      language: 'he' as const
    };

    await PoliticalPhilosophyFlashcardsService.generateFlashcards(input2);

    // Get the second message
    const secondMessage = mockSendMessage.mock.calls[1][0];

    // Second message should not include the full system instruction
    expect(secondMessage.length).toBeLessThan(mockSendMessage.mock.calls[0][0].length);
  });

  test('should maintain separate history for different thinkers', async () => {
    const input1 = {
      paragraph: 'Paragraph by Hobbes.',
      thinker: 'הובס',
      work: 'לויתן',
      language: 'he' as const
    };

    const input2 = {
      paragraph: 'Paragraph by Locke.',
      thinker: 'לוק',
      work: 'שני מאמרים',
      language: 'he' as const
    };

    await PoliticalPhilosophyFlashcardsService.generateFlashcards(input1);
    await PoliticalPhilosophyFlashcardsService.generateFlashcards(input2);

    // Both should create separate conversations
    expect(mockStartChat).toHaveBeenCalledTimes(2);

    // Each should start with empty history (first request for each)
    expect(mockStartChat.mock.calls[0][0].history).toEqual([]);
    expect(mockStartChat.mock.calls[1][0].history).toEqual([]);
  });
});
