import { GoogleGenerativeAI, type ChatSession } from '@google/generative-ai';
import { appConfig } from '../../../../config';
import { cleanResponseText } from '../../../shared/categoryUtils';

// Initialize Gemini AI client using configuration
const genAI = new GoogleGenerativeAI(appConfig.gemini.apiKey);
const model = genAI.getGenerativeModel({ model: appConfig.gemini.model });

// Types
export type ChatContent = {
  role: "user" | "model";
  parts: Array<{ text: string }>;
};

export interface Flashcard {
  type: string;
  front: string;
  back: string;
  context_logic?: string;
  tags?: string[];
}

export interface GenerateFlashcardsResult {
  flashcards: Flashcard[];
  metadata: {
    totalCards: number;
    conversationKey: string;
    [key: string]: any;
  };
}

export interface GenerateFlashcardsInput {
  paragraph: string;
  thinker: string;
  work: string;
  chapter?: string;
  language?: 'he' | 'en';
  extraCards?: boolean;
}

export interface DomainContext {
  /** Domain expertise description, e.g. "פילוסופיה פוליטית" or "הפילוסופיה של קאנט" */
  expertise: string;
  /** Optional domain-specific example to include in the system instruction */
  example?: string;
  /** Optional additional domain-specific instructions */
  additionalInstructions?: string;
}

/**
 * Abstract base class for philosophy flashcard generation services
 *
 * This class provides the core functionality for generating flashcards from philosophical texts
 * using Gemini AI, including conversation management, history optimization, and API interaction.
 *
 * Derived classes must implement:
 * - getDomainContext(language): Provide domain-specific expertise, examples, and instructions
 * - generateConversationKey(input): Create a unique key for the conversation
 * - getInputMetadata(input): Extract and structure metadata from input
 * - validateInput(input): Validate domain-specific input requirements
 *
 * Derived classes may optionally override:
 * - parseFlashcardsResponse(responseText, input): Custom parsing logic
 * - buildSystemInstruction(language): Full custom system instruction
 * - buildMessage(input, extraCards, isFirstMessage, language): Custom message building
 *
 * Features:
 * - Multi-turn conversation support with history management
 * - History optimization (keeps first exchange + last exchange only)
 * - ChatSession reuse for conversation continuity
 * - Automatic system instruction injection in first message
 * - Error recovery and session cleanup
 */
export class PhilosophyFlashcardsService {
  // Store ChatSession objects per conversation key
  protected static chatSessions = new Map<string, ChatSession>();
  // Store conversation history per conversation key
  protected static chatHistory = new Map<string, ChatContent[]>();
  // Track which conversations have sent their first message
  protected static conversationInitialized = new Set<string>();

  /**
   * Gets or creates a ChatSession for a specific conversation
   */
  protected static getOrCreateChatSession(conversationKey: string): ChatSession {
    // Return existing ChatSession if found
    const existingSession = this.chatSessions.get(conversationKey);
    if (existingSession) {
      console.log('💬 [PhilosophyFlashcardsService] Reusing existing ChatSession for:', conversationKey);
      return existingSession;
    }

    // Get stored conversation history or use empty array
    const storedHistory = this.chatHistory.get(conversationKey) || [];

    // Create new ChatSession with history
    console.log('💬 [PhilosophyFlashcardsService] Creating new ChatSession for:', conversationKey);
    const chat = model.startChat({
      history: storedHistory
    });

    // Store ChatSession for future use
    this.chatSessions.set(conversationKey, chat);
    // Mark that this conversation hasn't sent its first message yet
    this.conversationInitialized.delete(conversationKey);
    console.log('✅ [PhilosophyFlashcardsService] ChatSession created and stored');

    return chat;
  }

  /**
   * Returns domain-specific context for the system instruction.
   * Derived classes must implement this method.
   */
  protected static getDomainContext(language: 'he' | 'en' = 'he'): DomainContext {
    throw new Error('getDomainContext must be implemented by derived class');
  }

