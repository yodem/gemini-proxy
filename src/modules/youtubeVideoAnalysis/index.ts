import { Elysia } from 'elysia';
import { YouTubeVideoAnalysisService } from './service';
import { YouTubeVideoAnalysisModel } from './model';

// Create Elysia controller for YouTube video analysis
export const youtubeVideoAnalysisController = new Elysia({
  prefix: '/analyzeYouTubeVideo',
  name: 'YouTubeVideoAnalysis.Controller'
})
  .post('/', async ({ body, set }) => {
    const { youtubeUrl, categories } = body;

    console.log('🎬 [YouTube Analysis] API call received');
    console.log('📥 [YouTube Analysis] Input - URL:', youtubeUrl);
    console.log('📥 [YouTube Analysis] Input - Categories:', categories);

    try {
      console.log('✅ [YouTube Analysis] Starting input validation...');
      // Validate input using service
      YouTubeVideoAnalysisService.validateInput(youtubeUrl, categories);
      console.log('✅ [YouTube Analysis] Input validation passed');

      console.log('🤖 [YouTube Analysis] Starting Gemini AI analysis...');
      // Use service to analyze YouTube video
      const result = await YouTubeVideoAnalysisService.analyzeYouTubeVideo(
        youtubeUrl,
        categories
      );

      console.log('✅ [YouTube Analysis] Gemini analysis completed successfully');
      console.log('📤 [YouTube Analysis] Response - Description length:', result.description.length);
      console.log('📤 [YouTube Analysis] Response - Categories found:', result.categories.length);
      console.log('📤 [YouTube Analysis] Response - Categories:', result.categories);

      const response = {
        success: true,
        description: result.description,
        categories: result.categories
      };

      console.log('🎉 [YouTube Analysis] API call completed successfully');
      return response;

    } catch (error) {
      console.error('❌ [YouTube Analysis] Error occurred:', error);
      console.error('❌ [YouTube Analysis] Error type:', error instanceof Error ? error.constructor.name : typeof error);
      console.error('❌ [YouTube Analysis] Error message:', error instanceof Error ? error.message : String(error));

      // Set appropriate status code for error
      const isValidationError = error instanceof Error && (
        error.message.includes('required') ||
        error.message.includes('Invalid YouTube URL') ||
        error.message.includes('must be from YouTube')
      );

      set.status = isValidationError ? 400 : 500;
      console.log('📊 [YouTube Analysis] HTTP status set to:', set.status);

      const errorResponse = {
        success: false,
        error: 'Failed to process YouTube video analysis',
        message: error instanceof Error ? error.message : 'Unknown error'
      };

      console.log('📤 [YouTube Analysis] Error response:', errorResponse);
      return errorResponse;
    }
  }, {
    body: YouTubeVideoAnalysisModel.analyzeYouTubeVideoBody,
    response: {
      200: YouTubeVideoAnalysisModel.analyzeYouTubeVideoResponse,
      400: YouTubeVideoAnalysisModel.errorResponse,
      500: YouTubeVideoAnalysisModel.errorResponse
    },
    detail: {
      summary: 'Analyze YouTube video content and identify matching categories using Gemini AI',
      description: `
        Analyzes a YouTube video from a Jewish philosophy website and identifies up to 3 categories that best match its content.
        Uses Google Gemini AI to perform intelligent semantic matching based on context, themes, and key concepts.
        Returns both a description and matching categories in Hebrew.

        **Features:**
        - AI-powered YouTube video analysis
        - Hebrew language support for Jewish philosophy content
        - Semantic analysis of video content
        - Returns the most relevant categories
        - Validates categories against provided list
        - Extracts video information from YouTube URLs
      `,
      tags: ['YouTube Video Analysis'],
      responses: {
        200: {
          description: 'Successfully analyzed YouTube video and identified matching categories',
          content: {
            'application/json': {
              example: {
                success: true,
                description: "הסרטון דן ברעיונות הפילוסופיים של הרב קוק בעניין התחייה הלאומית והקשר בין האומה לטבע",
                categories: ["פילוסופיה יהודית", "תורה", "מחשבה יהודית"]
              }
            }
          }
        },
        400: {
          description: 'Bad request - invalid input parameters',
          content: {
            'application/json': {
              example: {
                success: false,
                error: 'Failed to process YouTube video analysis',
                message: 'YouTube URL is required and must be a non-empty string'
              }
            }
          }
        },
        500: {
          description: 'Internal server error - AI service or processing error',
          content: {
            'application/json': {
              example: {
                success: false,
                error: 'Failed to process YouTube video analysis',
                message: 'Failed to process YouTube video analysis request'
              }
            }
          }
        }
      }
    }
  });
