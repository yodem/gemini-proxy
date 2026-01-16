# Extra Cards Feature - Summary

## New Feature: Deep Analysis Mode

Added an optional `extraCards` boolean parameter that enables comprehensive analysis of philosophical paragraphs.

---

## What's New

### Request Parameter: `extraCards`

```typescript
interface GenerateFlashcardsRequest {
  paragraph: string;
  thinker: string;
  work: string;
  chapter?: string;
  language?: 'he' | 'en';
  extraCards?: boolean;  // 🆕 NEW PARAMETER
}
```

**Default:** `false`
**Type:** `boolean`

---

## How It Works

### Normal Mode (`extraCards: false`)
- **Focus:** Main ideas only
- **Output:** 1-2 cards typically
- **Use case:** Standard learning, routine study

### Deep Analysis Mode (`extraCards: true`)
- **Focus:** Comprehensive coverage of all aspects
- **Output:** 3-6 cards typically
- **Analyzes:**
  - Main and secondary concepts
  - Arguments and reasoning
  - Examples and analogies
  - Historical and philosophical contexts
  - Implications and conclusions
  - Fine distinctions and nuances
  - Comparisons and contrasts

---

## Example Usage

### Normal Request (1-2 cards)
```bash
curl -X POST http://localhost:4000/generateFlashcards/ \
  -H "Content-Type: application/json" \
  -d '{
    "paragraph": "במצב הטבעי, לפי הובס...",
    "thinker": "הובס",
    "work": "לויתן",
    "chapter": "פרק יג",
    "extraCards": false
  }'
```

**Expected output:** 1-2 focused cards

### Deep Analysis Request (3-6 cards)
```bash
curl -X POST http://localhost:4000/generateFlashcards/ \
  -H "Content-Type: application/json" \
  -d '{
    "paragraph": "במצב הטבעי, לפי הובס...",
    "thinker": "הובס",
    "work": "לויתן",
    "chapter": "פרק יג",
    "extraCards": true
  }'
```

**Expected output:** 3-6 comprehensive cards covering:
- Main concept (equality in state of nature)
- Why physical strength doesn't matter (cunning/coalition)
- Connection to "right of nature" concept
- Contrast with classical tradition
- Implications for social contract theory
- Role of fear in the dynamic

---

## TypeScript/JavaScript Integration

```typescript
// Normal mode
const normalCards = await generateFlashcards({
  paragraph: text,
  thinker: "הובס",
  work: "לויתן",
  extraCards: false  // 1-2 cards
});

// Deep analysis mode
const deepCards = await generateFlashcards({
  paragraph: text,
  thinker: "הובס",
  work: "לויתן",
  extraCards: true  // 3-6 cards
});

console.log(`Normal: ${normalCards.metadata.totalCards} cards`);
console.log(`Deep: ${deepCards.metadata.totalCards} cards`);
```

---

## When to Use Extra Cards Mode

✅ **Use `extraCards: true` for:**
- Dense philosophical paragraphs with multiple layers
- Foundational texts (Hobbes' state of nature, Locke's property theory)
- Exam preparation requiring deep understanding
- Complex arguments with multiple premises
- Core concepts in a thinker's philosophy
- Paragraphs with rich examples and implications

❌ **Use `extraCards: false` (default) for:**
- Simple definitional paragraphs
- Routine study material
- Quick review sessions
- Paragraphs with single, clear ideas
- When you want efficiency over comprehensiveness

---

## AI Prompt Differences

### Normal Mode Prompt
```
⚠️ חשוב מאוד - כמות כרטיסים:
- בדרך כלל, פסקה מכילה 1-2 רעיונות מרכזיים
- צור כרטיס אחד אם הפסקה מתמקדת ברעיון בודד
- צור 2 כרטיסים אם הפסקה מכילה שני רעיונות נפרדים
```

### Extra Cards Mode Prompt
```
⚠️ חשוב מאוד - מצב ניתוח מעמיק (Extra Cards Mode):
- נדרש ניתוח מעמיק ויסודי של הפסקה
- צור כרטיסים עבור כל היבט, ניואנס והקשר בפסקה
- חפש רעיונות משניים, השלכות, דוגמאות והבחנות עדינות
- פסקה טיפוסית תייצר 3-6 כרטיסים במצב זה
- היבטים שכדאי לחפש:
  * מושגים ראשיים ומשניים
  * טיעונים והנמקות
  * דוגמאות ואנלוגיות
  * הבחנות והשוואות
  * הקשרים היסטוריים ופילוסופיים
  * השלכות ומסקנות
  * ניואנסים מושגיים
```

---

## Response Structure (Unchanged)

Both modes return the same structure:

```typescript
{
  success: true,
  flashcards: [
    {
      type: 'Concept' | 'Argument' | 'Context' | 'Contrast',
      front: string,
      back: string,
      context_logic: string,
      tags: string[]
    },
    // ... more cards
  ],
  metadata: {
    thinker: string,
    work: string,
    chapter?: string,
    totalCards: number  // Different count based on mode
  }
}
```

---

## Benefits

1. **Flexibility:** Choose depth based on learning goals
2. **Efficiency:** Default mode is quick for routine material
3. **Comprehensiveness:** Deep mode ensures nothing is missed
4. **Backwards Compatible:** Existing code works (defaults to false)
5. **Cost Effective:** Use deep mode only when needed

---

## Files Modified

1. **`model.ts`**: Added `extraCards` optional boolean to schema
2. **`service.ts`**: 
   - Updated interface to include `extraCards`
   - Modified `buildFlashcardPrompt()` to use different instructions based on mode
   - Added conditional prompt sections
3. **`index.ts`**: Pass `extraCards` from request to service
4. **`FLASHCARDS_API_GUIDE.md`**: 
   - Documented new parameter
   - Added "Two Analysis Modes" section
   - Updated examples

---

## No Breaking Changes

- Parameter is optional with default value `false`
- Existing code continues to work without modifications
- Response structure remains identical
- API endpoint unchanged

---

## Testing

Test normal mode:
```bash
curl -X POST http://localhost:4000/generateFlashcards/ \
  -H "Content-Type: application/json" \
  -d '{"paragraph": "...", "thinker": "הובס", "work": "לויתן", "extraCards": false}'
```

Test deep mode:
```bash
curl -X POST http://localhost:4000/generateFlashcards/ \
  -H "Content-Type: application/json" \
  -d '{"paragraph": "...", "thinker": "הובס", "work": "לויתן", "extraCards": true}'
```

Compare `totalCards` in metadata to verify different behavior.