  /**
   * Builds the system instruction for the conversation.
   * Combines common flashcard methodology with domain-specific context.
   * Can be overridden by derived classes for fully custom instructions.
   */
  protected static buildSystemInstruction(language: 'he' | 'en' = 'he'): string {
    const domainContext = this.getDomainContext(language);

    if (language === 'en') {
      return `You are an expert in ${domainContext.expertise} and knowledgeable in Anki learning methodology. Your task is to analyze paragraphs from academic texts and create high-quality flashcards (Anki-style).

Working rules:
1. Atomicity: Each flashcard should address only one idea.
2. Active phrasing: Use questions like 'Why', 'How', 'What is the difference', not just 'Who'.
3. Academic precision: Don't simplify concepts in a way that damages their original meaning.
4. Context: Ensure the answer includes the philosopher's rationale.
5. English: All content should be in English.

Card types:
- Concept: A central concept or definition
- Argument: A thesis or justification
- Context: Historical or philosophical context
- Contrast: A comparison or opposition between ideas

Return response in JSON format only with this structure:
{
  "flashcards": [
    {
      "type": "Argument",
      "front": "Why does [thinker] argue that [specific question from text]?",
      "back": "[Concise answer including the rationale]",
      "context_logic": "[Explanation of the internal logic and connection to the thinker's theory]",
      "tags": ["Argument", "[Thinker name]", "[Work name]", "key concept"]
    }
  ]
}${domainContext.additionalInstructions ? '\n\n' + domainContext.additionalInstructions : ''}`;
    }

    // Hebrew instructions (detailed, primary language)
    return `אתה מומחה ל${domainContext.expertise} ומומחה למתודולוגיית הלמידה Anki. תפקידך לנתח פסקאות מתוך טקסטים אקדמיים וליצור מהם כרטיסי זיכרון (Flashcards) איכותיים.

חוקי עבודה:
1. אטומיות: כל כרטיס יעסוק ברעיון אחד בלבד.
2. ניסוח אקטיבי: השתמש בשאלות 'למה', 'איך' ו'מה ההבדל', ולא רק ב'מי'.
3. דיוק אקדמי: אל תפשט את המושגים באופן שפוגע במשמעות המקורית.
4. הקשר: ודא שהתשובה כוללת את הרציונל של ההוגה.
5. עברית: כל התוכן צריך להיות בעברית.

סוגי כרטיסים (type):
- Concept: מושג מרכזי או הגדרה
- Argument: טיעון או הנמקה
- Context: הקשר היסטורי או פילוסופי
- Contrast: השוואה או ניגוד בין רעיונות

עבור כל רעיון מרכזי בפסקה, צור כרטיס שכולל:
- type: אחד מהסוגים (Concept/Argument/Context/Contrast)
- front: השאלה (ניסוח אקטיבי ומעורר חשיבה)
- back: התשובה (תמציתית אך מלאה, כולל הרציונל)
- context_logic: הסבר נוסף על הלוגיקה הפנימית והקשר לתורת ההוגה
- tags: מערך של תגיות רלוונטיות (כולל את סוג הכרטיס, שם ההוגה, שם היצירה, ומושגי מפתח)

החזר תשובה בפורמט JSON בלבד עם המבנה הבא:
{
  "flashcards": [
    {
      "type": "Argument",
      "front": "מדוע, לפי [שם ההוגה], [שאלה ספציפית מהטקסט]?",
      "back": "[תשובה תמציתית הכוללת את הרציונל]",
      "context_logic": "[הסבר על הלוגיקה הפנימית]",
      "tags": ["Argument", "[שם ההוגה]", "[שם היצירה]", "מושג מפתח"]
    }
  ]
}${domainContext.example ? '\n\n' + domainContext.example : ''}

הנחיות כלליות:
- ודא שכל כרטיס עומד בפני עצמו ומובן ללא הפסקה המקורית
- השתמש במונחים המקוריים של ההוגה כשרלוונטי
- אל תכלול כל הסבר נוסף או טקסט מחוץ לפורמט JSON
- אל תוסיף סימני קוד (\`\`\`) או כל עיצוב markdown אחר
- החזר JSON נקי לחלוטין${domainContext.additionalInstructions ? '\n\n' + domainContext.additionalInstructions : ''}`;
  }

