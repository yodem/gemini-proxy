# Political Philosophy Flashcards API - Integration Guide

## Overview
This API endpoint generates high-quality Anki-style flashcards from political philosophy texts using Google Gemini AI. It follows academic standards and Anki learning methodology.

**Important**: The AI typically creates **1 card per paragraph**, but will create **2 cards** when the paragraph contains two distinct ideas or aspects. The response always returns an **array of flashcards** (even if it contains just one card).

---

## Endpoint Details

**URL:** `POST /generateFlashcards/`

**Base URL:** `http://localhost:4000` (or your configured server)

**Content-Type:** `application/json`

---

## Request Structure

### Required Fields

```typescript
interface GenerateFlashcardsRequest {
  paragraph: string;      // The paragraph to analyze (minimum 20 characters)
  thinker: string;        // Name of the philosopher/thinker
  work: string;           // Name of the work/book
  chapter?: string;       // Optional: specific chapter
  language?: 'he' | 'en'; // Optional: output language (default: 'he')
  extraCards?: boolean;   // Optional: deep analysis mode for more cards (default: false)
}
```

### Field Descriptions

- **`paragraph`** (required, string, min 20 chars)
  - The philosophical text paragraph to analyze
  - Should contain meaningful philosophical content
  - Example: `"במצב הטבעי, לפי הובס, כל אדם שווה באופן יסודי..."`

- **`thinker`** (required, string)
  - Name of the philosopher
  - Examples: `"הובס"`, `"לוק"`, `"רוסו"`, `"קאנט"`, `"מקיאוולי"`

- **`work`** (required, string)
  - Name of the philosophical work
  - Examples: `"לויתן"`, `"שני מאמרים על הממשל"`, `"האמנה החברתית"`

- **`chapter`** (optional, string)
  - Specific chapter or section
  - Examples: `"פרק יג"`, `"חלק ראשון"`, `"Book II, Chapter 5"`

- **`language`** (optional, 'he' | 'en', default: 'he')
  - Output language for flashcards
  - Currently optimized for Hebrew (`'he'`)

- **`extraCards`** (optional, boolean, default: false)
  - When `true`, activates **deep analysis mode**
  - AI performs comprehensive analysis and creates additional cards for:
    - Secondary concepts and nuances
    - Examples and analogies
    - Historical and philosophical contexts
    - Implications and conclusions
    - Fine distinctions and comparisons
  - Typical output: **3-6 cards** in this mode (vs. 1-2 in normal mode)
  - Use when you want thorough coverage of a rich philosophical paragraph

---

## Response Structure

### Success Response (200)

```typescript
interface GenerateFlashcardsResponse {
  success: true;
  flashcards: Flashcard[];
  metadata: {
    thinker: string;
    work: string;
    chapter?: string;
    totalCards: number;
  };
}

interface Flashcard {
  type: 'Concept' | 'Argument' | 'Context' | 'Contrast';
  front: string;           // The question
  back: string;            // The answer
  context_logic: string;   // Additional explanation of the logic
  tags: string[];          // Array of tags for categorization
}
```

### Flashcard Types

- **`Concept`**: Core concept or definition
- **`Argument`**: Argument or reasoning
- **`Context`**: Historical or philosophical context
- **`Contrast`**: Comparison or contrast between ideas

### Error Response (400/500)

```typescript
interface ErrorResponse {
  success: false;
  error: string;
  message?: string;
}
```

---

## Two Analysis Modes

### Normal Mode (`extraCards: false` - default)

**Best for:** Standard learning, most paragraphs

**Characteristics:**
- Focuses on main ideas only
- Typically generates **1-2 cards**
- Creates one card per distinct core concept
- Efficient for routine study material

**Example output:**
```json
{
  "success": true,
  "flashcards": [
    {
      "type": "Concept",
      "front": "מהו מושג השוויון של הובס במצב הטבע?",
      "back": "...",
      "context_logic": "...",
      "tags": ["Concept", "הובס", "לויתן"]
    }
  ]
}
```

### Deep Analysis Mode (`extraCards: true`)

**Best for:** Complex paragraphs, exam preparation, comprehensive study

**Characteristics:**
- In-depth analysis of all aspects
- Typically generates **3-6 cards**
- Covers main ideas, secondary concepts, examples, contexts, implications, nuances
- Thorough coverage for critical passages

**Example output:**
```json
{
  "success": true,
  "flashcards": [
    {
      "type": "Concept",
      "front": "מהו מושג השוויון של הובס במצב הטבע?",
      ...
    },
    {
      "type": "Argument",
      "front": "מדוע לפי הובס כוח פיזי לא מבטיח עליונות?",
      ...
    },
    {
      "type": "Context",
      "front": "מה הקשר בין שוויון במצב הטבע לרעיון הזכות לטבע?",
      ...
    },
    {
      "type": "Contrast",
      "front": "מה ההבדל בין תפיסת השוויון של הובס לבין המסורת הקלאסית?",
      ...
    }
  ]
}
```

