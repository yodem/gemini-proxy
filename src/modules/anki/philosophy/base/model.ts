import { t } from 'elysia';

/**
 * Base Models for Philosophy Flashcards
 *
 * These models define the core types and validation schemas used across all
 * philosophy flashcard services (political philosophy, Kant, etc.)
 */

// Base flashcard type - 4 types used across philosophy domains
export const FlashcardType = t.Union([
  t.Literal('Concept'),
  t.Literal('Argument'),
  t.Literal('Context'),
  t.Literal('Contrast')
], {
  description: "סוג הכרטיס - Concept (מושג), Argument (טיעון), Context (הקשר), Contrast (ניגוד)"
});

// Single flashcard schema
export const Flashcard = t.Object({
  type: FlashcardType,
  front: t.String({
    description: "השאלה (צד קדמי של הכרטיס)"
  }),
  back: t.String({
    description: "התשובה (צד אחורי של הכרטיס)"
  }),
  context_logic: t.Optional(t.String({
    description: "הסבר נוסף על הלוגיקה והרציונל"
  })),
  tags: t.Optional(t.Array(t.String(), {
    description: "תגיות לסיווג הכרטיס"
  }))
}, {
  description: "כרטיס זיכרון בודד",
  title: "Flashcard"
});

// Response schema
export const GenerateFlashcardsResponse = t.Object({
  success: t.Boolean({
    description: "האם הבקשה עובדה בהצלחה"
  }),
  flashcards: t.Array(Flashcard, {
    description: "מערך של כרטיסי הזיכרון שנוצרו"
  }),
  metadata: t.Object({
    totalCards: t.Number({
      description: "מספר הכרטיסים שנוצרו"
    }),
    conversationKey: t.Optional(t.String({
      description: "מפתח השיחה לשמירת ההיסטוריה"
    }))
  }, {
    description: "מטא-דאטה על הבקשה"
  })
}, {
  description: "תשובה מוצלחת עם כרטיסי הזיכרון שנוצרו",
  title: "GenerateFlashcardsResponse"
});

// Error response schema
export const ErrorResponse = t.Object({
  success: t.Literal(false),
  error: t.String({
    description: "סוג השגיאה"
  }),
  message: t.Optional(t.String({
    description: "הודעת שגיאה מפורטת"
  }))
}, {
  description: "תשובת שגיאה עם פרטי השגיאה",
  title: "ErrorResponse"
});

// TypeScript type exports
export type FlashcardType = typeof FlashcardType.static;
export type Flashcard = typeof Flashcard.static;
export type GenerateFlashcardsResponse = typeof GenerateFlashcardsResponse.static;
export type ErrorResponse = typeof ErrorResponse.static;