  /**
   * Builds the message content for a specific paragraph.
   * This is the dynamic content that changes per request.
   * Can be overridden by derived classes for custom message format.
   */
  protected static buildMessage(
    input: GenerateFlashcardsInput,
    extraCards: boolean = false,
    isFirstMessage: boolean = false,
    language: 'he' | 'en' = 'he'
  ): string {
    const { paragraph, thinker, work, chapter } = input;

    if (language === 'en') {
      const chapterInfo = chapter ? `Chapter: ${chapter}\n` : '';
      const cardCountInstructions = extraCards
        ? `\n⚠️ DEEP ANALYSIS MODE:\n- Create comprehensive analysis of the passage\n- Generate flashcards for every aspect, nuance and context\n- Look for primary concepts, secondary ideas, examples, implications\n- A typical passage should generate 3-6 flashcards in this mode\n`
        : `\n⚠️ STANDARD MODE:\n- Identify the 1-2 main ideas in the passage\n- Create one flashcard if focused on a single concept\n- Create 2 flashcards if the passage contains two distinct ideas\n`;

      const systemInstructionPrefix = isFirstMessage ? this.buildSystemInstruction(language) + '\n\n---\n\n' : '';

      return `${systemInstructionPrefix}Text Information:
Thinker: ${thinker}
Work: ${work}
${chapterInfo}
Paragraph to analyze:
${paragraph}${cardCountInstructions}`;
    }

    // Hebrew message format (default)
    const chapterInfo = chapter ? `פרק: ${chapter}\n` : '';

    const cardCountInstructions = extraCards ? `
⚠️ חשוב מאוד - מצב ניתוח מעמיק (Extra Cards Mode):
- נדרש ניתוח מעמיק ויסודי של הפסקה
- צור כרטיסים עבור כל היבט, ניואנס והקשר בפסקה
- חפש רעיונות משניים, השלכות, דוגמאות והבחנות עדינות
- פסקה טיפוסית תייצר 3-6 כרטיסים במצב זה
- אל תחשוש ליצור כרטיסים רבים - זה המצב שבו אנחנו רוצים כיסוי מקיף
- כל פרט פילוסופי משמעותי ראוי לכרטיס נפרד
- היבטים שכדאי לחפש:
  * מושגים ראשיים ומשניים
  * טיעונים והנמקות
  * דוגמאות ואנלוגיות
  * הבחנות והשוואות
  * הקשרים היסטוריים ופילוסופיים
  * השלכות ומסקנות
  * ניואנסים מושגיים
` : `
⚠️ חשוב מאוד - כמות כרטיסים:
- בדרך כלל, פסקה מכילה 1-2 רעיונות מרכזיים
- צור כרטיס אחד אם הפסקה מתמקדת ברעיון בודד
- צור 2 כרטיסים אם הפסקה מכילה שני רעיונות נפרדים או היבטים שונים של אותו נושא
- אל תכפה יצירת כרטיסים מרובים אם הפסקה באמת עוסקת ברעיון אחד
`;

    const additionalGuidelines = extraCards ? `
הנחיות נוספות (מצב מעמיק):
- חפש כל פרט פילוסופי משמעותי ויצור עבורו כרטיס
- פסקה עשירה יכולה לייצר 4-6 כרטיסים או יותר
- כלול כרטיסים על הקשרים, דוגמאות והשלכות
` : `
הנחיות נוספות:
- צור כרטיס אחד אם הפסקה מתמקדת ברעיון מרכזי אחד
- צור 2 כרטיסים אם הפסקה מכילה שני רעיונות נפרדים או שני היבטים משמעותיים
`;

    const systemInstructionPrefix = isFirstMessage ? this.buildSystemInstruction(language) + '\n\n' : '';

    return `${systemInstructionPrefix}מידע על הטקסט:
הוגה: ${thinker}
יצירה: ${work}
${chapterInfo}
הפסקה לניתוח:
${paragraph}
${cardCountInstructions}
${additionalGuidelines}`;
  }