**When to use Extra Cards mode:**
- Dense philosophical paragraphs with multiple layers
- Key foundational texts (e.g., Hobbes' state of nature, Locke's property theory)
- Exam preparation where deep understanding is required
- Complex arguments with multiple premises
- Paragraphs introducing core concepts in a thinker's philosophy

---

## Complete Example

### Request

```bash
curl -X POST http://localhost:4000/generateFlashcards/ \
  -H "Content-Type: application/json" \
  -d '{
    "paragraph": "במצב הטבעי, לפי הובס, כל אדם שווה באופן יסודי בכך שכל אחד מסוגל להרוג את זולתו. שוויון זה נובע לא מיכולות גופניות זהות, אלא מהעובדה שגם החלש ביותר יכול להרוג את החזק ביותר באמצעות תחבולה או קואליציה. מצב זה מוביל בהכרח למלחמת הכל בכל.",
    "thinker": "הובס",
    "work": "לויתן",
    "chapter": "פרק יג",
    "language": "he",
    "extraCards": false
  }'
```

### Response

```json
{
  "success": true,
  "flashcards": [
    {
      "type": "Concept",
      "front": "כיצד מגדיר הובס את מושג ה\"שוויון\" היסודי בין בני האדם במצב הטבע?",
      "back": "השוויון לפי הובס הוא היכולת המשותפת של כל אדם להרוג את זולתו, ללא קשר להבדלים פיזיים.",
      "context_logic": "הובס מניח שוויון רדיקלי המבוסס על פגיעות הדדית (Mutual vulnerability). בניגוד למסורת הקלאסית, השוויון אינו ערך מוסרי אלא עובדה קיומית המייצרת סכנה.",
      "tags": ["Concept", "הובס", "לויתן", "שוויון", "פרק יג"]
    },
    {
      "type": "Argument",
      "front": "מדוע הבדלים בכוח פיזי או בכישרון אינם מעניקים יתרון מוחלט לאדם אחד על פני אחר במצב הטבע?",
      "back": "משום שגם האדם החלש ביותר יכול להרוג את החזק ביותר באמצעות שימוש בתחבולה (עורמה) או על ידי התאגדות עם אחרים (קואליציה).",
      "context_logic": "הלוגיקה של הובס היא שאין פער כוחות גדול מספיק בטבע שיכול להבטיח לאדם חסינות מפני מוות אלים, מה שמנטרל יתרונות טבעיים.",
      "tags": ["Argument", "הובס", "לויתן", "שוויון", "מצב הטבע"]
    },
    {
      "type": "Argument",
      "front": "מהי התוצאה ההכרחית של השוויון ביכולת ההיזק ההדדית בהיעדר ריבון?",
      "back": "היווצרותה של \"מלחמת הכל בכל\" (Bellum omnium contra omnes).",
      "context_logic": "כאשר בני אדם שווים ביכולתם להזיק זה לזה, ואין כוח משותף שיטיל עליהם מורא, כל אדם הופך לאיום פוטנציאלי תמידי על חיי זולתו, מה שמוביל למצב של לוחמה מתמדת.",
      "tags": ["Argument", "הובס", "לויתן", "מלחמת הכל בכל", "מצב הטבע"]
    }
  ],
  "metadata": {
    "thinker": "הובס",
    "work": "לויתן",
    "chapter": "פרק יג",
    "totalCards": 3
  }
}
```

---

## JavaScript/TypeScript Integration Examples

### Using Fetch API

```typescript
async function generateFlashcards(
  paragraph: string,
  thinker: string,
  work: string,
  chapter?: string,
  language: 'he' | 'en' = 'he',
  extraCards: boolean = false
) {
  const response = await fetch('http://localhost:4000/generateFlashcards/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      paragraph,
      thinker,
      work,
      chapter,
      language,
      extraCards
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to generate flashcards');
  }

  return await response.json();
}

// Usage
try {
  const result = await generateFlashcards(
    "במצב הטבעי, לפי הובס...",
    "הובס",
    "לויתן",
    "פרק יג",
    "he",
    false  // Normal mode: 1-2 cards
  );
  
  console.log(`Generated ${result.metadata.totalCards} flashcards`);
  result.flashcards.forEach(card => {
    console.log(`[${card.type}] ${card.front}`);
  });
} catch (error) {
  console.error('Error:', error.message);
}

// Deep analysis mode
try {
  const result = await generateFlashcards(
    "במצב הטבעי, לפי הובס...",
    "הובס",
    "לויתן",
    "פרק יג",
    "he",
    true  // Extra cards mode: 3-6 cards
  );
  
  console.log(`Generated ${result.metadata.totalCards} flashcards (deep mode)`);
} catch (error) {
  console.error('Error:', error.message);
}
```

### Using Axios

```typescript
import axios from 'axios';

async function generateFlashcards(request: {
  paragraph: string;
  thinker: string;
  work: string;
  chapter?: string;
  language?: 'he' | 'en';
  extraCards?: boolean;
}) {
  try {
    const response = await axios.post(
      'http://localhost:4000/generateFlashcards/',
      request
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Failed to generate flashcards');
    }
    throw error;
  }
}
```

