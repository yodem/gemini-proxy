import { Elysia } from 'elysia';
import { BibleFlashcardsService } from './service';
import { BibleFlashcardsModel } from './model';

/**
 * Bible Flashcards Controller
 *
 * Endpoint for generating flashcards from academic Bible (תנ״ך) texts.
 * Route: /anki/bible/generate
 *
 * Features:
 * - Academic perspective on Tanakh (Hebrew Bible)
 * - Support for verse-aware deep analysis mode (extraCards)
 * - Multi-turn conversation support with history management
 * - Hebrew and English language support
 */
export const bibleModule = new Elysia({
  prefix: '/bible',
  name: 'Bible.Flashcards.Controller'
})
  .post('/generate', async ({ body, set }) => {
    const { paragraph, course, book, chapter, language, extraCards } = body;

    console.log('📚 [BibleFlashcards] API call received');
    console.log('📥 [BibleFlashcards] Input - Course:', course);
    console.log('📥 [BibleFlashcards] Input - Book:', book);
    console.log('📥 [BibleFlashcards] Input - Chapter:', chapter || 'Not specified');
    console.log('📥 [BibleFlashcards] Input - Language:', language || 'he');
    console.log('📥 [BibleFlashcards] Input - Extra Cards (Verse-Aware):', extraCards || false);
    console.log('📥 [BibleFlashcards] Input - Paragraph length:', paragraph.length, 'characters');

    try {
      console.log('✅ [BibleFlashcards] Starting input validation...');
      // Validate input using service
      BibleFlashcardsService.validateInput({
        paragraph,
        course,
        book,
        chapter,
        language,
        extraCards
      });
      console.log('✅ [BibleFlashcards] Input validation passed');

      console.log('🤖 [BibleFlashcards] Starting Gemini AI flashcard generation...');
      // Use service to generate flashcards
      const result = await BibleFlashcardsService.generateFlashcards({
        paragraph,
        course,
        book,
        chapter,
        language,
        extraCards
      });

      console.log('✅ [BibleFlashcards] Gemini generation completed successfully');
      console.log('📤 [BibleFlashcards] Response - Total cards:', result.flashcards.length);

      const response = {
        success: true,
        flashcards: result.flashcards,
        metadata: result.metadata
      };

      console.log('🎉 [BibleFlashcards] API call completed successfully');
      return response;

    } catch (error) {
      console.error('❌ [BibleFlashcards] Error occurred:', error);
      console.error('❌ [BibleFlashcards] Error type:', error instanceof Error ? error.constructor.name : typeof error);
      console.error('❌ [BibleFlashcards] Error message:', error instanceof Error ? error.message : String(error));

      // Set appropriate status code for error
      const isValidationError = error instanceof Error && (
        error.message.includes('שדה חובה') ||
        error.message.includes('קצרה מדי') ||
        error.message.includes('ריקה')
      );

      set.status = isValidationError ? 400 : 500;
      console.log('📊 [BibleFlashcards] HTTP status set to:', set.status);

      const errorResponse = {
        success: false,
        error: 'נכשל בעיבוד הבקשה ליצירת כרטיסי זיכרון',
        message: error instanceof Error ? error.message : 'שגיאה לא ידועה'
      };

      console.log('📤 [BibleFlashcards] Error response:', errorResponse);
      return errorResponse;
    }
  }, {
    body: BibleFlashcardsModel.generateFlashcardsBody,
    response: {
      200: BibleFlashcardsModel.generateFlashcardsResponse,
      400: BibleFlashcardsModel.errorResponse,
      500: BibleFlashcardsModel.errorResponse
    },
    detail: {
      summary: 'יצירת כרטיסי זיכרון (Flashcards) מתוך טקסט בתנ״ך אקדמי',
      description: `
מנתח פסקה מתוך טקסט אקדמי בתנ״ך (המקרא) ויוצר ממנה כרטיסי זיכרון (Flashcards) איכותיים בסגנון Anki.
משתמש ב-Google Gemini AI לניתוח סמנטי חכם של הטקסט האקדמי.

**סוגי כרטיסים:**
- Concept: מושג מרכזי או הגדרה
- Argument: טיעון או הנמקה
- Context: הקשר היסטורי או תרבותי
- Contrast: השוואה או ניגוד בין רעיונות
- Verse: שאלה על הפסוק בתנ״ך עצמו (במצב ניתוח מעמיק)
- Verse-Text Relation: קשר בין הפסוק לטקסט האקדמי (במצב ניתוח מעמיק)

**עקרונות:**
- אטומיות: כל כרטיס עוסק ברעיון אחד בלבד
- ניסוח אקטיבי: שאלות 'למה', 'איך', 'מה ההבדל'
- דיוק אקדמי: שמירה על המשמעות המקורית
- הקשר: כל תשובה כוללת את ההנמקה האקדמית

**מצב ניתוח מעמיק (Extra Cards):**
כאשר extraCards=true, המערכת מחפשת פסוקים שמופיעים בטקסט בפורמט "טקסט הפסוק" (ספר, פרק, פסוק)
ויוצרת כרטיסים נוספים המשלבים הבנה של הפסוק בהקשרו בתנ״ך עם הניתוח האקדמי.
      `,
      tags: ['Anki - Bible'],
      responses: {
        200: {
          description: 'כרטיסי הזיכרון נוצרו בהצלחה',
          content: {
            'application/json': {
              example: {
                success: true,
                flashcards: [
                  {
                    type: "Argument",
                    front: 'מה הטיעון של גדעון בפני המלאך, וכיצד זה משקף את כללי ההתגלות בימי השופטים?',
                    back: 'גדעון שואל סימן (האות היא תרגום מישנאי למילה חזה, חזון), מה משקף מעמדות תרבותיות בישראל העתיקה לגבי אימות הודעות אלוהיות.',
                    context_logic: 'השאלה של גדעון היא דוגמה לצורות הדיסקורס בספר שופטים - הן האלוהים והן בני אדם מתקשרים דרך סימנים וערעורים.',
                    tags: ["Argument", "מעשי גדעון", "שופטים", "ברית", "התגלות"]
                  },
                  {
                    type: "Verse",
                    front: 'מה משמעות הפסוק "אם מצאתי חן בעיניך" בהקשר של דיאלוג גדעון עם המלאך?',
                    back: 'הביטוי משמש להקדמת בקשה כבוד ממעמד נמוך לגבוה, וגדעון משתמש בו כדי לבקש אישור לשאלה שלו.',
                    context_logic: 'זהו שימוש בנוסחה תרבותית בשפה העברית הקדומה להיווך הקשרים בין גברים בעלי עוצמה לא שוות.',
                    tags: ["Verse", "מעשי גדעון", "שופטים", "פרק ו"]
                  }
                ],
                metadata: {
                  course: "מעשי גדעון",
                  book: "שופטים",
                  chapter: "פרק ו",
                  totalCards: 2
                }
              }
            }
          }
        },
        400: {
          description: 'בקשה לא תקינה - פרמטרים חסרים או לא תקינים',
          content: {
            'application/json': {
              example: {
                success: false,
                error: 'נכשל בעיבוד הבקשה ליצירת כרטיסי זיכרון',
                message: 'הפסקה לניתוח היא שדה חובה ולא יכולה להיות ריקה'
              }
            }
          }
        },
        500: {
          description: 'שגיאת שרת - שגיאה בשירות ה-AI או בעיבוד',
          content: {
            'application/json': {
              example: {
                success: false,
                error: 'נכשל בעיבוד הבקשה ליצירת כרטיסי זיכרון',
                message: 'Failed to generate flashcards from paragraph'
              }
            }
          }
        }
      }
    }
  });
