import { GoogleGenerativeAI } from '@google/generative-ai';
import { appConfig } from '../../config';
import type { CategoryIdentificationModel } from './model';
import { 
  buildCategoryPrompt, 
  parseAndValidateCategoriesResponse, 
  validateCategoryInput 
} from '../shared/categoryUtils';

// Initialize Gemini AI client using configuration
const genAI = new GoogleGenerativeAI(appConfig.gemini.apiKey);
const model = genAI.getGenerativeModel({ model: appConfig.gemini.model });

// Abstract class for category identification business logic
export abstract class CategoryIdentificationService {
  /**
   * Identifies matching categories from content using Gemini AI
   * @param categories Array of category strings to match against
   * @param title Title of the content
   * @param description Description of the content
   * @returns Array of matching categories (no limit, precision focused)
   */
  static async identifyCategories(
    categories: string[],
    title: string,
    description: string
  ): Promise<string[]> {
    try {
      // Validate input using shared utility
      validateCategoryInput(categories, title, description);

      // Create prompt using shared utility
      const prompt = buildCategoryPrompt(title, description, categories);

      // Generate response using Gemini
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim();

      // Parse and validate using shared utility
      return parseAndValidateCategoriesResponse(text, categories);
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      throw new Error('Failed to process category identification request');
    }
  }

  /**
   * Validates input data (delegates to shared utility)
   */
  static validateInput(categories: string[], title: string, description: string): void {
    validateCategoryInput(categories, title, description);
  }
}
