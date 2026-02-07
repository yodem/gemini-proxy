import { type ChatSession } from '@google/generative-ai';
import { PhilosophyFlashcardsService, type Flashcard, type DomainContext, type GenerateFlashcardsResult } from '../philosophy/base/service';
import { cleanResponseText } from '../../shared/categoryUtils';

// Types for Bible flashcards
type BibleFlashcardType = 'Concept' | 'Argument' | 'Context' | 'Contrast' | 'Verse' | 'Verse-Text Relation';

interface BibleFlashcard extends Flashcard {
  type: BibleFlashcardType;
  context_logic: string;
  tags: string[];
}

/**
 * Bible Flashcards Service
 *
 * Specializes the base PhilosophyFlashcardsService for academic Bible (תנ״ך) texts.
 * Implements domain-specific context and conversation management
 * strategies optimized for analyzing scholarly Biblical content.
 *
 * Features verse-aware deep analysis mode that detects inline verse references
 * and generates flashcards about the verses themselves and their relationships
 * to the scholarly commentary.
 */
export class BibleFlashcardsService extends PhilosophyFlashcardsService {

  /**
   * Clears old conversation history for a course when switching to a different book
   * This ensures fresh context when switching between books
   */
  private static clearHistoryForCourse(course: string, currentBook: string): void {
    // Find and remove all conversation history for this course that are NOT for the current book
    for (const [conversationKey] of this.chatSessions.entries()) {
      if (conversationKey.startsWith(`${course}|`) && !conversationKey.endsWith(`|${currentBook}`)) {
        console.log(`🔄 [BibleFlashcardsService] Clearing old conversation history for different book: ${conversationKey}`);
        this.chatSessions.delete(conversationKey);
        this.chatHistory.delete(conversationKey);
        this.conversationInitialized.delete(conversationKey);
      }
    }
  }

  /**
   * Gets or creates a ChatSession, calling clearHistoryForCourse before parent implementation
   */
  private static getOrCreateChatSessionWithCleanup(
    conversationKey: string,
    course: string,
    book: string
  ): ChatSession {
    const existingSession = this.chatSessions.get(conversationKey);
    if (existingSession) {
      console.log('💬 [BibleFlashcardsService] Reusing existing ChatSession for:', conversationKey);
      return existingSession;
    }

    // Clear old conversations for this course when switching books
    this.clearHistoryForCourse(course, book);

    // Call parent implementation to create new session
    return super.getOrCreateChatSession(conversationKey);
  }

  /**
   * Returns domain-specific context for academic Bible
   */
  protected static override getDomainContext(language: 'he' | 'en' = 'he'): DomainContext {
    if (language === 'en') {
      return {
        expertise: 'academic Bible (Tanakh) analysis',
        additionalInstructions: `
Special Instructions for Bible Analysis:
- Treat Tanakh (תנ״ך) as an academic text with historical and literary contexts
- Do NOT include Mishnah, Talmud, or other rabbinical texts unless explicitly cited
- Focus on textual analysis, scholarly interpretation, and historical context
- Use academic frameworks (source criticism, literary analysis, historical-cultural background)
`
      };
    }

    return {
      expertise: 'תנ״ך אקדמי',
      example: `דוגמה ליישום:
אם הפסקה עוסקת בסיפור גדעון, כרטיס יכול להיראות כך:
{
  "type": "Argument",
  "front": "מה אופי הברית שאלוהים כורת עם גדעון, ואיך היא שונה מהבריתות הקודמות?",
  "back": "גדעון חוקר את ההודעה האלוהית ודורש סימן (קרוב לפרוש בספרות), ואלוהים מסכים. זו ברית מותנית בהבדל מהברית עם אברהם.",
  "context_logic": "הערעור של גדעון מחדש את דפוס התגובה האנושית לגילוי אלוהי בספר שופטים.",
  "tags": ["Argument", "שופטים", "גדעון", "ברית", "פרוש"]
}`,
      additionalInstructions: `
הנחיות מיוחדות לניתוח תנ״ך:
- התייחס לתנ״ך כטקסט אקדמי עם הקשרים היסטוריים וספרותיים
- אל תכלול מישנה, תלמוד או טקסטים רבניים אחרים אלא אם צוינו במפורש
- התמקד בניתוח טקסטואלי, פרשנות אקדמית והקשר היסטורי-תרבותי
- השתמש בכלים אקדמיים (critique של מקורות, ניתוח ספרותי, רקע היסטורי-תרבותי)`
    };
  }

