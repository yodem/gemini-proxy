import { t } from 'elysia';

// Define validation schemas for political philosophy flashcards
export namespace PoliticalPhilosophyFlashcardsModel {
  // Flashcard type enum
  export const FlashcardType = t.Union([
    t.Literal('Concept'),
    t.Literal('Argument'),
    t.Literal('Context'),
    t.Literal('Contrast')
  ], {
    description: "סוג הכרטיס - Concept (מושג), Argument (טיעון), Context (הקשר), Contrast (ניגוד)"
  });

  // Input schema for the generateFlashcards request
  export const generateFlashcardsBody = t.Object({
    paragraph: t.String({
      minLength: 1,
      description: "הפסקה מתוך הטקסט הפילוסופי לניתוח",
      examples: ["במצב הטבעי, לפי הובס, כל אדם שווה באופן יסודי בכך שכל אחד מסוגל להרוג את זולתו..."]
    }),
    thinker: t.String({
      minLength: 1,
      description: "שם ההוגה/הפילוסוף",
      examples: ["הובס", "לוק", "רוסו", "קאנט"]
    }),
    work: t.String({
      minLength: 1,
      description: "שם היצירה/הספר",
      examples: ["לויתן", "שני מאמרים על הממשל", "האמנה החברתית"]
    }),
    chapter: t.Optional(t.String({
      description: "פרק ספציפי (אופציונלי)",
      examples: ["פרק יג", "חלק ראשון"]
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
      description: "אם true, הניתוח יהיה מעמיק יותר ויצור כרטיסים נוספים עבור היבטים משניים, הקשרים נוספים וניואנסים בפסקה"
    }))
  }, {
    description: "בקשה ליצירת כרטיסי זיכרון מפסקה בפילוסופיה פוליטית",
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
      thinker: t.String({
        description: "שם ההוגה"
      }),
      work: t.String({
        description: "שם היצירה"
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

