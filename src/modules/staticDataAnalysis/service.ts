import { GoogleGenerativeAI } from '@google/generative-ai';
import { appConfig } from '../../config';
import type { StaticDataAnalysisModel } from './model';
import { 
  buildCategoryPrompt, 
  buildStaticDataYouTubePrompt,
  parseAndValidateCategoriesResponse, 
  parseYouTubeResponse,
  validateCategoryInput 
} from '../shared/categoryUtils';

// Initialize Gemini AI client using configuration
const genAI = new GoogleGenerativeAI(appConfig.gemini.apiKey);
const model = genAI.getGenerativeModel({ model: appConfig.gemini.model });

// Class for static data analysis business logic
export class StaticDataAnalysisService {
  /**
   * Analyzes static data (title and description) and identifies matching categories using Gemini AI
   * @param title Title of the content to analyze
   * @param description Description of the content to analyze
   * @param categories Array of category strings to match against
   * @param isYoutube If true, returns YouTube-style description starting with "בסרטון זה פרופ׳ שלום צדיק מדבר על..."
   * @param clarificationParagraph Optional additional paragraph for context and clarification
   * @returns Object containing matching categories and optional description
   */
  static async analyzeStaticData(
    title: string,
    description: string,
    categories: string[],
    isYoutube?: boolean,
    clarificationParagraph?: string
  ): Promise<{ categories: string[]; description?: string }> {
    console.log('🔍 [Service] Starting static data analysis');
    console.log('📝 [Service] Title:', title);
    console.log('📄 [Service] Description:', description);
    console.log('📂 [Service] Available categories:', categories);
    console.log('🎬 [Service] YouTube mode:', isYoutube || false);
    if (clarificationParagraph) {
      console.log('💡 [Service] Clarification paragraph:', clarificationParagraph);
    }

    try {
      // Validate input using shared utility
      validateCategoryInput(categories, title, description);

      console.log('📝 [Service] Building Hebrew prompt for Gemini...');
      // Create Hebrew prompt using shared utility with optional clarification
      const prompt = isYoutube 
        ? buildStaticDataYouTubePrompt(categories, title, description)
        : buildCategoryPrompt(title, description, categories, undefined, clarificationParagraph);
      console.log('📝 [Service] Prompt built successfully (length:', prompt.length, 'characters)');

      console.log('🚀 [Service] Calling Gemini API...');
      // Use Gemini to analyze the static data
      const result = await model.generateContent(prompt);

      console.log('📡 [Service] Gemini API call completed');

      const response = await result.response;
      console.log('📨 [Service] Gemini response received');

      const text = response.text().trim();
      console.log('📄 [Service] Raw response text length:', text.length);
      console.log('📄 [Service] Raw response preview:', text.substring(0, 200) + (text.length > 200 ? '...' : ''));

      console.log('🔧 [Service] Parsing and validating response...');
      // Parse and validate using shared utility
      if (isYoutube) {
        const youtubeResult = parseYouTubeResponse(text, categories);
        console.log('✅ [Service] YouTube response parsing completed successfully');
        console.log('📊 [Service] Final result - Description length:', youtubeResult.description.length);
        console.log('📊 [Service] Final result - Categories found:', youtubeResult.categories.length);
        console.log('📊 [Service] Final result - Categories:', youtubeResult.categories);
        return { categories: youtubeResult.categories, description: youtubeResult.description };
      } else {
        const categories_result = parseAndValidateCategoriesResponse(text, categories);
        console.log('✅ [Service] Response parsing completed successfully');
        console.log('📊 [Service] Final result - Categories found:', categories_result.length);
        console.log('📊 [Service] Final result - Categories:', categories_result);
        return { categories: categories_result };
      }

    } catch (error) {
      console.error('❌ [Service] Error in static data analysis:', error);
      console.error('❌ [Service] Error type:', error instanceof Error ? error.constructor.name : typeof error);
      console.error('❌ [Service] Error message:', error instanceof Error ? error.message : String(error));

      if (error instanceof Error && error.stack) {
        console.error('❌ [Service] Error stack:', error.stack);
      }

      throw new Error('Failed to process static data analysis request');
    }
  }

  /**
   * Validates input data (delegates to shared utility with logging)
   */
  static validateInput(title: string, description: string, categories: string[], isYoutube?: boolean): void {
    console.log('✅ [Validate] Starting input validation');
    console.log('📝 [Validate] Title:', title);
    console.log('📄 [Validate] Description:', description);
    console.log('📂 [Validate] Categories:', categories);
    console.log('🎬 [Validate] YouTube mode:', isYoutube || false);

    try {
      validateCategoryInput(categories, title, description);
      console.log('🎉 [Validate] All input validation completed successfully');
    } catch (error) {
      console.log('❌ [Validate] Validation failed:', error);
      throw error;
    }
  }
}
