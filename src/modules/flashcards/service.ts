import { GoogleGenerativeAI, type ChatSession } from '@google/generative-ai';
import { appConfig } from '../../config';
import type { GenerateFlashcardsInput, Flashcard } from './model';
import { cleanResponseText } from '../shared/categoryUtils';
import { createHash } from 'crypto';

// Initialize Gemini AI client using configuration
const genAI = new GoogleGenerativeAI(appConfig.gemini.apiKey);
const model = genAI.getGenerativeModel({ model: appConfig.gemini.model });

// Types
type ChatContent = {
  role: "user" | "model";
  parts: Array<{ text: string }>;
};

interface GenerateFlashcardsResult {
  flashcards: Flashcard[];
  metadata: {
    totalCards: number;
    contextMetadata?: Record<string, string>;
    conversationKey?: string;
  };
}

/**
 * שירות יצירת כרטיסי זיכרון גנרי (Generic Flashcard Service)
 *
 * שירות זה מספק יצירת כרטיסי זיכרון גמישה באמצעות Gemini AI.
 * בשונה מיישומים ספציפיים לתחום, הוא מקבל הוראות מערכת וקונטקסט שמסופקים על ידי המשתמש,
 * מה שהופך אותו מתאים לכל נושא.
 *
 * תכונות עיקריות:
 * - תמיכה בשיחות ניתנות למעקב עם ניהול היסטוריה
 * - הוראות מערכת וסוגי כרטיסים המוגדרים על ידי המשתמש
 * - מבנה מטא-דאטה גמיש
 * - ניהול מפתחות שיחה עם מפתחות אוטומטיים
 * - אופטימיזציית היסטוריה (שומרת רק על הקומה הראשונה והאחרונה)
 */
export class FlashcardsService {
  // Store ChatSession objects per conversation key
  private static chatSessions = new Map<string, ChatSession>();
  // Store conversation history per conversation key
  private static chatHistory = new Map<string, ChatContent[]>();
  // Track which conversations have sent their first message
  private static conversationInitialized = new Set<string>();

  /**
   * Generates a conversation key from system instruction and context metadata
   */
  private static generateConversationKey(
    systemInstruction: string,
    contextMetadata?: Record<string, string>
  ): string {
    const metadataStr = contextMetadata
      ? Object.entries(contextMetadata).sort().map(([k, v]) => `${k}:${v}`).join('|')
      : '';
    const combined = `${systemInstruction}|${metadataStr}`;
    return createHash('sha256').update(combined).digest('hex').substring(0, 16);
  }

  /**
   * Gets or creates a ChatSession for a specific conversation
   */
  private static getOrCreateChatSession(conversationKey: string): ChatSession {
    // Return existing ChatSession if found
    const existingSession = this.chatSessions.get(conversationKey);
    if (existingSession) {
      console.log('💬 [FlashcardsService] Reusing existing ChatSession for:', conversationKey);
      return existingSession;
    }

    // Get stored conversation history or use empty array
    const storedHistory = this.chatHistory.get(conversationKey) || [];

    // Create new ChatSession with history
    console.log('💬 [FlashcardsService] Creating new ChatSession for:', conversationKey);
    const chat = model.startChat({
      history: storedHistory
    });

    // Store ChatSession for future use
    this.chatSessions.set(conversationKey, chat);
    // Mark that this conversation hasn't sent its first message yet
    this.conversationInitialized.delete(conversationKey);
    console.log('✅ [FlashcardsService] ChatSession created and stored');

    return chat;
  }

