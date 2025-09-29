/**
 * Shared utilities for category identification across all services
 * Eliminates code duplication and provides consistent logic
 */

// Shared constants for category identification
export const CategoryConstants = {
  // Acronym mappings for Jewish philosophy
  ACRONYMS: {
    'רס״ג': 'רבי סעדיה גאון',
    'רמב״ם': 'רבי משה בן מימון',
    // Add more acronyms as needed
  },

  // Book-to-author mappings
  BOOK_AUTHOR_MAPPINGS: {
    'מורה נבוכים': 'רמב״ם',
    'שמונה פרקים': 'רמב״ם', 
    'משנה תורה': 'רמב״ם',
    'אמונות ודעות': 'רס״ג',
    'ספר יצירה': 'קבלה',
    'ספר הזוהר': 'קבלה',
  },

  // Keywords that should trigger the חז״ל category
  CHAZAL_KEYWORDS: [
    'משנה',
    'תלמוד',
    'גמרא',
    'ברייתא',
    'תוספתא',
    'חכמים',
    'תנאים',
    'אמוראים'
  ],

  // Common examples used across all services
  EXAMPLES: [
    {
      title: 'היחס לגיוס לצה״ל להגותו של שעיהו ליבוביץ',
      description: 'אשמח לדעת מה דעת הפרופסור לגביי גיוס לצבא בעד או לא ומה הוא חושב על דעתו של פרופסור ישעיהו ליבוביץ בכלל גם צבאי וגם איך הוא תופס את משנתו של ליבוביץ',
      expectedCategories: ['כללי']
    },
    {
      title: 'השכל העיוני',
      description: 'על פי הפילוסופיה של הרמב״ם, השכל העיוני הוא חלק מהשכל האחראי על ידע תיאורטי, כמו מדעי טבע, להבדיל מידע מעשי כמו הנדסה. ידע זה כולל הבנה מושגית של דברים, לדוגמה, מי הוא אלוהים להבדיל מאיך לדבר עם אלוהים. השכל העיוני נחשב לכוח החשוב ביותר מכל כוחות הנפש, והוא היחיד שממשיך להתקיים גם לאחר המוות.',
      expectedCategories: ['רמב״ם', 'פילוסופיה אריסטוטלית']
    }
  ]
};

// Shared Hebrew text snippets for prompts
export const HebrewPromptSnippets = {
  INTRODUCTION: 'אתה עוזר לזיהוי קטגוריות בתחום הפילוסופיה היהודית עבור אתר אקדמי. אני רוצה שתנתח כותרת ותיאור של תוכן ותזהה את הקטגוריות הרלוונטיות ביותר בצורה מדויקת ומדעית.',

  ACADEMIC_PRECISION: 'חשוב מאוד: זהו אתר אקדמי ונדרשת דיוק מקסימלי. בחר רק קטגוריות שיש להן קשר ישיר ומוכח לתוכן הנתון.',

  SELECTION_PRINCIPLES: `עקרונות לבחירה:
1. דיוק אקדמי: בחר רק קטגוריות שהן רלוונטיות באופן ישיר לכותרת ולתיאור
2. זיהוי ראשי תיבות: רס״ג = רבי סעדיה גאון, רמב״ם = רבי משה בן מימון, וכו׳
3. זיהוי ספרים ומחבריהם:
   - מורה נבוכים, שמונה פרקים, משנה תורה = רמב״ם
   - אמונות ודעות = רס״ג
   - ספר יצירה, ספר הזוהר = קבלה
4. תוכן חז״ל: כל תוכן הקשור למשנה, תלמוד או חכמים מאותה תקופה = חז״ל
5. אל תגביל את מספר הקטגוריות - התמקד בדיוק בלבד
6. הימנע מכפייה: אל תנסה לכפות קטגוריות שאינן מתאימות`,

  CONSIDERATIONS: `שקול בקפידה:
- הנושא המרכזי המוצג בכותרת ובתיאור
- ההקשר הפילוסופי והיהודי הספציפי
- הקשר המדויק לתורת ישראל ולמסורת היהודית
- ערכי היסוד והמושגים היהודיים המרכזיים המוזכרים
- זיהוי מחברים דרך ספריהם או ראשי תיבות
- כל תוכן הוא ייחודי - אל תסתמך רק על הדוגמאות, נתח את התוכן הספציפי הזה`,

  JSON_FORMAT_INSTRUCTION: `החזר תשובה בפורמט JSON בלבד:
{
  "categories": ["קטגוריה מהרשימה 1", "קטגוריה מהרשימה 2"]
}

אל תוסיף סימני קוד או עיצוב markdown.
ודא שאתה בוחר רק קטגוריות מהרשימה שסופקה.
זכור: דיוק אקדמי חשוב יותר מכמות הקטגוריות.
הדוגמאות שניתנו הן רק דוגמאות - יכולות להיות הרבה קטגוריות אחרות או צירופים שונים לחלוטין בהתאם לתוכן הספציפי.`,

  EMPTY_RESPONSE_INSTRUCTION: 'אם התוכן אינו מתאים לאף קטגוריה מהרשימה, החזר רשימה ריקה.'
};

