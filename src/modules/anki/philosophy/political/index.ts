import { Elysia } from 'elysia';
import { PoliticalPhilosophyFlashcardsService } from './service';
import { PoliticalPhilosophyFlashcardsModel } from './model';

/**
 * Political Philosophy Flashcards Controller
 *
 * Endpoint for generating flashcards from political philosophy texts.
 * Route: /anki/philosophy/political
 */
export const politicalPhilosophyFlashcardsController = new Elysia({
  prefix: '',
  name: 'PoliticalPhilosophyFlashcards.Controller'
})
  .post('/', async ({ body, set }) => {
    const { paragraph, thinker, work, chapter, language, extraCards } = body;

    console.log('📚 [PoliticalPhilosophyFlashcards] API call received');
    console.log('📥 [PoliticalPhilosophyFlashcards] Input - Thinker:', thinker);
    console.log('📥 [PoliticalPhilosophyFlashcards] Input - Work:', work);
    console.log('📥 [PoliticalPhilosophyFlashcards] Input - Chapter:', chapter || 'Not specified');
    console.log('📥 [PoliticalPhilosophyFlashcards] Input - Language:', language || 'he');
    console.log('📥 [PoliticalPhilosophyFlashcards] Input - Extra Cards:', extraCards || false);
    console.log('📥 [PoliticalPhilosophyFlashcards] Input - Paragraph length:', paragraph.length, 'characters');

    try {
      console.log('✅ [PoliticalPhilosophyFlashcards] Starting input validation...');
      // Validate input using service
      PoliticalPhilosophyFlashcardsService.validateInput({
        paragraph,
        thinker,
        work,
        chapter,
        language,
        extraCards
      });
      console.log('✅ [PoliticalPhilosophyFlashcards] Input validation passed');

      console.log('🤖 [PoliticalPhilosophyFlashcards] Starting Gemini AI flashcard generation...');
      // Use service to generate flashcards
      const result = await PoliticalPhilosophyFlashcardsService.generateFlashcards({
        paragraph,
        thinker,
        work,
        chapter,
        language,
        extraCards
      });

      console.log('✅ [PoliticalPhilosophyFlashcards] Gemini generation completed successfully');
      console.log('📤 [PoliticalPhilosophyFlashcards] Response - Total cards:', result.flashcards.length);

      const response = {
        success: true,
        flashcards: result.flashcards,
        metadata: result.metadata
      };

      console.log('🎉 [PoliticalPhilosophyFlashcards] API call completed successfully');
      return response;

    } catch (error) {
      console.error('❌ [PoliticalPhilosophyFlashcards] Error occurred:', error);
      console.error('❌ [PoliticalPhilosophyFlashcards] Error type:', error instanceof Error ? error.constructor.name : typeof error);
      console.error('❌ [PoliticalPhilosophyFlashcards] Error message:', error instanceof Error ? error.message : String(error));

      // Set appropriate status code for error
      const isValidationError = error instanceof Error && (
        error.message.includes('שדה חובה') ||
        error.message.includes('קצרה מדי') ||
        error.message.includes('ריקה')
      );

      set.status = isValidationError ? 400 : 500;
      console.log('📊 [PoliticalPhilosophyFlashcards] HTTP status set to:', set.status);

      const errorResponse = {
        success: false,
        error: 'נכשל בעיבוד הבקשה ליצירת כרטיסי זיכרון',
        message: error instanceof Error ? error.message : 'שגיאה לא ידועה'
      };

      console.log('📤 [PoliticalPhilosophyFlashcards] Error response:', errorResponse);
      return errorResponse;
    }
  }, {
    body: PoliticalPhilosophyFlashcardsModel.generateFlashcardsBody,
    response: {
      200: PoliticalPhilosophyFlashcardsModel.generateFlashcardsResponse,
      400: PoliticalPhilosophyFlashcardsModel.errorResponse,
      500: PoliticalPhilosophyFlashcardsModel.errorResponse
    },
    detail: {
      summary: 'יצירת כרטיסי זיכרון (Flashcards) מפסקה בפילוסופיה פוליטית',
      description: `
מנתח פסקה מתוך טקסט אקדמי בפילוסופיה פוליטית ויוצר ממנה כרטיסי זיכרון (Flashcards) איכותיים בסגנון Anki.
משתמש ב-Google Gemini AI לניתוח סמנטי חכם של הטקסט.

**סוגי כרטיסים:**
- Concept: מושג מרכזי או הגדרה
- Argument: טיעון או הנמקה
- Context: הקשר היסטורי או פילוסופי
- Contrast: השוואה או ניגוד בין רעיונות

**עקרונות:**
- אטומיות: כל כרטיס עוסק ברעיון אחד בלבד
- ניסוח אקטיבי: שאלות 'למה', 'איך', 'מה ההבדל'
- דיוק אקדמי: שמירה על המשמעות המקורית
- הקשר: כל תשובה כוללת את הרציונל של ההוגה
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
                    type: "Argument",
                    front: "מדוע, לפי הובס, \"המצב הטבעי\" הוא בהכרח מצב של מלחמה?",
                    back: "בשל השילוב בין שוויון ביכולת להרוג, מחסור במשאבים, והיעדר ריבון מוסכם המטיל מורא.",
                    context_logic: "היעדר סמכות מרכזית מוביל לכך שכל אדם פועל לפי 'הזכות לטבע' לשימור עצמי, מה שיוצר חוסר ביטחון תמידי.",
                    tags: ["Argument", "הובס", "לויתן", "מצב הטבע"]
                  }
                ],
                metadata: {
                  thinker: "הובס",
                  work: "לויתן",
                  chapter: "פרק יג",
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