  /**
   * Generates conversation key from course and book
   */
  protected static override generateConversationKey(input: any): string {
    return `${input.course}|${input.book}`;
  }

  /**
   * Extracts metadata from input
   */
  protected static override getInputMetadata(input: any): Record<string, string> {
    const metadata: Record<string, string> = {
      course: input.course,
      book: input.book
    };
    if (input.chapter) {
      metadata.chapter = input.chapter;
    }
    return metadata;
  }

  /**
   * Validates input data for Bible flashcards
   */
  static override validateInput(input: any): void {
    console.log('✅ [BibleFlashcardsService] Starting input validation');

    const { paragraph, course, book } = input;

    if (!paragraph || typeof paragraph !== 'string' || paragraph.trim().length === 0) {
      console.log('❌ [BibleFlashcardsService] Paragraph is empty or invalid');
      throw new Error('הפסקה לניתוח היא שדה חובה ולא יכולה להיות ריקה');
    }

    if (paragraph.trim().length < 20) {
      console.log('❌ [BibleFlashcardsService] Paragraph too short:', paragraph.length);
      throw new Error('הפסקה קצרה מדי. יש להזין לפחות 20 תווים');
    }

    if (!course || typeof course !== 'string' || course.trim().length === 0) {
      console.log('❌ [BibleFlashcardsService] Course is empty or invalid');
      throw new Error('שם הקורס הוא שדה חובה');
    }

    if (!book || typeof book !== 'string' || book.trim().length === 0) {
      console.log('❌ [BibleFlashcardsService] Book is empty or invalid');
      throw new Error('שם הספר בתנ״ך הוא שדה חובה');
    }

    console.log('✅ [BibleFlashcardsService] All input validation passed');
  }

  /**
   * Parses and validates flashcard response with strict Bible scholarship rules
   */
  protected static override parseFlashcardsResponse(
    responseText: string,
    input: any
  ): BibleFlashcard[] {
    try {
      const cleanText = cleanResponseText(responseText);
      const parsed = JSON.parse(cleanText);

      if (!parsed.flashcards || !Array.isArray(parsed.flashcards)) {
        throw new Error('Response does not contain flashcards array');
      }

      // Validate and transform each flashcard with strict rules
      const validFlashcards: BibleFlashcard[] = parsed.flashcards
        .filter((card: any) => {
          return (
            card &&
            typeof card.type === 'string' &&
            ['Concept', 'Argument', 'Context', 'Contrast', 'Verse', 'Verse-Text Relation'].includes(card.type) &&
            typeof card.front === 'string' &&
            typeof card.back === 'string' &&
            typeof card.context_logic === 'string'
          );
        })
        .map((card: any) => ({
          type: card.type as BibleFlashcardType,
          front: card.front.trim(),
          back: card.back.trim(),
          context_logic: card.context_logic.trim(),
          tags: Array.isArray(card.tags)
            ? card.tags.filter((tag: any) => typeof tag === 'string')
            : [card.type, input.course, input.book, ...(input.chapter ? [input.chapter] : [])]
        }));

      if (validFlashcards.length === 0) {
        console.warn('⚠️ [BibleFlashcardsService] No valid flashcards found in response, creating fallback');
        return [{
          type: 'Concept',
          front: `מהו הרעיון המרכזי בקטע זה הקשור ל${input.book}?`,
          back: 'לא ניתן היה לעבד את הפסקה. אנא נסה שוב או הזן פסקה ארוכה יותר.',
          context_logic: 'יש לוודא שהפסקה מכילה תוכן אקדמי מספיק לניתוח.',
          tags: ['Error', input.course, input.book]
        }];
      }

      return validFlashcards;

    } catch (parseError) {
      console.error('❌ [BibleFlashcardsService] Failed to parse flashcards response:', responseText);

      // Return a fallback flashcard
      return [{
        type: 'Concept',
        front: `מהו הרעיון המרכזי בקטע זה הקשור ל${input.book}?`,
        back: 'לא ניתן היה לעבד את התשובה מהמערכת. אנא נסה שוב.',
        context_logic: 'אירעה שגיאה בעיבוד התשובה.',
        tags: ['Error', input.course, input.book]
      }];
    }
  }