  /**
   * Builds the message content for a specific flashcard generation request
   */
  private static buildMessage(
    content: string,
    systemInstruction: string,
    contextMetadata?: Record<string, string>,
    extraCards: boolean = false,
    isFirstMessage: boolean = false
  ): string {
    // Format context metadata if provided
    const metadataSection = contextMetadata && Object.keys(contextMetadata).length > 0
      ? '\n\nContext Metadata:\n' + Object.entries(contextMetadata)
          .map(([key, value]) => `${key}: ${value}`)
          .join('\n') + '\n'
      : '';

    // Extra cards mode instructions
    const analysisMode = extraCards
      ? '\n\n⚠️ DEEP ANALYSIS MODE:\n' +
        '- Provide comprehensive analysis of the content\n' +
        '- Create flashcards for every significant aspect, nuance, and context\n' +
        '- Look for primary concepts, secondary ideas, examples, implications, and subtle distinctions\n' +
        '- A typical passage should generate 3-6 flashcards in this mode\n' +
        '- Don\'t hesitate to create many flashcards - thorough coverage is desired\n'
      : '\n\n⚠️ STANDARD MODE:\n' +
        '- Identify the 1-2 main ideas in the content\n' +
        '- Create one flashcard if the content focuses on a single concept\n' +
        '- Create 2 flashcards if the content contains two distinct ideas or aspects\n' +
        '- Don\'t force multiple flashcards if the content addresses only one idea\n';

    // Include system instruction in first message if this is a new session
    const systemInstructionPrefix = isFirstMessage ? systemInstruction + '\n\n---\n\n' : '';

    return `${systemInstructionPrefix}Content to analyze:\n${content}${metadataSection}${analysisMode}`;
  }

  /**
   * Generates flashcards from content using Gemini AI
   */
  static async generateFlashcards(
    input: GenerateFlashcardsInput
  ): Promise<GenerateFlashcardsResult> {
    const {
      content,
      systemInstruction,
      contextMetadata,
      cardTypes,
      language = 'en',
      extraCards = false,
      conversationKey: userProvidedKey
    } = input;

    console.log('📚 [FlashcardsService] Starting flashcard generation');
    console.log('📝 [FlashcardsService] Content length:', content.length, 'characters');
    console.log('🌐 [FlashcardsService] Language:', language);
    console.log('➕ [FlashcardsService] Extra Cards Mode:', extraCards);

    // Generate or use provided conversation key
    const conversationKey = userProvidedKey ||
      this.generateConversationKey(systemInstruction, contextMetadata);
    console.log('🔑 [FlashcardsService] Conversation key:', conversationKey);

    try {
      // Get or create ChatSession for this conversation
      const isFirstMessage = !this.conversationInitialized.has(conversationKey);
      const chat = this.getOrCreateChatSession(conversationKey);

      // Build message content
      console.log('📝 [FlashcardsService] Building message content...');
      const message = this.buildMessage(
        content,
        systemInstruction,
        contextMetadata,
        extraCards,
        isFirstMessage
      );
      console.log('✅ [FlashcardsService] Message built successfully (length:', message.length, 'characters)');

      // Mark conversation as initialized after sending first message
      if (isFirstMessage) {
        this.conversationInitialized.add(conversationKey);
        console.log('📋 [FlashcardsService] System instruction included in first message');
      }

      // Send message using ChatSession
      console.log('🚀 [FlashcardsService] Sending message to Gemini API...');
      const result = await chat.sendMessage(message);

      console.log('📡 [FlashcardsService] Gemini API call completed');

      const response = result.response;
      console.log('📨 [FlashcardsService] Gemini response received');

      const text = response.text().trim();
      console.log('📄 [FlashcardsService] Raw response text length:', text.length);

      // Extract and store updated conversation history (first exchange + last exchange)
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
      console.log('💾 [FlashcardsService] Conversation history updated and stored (', updatedHistory.length, 'items)');

      console.log('🔧 [FlashcardsService] Parsing and validating response...');
      const flashcards = this.parseFlashcardsResponse(text, cardTypes, contextMetadata);

      console.log('✅ [FlashcardsService] Response parsing completed successfully');
      console.log('📊 [FlashcardsService] Total flashcards generated:', flashcards.length);

      return {
        flashcards,
        metadata: {
          totalCards: flashcards.length,
          contextMetadata,
          conversationKey
        }
      };

    } catch (error) {
      console.error('❌ [FlashcardsService] Error in flashcard generation:', error);
      console.error('❌ [FlashcardsService] Error type:', error instanceof Error ? error.constructor.name : typeof error);
      console.error('❌ [FlashcardsService] Error message:', error instanceof Error ? error.message : String(error));

      if (error instanceof Error && error.stack) {
        console.error('❌ [FlashcardsService] Error stack:', error.stack);
      }

      // If ChatSession fails, remove it so it can be recreated on next request
      if (this.chatSessions.has(conversationKey)) {
        console.log('🔄 [FlashcardsService] Removing failed ChatSession');
        this.chatSessions.delete(conversationKey);
        this.chatHistory.delete(conversationKey);
        this.conversationInitialized.delete(conversationKey);
      }

      throw new Error('Failed to generate flashcards from content');
    }
  }

