import { GoogleGenerativeAI } from '@google/generative-ai';
import { appConfig } from '../../config';
import type { PoliticalPhilosophyFlashcardsModel } from './model';
import { cleanResponseText } from '../shared/categoryUtils';

// Initialize Gemini AI client using configuration
const genAI = new GoogleGenerativeAI(appConfig.gemini.apiKey);
const model = genAI.getGenerativeModel({ model: appConfig.gemini.model });

// Types
type FlashcardType = 'Concept' | 'Argument' | 'Context' | 'Contrast';

interface Flashcard {
  type: FlashcardType;
  front: string;
  back: string;
  context_logic: string;
  tags: string[];
}

interface GenerateFlashcardsInput {
  paragraph: string;
  thinker: string;
  work: string;
  chapter?: string;
  language?: 'he' | 'en';
  extraCards?: boolean;
}

// Class for political philosophy flashcard generation business logic
export class PoliticalPhilosophyFlashcardsService {
  /**
   * Generates flashcards from a political philosophy paragraph using Gemini AI
   */
  static async generateFlashcards(
    input: GenerateFlashcardsInput
  ): Promise<{ flashcards: Flashcard[]; metadata: { thinker: string; work: string; chapter?: string; totalCards: number } }> {
    const { paragraph, thinker, work, chapter, language = 'he', extraCards = false } = input;

    console.log('📚 [Service] Starting flashcard generation');
    console.log('👤 [Service] Thinker:', thinker);
    console.log('📖 [Service] Work:', work);
    console.log('📄 [Service] Chapter:', chapter || 'Not specified');
    console.log('🌐 [Service] Language:', language);
    console.log('➕ [Service] Extra Cards Mode:', extraCards);
    console.log('📝 [Service] Paragraph length:', paragraph.length, 'characters');

    try {
      console.log('📝 [Service] Building prompt for Gemini...');
      const prompt = this.buildFlashcardPrompt(paragraph, thinker, work, chapter, language, extraCards);
      console.log('✅ [Service] Prompt built successfully (length:', prompt.length, 'characters)');

      console.log('🚀 [Service] Calling Gemini API...');
      const result = await model.generateContent(prompt);

      console.log('📡 [Service] Gemini API call completed');

      const response = await result.response;
      console.log('📨 [Service] Gemini response received');

      const text = response.text().trim();
      console.log('📄 [Service] Raw response text length:', text.length);
      console.log('📄 [Service] Raw response preview:', text.substring(0, 300) + (text.length > 300 ? '...' : ''));

      console.log('🔧 [Service] Parsing and validating response...');
      const flashcards = this.parseFlashcardsResponse(text, thinker, work, chapter);

      console.log('✅ [Service] Response parsing completed successfully');
      console.log('📊 [Service] Total flashcards generated:', flashcards.length);

      return {
        flashcards,
        metadata: {
          thinker,
          work,
          chapter,
          totalCards: flashcards.length
        }
      };

    } catch (error) {
      console.error('❌ [Service] Error in flashcard generation:', error);
      console.error('❌ [Service] Error type:', error instanceof Error ? error.constructor.name : typeof error);
      console.error('❌ [Service] Error message:', error instanceof Error ? error.message : String(error));

      if (error instanceof Error && error.stack) {
        console.error('❌ [Service] Error stack:', error.stack);
      }

      throw new Error('Failed to generate flashcards from paragraph');
    }
  }