  /**
   * Overrides buildMessage to include verse detection instructions for extraCards mode
   */
  protected static override buildMessage(
    input: any,
    extraCards: boolean = false,
    isFirstMessage: boolean = false,
    language: 'he' | 'en' = 'he'
  ): string {
    const { paragraph, course, book, chapter } = input;

    if (language === 'en') {
      const chapterInfo = chapter ? `Chapter: ${chapter}\n` : '';

      const cardCountInstructions = extraCards
        ? `\n⚠️ DEEP ANALYSIS MODE (Verse-Aware):\n- Create comprehensive analysis of the passage\n- Detect verses in the format: "verse text" (Book, Chapter, Verse)\n- For each detected verse:\n  1. Understand it in its full Biblical context\n  2. Create a "Verse" card asking about the verse itself\n  3. Create a "Verse-Text Relation" card about how the verse relates to the scholarly commentary\n- Generate 3-6+ flashcards total in this mode\n`
        : `\n⚠️ STANDARD MODE:\n- Identify the 1-2 main ideas in the scholarly passage\n- Focus on the academic analysis, not on individual verses\n- Create one flashcard if focused on a single concept\n- Create 2 flashcards if the passage contains two distinct ideas\n`;

      const systemInstructionPrefix = isFirstMessage ? this.buildSystemInstruction(language) + '\n\n---\n\n' : '';

      return `${systemInstructionPrefix}Text Information:
Course: ${course}
Book: ${book}
${chapterInfo}
Paragraph to analyze:
${paragraph}${cardCountInstructions}`;
    }

    // Hebrew message format (default)
    const chapterInfo = chapter ? `פרק: ${chapter}\n` : '';

    const cardCountInstructions = extraCards ? `
⚠️ חשוב מאוד - מצב ניתוח מעמיק (Extra Cards Mode) עם תפיסת פסוקים:
- נדרש ניתוח מעמיק ויסודי של הפסקה
- חפש פסוקים שמופיעים בטקסט בפורמט: "טקסט הפסוק" (שם הספר, פרק, פסוק)
- עבור כל פסוק שנמצא:
  1. הבן את הפסוק בהקשר הציבור שלו בתנ״ך
  2. צור כרטיס מסוג "Verse" - שאלה על הפסוק עצמו ומשמעותו
  3. צור כרטיס מסוג "Verse-Text Relation" - שאלה על הקשר בין הפסוק לטקסט האקדמי
- צור כרטיסים גם על רעיונות אקדמיים כלליים (Concept, Argument, Context, Contrast)
- פסקה טיפוסית תייצר 4-8 כרטיסים במצב זה (או יותר אם יש פסוקים רבים)
` : `
⚠️ חשוב מאוד - כמות כרטיסים (מצב סטנדרטי):
- התמקד בניתוח האקדמי של הפסקה, לא בפסוקים בודדים
- בדרך כלל, פסקה מכילה 1-2 רעיונות אקדמיים מרכזיים
- צור כרטיס אחד אם הפסקה מתמקדת ברעיון בודד
- צור 2 כרטיסים אם הפסקה מכילה שני רעיונות נפרדים
`;

    const additionalGuidelines = extraCards ? `
הנחיות נוספות (מצב מעמיק):
- חפש כל פרט אקדמי משמעותי ויצור עבורו כרטיס
- פסקה עשירה יכולה לייצר 5-8 כרטיסים או יותר
- אל תחשוש ליצור כרטיסים רבים - זה המצב שבו אנחנו רוצים כיסוי מקיף
` : `
הנחיות נוספות:
- צור כרטיס אחד אם הפסקה מתמקדת ברעיון מרכזי אחד
- צור 2 כרטיסים אם הפסקה מכילה שני רעיונות נפרדים או שני היבטים משמעותיים
`;

    const systemInstructionPrefix = isFirstMessage ? this.buildSystemInstruction(language) + '\n\n' : '';

    return `${systemInstructionPrefix}מידע על הטקסט:
קורס: ${course}
ספר בתנ״ך: ${book}
${chapterInfo}
הפסקה לניתוח:
${paragraph}
${cardCountInstructions}
${additionalGuidelines}`;
  }