/**
 * Builds a formatted list of categories for prompts
 */
export function buildCategoriesList(categories: string[]): string {
  return categories.map((cat, index) => `${index + 1}. ${cat}`).join('\n');
}

/**
 * Builds the examples section for prompts
 */
export function buildExamplesSection(): string {
  const examples = CategoryConstants.EXAMPLES
    .map(example => 
      `כותרת: "${example.title}"\n` +
      `תיאור: "${example.description}"\n` +
      `תשובה נכונה: ${JSON.stringify(example.expectedCategories)}`
    ).join('\n\n');

  return `חשוב: הדוגמאות הבאות הן רק דוגמאות מייצגות ולא מגבילות. יש אפשרויות רבות נוספות וצירופים שונים של קטגוריות בהתאם לתוכן הספציפי.\n\n${examples}\n\nשוב, אלו רק דוגמאות - יש מקרים רבים נוספים ואתה צריך לנתח כל תוכן בנפרד ולהחליט על הקטגוריות המתאימות בדיוק לאותו תוכן ספציפי.`;
}

/**
 * Builds a complete Hebrew prompt for category identification
 */
export function buildCategoryPrompt(
  title: string, 
  description: string, 
  categories: string[],
  customIntroduction?: string,
  clarificationParagraph?: string
): string {
  const categoriesList = buildCategoriesList(categories);
  const examples = buildExamplesSection();
  const introduction = customIntroduction || HebrewPromptSnippets.INTRODUCTION;
  
  // Build the clarification section if provided
  const clarificationSection = clarificationParagraph 
    ? `\nהקשר נוסף להבהרה: ${clarificationParagraph}\n`
    : '';

  return `${introduction}

כותרת: ${title}
תיאור: ${description}${clarificationSection}

רשימת הקטגוריות הזמינות:
${categoriesList}

${HebrewPromptSnippets.ACADEMIC_PRECISION}

${HebrewPromptSnippets.SELECTION_PRINCIPLES}

דוגמאות:

${examples}

${HebrewPromptSnippets.CONSIDERATIONS}

${HebrewPromptSnippets.EMPTY_RESPONSE_INSTRUCTION}

${HebrewPromptSnippets.JSON_FORMAT_INSTRUCTION}`;
}

/**
 * Cleans response text by removing markdown markers
 */