  /**
   * Builds the prompt for Gemini AI flashcard generation
   */
  private static buildFlashcardPrompt(
    paragraph: string,
    thinker: string,
    work: string,
    chapter?: string,
    language: 'he' | 'en' = 'he',
    extraCards: boolean = false
  ): string {
    const chapterInfo = chapter ? `פרק: ${chapter}\n` : '';
    
    // Different instructions based on extraCards mode
    const cardCountInstructions = extraCards ? `
⚠️ חשוב מאוד - מצב ניתוח מעמיק (Extra Cards Mode):
- נדרש ניתוח מעמיק ויסודי של הפסקה
- צור כרטיסים עבור כל היבט, ניואנס והקשר בפסקה
- חפש רעיונות משניים, השלכות, דוגמאות והבחנות עדינות
- פסקה טיפוסית תייצר 3-6 כרטיסים במצב זה
- אל תחשוש ליצור כרטיסים רבים - זה המצב שבו אנחנו רוצים כיסוי מקיף
- כל פרט פילוסופי משמעותי ראוי לכרטיס נפרד
- היבטים שכדאי לחפש:
  * מושגים ראשיים ומשניים
  * טיעונים והנמקות
  * דוגמאות ואנלוגיות
  * הבחנות והשוואות
  * הקשרים היסטוריים ופילוסופיים
  * השלכות ומסקנות
  * ניואנסים מושגיים
` : `
⚠️ חשוב מאוד - כמות כרטיסים:
- בדרך כלל, פסקה מכילה 1-2 רעיונות מרכזיים
- צור כרטיס אחד אם הפסקה מתמקדת ברעיון בודד
- צור 2 כרטיסים אם הפסקה מכילה שני רעיונות נפרדים או היבטים שונים של אותו נושא
- אל תכפה יצירת כרטיסים מרובים אם הפסקה באמת עוסקת ברעיון אחד
`;

    const additionalGuidelines = extraCards ? `
הנחיות נוספות (מצב מעמיק):
- חפש כל פרט פילוסופי משמעותי ויצור עבורו כרטיס
- פסקה עשירה יכולה לייצר 4-6 כרטיסים או יותר
- כלול כרטיסים על הקשרים, דוגמאות והשלכות
- ודא שכל כרטיס עומד בפני עצמו ומובן ללא הפסקה המקורית
- השתמש במונחים המקוריים של ההוגה כשרלוונטי
- אל תכלול כל הסבר נוסף או טקסט מחוץ לפורמט JSON
- אל תוסיף סימני קוד (\`\`\`) או כל עיצוב markdown אחר
- החזר JSON נקי לחלוטין
` : `
הנחיות נוספות:
- צור כרטיס אחד אם הפסקה מתמקדת ברעיון מרכזי אחד
- צור 2 כרטיסים אם הפסקה מכילה שני רעיונות נפרדים או שני היבטים משמעותיים
- ודא שכל כרטיס עומד בפני עצמו ומובן ללא הפסקה המקורית
- השתמש במונחים המקוריים של ההוגה כשרלוונטי
- אל תכלול כל הסבר נוסף או טקסט מחוץ לפורמט JSON
- אל תוסיף סימני קוד (\`\`\`) או כל עיצוב markdown אחר
- החזר JSON נקי לחלוטין
`;
    
    return `אתה מומחה לפילוסופיה פוליטית ומומחה למתודולוגיית הלמידה Anki. תפקידך לנתח פסקאות מתוך טקסטים אקדמיים וליצור מהם כרטיסי זיכרון (Flashcards) איכותיים.

מידע על הטקסט:
הוגה: ${thinker}
יצירה: ${work}
${chapterInfo}
הפסקה לניתוח:
${paragraph}
${cardCountInstructions}
חוקי עבודה:
1. אטומיות: כל כרטיס יעסוק ברעיון אחד בלבד.
2. ניסוח אקטיבי: השתמש בשאלות 'למה', 'איך' ו'מה ההבדל', ולא רק ב'מי'.
3. דיוק אקדמי: אל תפשט את המושגים באופן שפוגע במשמעות המקורית.
4. הקשר: ודא שהתשובה כוללת את הרציונל של ההוגה.
5. עברית: כל התוכן צריך להיות בעברית.
6. כמות: צור כרטיס אחד לרעיון מרכזי. אם יש 2 רעיונות נפרדים - צור 2 כרטיסים.

סוגי כרטיסים (type):
- Concept: מושג מרכזי או הגדרה
- Argument: טיעון או הנמקה
- Context: הקשר היסטורי או פילוסופי
- Contrast: השוואה או ניגוד בין רעיונות

עבור כל רעיון מרכזי בפסקה, צור כרטיס שכולל:
- type: אחד מהסוגים (Concept/Argument/Context/Contrast)
- front: השאלה (ניסוח אקטיבי ומעורר חשיבה)
- back: התשובה (תמציתית אך מלאה, כולל הרציונל)
- context_logic: הסבר נוסף על הלוגיקה הפנימית והקשר לתורת ההוגה
- tags: מערך של תגיות רלוונטיות (כולל את סוג הכרטיס, שם ההוגה, שם היצירה, ומושגי מפתח)

החזר תשובה בפורמט JSON בלבד עם המבנה הבא:
{
  "flashcards": [
    {
      "type": "Argument",
      "front": "מדוע, לפי ${thinker}, [שאלה ספציפית מהטקסט]?",
      "back": "[תשובה תמציתית הכוללת את הרציונל]",
      "context_logic": "[הסבר על הלוגיקה הפנימית]",
      "tags": ["Argument", "${thinker}", "${work}"${chapter ? `, "${chapter}"` : ''}, "מושג מפתח"]
    }
  ]
}

דוגמה ליישום:
אם הפסקה עוסקת ב"המצב הטבעי" של הובס, כרטיס יכול להיראות כך:
{
  "type": "Argument",
  "front": "מדוע, לפי הובס, \\\"המצב הטבעי\\\" הוא בהכרח מצב של מלחמה (Bellum omnium contra omnes)?",
  "back": "בשל השילוב בין שוויון ביכולת להרוג, מחסור במשאבים, והיעדר ריבון מוסכם המטיל מורא.",
  "context_logic": "היעדר סמכות מרכזית מוביל לכך שכל אדם פועל לפי 'הזכות לטבע' לשימור עצמי, מה שיוצר חוסר ביטחון תמידי.",
  "tags": ["Argument", "הובס", "לויתן", "מצב הטבע", "מלחמת הכל בכל"]
}

${additionalGuidelines}`;
  }

