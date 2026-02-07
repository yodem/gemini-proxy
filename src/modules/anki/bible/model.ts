import { t } from 'elysia';

// Define validation schemas for Bible flashcards
export namespace BibleFlashcardsModel {
  // Flashcard type enum - Bible includes specialized types for verses
  export const FlashcardType = t.Union([
    t.Literal('Concept'),
    t.Literal('Argument'),
    t.Literal('Context'),
    t.Literal('Contrast'),
    t.Literal('Verse'),
    t.Literal('Verse-Text Relation')
  ], {
    description: "סוג הכרטיס - Concept (מושג), Argument (טיעון), Context (הקשר), Contrast (ניגוד), Verse (פסוק), Verse-Text Relation (קשר בין פסוק לטקסט)"
  });

  // Input schema for the generateFlashcards request
  export const generateFlashcardsBody = t.Object({
    paragraph: t.String({
      minLength: 1,
      description: "הפסקה מתוך הטקסט האקדמי בתנ״ך לניתוח",
      examples: ["המחלוקת סביב הפרשנות של הגלות בבבל הייתה מרכזית בתקופה ההלניסטית. הפסוק 'ויהי בימי נבוכדנצר מלך בבל...' (דניאל, ג, א) מעלה שאלות על הגדרת הגלות..."]
    }),
    course: t.String({
      minLength: 1,
      description: "שם הקורס/הנושא",
      examples: ["מעשי גדעון", "שיר השירים האקדמי", "ספר איוב - טרגדיה ופילוסופיה"]
    }),
    book: t.String({
      minLength: 1,
      description: "שם הספר בתנ״ך",
      examples: ["שופטים", "שיר השירים", "איוב", "דניאל"]
    }),
    chapter: t.Optional(t.String({
      description: "פרק ספציפי (אופציונלי)",
      examples: ["פרק ו", "פרק שלוש עשרה"]
    })),
    language: t.Optional(t.Union([
      t.Literal('he'),
      t.Literal('en')
    ], {
      default: 'he',
      description: "שפת הפלט - עברית (he) או אנגלית (en)"
    })),
    extraCards: t.Optional(t.Boolean({
      default: false,
      description: "אם true, ניתוח מעמיק היוצר כרטיסים נוספים עבור פסוקים שמופיעים בפסקה, כולל שאלות על הפסוקים עצמם וקשרם לטקסט האקדמי"
    }))
  }, {
    description: "בקשה ליצירת כרטיסי זיכרון מתוך טקסט בתנ״ך אקדמי",
    title: "GenerateFlashcardsRequest"
  });

  // TypeScript types inferred from schemas
  export type GenerateFlashcardsBody = typeof generateFlashcardsBody.static;

  // Single flashcard schema
  export const Flashcard = t.Object({
    type: FlashcardType,
    front: t.String({
      description: "השאלה (צד קדמי של הכרטיס)"
    }),
    back: t.String({
      description: "התשובה (צד אחורי של הכרטיס)"
    }),
    context_logic: t.String({
      description: "הסבר נוסף על הלוגיקה והרציונל"
    }),
    tags: t.Array(t.String(), {
      description: "תגיות לסיווג הכרטיס"
    })
  }, {
    description: "כרטיס זיכרון בודד",
    title: "Flashcard"
  });

  export type Flashcard = typeof Flashcard.static;

  // Response schema
  export const generateFlashcardsResponse = t.Object({
    success: t.Boolean({
      description: "האם הבקשה עובדה בהצלחה"
    }),
    flashcards: t.Array(Flashcard, {
      description: "מערך של כרטיסי הזיכרון שנוצרו"
    }),
    metadata: t.Object({
      course: t.String({
        description: "שם הקורס"
      }),
      book: t.String({
        description: "שם הספר בתנ״ך"
      }),
      chapter: t.Optional(t.String({
        description: "הפרק (אם צוין)"
      })),
      totalCards: t.Number({
        description: "מספר הכרטיסים שנוצרו"
      })
    }, {
      description: "מטא-דאטה על הבקשה"
    })
  }, {
    description: "תשובה מוצלחת עם כרטיסי הזיכרון שנוצרו",
    title: "GenerateFlashcardsResponse"
  });

  export type GenerateFlashcardsResponse = typeof generateFlashcardsResponse.static;

  // Error response schema
  export const errorResponse = t.Object({
    success: t.Boolean({
      description: "תמיד false עבור תשובות שגיאה"
    }),
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

  export type ErrorResponse = typeof errorResponse.static;
}
