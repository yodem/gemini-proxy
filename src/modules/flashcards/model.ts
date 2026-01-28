import { t } from 'elysia';

/**
 * Generic Flashcard Models
 *
 * These models provide a flexible foundation for flashcard generation across any domain.
 * Unlike domain-specific implementations, these schemas allow users to provide their own:
 * - System instructions
 * - Card type definitions
 * - Context metadata
 * - Language preferences
 */

// Flexible flashcard schema that accepts any string type
export const FlashcardSchema = t.Object({
  type: t.String({
    description: 'Card type (user-defined, e.g., Concept, Question, Definition, etc.)'
  }),
  front: t.String({
    minLength: 1,
    description: 'The question or prompt side of the flashcard'
  }),
  back: t.String({
    minLength: 1,
    description: 'The answer or explanation side of the flashcard'
  }),
  context_logic: t.Optional(t.String({
    description: 'Additional context or explanation about the logic/reasoning'
  })),
  tags: t.Optional(t.Array(t.String(), {
    description: 'Array of tags for organizing and filtering flashcards'
  }))
});

// Request body for generating flashcards
export const GenerateFlashcardsBody = t.Object({
  content: t.String({
    minLength: 20,
    description: 'The text content to analyze and convert into flashcards'
  }),
  systemInstruction: t.String({
    minLength: 50,
    description: 'Detailed instructions for the AI on how to create flashcards from the content. Should include: desired card types, formatting rules, language, and any domain-specific guidance.'
  }),
  contextMetadata: t.Optional(t.Record(t.String(), t.String(), {
    description: 'Optional metadata about the content (e.g., {author: "John Locke", source: "Two Treatises", chapter: "5"}). Used for organizing and tagging flashcards.'
  })),
  cardTypes: t.Optional(t.Array(t.String(), {
    description: 'Optional array of allowed card types (e.g., ["Concept", "Argument", "Example"]). If not provided, any types mentioned in systemInstruction are allowed.'
  })),
  language: t.Optional(t.String({
    description: 'Language code for the flashcards (e.g., "en", "he", "es"). Should match the language used in systemInstruction.'
  })),
  extraCards: t.Optional(t.Boolean({
    description: 'If true, requests more comprehensive analysis with additional flashcards for nuances, examples, and secondary concepts.'
  })),
  conversationKey: t.Optional(t.String({
    description: 'Optional key for maintaining conversation context across multiple requests. If not provided, a key is generated from systemInstruction + contextMetadata.'
  }))
});

// Response for flashcard generation
export const GenerateFlashcardsResponse = t.Object({
  success: t.Boolean(),
  flashcards: t.Array(FlashcardSchema),
  metadata: t.Object({
    totalCards: t.Number(),
    contextMetadata: t.Optional(t.Record(t.String(), t.String())),
    conversationKey: t.Optional(t.String())
  })
});

// Error response
export const ErrorResponse = t.Object({
  success: t.Literal(false),
  error: t.String()
});

// Type exports for TypeScript
export type Flashcard = typeof FlashcardSchema.static;
export type GenerateFlashcardsInput = typeof GenerateFlashcardsBody.static;
export type GenerateFlashcardsOutput = typeof GenerateFlashcardsResponse.static;