export function cleanResponseText(responseText: string): string {
  let cleanText = responseText.trim();

  // Remove ```json and ``` markers if present
  if (cleanText.startsWith('```json')) {
    cleanText = cleanText.replace(/^```json\s*/, '');
  }
  if (cleanText.startsWith('```')) {
    cleanText = cleanText.replace(/^```\s*/, '');
  }
  if (cleanText.endsWith('```')) {
    cleanText = cleanText.replace(/\s*```$/, '');
  }

  return cleanText.trim();
}

/**
 * Parses and validates Gemini response for category identification
 */
export function parseAndValidateCategoriesResponse(
  responseText: string, 
  categories: string[]
): string[] {
  try {
    const cleanText = cleanResponseText(responseText);
    const parsed = JSON.parse(cleanText);

    // Check if response is in expected format
    if (parsed && typeof parsed === 'object' && Array.isArray(parsed.categories)) {
      // New format: { "categories": [...] }
      const validCategories = parsed.categories.filter((cat: any) =>
        typeof cat === 'string' && categories.includes(cat.trim())
      );
      return validCategories;
    } else if (Array.isArray(parsed)) {
      // Old format: direct array
      const validCategories = parsed.filter((cat: any) =>
        typeof cat === 'string' && categories.includes(cat.trim())
      );
      return validCategories;
    } else {
      throw new Error('Response is not in expected format');
    }
  } catch (parseError) {
    console.error('Failed to parse Gemini response as JSON:', responseText);
    
    // Fallback: try to extract categories from text response
    return extractCategoriesFromText(responseText, categories);
  }
}

/**
 * Fallback method to extract categories from text response
 */
export function extractCategoriesFromText(text: string, categories: string[]): string[] {
  const extractedCategories = categories.filter(cat =>
    text.toLowerCase().includes(cat.toLowerCase())
  );
  return extractedCategories;
}

/**
 * Validates input data for category identification
 */
export function validateCategoryInput(
  categories: string[], 
  title: string, 
  description: string
): void {
  if (!categories || !Array.isArray(categories) || categories.length === 0) {
    throw new Error('Categories array is required and must not be empty');
  }

  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    throw new Error('Title is required and must be a non-empty string');
  }

  if (!description || typeof description !== 'string' || description.trim().length === 0) {
    throw new Error('Description is required and must be a non-empty string');
  }
}

/**
 * Builds YouTube-specific prompt (inherits from base with custom introduction)
 */
export function buildYouTubePrompt(
  categories: string[], 
  videoId: string, 
  youtubeUrl: string
): string {
  const customIntroduction = `אתה עוזר אנליזה של סרטוני יוטיוב בתחום הפילוסופיה היהודית. הסרטונים הם של פרופ׳ שלום צדיק. אני רוצה שבסיכום שלך תכתוב את הנושא המרכזי שפרופ׳ שלום מדבר עליו ותסביר אותו בקצרה תוך שאתה צמוד לתוכן הסרטון.

נתון לך סרטון יוטיוב עם המזהה: ${videoId}
קישור: ${youtubeUrl}

עליך:
1. ליצור תיאור קצר וממוקד של תוכן הסרטון בעברית (4-5 משפטים בלבד שמסכמים את הנושא העיקרי שפרופ׳ שלום צדיק מדבר עליו)
2. לזהות את הקטגוריות מהרשימה שתואמות בצורה הטובה ביותר לתוכן הסרטון

עקרונות לבחירת קטגוריות:
1. דיוק אקדמי: בחר רק קטגוריות שהן רלוונטיות באופן ישיר לתוכן הסרטון
2. זיהוי ראשי תיבות: רס״ג = רבי סעדיה גאון, רמב״ם = רבי משה בן מימון, וכו׳
3. זיהוי ספרים ומחבריהם:
   - מורה נבוכים, שמונה פרקים, משנה תורה = רמב״ם
   - אמונות ודעות = רס״ג
   - ספר יצירה, ספר הזוהר = קבלה
4. תוכן חז״ל: כל תוכן הקשור למשנה, תלמוד או חכמים מאותה תקופה = חז״ל
5. אל תגביל את מספר הקטגוריות - התמקד בדיוק בלבד
6. הימנע מכפייה: אל תנסה לכפות קטגוריות שאינן מתאימות

שקול:
- הנושא המרכזי שהרב/הפרופסור מציג
- ההקשר הפילוסופי והיהודי
- הקשר לתורת ישראל ולמסורת היהודית
- ערכי היסוד והמושגים היהודיים המרכזיים
- זיהוי מחברים דרך ספריהם או ראשי תיבות

החזר תשובה בפורמט JSON בלבד עם המבנה הבא:
{
  "description": "תיאור קצר של 4-5 משפטים בעברית על הנושא המרכזי שפרופ׳ שלום צדיק מדבר עליו",
  "categories": ["קטגוריה מהרשימה 1", "קטגוריה מהרשימה 2"]
}

אל תכלול כל הסבר נוסף או טקסט מחוץ לפורמט JSON.
אל תוסיף סימני קוד (\`\`\`) או כל עיצוב markdown אחר.
החזר JSON נקי לחלוטין.
ודא שהתיאור מורכב מ-4 עד 5 משפטים בלבד ומתמקד בנושא המרכזי.
ודא שאתה בוחר רק קטגוריות מהרשימה שסופקה.
זכור: דיוק אקדמי חשוב יותר מכמות הקטגוריות.
חשוב: אל תהסס לבחור קטגוריות שונות לחלוטין מהדוגמאות - כל סרטון הוא ייחודי ונתח אותו בנפרד בהתאם לתוכן הספציפי שלו.`;

  const categoriesList = buildCategoriesList(categories);
  
  return `${customIntroduction}

רשימת הקטגוריות הזמינות:
${categoriesList}`;
}

/**
 * Parses YouTube-specific response with both description and categories
 */
export function parseYouTubeResponse(
  responseText: string, 
  categories: string[]
): { description: string; categories: string[] } {
  try {
    const cleanText = cleanResponseText(responseText);
    const parsed = JSON.parse(cleanText);

    // Validate structure
    if (!parsed.description) {
      throw new Error('Response does not contain description field');
    }
    if (!Array.isArray(parsed.categories)) {
      throw new Error('Response categories field is not an array');
    }

    // Validate that all returned categories are from the original list
    const validCategories = parsed.categories.filter((cat: any) =>
      typeof cat === 'string' && categories.includes(cat.trim())
    );

    return {
      description: parsed.description.trim(),
      categories: validCategories
    };
  } catch (parseError) {
    console.error('Failed to parse YouTube Gemini response as JSON:', responseText);
    
    // Fallback: create a basic response
    return {
      description: 'לא ניתן היה לנתח את תוכן הסרטון. אנא נסה שוב או בדוק את הקישור.',
      categories: []
    };
  }
}