  /**
   * Generates conversation key from input
   * Derived classes should override this method
   */
  protected static generateConversationKey(input: any): string {
    throw new Error('generateConversationKey must be implemented by derived class');
  }

  /**
   * Extracts metadata from input
   * Derived classes should override this method
   */
  protected static getInputMetadata(input: any): Record<string, string> {
    throw new Error('getInputMetadata must be implemented by derived class');
  }

  /**
   * Validates input
   * Derived classes should override this method
   */
  static validateInput(input: any): void {
    throw new Error('validateInput must be implemented by derived class');
  }

  /**
   * Template method that orchestrates the flashcard generation flow
   * Derived classes implement the abstract methods called by this method
   */
  static async generateFlashcards(
    input: GenerateFlashcardsInput,
    language: 'he' | 'en' = 'he',
    extraCards: boolean = false
  ): Promise<GenerateFlashcardsResult> {
    console.log('📚 [PhilosophyFlashcardsService] Starting flashcard generation');

    try {
      // Step 1: Validate input using derived class validation
      console.log('✅ [PhilosophyFlashcardsService] Validating input...');
      this.validateInput(input);

      // Step 2: Generate conversation key using derived class strategy
      const conversationKey = this.generateConversationKey(input);
      console.log('🔑 [PhilosophyFlashcardsService] Conversation key:', conversationKey);

      // Step 3: Determine if this is the first message
      const isFirstMessage = !this.conversationInitialized.has(conversationKey);

      // Step 4: Get or create ChatSession for this conversation
      const chat = this.getOrCreateChatSession(conversationKey);

      // Step 5: Build message content using derived class
      console.log('📝 [PhilosophyFlashcardsService] Building message content...');
      const message = this.buildMessage(input, extraCards, isFirstMessage, language);
      console.log('✅ [PhilosophyFlashcardsService] Message built successfully (length:', message.length, 'characters)');

      // Mark conversation as initialized after first message
      if (isFirstMessage) {
        this.conversationInitialized.add(conversationKey);
        console.log('📋 [PhilosophyFlashcardsService] System instruction included in first message');
      }

      // Step 6: Send message to Gemini API
      console.log('🚀 [PhilosophyFlashcardsService] Sending message to Gemini API...');
      const result = await chat.sendMessage(message);

      console.log('📡 [PhilosophyFlashcardsService] Gemini API call completed');

      const response = result.response;
      console.log('📨 [PhilosophyFlashcardsService] Gemini response received');

      const text = response.text().trim();
      console.log('📄 [PhilosophyFlashcardsService] Raw response text length:', text.length);

      // Step 7: Extract and store updated conversation history
      // Keep only first exchange + last exchange to optimize memory usage
      const currentHistory = this.chatHistory.get(conversationKey) || [];
      const newUserMessage: ChatContent = { role: "user", parts: [{ text: message }] };
      const newModelResponse: ChatContent = { role: "model", parts: [{ text: text }] };

      let updatedHistory: ChatContent[];
      if (currentHistory.length === 0) {
        // First message: keep both user and model (contains system instruction)
        updatedHistory = [newUserMessage, newModelResponse];
      } else {
        // Keep first 2 items (first user + first model) + last 2 items (latest user + latest model)
        const firstExchange = currentHistory.slice(0, 2);
        updatedHistory = [...firstExchange, newUserMessage, newModelResponse];
      }

      this.chatHistory.set(conversationKey, updatedHistory);
      console.log('💾 [PhilosophyFlashcardsService] Conversation history updated and stored (', updatedHistory.length, 'items)');

      // Step 8: Parse and validate response using derived class parser
      console.log('🔧 [PhilosophyFlashcardsService] Parsing and validating response...');
      const flashcards = this.parseFlashcardsResponse(text, input);

      console.log('✅ [PhilosophyFlashcardsService] Response parsing completed successfully');
      console.log('📊 [PhilosophyFlashcardsService] Total flashcards generated:', flashcards.length);

      // Step 9: Return result with metadata
      const metadata = this.getInputMetadata(input);
      return {
        flashcards,
        metadata: {
          totalCards: flashcards.length,
          conversationKey,
          ...metadata
        }
      };

    } catch (error) {
      console.error('❌ [PhilosophyFlashcardsService] Error in flashcard generation:', error);
      console.error('❌ [PhilosophyFlashcardsService] Error type:', error instanceof Error ? error.constructor.name : typeof error);
      console.error('❌ [PhilosophyFlashcardsService] Error message:', error instanceof Error ? error.message : String(error));

      if (error instanceof Error && error.stack) {
        console.error('❌ [PhilosophyFlashcardsService] Error stack:', error.stack);
      }

      // If ChatSession fails, remove it so it can be recreated on next request
      const conversationKey = this.generateConversationKey(input);
      if (this.chatSessions.has(conversationKey)) {
        console.log('🔄 [PhilosophyFlashcardsService] Removing failed ChatSession');
        this.chatSessions.delete(conversationKey);
        this.chatHistory.delete(conversationKey);
        this.conversationInitialized.delete(conversationKey);
      }

      throw new Error('Failed to generate flashcards from content');
    }
  }