---

## Validation Rules

### Input Validation

1. **`paragraph`**:
   - Must be a non-empty string
   - Minimum length: 20 characters
   - Should contain meaningful philosophical content

2. **`thinker`**:
   - Must be a non-empty string
   - Required field

3. **`work`**:
   - Must be a non-empty string
   - Required field

4. **`chapter`**:
   - Optional string
   - Can be omitted

5. **`language`**:
   - Optional, must be either `'he'` or `'en'`
   - Defaults to `'he'` if not provided

6. **`extraCards`**:
   - Optional boolean
   - Defaults to `false` if not provided
   - When `true`, activates deep analysis mode for comprehensive coverage

### Error Messages (Hebrew)

- `"הפסקה לניתוח היא שדה חובה ולא יכולה להיות ריקה"` - Paragraph is required
- `"הפסקה קצרה מדי. יש להזין לפחות 20 תווים"` - Paragraph too short
- `"שם ההוגה הוא שדה חובה"` - Thinker name is required
- `"שם היצירה הוא שדה חובה"` - Work name is required

---

## Key Principles (Built into the AI)

The AI follows these principles when generating flashcards:

1. **Atomicity (אטומיות)**: Each card focuses on ONE idea only
2. **Active Formulation (ניסוח אקטיבי)**: Uses 'why', 'how', 'what's the difference' questions
3. **Academic Precision (דיוק אקדמי)**: Maintains original meaning without oversimplification
4. **Context (הקשר)**: Answers include the thinker's rationale
5. **Appropriate Card Count**: The AI creates **1 card** for paragraphs with a single main idea, and **2 cards** when there are two distinct ideas or aspects. It doesn't force multiple cards unnecessarily

---

## HTTP Status Codes

- **200**: Success - Flashcards generated successfully
- **400**: Bad Request - Invalid input (missing required fields, paragraph too short, etc.)
- **500**: Internal Server Error - AI service error or processing failure

---

## Notes for Integration

1. **Language**: The system is optimized for Hebrew (`he`) but supports English (`en`)
2. **Response Time**: Expect 3-10 seconds depending on paragraph length and complexity (longer with `extraCards: true`)
3. **Card Count**: 
   - **Normal mode** (`extraCards: false`): Typically **1 card**, sometimes **2 cards** when paragraph contains two distinct ideas
   - **Deep analysis mode** (`extraCards: true`): Typically **3-6 cards** with comprehensive coverage of all aspects
4. **Response Structure**: Always returns an array of flashcards in the `flashcards` field, even if only one card is generated
5. **Tags**: Each card automatically includes: card type, thinker name, work name, chapter (if provided), and key concepts
6. **Error Handling**: Always check the `success` field in the response before processing flashcards
7. **Extra Cards Mode**: Use sparingly for particularly rich/complex paragraphs where deep understanding is critical

---

## Testing the Endpoint

### Quick Test with cURL

```bash
curl -X POST http://localhost:4000/generateFlashcards/ \
  -H "Content-Type: application/json" \
  -d '{
    "paragraph": "לפי לוק, הקניין הפרטי נוצר כאשר אדם מערבב את עבודתו עם משאב טבעי. העבודה היא רכושו של האדם, ולכן התוצר הופך לרכושו.",
    "thinker": "לוק",
    "work": "שני מאמרים על הממשל",
    "language": "he"
  }'
```

### Expected Response Structure

```json
{
  "success": true,
  "flashcards": [
    {
      "type": "Concept",
      "front": "...",
      "back": "...",
      "context_logic": "...",
      "tags": ["..."]
    }
  ],
  "metadata": {
    "thinker": "לוק",
    "work": "שני מאמרים על הממשל",
    "totalCards": 2
  }
}
```

---

## API Documentation

Full OpenAPI documentation is available at:
- **Swagger UI**: `http://localhost:4000/docs`
- **OpenAPI JSON**: `http://localhost:4000/docs/json`

---

## Common Use Cases

### 1. Processing a Single Paragraph
```typescript
const result = await generateFlashcards(
  "Your philosophical paragraph here...",
  "Philosopher Name",
  "Book Title"
);
```

### 2. Batch Processing Multiple Paragraphs
```typescript
const paragraphs = [
  { text: "...", thinker: "הובס", work: "לויתן", chapter: "פרק יג" },
  { text: "...", thinker: "לוק", work: "שני מאמרים על הממשל" },
];

const allFlashcards = [];
for (const para of paragraphs) {
  const result = await generateFlashcards(
    para.text,
    para.thinker,
    para.work,
    para.chapter
  );
  allFlashcards.push(...result.flashcards);
}
```

### 3. Filtering by Card Type
```typescript
const result = await generateFlashcards(...);
const argumentCards = result.flashcards.filter(card => card.type === 'Argument');
const conceptCards = result.flashcards.filter(card => card.type === 'Concept');
```

---

## Support

For issues or questions about the API, check:
1. Server logs for detailed error information
2. OpenAPI documentation at `/docs`
3. Validate your request structure matches the schema above

