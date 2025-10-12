import { Elysia } from 'elysia';
import { StaticDataAnalysisService } from './service';
import { StaticDataAnalysisModel } from './model';

// Create Elysia controller for static data analysis
export const staticDataAnalysisController = new Elysia({
  prefix: '/analyzeStaticData',
  name: 'StaticDataAnalysis.Controller'
})
  .post('/', async ({ body, set }) => {
    const { title, description, categories, isYoutube, clarificationParagraph } = body;

    console.log('📝 [Static Analysis] API call received');
    console.log('📥 [Static Analysis] Input - Title:', title);
    console.log('📥 [Static Analysis] Input - Description:', description);
    console.log('📥 [Static Analysis] Input - Categories:', categories);
    console.log('📥 [Static Analysis] Input - YouTube mode:', isYoutube || false);
    if (clarificationParagraph) {
      console.log('📥 [Static Analysis] Input - Clarification paragraph:', clarificationParagraph);
    }

    try {
      console.log('✅ [Static Analysis] Starting input validation...');
      // Validate input using service
      StaticDataAnalysisService.validateInput(title, description, categories, isYoutube);
      console.log('✅ [Static Analysis] Input validation passed');

      console.log('🤖 [Static Analysis] Starting Gemini AI analysis...');
      // Use service to analyze static data
      const result = await StaticDataAnalysisService.analyzeStaticData(
        title,
        description,
        categories,
        isYoutube,
        clarificationParagraph
      );

      console.log('✅ [Static Analysis] Gemini analysis completed successfully');
      console.log('📤 [Static Analysis] Response - Categories found:', result.categories.length);
      console.log('📤 [Static Analysis] Response - Categories:', result.categories);
      if (result.description) {
        console.log('📤 [Static Analysis] Response - Description length:', result.description.length);
      }

      const response: any = {
        success: true,
        categories: result.categories
      };
      
      if (result.description) {
        response.description = result.description;
      }

      console.log('🎉 [Static Analysis] API call completed successfully');
      return response;

    } catch (error) {
      console.error('❌ [Static Analysis] Error occurred:', error);
      console.error('❌ [Static Analysis] Error type:', error instanceof Error ? error.constructor.name : typeof error);
      console.error('❌ [Static Analysis] Error message:', error instanceof Error ? error.message : String(error));

      // Set appropriate status code for error
      const isValidationError = error instanceof Error && (
        error.message.includes('required') ||
        error.message.includes('must be a string') ||
        error.message.includes('must not be empty') ||
        error.message.includes('must be an array')
      );

      set.status = isValidationError ? 400 : 500;
      console.log('📊 [Static Analysis] HTTP status set to:', set.status);

      const errorResponse = {
        success: false,
        error: 'Failed to process static data analysis',
        message: error instanceof Error ? error.message : 'Unknown error'
      };

      console.log('📤 [Static Analysis] Error response:', errorResponse);
      return errorResponse;
    }
  }, {
    body: StaticDataAnalysisModel.analyzeStaticDataBody,
    response: {
      200: StaticDataAnalysisModel.analyzeStaticDataResponse,
      400: StaticDataAnalysisModel.errorResponse,
      500: StaticDataAnalysisModel.errorResponse
    },
    detail: {
      summary: 'Analyze static data (title and description) and identify matching categories using Gemini AI',
      description: `
        Analyzes static data containing title and description from Jewish philosophy content and identifies 
        the most relevant categories that best match its content with academic precision.
        Uses Google Gemini AI to perform intelligent semantic matching based on context, themes, and key concepts.
        Returns only categories that have direct, proven relevance to the content.

        **Features:**
        - AI-powered static data analysis with academic precision
        - Hebrew language support for Jewish philosophy content
        - YouTube-style description generation (when isYoutube=true) starting with "בסרטון זה פרופ׳ שלום צדיק מדבר על..."
        - Optional clarification paragraph for additional context
        - Conservative category selection - only returns categories with direct relevance
        - Semantic analysis of title and description
        - Validates categories against provided list
        - No external API calls required for content retrieval
        - Returns empty array if no categories are relevant (no forced categorization)
        - Dual mode: categories-only or categories + YouTube-style description
      `,
      tags: ['Static Data Analysis'],
      responses: {
        200: {
          description: 'Successfully analyzed static data and identified matching categories',
          content: {
            'application/json': {
              examples: {
                'categories-only': {
                  summary: 'Categories only (isYoutube: false)',
                  value: {
                    success: true,
                    categories: ["רמב״ם", "פילוסופיה אריסטוטלית"]
                  }
                },
                'youtube-style': {
                  summary: 'YouTube style with description (isYoutube: true)', 
                  value: {
                    success: true,
                    categories: ["רמב״ם", "פילוסופיה אריסטוטלית"],
                    description: "בסרטון זה פרופ׳ שלום צדיק מדבר על השפעת הפילוסופיה האריסטוטלית על המחשבה היהודית. הוא מרחיב על הרמב״ם ועל הדרך שבה השלב בין החכמה היוונית לבין המסורת היהודית. הדיון מתמקד בספר מורה נבוכים ובהשפעתו על ההגות היהודית לדורותיה. זהו עיון מעמיק בדמותו של הרמב״ם כפילוסוף ומחנך."
                  }
                }
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
                error: 'Failed to process static data analysis',
                message: 'Title is required'
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
                error: 'Failed to process static data analysis',
                message: 'Failed to process static data analysis request'
              }
            }
          }
        }
      }
    }
  });
