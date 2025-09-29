import { Elysia } from 'elysia';
import { CategoryIdentificationService } from './service';
import { CategoryIdentificationModel } from './model';

// Create Elysia controller for category identification
export const categoryIdentificationController = new Elysia({
  prefix: '/identifyCategories',
  name: 'CategoryIdentification.Controller'
})
  .post('/', async ({ body, set }) => {
    const { categories, title, description } = body;

    try {
      // Validate input using service
      CategoryIdentificationService.validateInput(categories, title, description);

      // Use service to identify categories
      const matchingCategories = await CategoryIdentificationService.identifyCategories(
        categories,
        title,
        description
      );

      return {
        success: true,
        matchingCategories,
        totalCategoriesProvided: categories.length
      };
    } catch (error) {
      console.error('Category identification error:', error);

      // Set appropriate status code for error
      set.status = error instanceof Error && error.message.includes('required') ? 400 : 500;

      return {
        success: false,
        error: 'Failed to process category identification',
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }, {
    body: CategoryIdentificationModel.identifyCategoriesBody,
    response: {
      200: CategoryIdentificationModel.identifyCategoriesResponse,
      400: CategoryIdentificationModel.errorResponse,
      500: CategoryIdentificationModel.errorResponse
    },
    detail: {
      summary: 'Identify matching categories from Jewish philosophy content using Gemini AI',
      description: `
        Analyzes title and description of Jewish philosophy content and identifies precise categories that match the content.
        Uses Google Gemini AI with specialized Hebrew prompts for accurate academic categorization.

        **Features:**
        - AI-powered category identification specialized for Jewish philosophy
        - Hebrew language processing with academic precision
        - Handles acronyms (רס״ג = רבי סעדיה גאון, רמב״ם = רבי משה בן מימון)
        - Book-to-author mapping (מורה נבוכים → רמב״ם)
        - חז״ל detection for Talmudic content
        - Focus on precision over quantity (no artificial limits)
      `,
      tags: ['Category Identification'],
      responses: {
        200: {
          description: 'Successfully identified matching categories',
          content: {
            'application/json': {
              example: {
                success: true,
                matchingCategories: ['רמב״ם', 'פילוסופיה אריסטוטלית'],
                totalCategoriesProvided: 10
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
                error: 'Failed to process category identification',
                message: 'Title is required and must be a non-empty string'
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
                error: 'Failed to process category identification',
                message: 'Failed to process category identification request'
              }
            }
          }
        }
      }
    }
  });
