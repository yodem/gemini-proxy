# Flashcards API - Changes Summary

## What Changed

### 1. Enhanced AI Prompt (service.ts)

Added a prominent section clarifying card count expectations:

```
⚠️ חשוב מאוד - כמות כרטיסים:
- בדרך כלל, פסקה מכילה 1-2 רעיונות מרכזיים
- צור כרטיס אחד אם הפסקה מתמקדת ברעיון בודד
- צור 2 כרטיסים אם הפסקה מכילה שני רעיונות נפרדים או היבטים שונים של אותו נושא
- אל תכפה יצירת כרטיסים מרובים אם הפסקה באמת עוסקת ברעיון אחד
- כל רעיון מהותי ונפרד בפסקה צריך כרטיס משלו
```

Updated working rules:
```
6. כמות: צור כרטיס אחד לרעיון מרכזי. אם יש 2 רעיונות נפרדים - צור 2 כרטיסים.
```

Updated additional guidelines:
```
- צור כרטיס אחד אם הפסקה מתמקדת ברעיון מרכזי אחד
- צור 2 כרטיסים אם הפסקה מכילה שני רעיונות נפרדים או שני היבטים משמעותיים
```

### 2. Updated API Documentation (FLASHCARDS_API_GUIDE.md)

**Overview section** now states:
> **Important**: The AI typically creates **1 card per paragraph**, but will create **2 cards** when the paragraph contains two distinct ideas or aspects. The response always returns an **array of flashcards** (even if it contains just one card).

**Key Principles** section updated:
> 5. **Appropriate Card Count**: The AI creates **1 card** for paragraphs with a single main idea, and **2 cards** when there are two distinct ideas or aspects. It doesn't force multiple cards unnecessarily

**Notes for Integration** updated:
> 3. **Card Count**: Typically **1 card per paragraph**, but **2 cards** when the paragraph contains two distinct ideas. The AI doesn't force multiple cards - it creates one card per distinct idea
> 4. **Response Structure**: Always returns an array of flashcards in the `flashcards` field, even if only one card is generated

## Why These Changes

1. **Realistic Expectations**: Most philosophical paragraphs focus on 1-2 main ideas, not 3-5

2. **Anki Best Practices**: Each card should be atomic (one idea), but we shouldn't artificially split content

3. **Clear Guidance**: The AI now understands to create 1 card typically, 2 cards when genuinely needed

4. **Array Structure**: The response structure returns an array (`flashcards: []`), which can contain 1 or 2 cards

## Expected Behavior

### Typical Output
- **1 card** for paragraphs with a single main idea (most common)
- **2 cards** when the paragraph genuinely contains two distinct ideas or aspects

### Quality Focus
- Each card remains atomic (one idea)
- No artificial splitting of content
- Natural identification of distinct ideas
- Better alignment with actual paragraph structure

## Examples

### Single Idea Paragraph → 1 Card
If a paragraph focuses on one concept (e.g., "Hobbes' definition of equality"):
- **Card 1**: What is Hobbes' concept of equality in the state of nature and why?

### Two Ideas Paragraph → 2 Cards
If a paragraph discusses two distinct aspects (e.g., "equality AND its consequences"):
- **Card 1**: What is Hobbes' concept of equality in the state of nature?
- **Card 2**: Why does this equality lead to the war of all against all?

## No Breaking Changes

- Request structure: **unchanged**
- Response structure: **unchanged** (already returns array)
- API endpoint: **unchanged**
- Validation: **unchanged**

Only the AI's internal instructions were enhanced to produce more cards per paragraph.

