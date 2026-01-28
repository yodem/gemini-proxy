import { type ChatSession } from '@google/generative-ai';
import { PhilosophyFlashcardsService, type Flashcard, type DomainContext, type GenerateFlashcardsInput, type GenerateFlashcardsResult } from '../base/service';
import { cleanResponseText } from '../../../shared/categoryUtils';

// Types for political philosophy
type FlashcardType = 'Concept' | 'Argument' | 'Context' | 'Contrast';

interface PoliticalFlashcard extends Flashcard {
  type: FlashcardType;
  context_logic: string;
  tags: string[];
}

/**
 * Political Philosophy Flashcards Service
 *
 * Specializes the base PhilosophyFlashcardsService for political philosophy texts.
 * Implements domain-specific context and conversation management
 * strategies optimized for analyzing works by political philosophers.
 */
export class PoliticalPhilosophyFlashcardsService extends PhilosophyFlashcardsService {

  /**
   * Clears old conversation history for a thinker when switching to a different work
   * This ensures fresh context when switching between works
   */
  private static clearHistoryForThinker(thinker: string, currentWork: string): void {
    // Find and remove all conversation history for this thinker that are NOT for the current work
    for (const [conversationKey] of this.chatSessions.entries()) {
      if (conversationKey.startsWith(`${thinker}|`) && !conversationKey.endsWith(`|${currentWork}`)) {
        console.log(`🔄 [PoliticalPhilosophyService] Clearing old conversation history for different work: ${conversationKey}`);
        this.chatSessions.delete(conversationKey);
        this.chatHistory.delete(conversationKey);
        this.conversationInitialized.delete(conversationKey);
      }
    }
  }

  /**
   * Gets or creates a ChatSession, calling clearHistoryForThinker before parent implementation
   */
  private static getOrCreateChatSessionWithCleanup(
    conversationKey: string,
    thinker: string,
    work: string
  ): ChatSession {
    const existingSession = this.chatSessions.get(conversationKey);
    if (existingSession) {
      console.log('💬 [PoliticalPhilosophyService] Reusing existing ChatSession for:', conversationKey);
      return existingSession;
    }

    // Clear old conversations for this thinker when switching works
    this.clearHistoryForThinker(thinker, work);

    // Call parent implementation to create new session
    return super.getOrCreateChatSession(conversationKey);
  }

  /**
   * Returns domain-specific context for political philosophy
   */
  protected static override getDomainContext(language: 'he' | 'en' = 'he'): DomainContext {
    if (language === 'en') {
      return {
        expertise: 'political philosophy',
      };
    }

    return {
      expertise: 'פילוסופיה פוליטית',
      example: `דוגמה ליישום:
אם הפסקה עוסקת ב"המצב הטבעי" של הובס, כרטיס יכול להיראות כך:
{
  "type": "Argument",
  "front": "מדוע, לפי הובס, \\"המצב הטבעי\\" הוא בהכרח מצב של מלחמה (Bellum omnium contra omnes)?",
  "back": "בשל השילוב בין שוויון ביכולת להרוג, מחסור במשאבים, והיעדר ריבון מוסכם המטיל מורא.",
  "context_logic": "היעדר סמכות מרכזית מוביל לכך שכל אדם פועל לפי 'הזכות לטבע' לשימור עצמי, מה שיוצר חוסר ביטחון תמידי.",
  "tags": ["Argument", "הובס", "לויתן", "מצב הטבע", "מלחמת הכל בכל"]
}`,
    };
  }

  /**
   * Generates conversation key from thinker and work
   */
  protected static override generateConversationKey(input: GenerateFlashcardsInput): string {
    return `${input.thinker}|${input.work}`;
  }

  /**
   * Extracts metadata from input
   */
  protected static override getInputMetadata(input: GenerateFlashcardsInput): Record<string, string> {
    const metadata: Record<string, string> = {
      thinker: input.thinker,
      work: input.work
    };
    if (input.chapter) {
      metadata.chapter = input.chapter;
    }
    return metadata;
  }

  /**
   * Validates input data for political philosophy
   */
  static override validateInput(input: GenerateFlashcardsInput): void {
    console.log('✅ [PoliticalPhilosophyService] Starting input validation');

    const { paragraph, thinker, work } = input;

    if (!paragraph || typeof paragraph !== 'string' || paragraph.trim().length === 0) {
      console.log('❌ [PoliticalPhilosophyService] Paragraph is empty or invalid');
      throw new Error('הפסקה לניתוח היא שדה חובה ולא יכולה להיות ריקה');
    }

    if (paragraph.trim().length < 20) {
      console.log('❌ [PoliticalPhilosophyService] Paragraph too short:', paragraph.length);
      throw new Error('הפסקה קצרה מדי. יש להזין לפחות 20 תווים');
    }

    if (!thinker || typeof thinker !== 'string' || thinker.trim().length === 0) {
      console.log('❌ [PoliticalPhilosophyService] Thinker is empty or invalid');
      throw new Error('שם ההוגה הוא שדה חובה');
    }

    if (!work || typeof work !== 'string' || work.trim().length === 0) {
      console.log('❌ [PoliticalPhilosophyService] Work is empty or invalid');
      throw new Error('שם היצירה הוא שדה חובה');
    }

    console.log('✅ [PoliticalPhilosophyService] All input validation passed');
  }