  /**
   * Parses the Gemini response into flashcard objects
   * Can be overridden by derived classes for custom parsing logic
   */
  protected static parseFlashcardsResponse(
    responseText: string,
    input: any
  ): Flashcard[] {
    try {
      const cleanText = cleanResponseText(responseText);
      const parsed = JSON.parse(cleanText);

      if (!parsed.flashcards || !Array.isArray(parsed.flashcards)) {
        throw new Error('Response does not contain flashcards array');
      }

      // Validate and transform each flashcard
      const validFlashcards: Flashcard[] = parsed.flashcards
        .filter((card: any) => {
          const hasBasicStructure =
            card &&
            typeof card.type === 'string' &&
            typeof card.front === 'string' &&
            typeof card.back === 'string';

          return hasBasicStructure;
        })
        .map((card: any) => ({
          type: card.type,
          front: card.front.trim(),
          back: card.back.trim(),
          context_logic: card.context_logic?.trim(),
          tags: Array.isArray(card.tags)
            ? card.tags.filter((tag: any) => typeof tag === 'string')
            : undefined
        }));

      if (validFlashcards.length === 0) {
        console.warn('⚠️ [PhilosophyFlashcardsService] No valid flashcards found in response');
        return [];
      }

      return validFlashcards;

    } catch (parseError) {
      console.error('❌ [PhilosophyFlashcardsService] Failed to parse flashcards response:', responseText.substring(0, 500));
      return [];
    }
  }

  /**
   * Clears conversation history for a specific conversation key
   * Useful for testing or manual session management
   */
  static clearConversation(conversationKey: string): void {
    this.chatSessions.delete(conversationKey);
    this.chatHistory.delete(conversationKey);
    this.conversationInitialized.delete(conversationKey);
    console.log('🔄 [PhilosophyFlashcardsService] Cleared conversation:', conversationKey);
  }

  /**
   * Clears all conversation histories
   * Useful for testing or memory management
   */
  static clearAllConversations(): void {
    this.chatSessions.clear();
    this.chatHistory.clear();
    this.conversationInitialized.clear();
    console.log('🔄 [PhilosophyFlashcardsService] Cleared all conversations');
  }
}