  /**
   * Parses the Gemini response into flashcard objects
   */
  private static parseFlashcardsResponse(
    responseText: string,
    cardTypes?: string[],
    contextMetadata?: Record<string, string>
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

          // If cardTypes specified, validate against them
          if (hasBasicStructure && cardTypes && cardTypes.length > 0) {
            return cardTypes.includes(card.type);
          }

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
        console.warn('⚠️ [FlashcardsService] No valid flashcards found in response');
        // Return a fallback flashcard
        return [{
          type: 'Error',
          front: 'Could not process the content',
          back: 'The AI response did not contain valid flashcards. Please try again or adjust your system instruction.',
          context_logic: 'Ensure the content has enough substance to analyze and that the system instruction requests valid JSON output.',
          tags: ['Error']
        }];
      }

      return validFlashcards;

    } catch (parseError) {
      console.error('❌ [FlashcardsService] Failed to parse flashcards response:', responseText.substring(0, 500));

      // Return a fallback flashcard
      return [{
        type: 'Error',
        front: 'Failed to process AI response',
        back: 'Could not parse the response. Please try again.',
        context_logic: 'There was an error processing the response from the AI.',
        tags: ['Error']
      }];
    }
  }

  /**
   * Validates input data
   */
  static validateInput(input: GenerateFlashcardsInput): void {
    console.log('✅ [FlashcardsService] Starting input validation');

    const { content, systemInstruction } = input;

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      console.log('❌ [FlashcardsService] Content is empty or invalid');
      throw new Error('Content is required and cannot be empty');
    }

    if (content.trim().length < 20) {
      console.log('❌ [FlashcardsService] Content too short:', content.length);
      throw new Error('Content is too short. Please provide at least 20 characters');
    }

    if (!systemInstruction || typeof systemInstruction !== 'string' || systemInstruction.trim().length === 0) {
      console.log('❌ [FlashcardsService] System instruction is empty or invalid');
      throw new Error('System instruction is required');
    }

    if (systemInstruction.trim().length < 50) {
      console.log('❌ [FlashcardsService] System instruction too short:', systemInstruction.length);
      throw new Error('System instruction is too short. Please provide detailed instructions (at least 50 characters)');
    }

    console.log('✅ [FlashcardsService] All input validation passed');
  }

  /**
   * Clears conversation history for a specific conversation key
   * Useful for testing or manual session management
   */
  static clearConversation(conversationKey: string): void {
    this.chatSessions.delete(conversationKey);
    this.chatHistory.delete(conversationKey);
    this.conversationInitialized.delete(conversationKey);
    console.log('🔄 [FlashcardsService] Cleared conversation:', conversationKey);
  }

  /**
   * Clears all conversation histories
   * Useful for testing or memory management
   */
  static clearAllConversations(): void {
    this.chatSessions.clear();
    this.chatHistory.clear();
    this.conversationInitialized.clear();
    console.log('🔄 [FlashcardsService] Cleared all conversations');
  }
}
