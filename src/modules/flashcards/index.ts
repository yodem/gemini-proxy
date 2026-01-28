import { Elysia } from 'elysia';
import { FlashcardsService } from './service';
import {
  GenerateFlashcardsBody,
  GenerateFlashcardsResponse,
  ErrorResponse
} from './model';

/**
 * Generic Flashcards API Endpoint
 *
 * Provides flexible flashcard generation for any subject matter.
 * Users provide their own system instructions and context.
 *
 * Key features:
 * - User-defined system instructions
 * - Flexible metadata structure
 * - Multi-turn conversation support
 * - Works with any domain or subject
 */
export const flashcardsModule = new Elysia({ prefix: '/flashcards' })
  .post('/generate', async ({ body, set }) => {
    try {
      // Validate input
      FlashcardsService.validateInput(body);

      // Generate flashcards using the generic service
      const result = await FlashcardsService.generateFlashcards(body);

      // Return success response
      return {
        success: true,
        flashcards: result.flashcards,
        metadata: result.metadata
      };

    } catch (error) {
      console.error('[FlashcardsAPI] Error generating flashcards:', error);
      set.status = 400;

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate flashcards'
      };
    }
  }, {
    body: GenerateFlashcardsBody,
    response: {
      200: GenerateFlashcardsResponse,
      400: ErrorResponse
    },
    detail: {
      summary: 'Generate flashcards from content',
      description: `
# Generic Flashcard Generation

This endpoint generates flashcards from any content using AI. Unlike domain-specific endpoints,
this accepts custom system instructions, making it suitable for any subject matter.

## How It Works

1. Provide your content (text to analyze)
2. Provide system instructions (how the AI should create flashcards)
3. Optionally provide context metadata and other parameters
4. Receive generated flashcards in JSON format

## Multi-Turn Conversations

The service maintains conversation context across multiple requests when using the same
\`conversationKey\` or \`systemInstruction + contextMetadata\` combination. This allows the AI
to build on previous flashcards and maintain consistency.

## Example Request

\`\`\`json
{
  "content": "Photosynthesis is the process by which plants convert light energy into chemical energy...",
  "systemInstruction": "You are an expert biology tutor. Create educational flashcards that help students learn key concepts. Each flashcard should: 1) Have a clear question on the front, 2) Provide a concise answer on the back, 3) Include additional context. Use these card types: Concept, Process, Example. Return JSON with structure: {flashcards: [{type, front, back, context_logic, tags}]}",
  "contextMetadata": {
    "subject": "Biology",
    "topic": "Photosynthesis",
    "level": "High School"
  },
  "cardTypes": ["Concept", "Process", "Example"],
  "language": "en",
  "extraCards": false
}
\`\`\`

## Example Response

\`\`\`json
{
  "success": true,
  "flashcards": [
    {
      "type": "Concept",
      "front": "What is photosynthesis?",
      "back": "The process by which plants convert light energy into chemical energy (glucose)",
      "context_logic": "This is the fundamental definition that establishes understanding of the entire process",
      "tags": ["Biology", "Photosynthesis", "Concept", "Definition"]
    },
    {
      "type": "Process",
      "front": "What are the main inputs and outputs of photosynthesis?",
      "back": "Inputs: light energy, water, CO2. Outputs: glucose, oxygen",
      "context_logic": "Understanding inputs and outputs helps students grasp the transformation occurring",
      "tags": ["Biology", "Photosynthesis", "Process", "Chemical Equation"]
    }
  ],
  "metadata": {
    "totalCards": 2,
    "contextMetadata": {
      "subject": "Biology",
      "topic": "Photosynthesis",
      "level": "High School"
    },
    "conversationKey": "a1b2c3d4e5f6g7h8"
  }
}
\`\`\`

## System Instruction Best Practices

1. **Define your domain**: Specify subject area and expertise level
2. **Specify card types**: List the types of flashcards you want (Concept, Example, etc.)
3. **Define structure**: Clearly request JSON format with specific fields
4. **Set quality criteria**: Specify what makes a good flashcard (clarity, conciseness, etc.)
5. **Include examples**: If helpful, provide an example flashcard in the instruction

## Parameters

- **content** (required): The text to analyze (min 20 chars)
- **systemInstruction** (required): Detailed AI instructions (min 50 chars)
- **contextMetadata** (optional): Key-value metadata for organizing flashcards
- **cardTypes** (optional): Array of allowed card types for validation
- **language** (optional): Language code (e.g., "en", "es", "he")
- **extraCards** (optional): Request deeper analysis with more flashcards
- **conversationKey** (optional): Explicit key for conversation continuity
`,
      tags: ['Flashcards', 'AI Generation', 'Education']
    }
  });
