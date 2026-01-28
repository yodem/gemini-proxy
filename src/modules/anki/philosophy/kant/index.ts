import { Elysia } from 'elysia';
import { KantPhilosophyFlashcardsService } from './service';
import { KantPhilosophyFlashcardsModel } from './model';

/**
 * Kant Philosophy Flashcards Controller
 *
 * Endpoint for generating flashcards from Kantian philosophy texts.
 * Route: /anki/philosophy/kant
 */
export const kantPhilosophyFlashcardsController = new Elysia({
  prefix: '',
  name: 'KantPhilosophyFlashcards.Controller'
})
  .post('/', async ({ body, set }) => {
    const { paragraph, thinker, work, chapter, language, extraCards } = body;

    console.log('📚 [KantPhilosophyFlashcards] API call received');
    console.log('📥 [KantPhilosophyFlashcards] Input - Thinker:', thinker);
    console.log('📥 [KantPhilosophyFlashcards] Input - Work:', work);
    console.log('📥 [KantPhilosophyFlashcards] Input - Chapter:', chapter || 'Not specified');
    console.log('📥 [KantPhilosophyFlashcards] Input - Language:', language || 'he');
    console.log('📥 [KantPhilosophyFlashcards] Input - Extra Cards:', extraCards || false);
    console.log('📥 [KantPhilosophyFlashcards] Input - Paragraph length:', paragraph.length, 'characters');

    try {
      console.log('✅ [KantPhilosophyFlashcards] Starting input validation...');
      // Validate input using service
      KantPhilosophyFlashcardsService.validateInput({
        paragraph,
        thinker,
        work,
        chapter,
        language,
        extraCards
      });
      console.log('✅ [KantPhilosophyFlashcards] Input validation passed');

      console.log('🤖 [KantPhilosophyFlashcards] Starting Gemini AI flashcard generation...');
      // Use service to generate flashcards
      const result = await KantPhilosophyFlashcardsService.generateFlashcards({
        paragraph,
        thinker,
        work,
        chapter,
        language,
        extraCards
      });

      console.log('✅ [KantPhilosophyFlashcards] Gemini generation completed successfully');
      console.log('📤 [KantPhilosophyFlashcards] Response - Total cards:', result.flashcards.length);

      const response = {
        success: true,
        flashcards: result.flashcards,
        metadata: result.metadata
      };

      console.log('🎉 [KantPhilosophyFlashcards] API call completed successfully');
      return response;

    } catch (error) {
      console.error('❌ [KantPhilosophyFlashcards] Error occurred:', error);
      console.error('❌ [KantPhilosophyFlashcards] Error type:', error instanceof Error ? error.constructor.name : typeof error);
      console.error('❌ [KantPhilosophyFlashcards] Error message:', error instanceof Error ? error.message : String(error));

      // Set appropriate status code for error
      const isValidationError = error instanceof Error && (
        error.message.includes('שדה חובה') ||
        error.message.includes('קצרה מדי') ||
        error.message.includes('ריקה')
      );

      set.status = isValidationError ? 400 : 500;
      console.log('📊 [KantPhilosophyFlashcards] HTTP status set to:', set.status);

      const errorResponse = {
        success: false,
        error: 'נכשל בעיבוד הבקשה ליצירת כרטיסי זיכרון',
        message: error instanceof Error ? error.message : 'שגיאה לא ידועה'
      };

      console.log('📤 [KantPhilosophyFlashcards] Error response:', errorResponse);
      return errorResponse;
    }
  }, {
    body: KantPhilosophyFlashcardsModel.generateFlashcardsBody,
    response: {
      200: KantPhilosophyFlashcardsModel.generateFlashcardsResponse,
      400: KantPhilosophyFlashcardsModel.errorResponse,
      500: KantPhilosophyFlashcardsModel.errorResponse
    },
    detail: {
      summary: 'יצירת כרטיסי זיכרון (Flashcards) מפסקה בפילוסופיה של קאנט',
      description: `
מנתח פסקה מתוך טקסט אקדמי בפילוסופיה של קאנט ויוצר ממנה כרטיסי זיכרון (Flashcards) איכותיים בסגנון Anki.
משתמש ב-Google Gemini AI לניתוח סמנטי חכם של הטקסט.

**מתמחה ב:**
- אידאליזם טרנסצנדנטלי
- אימפרטיב קטגורי
- תורת הקריטיקות (ביקורת התבונה הטהורה/המעשית/כוח השיפוט)
- הבחנות מרכזיות: תופעה/דבר-בעצמו, א-פריורי/א-פוסטריורי, אנליטי/סינתטי

**סוגי כרטיסים:**
- Concept: מושג מרכזי או הגדרה
- Argument: טיעון או הנמקה
- Context: הקשר היסטורי או פילוסופי
- Contrast: השוואה או ניגוד בין רעיונות

**עקרונות:**
- אטומיות: כל כרטיס עוסק ברעיון אחד בלבד
- ניסוח אקטיבי: שאלות 'למה', 'איך', 'מה ההבדל'
- דיוק אקדמי: שמירה על המשמעות המקורית
- הקשר: כל תשובה כוללת את הרציונל של קאנט
      `,
      tags: ['Anki - Philosophy'],
      responses: {
        200: {
          description: 'כרטיסי הזיכרון נוצרו בהצלחה',
          content: {
            'application/json': {
              example: {
                success: true,
                flashcards: [
                  {
                    type: "Concept",
                    front: "מהו האימפרטיב הקטגורי לפי קאנט?",
                    back: "ציווי מוחלט המחייב פעולה מתוך חובה, ללא תלות בנטיות או תוצאות.",
                    context_logic: "האימפרטיב הקטגורי הוא עקרון היסוד של המוסר הקאנטיאני, המבוסס על אוטונומיה של התבונה.",
                    tags: ["Concept", "קאנט", "הנחות יסוד", "אימפרטיב קטגורי"]
                  }
                ],
                metadata: {
                  thinker: "קאנט",
                  work: "הנחות יסוד למטפיזיקה של המידות",
                  chapter: "חלק ראשון",
                  totalCards: 1
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
