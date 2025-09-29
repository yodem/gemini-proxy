import { GoogleGenerativeAI } from '@google/generative-ai';
import { appConfig } from '../../config';
import type { YouTubeVideoAnalysisModel } from './model';
import { 
  buildYouTubePrompt, 
  parseYouTubeResponse, 
  validateCategoryInput 
} from '../shared/categoryUtils';

// Initialize Gemini AI client using configuration
const genAI = new GoogleGenerativeAI(appConfig.gemini.apiKey);
const model = genAI.getGenerativeModel({ model: appConfig.gemini.model });

// Class for YouTube video analysis business logic
export class YouTubeVideoAnalysisService {
  /**
   * Analyzes YouTube video content and identifies matching categories using Gemini AI
   * @param youtubeUrl YouTube URL to analyze
   * @param categories Array of category strings to match against
   * @returns Object containing video description and matching categories in Hebrew
   */
  static async analyzeYouTubeVideo(
    youtubeUrl: string,
    categories: string[]
  ): Promise<{ description: string; categories: string[] }> {
    console.log('🔍 [Service] Starting YouTube video analysis');
    console.log('🔗 [Service] YouTube URL:', youtubeUrl);
    console.log('📂 [Service] Available categories:', categories);

    try {
      console.log('🎬 [Service] Extracting video ID from URL...');
      // Extract video ID from URL for context
      const videoId = this.extractVideoId(youtubeUrl);
      console.log('✅ [Service] Video ID extracted:', videoId);

      console.log('📝 [Service] Building Hebrew prompt for Gemini...');
      // Create Hebrew prompt using shared utility
      const prompt = buildYouTubePrompt(categories, videoId, youtubeUrl);
      console.log('📝 [Service] Prompt built successfully (length:', prompt.length, 'characters)');

      console.log('🚀 [Service] Calling Gemini API with YouTube file data...');

      // Use Gemini's file data approach for YouTube analysis
      const result = await model.generateContent([
        prompt,
        {
          fileData: {
            fileUri: youtubeUrl,
            mimeType: "video/mp4"
          }
        }
      ]);

      console.log('📡 [Service] Gemini API call completed');

      const response = await result.response;
      console.log('📨 [Service] Gemini response received');

      const text = response.text().trim();
      console.log('📄 [Service] Raw response text length:', text.length);
      console.log('📄 [Service] Raw response preview:', text.substring(0, 200) + (text.length > 200 ? '...' : ''));

      console.log('🔧 [Service] Parsing and validating response...');
      // Parse and validate using shared utility
      const parsedResult = parseYouTubeResponse(text, categories);

      console.log('✅ [Service] Response parsing completed successfully');
      console.log('📊 [Service] Final result - Description length:', parsedResult.description.length);
      console.log('📊 [Service] Final result - Categories found:', parsedResult.categories.length);
      console.log('📊 [Service] Final result - Categories:', parsedResult.categories);

      return parsedResult;

    } catch (error) {
      console.error('❌ [Service] Error in YouTube video analysis:', error);
      console.error('❌ [Service] Error type:', error instanceof Error ? error.constructor.name : typeof error);
      console.error('❌ [Service] Error message:', error instanceof Error ? error.message : String(error));

      if (error instanceof Error && error.stack) {
        console.error('❌ [Service] Error stack:', error.stack);
      }

      throw new Error('Failed to process YouTube video analysis request');
    }
  }

  /**
   * Extracts video ID from YouTube URL
   */
  private static extractVideoId(url: string): string {
    console.log('🔍 [Extract] Extracting video ID from URL:', url);

    try {
      const urlObj = new URL(url);
      console.log('🔗 [Extract] URL parsed successfully, hostname:', urlObj.hostname);

      let videoId = '';

      if (urlObj.hostname.includes('youtube.com')) {
        videoId = urlObj.searchParams.get('v') || '';
        console.log('📺 [Extract] YouTube.com format detected, video ID from params:', videoId);
      } else if (urlObj.hostname.includes('youtu.be')) {
        videoId = urlObj.pathname.slice(1);
        console.log('📺 [Extract] YouTu.be format detected, video ID from path:', videoId);
      } else {
        console.log('❌ [Extract] Unsupported hostname:', urlObj.hostname);
        throw new Error('Unsupported YouTube hostname');
      }

      if (!videoId) {
        console.log('❌ [Extract] No video ID found in URL');
        throw new Error('No video ID found in URL');
      }

      console.log('✅ [Extract] Video ID successfully extracted:', videoId);
      return videoId;

    } catch (error) {
      console.error('❌ [Extract] Error extracting video ID:', error);
      console.error('❌ [Extract] Error type:', error instanceof Error ? error.constructor.name : typeof error);
      throw new Error('Invalid YouTube URL provided');
    }
  }

  /**
   * Validates input data (with YouTube-specific validation and logging)
   */
  static validateInput(youtubeUrl: string, categories: string[]): void {
    console.log('✅ [Validate] Starting input validation');
    console.log('🔗 [Validate] YouTube URL:', youtubeUrl);
    console.log('📂 [Validate] Categories:', categories);

    // Validate YouTube URL
    if (!youtubeUrl) {
      console.log('❌ [Validate] YouTube URL is null/undefined');
      throw new Error('YouTube URL is required');
    }

    if (typeof youtubeUrl !== 'string') {
      console.log('❌ [Validate] YouTube URL is not a string, type:', typeof youtubeUrl);
      throw new Error('YouTube URL must be a string');
    }

    if (youtubeUrl.trim().length === 0) {
      console.log('❌ [Validate] YouTube URL is empty');
      throw new Error('YouTube URL must be a non-empty string');
    }

    console.log('✅ [Validate] YouTube URL basic validation passed');

    // Basic URL validation
    try {
      const urlObj = new URL(youtubeUrl);
      console.log('✅ [Validate] URL parsing successful, hostname:', urlObj.hostname);
    } catch (error) {
      console.log('❌ [Validate] URL parsing failed:', error);
      throw new Error('Invalid YouTube URL format');
    }

    // Check if it's a YouTube URL
    if (!youtubeUrl.includes('youtube.com') && !youtubeUrl.includes('youtu.be')) {
      console.log('❌ [Validate] URL is not from YouTube:', youtubeUrl);
      throw new Error('URL must be from YouTube (youtube.com or youtu.be)');
    }

    console.log('✅ [Validate] YouTube URL validation passed');

    // Validate categories using shared utility
    try {
      validateCategoryInput(categories, 'YouTube Video', 'Video content analysis');
      console.log('✅ [Validate] Categories validation passed, count:', categories.length);
      console.log('🎉 [Validate] All input validation completed successfully');
    } catch (error) {
      console.log('❌ [Validate] Categories validation failed:', error);
      throw error;
    }
  }
}
