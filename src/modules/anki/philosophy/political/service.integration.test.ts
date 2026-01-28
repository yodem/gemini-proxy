import { describe, test, expect, beforeEach } from 'bun:test';
import { PoliticalPhilosophyFlashcardsService } from './service';

// Skip integration tests if explicitly disabled or if API key is missing
const SKIP_INTEGRATION = process.env.SKIP_INTEGRATION_TESTS === 'true' || !process.env.GOOGLE_API_KEY;

if (SKIP_INTEGRATION) {
  console.log('⏭️  Skipping integration tests (SKIP_INTEGRATION_TESTS=true or GOOGLE_API_KEY not set)');
}

/**
 * Integration Tests for Multi-Turn Conversation Functionality
 *
 * These tests make ACTUAL API calls to Gemini to verify:
 * - Conversation history is properly maintained
 * - ChatSession reuse works correctly
 * - History limiting strategy (first + last exchange) functions as expected
 * - System instructions are only sent in the first message
 *
 * ⚠️ WARNING: These tests consume API quota!
 *
 * To run these tests:
 * 1. Set GOOGLE_API_KEY environment variable
 * 2. Run: bun test src/modules/anki/philosophy/political/service.integration.test.ts
 *
 * To skip these tests:
 * - Set SKIP_INTEGRATION_TESTS=true
 */

const describeIntegration = SKIP_INTEGRATION ? describe.skip : describe;