  /**
   * Parses the Gemini response into flashcard objects
   */
  private static parseFlashcardsResponse(
    responseText: string,
    thinker: string,
    work: string,
    chapter?: string
  ): Flashcard[] {
    try {
      const cleanText = cleanResponseText(responseText);
      const parsed = JSON.parse(cleanText);

      if (!parsed.flashcards || !Array.isArray(parsed.flashcards)) {
        throw new Error('Response does not contain flashcards array');
      }

      // Validate and transform each flashcard
      const validFlashcards: Flashcard[] = parsed.flashcards
        .filter((card: any) => {
          return (
            card &&
            typeof card.type === 'string' &&
            ['Concept', 'Argument', 'Context', 'Contrast'].includes(card.type) &&
            typeof card.front === 'string' &&
            typeof card.back === 'string' &&
            typeof card.context_logic === 'string'
          );
        })
        .map((card: any) => ({
          type: card.type as FlashcardType,
          front: card.front.trim(),
          back: card.back.trim(),
          context_logic: card.context_logic.trim(),
          tags: Array.isArray(card.tags) 
            ? card.tags.filter((tag: any) => typeof tag === 'string')
            : [card.type, thinker, work, ...(chapter ? [chapter] : [])]
        }));

      if (validFlashcards.length === 0) {
        console.warn('⚠️ [Service] No valid flashcards found in response, creating fallback');
        return [{
          type: 'Concept',
          front: `מהו הרעיון המרכזי בקטע זה של ${thinker}?`,
          back: 'לא ניתן היה לעבד את הפסקה. אנא נסה שוב או הזן פסקה ארוכה יותר.',
          context_logic: 'יש לוודא שהפסקה מכילה תוכן פילוסופי מספיק לניתוח.',
          tags: ['Error', thinker, work]
        }];
      }

      return validFlashcards;

    } catch (parseError) {
      console.error('❌ [Service] Failed to parse flashcards response:', responseText);
      
      // Return a fallback flashcard
      return [{
        type: 'Concept',
        front: `מהו הרעיון המרכזי בקטע זה של ${thinker}?`,
        back: 'לא ניתן היה לעבד את התשובה מהמערכת. אנא נסה שוב.',
        context_logic: 'אירעה שגיאה בעיבוד התשובה.',
        tags: ['Error', thinker, work]
      }];
    }
  }

  /**
   * Validates input data
   */
  static validateInput(input: GenerateFlashcardsInput): void {
    console.log('✅ [Validate] Starting input validation');

    const { paragraph, thinker, work } = input;

    if (!paragraph || typeof paragraph !== 'string' || paragraph.trim().length === 0) {
      console.log('❌ [Validate] Paragraph is empty or invalid');
      throw new Error('הפסקה לניתוח היא שדה חובה ולא יכולה להיות ריקה');
    }

    if (paragraph.trim().length < 20) {
      console.log('❌ [Validate] Paragraph too short:', paragraph.length);
      throw new Error('הפסקה קצרה מדי. יש להזין לפחות 20 תווים');
    }

    if (!thinker || typeof thinker !== 'string' || thinker.trim().length === 0) {
      console.log('❌ [Validate] Thinker is empty or invalid');
      throw new Error('שם ההוגה הוא שדה חובה');
    }

    if (!work || typeof work !== 'string' || work.trim().length === 0) {
      console.log('❌ [Validate] Work is empty or invalid');
      throw new Error('שם היצירה הוא שדה חובה');
    }

    console.log('✅ [Validate] All input validation passed');
  }
}