  /**
   * Parses and validates flashcard response with strict political philosophy rules
   */
  protected static override parseFlashcardsResponse(
    responseText: string,
    input: GenerateFlashcardsInput
  ): PoliticalFlashcard[] {
    try {
      const cleanText = cleanResponseText(responseText);
      const parsed = JSON.parse(cleanText);

      if (!parsed.flashcards || !Array.isArray(parsed.flashcards)) {
        throw new Error('Response does not contain flashcards array');
      }

      // Validate and transform each flashcard with strict rules
      const validFlashcards: PoliticalFlashcard[] = parsed.flashcards
        .filter((card: any) => {
          return (
            card &&
            typeof card.type === 'string' &&
            ['Concept', 'Argument', 'Context', 'Contrast'].includes(card.type) &&
            typeof card.front === 'string' &&
            typeof card.back === 'string' &&
            typeof card.context_logic === 'string'
          );
        })
        .map((card: any) => ({
          type: card.type as FlashcardType,
          front: card.front.trim(),
          back: card.back.trim(),
          context_logic: card.context_logic.trim(),
          tags: Array.isArray(card.tags)
            ? card.tags.filter((tag: any) => typeof tag === 'string')
            : [card.type, input.thinker, input.work, ...(input.chapter ? [input.chapter] : [])]
        }));

      if (validFlashcards.length === 0) {
        console.warn('⚠️ [PoliticalPhilosophyService] No valid flashcards found in response, creating fallback');
        return [{
          type: 'Concept',
          front: `מהו הרעיון המרכזי בקטע זה של ${input.thinker}?`,
          back: 'לא ניתן היה לעבד את הפסקה. אנא נסה שוב או הזן פסקה ארוכה יותר.',
          context_logic: 'יש לוודא שהפסקה מכילה תוכן פילוסופי מספיק לניתוח.',
          tags: ['Error', input.thinker, input.work]
        }];
      }

      return validFlashcards;

    } catch (parseError) {
      console.error('❌ [PoliticalPhilosophyService] Failed to parse flashcards response:', responseText);

      // Return a fallback flashcard
      return [{
        type: 'Concept',
        front: `מהו הרעיון המרכזי בקטע זה של ${input.thinker}?`,
        back: 'לא ניתן היה לעבד את התשובה מהמערכת. אנא נסה שוב.',
        context_logic: 'אירעה שגיאה בעיבוד התשובה.',
        tags: ['Error', input.thinker, input.work]
      }];
    }
  }

  /**
   * Public API method for generating flashcards
   */
  static override async generateFlashcards(
    input: GenerateFlashcardsInput
  ): Promise<GenerateFlashcardsResult> {
    const { language = 'he', extraCards = false } = input;

    console.log('📚 [PoliticalPhilosophyService] Starting flashcard generation');
    console.log('👤 [PoliticalPhilosophyService] Thinker:', input.thinker);
    console.log('📖 [PoliticalPhilosophyService] Work:', input.work);
    console.log('📄 [PoliticalPhilosophyService] Chapter:', input.chapter || 'Not specified');
    console.log('🌐 [PoliticalPhilosophyService] Language:', language);
    console.log('➕ [PoliticalPhilosophyService] Extra Cards Mode:', extraCards);

    try {
      // Get conversation key and check if first message
      const conversationKey = this.generateConversationKey(input);
      const isFirstMessage = !this.conversationInitialized.has(conversationKey);

      // Get or create ChatSession with cleanup for work switching
      const chat = this.getOrCreateChatSessionWithCleanup(conversationKey, input.thinker, input.work);

      // Mark conversation as initialized
      if (isFirstMessage) {
        this.conversationInitialized.add(conversationKey);
        console.log('📋 [PoliticalPhilosophyService] System instruction included in first message');
      }

      // Build message content
      console.log('📝 [PoliticalPhilosophyService] Building message content...');
      const message = this.buildMessage(input, extraCards, isFirstMessage, language);
      console.log('✅ [PoliticalPhilosophyService] Message built successfully');

      // Send message to Gemini API
      console.log('🚀 [PoliticalPhilosophyService] Sending message to Gemini API...');
      const result = await chat.sendMessage(message);
      const response = await result.response;
      const text = response.text().trim();

      console.log('📡 [PoliticalPhilosophyService] Gemini API call completed');
      console.log('📄 [PoliticalPhilosophyService] Raw response text length:', text.length);

      // Store updated conversation history
      const currentHistory = this.chatHistory.get(conversationKey) || [];
      const newUserMessage = { role: "user" as const, parts: [{ text: message }] };
      const newModelResponse = { role: "model" as const, parts: [{ text }] };

      let updatedHistory;
      if (currentHistory.length === 0) {
        updatedHistory = [newUserMessage, newModelResponse];
      } else {
        const firstExchange = currentHistory.slice(0, 2);
        updatedHistory = [...firstExchange, newUserMessage, newModelResponse];
      }

      this.chatHistory.set(conversationKey, updatedHistory);
      console.log('💾 [PoliticalPhilosophyService] Conversation history updated');

      // Parse response
      console.log('🔧 [PoliticalPhilosophyService] Parsing and validating response...');
      const flashcards = this.parseFlashcardsResponse(text, input);

      console.log('✅ [PoliticalPhilosophyService] Response parsing completed successfully');
      console.log('📊 [PoliticalPhilosophyService] Total flashcards generated:', flashcards.length);

      return {
        flashcards,
        metadata: {
          thinker: input.thinker,
          work: input.work,
          chapter: input.chapter,
          totalCards: flashcards.length,
          conversationKey
        }
      };

    } catch (error) {
      console.error('❌ [PoliticalPhilosophyService] Error in flashcard generation:', error);
      throw new Error('Failed to generate flashcards from paragraph');
    }
  }
}