describeIntegration('PoliticalPhilosophyFlashcardsService - Integration Tests', () => {

  // Clear all conversation history before each test to ensure isolation
  beforeEach(() => {
    // @ts-ignore - accessing private static properties for testing
    PoliticalPhilosophyFlashcardsService.chatSessions.clear();
    // @ts-ignore
    PoliticalPhilosophyFlashcardsService.chatHistory.clear();
    // @ts-ignore
    PoliticalPhilosophyFlashcardsService.conversationInitialized.clear();
  });

  test('should generate flashcards from a single request', async () => {
    const input = {
      paragraph: 'לפי הובס, המצב הטבעי הוא מצב של מלחמת כולם נגד כולם. בהיעדר ריבון מוסכם, כל אדם פועל לפי הזכות לטבע לשימור עצמי, מה שיוצר חוסר ביטחון תמידי.',
      thinker: 'Thomas Hobbes',
      work: 'Leviathan',
      chapter: 'Chapter 13',
      language: 'he' as const,
      extraCards: false
    };

    const result = await PoliticalPhilosophyFlashcardsService.generateFlashcards(input);

    // Verify basic response structure
    expect(result).toBeDefined();
    expect(result.flashcards).toBeInstanceOf(Array);
    expect(result.flashcards.length).toBeGreaterThan(0);
    expect(result.metadata).toBeDefined();
    expect(result.metadata.thinker).toBe('Thomas Hobbes');
    expect(result.metadata.work).toBe('Leviathan');

    // Verify flashcard structure
    const card = result.flashcards[0];
    expect(card.type).toBeDefined();
    expect(card.front).toBeDefined();
    expect(card.back).toBeDefined();
    expect(card.context_logic).toBeDefined();
    expect(card.tags).toBeInstanceOf(Array);

    console.log('✅ Single request test passed');
    console.log(`   Generated ${result.flashcards.length} flashcard(s)`);
  }, 30000); // 30 second timeout for API call

  test('should maintain conversation context across multiple requests', async () => {
    const thinker = 'John Locke';
    const work = 'Two Treatises of Government';

    // First request
    const result1 = await PoliticalPhilosophyFlashcardsService.generateFlashcards({
      paragraph: 'לפי לוק, המצב הטבעי הוא מצב של חירות ושוויון, אך לא מצב של התפקרות. בני אדם נמצאים תחת חוק הטבע שמחייב אותם לכבד את זכויותיהם ההדדיות.',
      thinker,
      work,
      language: 'he' as const
    });

    expect(result1.flashcards.length).toBeGreaterThan(0);
    console.log('✅ First request completed');

    // Second request - should reuse conversation
    const result2 = await PoliticalPhilosophyFlashcardsService.generateFlashcards({
      paragraph: 'לוק טוען שכאשר המדינה מפרה את חוק הטבע, האנשים רשאים למרוד בה ולהקים ממשל חדש.',
      thinker,
      work,
      language: 'he' as const
    });

    expect(result2.flashcards.length).toBeGreaterThan(0);
    console.log('✅ Second request completed (conversation reused)');

    // Verify conversation history was maintained
    // @ts-ignore - accessing private static properties for testing
    const conversationKey = `${thinker}|${work}`;
    // @ts-ignore
    const history = PoliticalPhilosophyFlashcardsService.chatHistory.get(conversationKey);

    expect(history).toBeDefined();
    expect(history!.length).toBe(4); // First user + first model + second user + second model
    expect(history![0].role).toBe('user');
    expect(history![1].role).toBe('model');
    expect(history![2].role).toBe('user');
    expect(history![3].role).toBe('model');

    console.log('✅ Multi-turn conversation test passed');
    console.log(`   History length: ${history!.length} items`);
  }, 60000); // 60 second timeout for multiple API calls

  test('should limit conversation history to first + last exchange', async () => {
    const thinker = 'Jean-Jacques Rousseau';
    const work = 'The Social Contract';

    const paragraphs = [
      'רוסו טוען שהאדם נולד חופשי אך בכל מקום הוא בכבלים.',
      'החוזה החברתי מאפשר לאדם להשתחרר מהכבלים של החברה.',
      'הרצון הכללי מייצג את הטוב המשותף של כלל האזרחים.',
      'הריבון הוא עצמו העם, ולא יכול להיות מופרד ממנו.',
      'החוק הוא ביטוי של הרצון הכללי ולכן תקף לכולם באופן שווה.'
    ];

    // Send 5 requests sequentially
    for (let i = 0; i < paragraphs.length; i++) {
      await PoliticalPhilosophyFlashcardsService.generateFlashcards({
        paragraph: paragraphs[i],
        thinker,
        work,
        language: 'he' as const
      });
      console.log(`✅ Request ${i + 1}/5 completed`);
    }

    // Verify history is limited to 4 items (first exchange + last exchange)
    // @ts-ignore
    const conversationKey = `${thinker}|${work}`;
    // @ts-ignore
    const history = PoliticalPhilosophyFlashcardsService.chatHistory.get(conversationKey);

    expect(history).toBeDefined();
    expect(history!.length).toBe(4); // Should stay at 4, not grow to 10

    // Verify structure: first user, first model, last user, last model
    expect(history![0].role).toBe('user'); // First request
    expect(history![1].role).toBe('model'); // First response
    expect(history![2].role).toBe('user'); // Last request (5th)
    expect(history![3].role).toBe('model'); // Last response (5th)

    // Verify first message contains system instruction (longer)
    expect(history![0].parts[0].text.length).toBeGreaterThan(history![2].parts[0].text.length);

    console.log('✅ History limiting test passed');
    console.log(`   After 5 requests, history length: ${history!.length} items (expected 4)`);
  }, 120000); // 120 second timeout for 5 sequential API calls

  test('should clear old conversation when switching works', async () => {
    const thinker = 'Immanuel Kant';

    // First conversation with one work
    await PoliticalPhilosophyFlashcardsService.generateFlashcards({
      paragraph: 'קאנט טוען שהקטגורי אימפרטיב הוא העיקרון המוסרי העליון.',
      thinker,
      work: 'Groundwork of the Metaphysics of Morals',
      language: 'he' as const
    });

    // @ts-ignore
    const key1 = `${thinker}|Groundwork of the Metaphysics of Morals`;
    // @ts-ignore
    expect(PoliticalPhilosophyFlashcardsService.chatHistory.has(key1)).toBe(true);

    console.log('✅ First work conversation created');

    // Switch to different work - should clear old history
    await PoliticalPhilosophyFlashcardsService.generateFlashcards({
      paragraph: 'בשלום הנצחי, קאנט טוען שדמוקרטיות רפובליקניות נוטות פחות למלחמה.',
      thinker,
      work: 'Perpetual Peace',
      language: 'he' as const
    });

    // @ts-ignore
    const key2 = `${thinker}|Perpetual Peace`;
    // @ts-ignore
    expect(PoliticalPhilosophyFlashcardsService.chatHistory.has(key1)).toBe(false); // Old history cleared
    // @ts-ignore
    expect(PoliticalPhilosophyFlashcardsService.chatHistory.has(key2)).toBe(true); // New history exists

    console.log('✅ Work switching test passed');
    console.log('   Old conversation cleared, new conversation created');
  }, 60000);

  test('should maintain separate conversations for different thinkers', async () => {
    // Start two parallel conversations
    const request1 = PoliticalPhilosophyFlashcardsService.generateFlashcards({
      paragraph: 'מקיאוולי טוען שהנסיך צריך להיות גם אריה וגם שועל.',
      thinker: 'Niccolò Machiavelli',
      work: 'The Prince',
      language: 'he' as const
    });

    const request2 = PoliticalPhilosophyFlashcardsService.generateFlashcards({
      paragraph: 'מיל טוען שחופש הביטוי הוא ערך עליון גם כשהדעות שגויות.',
      thinker: 'John Stuart Mill',
      work: 'On Liberty',
      language: 'he' as const
    });

    // Wait for both to complete
    const [result1, result2] = await Promise.all([request1, request2]);

    expect(result1.flashcards.length).toBeGreaterThan(0);
    expect(result2.flashcards.length).toBeGreaterThan(0);

    // Verify separate conversation histories exist
    // @ts-ignore
    const key1 = `Niccolò Machiavelli|The Prince`;
    // @ts-ignore
    const key2 = `John Stuart Mill|On Liberty`;
    // @ts-ignore
    expect(PoliticalPhilosophyFlashcardsService.chatHistory.has(key1)).toBe(true);
    // @ts-ignore
    expect(PoliticalPhilosophyFlashcardsService.chatHistory.has(key2)).toBe(true);

    console.log('✅ Parallel conversations test passed');
    console.log('   Two separate conversation histories maintained');
  }, 60000);

  test('should include system instruction only in first message', async () => {
    const thinker = 'Karl Marx';
    const work = 'Das Kapital';

    // First request
    await PoliticalPhilosophyFlashcardsService.generateFlashcards({
      paragraph: 'מרקס טוען שערך הסחורה נקבע על פי כמות העבודה החברתית הדרושה לייצורה.',
      thinker,
      work,
      language: 'he' as const
    });

    // Second request
    await PoliticalPhilosophyFlashcardsService.generateFlashcards({
      paragraph: 'ערך העבודה מחולק לערך שימוש וערך חליפין.',
      thinker,
      work,
      language: 'he' as const
    });

    // @ts-ignore
    const conversationKey = `${thinker}|${work}`;
    // @ts-ignore
    const history = PoliticalPhilosophyFlashcardsService.chatHistory.get(conversationKey);

    expect(history).toBeDefined();
    expect(history!.length).toBe(4);

    // First user message should contain system instruction (much longer)
    const firstMessageLength = history![0].parts[0].text.length;
    const secondMessageLength = history![2].parts[0].text.length;

    expect(firstMessageLength).toBeGreaterThan(secondMessageLength * 2);

    // Verify first message contains key system instruction phrases
    const firstMessage = history![0].parts[0].text;
    expect(firstMessage).toContain('אתה מומחה לפילוסופיה פוליטית');
    expect(firstMessage).toContain('Anki');

    // Verify second message does NOT contain system instruction
    const secondMessage = history![2].parts[0].text;
    expect(secondMessage).not.toContain('אתה מומחה לפילוסופיה פוליטית');

    console.log('✅ System instruction test passed');
    console.log(`   First message length: ${firstMessageLength} characters`);
    console.log(`   Second message length: ${secondMessageLength} characters`);
  }, 60000);
});
