import { type ChatSession } from '@google/generative-ai';
import { PhilosophyFlashcardsService, type Flashcard, type DomainContext, type GenerateFlashcardsInput, type GenerateFlashcardsResult } from '../base/service';
import { cleanResponseText } from '../../../shared/categoryUtils';

// Types for Kant philosophy
type FlashcardType = 'Concept' | 'Argument' | 'Context' | 'Contrast';

interface KantFlashcard extends Flashcard {
  type: FlashcardType;
  context_logic: string;
  tags: string[];
}

/**
 * Kant Philosophy Flashcards Service
 *
 * Specializes the base PhilosophyFlashcardsService for Kantian philosophy texts.
 * Implements domain-specific context focused on transcendental idealism,
 * categorical imperative, and critical philosophy.
 */
export class KantPhilosophyFlashcardsService extends PhilosophyFlashcardsService {

  /**
   * Clears old conversation history for a thinker when switching to a different work
   * This ensures fresh context when switching between works
   */
  private static clearHistoryForThinker(thinker: string, currentWork: string): void {
    // Find and remove all conversation history for this thinker that are NOT for the current work
    for (const [conversationKey] of this.chatSessions.entries()) {
      if (conversationKey.startsWith(`${thinker}|`) && !conversationKey.endsWith(`|${currentWork}`)) {
        console.log(`🔄 [KantPhilosophyService] Clearing old conversation history for different work: ${conversationKey}`);
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
      console.log('💬 [KantPhilosophyService] Reusing existing ChatSession for:', conversationKey);
      return existingSession;
    }

    // Clear old conversations for this thinker when switching works
    this.clearHistoryForThinker(thinker, work);

    // Call parent implementation to create new session
    return super.getOrCreateChatSession(conversationKey);
  }

  /**
   * Returns domain-specific context for Kantian philosophy
   */
  protected static override getDomainContext(language: 'he' | 'en' = 'he'): DomainContext {
    if (language === 'en') {
      return {
        expertise: 'Kantian philosophy and transcendental idealism',
      };
    }

    return {
      expertise: 'הפילוסופיה של קאנט והאידאליזם הטרנסצנדנטלי',
      example: `דוגמה ליישום:
אם הפסקה עוסקת ב"אימפרטיב קטגורי", כרטיס יכול להיראות כך:
{
  "type": "Concept",
  "front": "מהו האימפרטיב הקטגורי לפי קאנט?",
  "back": "ציווי מוחלט המחייב פעולה מתוך חובה, ללא תלות בנטיות או תוצאות - \\"פעל רק על פי מקסימה שתוכל גם לרצות שתהפוך לחוק כללי\\".",
  "context_logic": "האימפרטיב הקטגורי הוא עקרון היסוד של המוסר הקאנטיאני, המבוסס על אוטונומיה של התבונה ולא על השלכות.",
  "tags": ["Concept", "קאנט", "הנחות יסוד", "אימפרטיב קטגורי"]
}`,
      additionalInstructions: `הנחיות ספציפיות לקאנט:
- השתמש במונחים המקוריים: "אימפרטיב קטגורי", "תבונה מעשית", "אוטונומיה", "סינתזה א-פריורית", "תבונה טהורה"
- הדגש את הלוגיקה הטרנסצנדנטלית והארגומנטציה המושגית
- הבחן בין נטיות (Neigungen) לבין חובה (Pflicht)
- חבר רעיונות לתורת הקריטיקות (ביקורת התבונה הטהורה/המעשית/כוח השיפוט)
- שים לב להבחנות מרכזיות: תופעה/דבר-בעצמו, א-פריורי/א-פוסטריורי, אנליטי/סינתטי
- הדגש את מרכזיות האוטונומיה והחופש בפילוסופיה המוסרית`
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
   * Validates input data for Kant philosophy
   */
  static override validateInput(input: GenerateFlashcardsInput): void {
    console.log('✅ [KantPhilosophyService] Starting input validation');

    const { paragraph, thinker, work } = input;

    if (!paragraph || typeof paragraph !== 'string' || paragraph.trim().length === 0) {
      console.log('❌ [KantPhilosophyService] Paragraph is empty or invalid');
      throw new Error('הפסקה לניתוח היא שדה חובה ולא יכולה להיות ריקה');
    }

    if (paragraph.trim().length < 20) {
      console.log('❌ [KantPhilosophyService] Paragraph too short:', paragraph.length);
      throw new Error('הפסקה קצרה מדי. יש להזין לפחות 20 תווים');
    }

    if (!thinker || typeof thinker !== 'string' || thinker.trim().length === 0) {
      console.log('❌ [KantPhilosophyService] Thinker is empty or invalid');
      throw new Error('שם ההוגה הוא שדה חובה');
    }

    if (!work || typeof work !== 'string' || work.trim().length === 0) {
      console.log('❌ [KantPhilosophyService] Work is empty or invalid');
      throw new Error('שם היצירה הוא שדה חובה');
    }

    console.log('✅ [KantPhilosophyService] All input validation passed');
  }

  /**
   * Parses and validates flashcard response with strict Kant philosophy rules
   */
  protected static override parseFlashcardsResponse(
    responseText: string,
    input: GenerateFlashcardsInput
  ): KantFlashcard[] {
    try {
      const cleanText = cleanResponseText(responseText);
      const parsed = JSON.parse(cleanText);

      if (!parsed.flashcards || !Array.isArray(parsed.flashcards)) {
        throw new Error('Response does not contain flashcards array');
      }

      // Validate and transform each flashcard with strict rules
      const validFlashcards: KantFlashcard[] = parsed.flashcards
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
        console.warn('⚠️ [KantPhilosophyService] No valid flashcards found in response, creating fallback');
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
      console.error('❌ [KantPhilosophyService] Failed to parse flashcards response:', responseText);

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

    console.log('📚 [KantPhilosophyService] Starting flashcard generation');
    console.log('👤 [KantPhilosophyService] Thinker:', input.thinker);
    console.log('📖 [KantPhilosophyService] Work:', input.work);
    console.log('📄 [KantPhilosophyService] Chapter:', input.chapter || 'Not specified');
    console.log('🌐 [KantPhilosophyService] Language:', language);
    console.log('➕ [KantPhilosophyService] Extra Cards Mode:', extraCards);

    try {
      // Get conversation key and check if first message
      const conversationKey = this.generateConversationKey(input);
      const isFirstMessage = !this.conversationInitialized.has(conversationKey);

      // Get or create ChatSession with cleanup for work switching
      const chat = this.getOrCreateChatSessionWithCleanup(conversationKey, input.thinker, input.work);

      // Mark conversation as initialized
      if (isFirstMessage) {
        this.conversationInitialized.add(conversationKey);
        console.log('📋 [KantPhilosophyService] System instruction included in first message');
      }

      // Build message content
      console.log('📝 [KantPhilosophyService] Building message content...');
      const message = this.buildMessage(input, extraCards, isFirstMessage, language);
      console.log('✅ [KantPhilosophyService] Message built successfully');

      // Send message to Gemini API
      console.log('🚀 [KantPhilosophyService] Sending message to Gemini API...');
      const result = await chat.sendMessage(message);
      const response = await result.response;
      const text = response.text().trim();

      console.log('📡 [KantPhilosophyService] Gemini API call completed');
      console.log('📄 [KantPhilosophyService] Raw response text length:', text.length);

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
      console.log('💾 [KantPhilosophyService] Conversation history updated');

      // Parse response
      console.log('🔧 [KantPhilosophyService] Parsing and validating response...');
      const flashcards = this.parseFlashcardsResponse(text, input);

      console.log('✅ [KantPhilosophyService] Response parsing completed successfully');
      console.log('📊 [KantPhilosophyService] Total flashcards generated:', flashcards.length);

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
      console.error('❌ [KantPhilosophyService] Error in flashcard generation:', error);
      throw new Error('Failed to generate flashcards from paragraph');
    }
  }
}