  /**
   * Public API method for generating flashcards
   */
  static override async generateFlashcards(
    input: any
  ): Promise<GenerateFlashcardsResult> {
    const { language = 'he', extraCards = false } = input;

    console.log('📚 [BibleFlashcardsService] Starting flashcard generation');
    console.log('📖 [BibleFlashcardsService] Course:', input.course);
    console.log('📕 [BibleFlashcardsService] Book:', input.book);
    console.log('📄 [BibleFlashcardsService] Chapter:', input.chapter || 'Not specified');
    console.log('🌐 [BibleFlashcardsService] Language:', language);
    console.log('➕ [BibleFlashcardsService] Extra Cards Mode (Verse-Aware):', extraCards);

    try {
      // Get conversation key and check if first message
      const conversationKey = this.generateConversationKey(input);
      const isFirstMessage = !this.conversationInitialized.has(conversationKey);

      // Get or create ChatSession with cleanup for book switching
      const chat = this.getOrCreateChatSessionWithCleanup(conversationKey, input.course, input.book);

      // Mark conversation as initialized
      if (isFirstMessage) {
        this.conversationInitialized.add(conversationKey);
        console.log('📋 [BibleFlashcardsService] System instruction included in first message');
      }

      // Build message content
      console.log('📝 [BibleFlashcardsService] Building message content...');
      const message = this.buildMessage(input, extraCards, isFirstMessage, language);
      console.log('✅ [BibleFlashcardsService] Message built successfully');

      // Send message to Gemini API
      console.log('🚀 [BibleFlashcardsService] Sending message to Gemini API...');
      const result = await chat.sendMessage(message);
      const response = result.response;
      const text = response.text().trim();

      console.log('📡 [BibleFlashcardsService] Gemini API call completed');
      console.log('📄 [BibleFlashcardsService] Raw response text length:', text.length);

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
      console.log('💾 [BibleFlashcardsService] Conversation history updated');

      // Parse response
      console.log('🔧 [BibleFlashcardsService] Parsing and validating response...');
      const flashcards = this.parseFlashcardsResponse(text, input);

      console.log('✅ [BibleFlashcardsService] Response parsing completed successfully');
      console.log('📊 [BibleFlashcardsService] Total flashcards generated:', flashcards.length);

      return {
        flashcards,
        metadata: {
          course: input.course,
          book: input.book,
          chapter: input.chapter,
          totalCards: flashcards.length,
          conversationKey
        }
      };

    } catch (error) {
      console.error('❌ [BibleFlashcardsService] Error in flashcard generation:', error);
      throw new Error('Failed to generate flashcards from paragraph');
    }
  }
}
