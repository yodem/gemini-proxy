# Generic Flashcards API Integration Guide

This guide explains how to use the generic flashcards endpoint from your other codebase.

## Endpoint

**Base URL:** `http://localhost:4000` (adjust host/port as needed)

**POST** `/flashcards/generate`

## Request Body Structure

```typescript
{
  "content": string,                              // The text to analyze (min 20 chars)
  "systemInstruction": string,                    // Detailed AI instructions (min 50 chars)
  "contextMetadata": Record<string, string>,      // Optional: metadata about the content
  "cardTypes": string[],                          // Optional: allowed card types
  "language": string,                             // Optional: language code (e.g., "en", "he", "es")
  "extraCards": boolean,                          // Optional: request deeper analysis
  "conversationKey": string                       // Optional: explicit session key for context
}
```

## Complete Example - Hebrew Flashcards

### Request

```javascript
const request = {
  content: `פילוסופיה היא חקר השאלות הבסיסיות על קיום, ידע, ערכים ותבונה. המילה מקורה ביוונית: "פילו" (אהבה) ו"סופיה" (חוכמה). פילוסופים בדקו שאלות כמו "מה הוא הטוב?" ו"כיצד אנחנו יודעים מה שאנחנו יודעים?"`,

  systemInstruction: `אתה מומחה בהוראת פילוסופיה. תפקידך ליצור כרטיסי זיכרון (flashcards) לתלמידים.

דרישות:
1. כל כרטיס יכול לעמוד בעצמו ולהיות מובן
2. השתמש בשאלות פתוחות (למה, איך, מה) ולא רק בשאלות סגורות
3. תרגם מושגים מהעברית לאנגלית בסוגריים כשרלוונטי
4. הסבר את הרציונל של כל מושג

סוגי כרטיסים:
- הגדרה: הגדרה בסיסית של מושג
- שאלה: שאלה בסיסית עם תשובה
- דיון: שאלה עמוקה על משמעות או חשיבות

תבנית JSON:
{
  "flashcards": [
    {
      "type": "הגדרה",
      "front": "השאלה בעברית",
      "back": "התשובה בעברית",
      "context_logic": "הסבר על הלוגיקה",
      "tags": ["תג1", "תג2"]
    }
  ]
}`,

  contextMetadata: {
    subject: "Philosophy",
    topic: "Introduction to Philosophy",
    level: "Intermediate",
    language: "Hebrew"
  },

  cardTypes: ["הגדרה", "שאלה", "דיון"],

  language: "he",

  extraCards: false,

  conversationKey: "philosophy-intro-hebrew-001"
};

// Send the request
const response = await fetch("http://localhost:4000/flashcards/generate", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify(request)
});

const result = await response.json();
console.log(result);
```

### Expected Response

```json
{
  "success": true,
  "flashcards": [
    {
      "type": "הגדרה",
      "front": "מהי פילוסופיה?",
      "back": "פילוסופיה היא חקר השאלות הבסיסיות על קיום, ידע, ערכים ותבונה. המילה מקורה ביוונית 'פילו' (אהבה) ו'סופיה' (חוכמה).",
      "context_logic": "זו הגדרה בסיסית המסבירה את המשמעות של המילה ואת תחומי הדעת שפילוסופיה חוקרת.",
      "tags": ["Philosophy", "Definition", "Introduction"]
    },
    {
      "type": "שאלה",
      "front": "מהן דוגמאות לשאלות שפילוסופים בדקו?",
      "back": "שאלות כמו 'מה הוא הטוב?' (אתיקה) ו'כיצד אנחנו יודעים מה שאנחנו יודעים?' (אפיסטמולוגיה).",
      "context_logic": "שאלות אלו מיצגות את סוגי ההשאלות החוקרות בפילוסופיה.",
      "tags": ["Philosophy", "Questions", "Epistemology"]
    }
  ],
  "metadata": {
    "totalCards": 2,
    "contextMetadata": {
      "subject": "Philosophy",
      "topic": "Introduction to Philosophy",
      "level": "Intermediate",
      "language": "Hebrew"
    },
    "conversationKey": "philosophy-intro-hebrew-001"
  }
}
```

## Multi-Turn Conversations (Context Preservation)

To maintain conversation context across multiple requests (e.g., analyzing multiple sections of the same text), use the same `conversationKey` or `systemInstruction + contextMetadata` combination:

```javascript
// First request
const request1 = {
  content: "First section of text...",
  systemInstruction: "Your instructions...",
  contextMetadata: { topic: "My Topic" },
  conversationKey: "my-conversation-001"
};

// Second request - uses same conversation context
const request2 = {
  content: "Second section of text...",
  systemInstruction: "Your instructions...",
  contextMetadata: { topic: "My Topic" },
  conversationKey: "my-conversation-001"  // Same key!
};
```

The service will:
- Remember the first exchange (for context)
- Include only the latest exchange
- Build on the established understanding from previous requests

## Hebrew System Instruction Template

```
אתה מומחה [בתחום]. תפקידך ליצור כרטיסי זיכרון איכותיים.

דרישות:
1. כל כרטיס יעסוק ברעיון אחד בלבד
2. השתמש בשאלות פתוחות ודיווח אקטיבי
3. הסבר את הרציונל של כל מושג
4. תרגם מונחים חשובים לאנגלית בסוגריים

סוגי כרטיסים:
- הגדרה: הגדרה בסיסית
- שאלה: שאלה עם תשובה
- דיון: שאלה עמוקה
- דוגמה: דוגמה מעשית

תבנית JSON:
{
  "flashcards": [
    {
      "type": "סוג כרטיס",
      "front": "השאלה",
      "back": "התשובה",
      "context_logic": "הסבר",
      "tags": ["תג1", "תג2"]
    }
  ]
}

אנא החזר JSON טהור בלבד, ללא קוד מרכאות או markdown.
```

## Integration Examples

### JavaScript/Node.js

```javascript
const FlashcardsAPI = {
  baseURL: "http://localhost:4000",

  async generateFlashcards(request) {
    const response = await fetch(
      `${this.baseURL}/flashcards/generate`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request)
      }
    );

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }
};

// Usage
const result = await FlashcardsAPI.generateFlashcards({
  content: "Your content here...",
  systemInstruction: "Your instructions...",
  language: "he",
  contextMetadata: { topic: "My Topic" }
});

console.log(`Generated ${result.flashcards.length} flashcards`);
```

### Python

```python
import requests
import json

class FlashcardsAPI:
    def __init__(self, base_url="http://localhost:4000"):
        self.base_url = base_url

    def generate_flashcards(self, request_data):
        """Generate flashcards from content"""
        response = requests.post(
            f"{self.base_url}/flashcards/generate",
            json=request_data,
            headers={"Content-Type": "application/json"}
        )
        response.raise_for_status()
        return response.json()

# Usage
api = FlashcardsAPI()
result = api.generate_flashcards({
    "content": "Your content here...",
    "systemInstruction": "Your instructions...",
    "language": "he",
    "contextMetadata": {"topic": "My Topic"}
})

print(f"Generated {len(result['flashcards'])} flashcards")
for card in result['flashcards']:
    print(f"- {card['type']}: {card['front']}")
```

### TypeScript

```typescript
interface FlashcardsRequest {
  content: string;
  systemInstruction: string;
  contextMetadata?: Record<string, string>;
  cardTypes?: string[];
  language?: string;
  extraCards?: boolean;
  conversationKey?: string;
}

interface FlashcardsResponse {
  success: boolean;
  flashcards: Array<{
    type: string;
    front: string;
    back: string;
    context_logic?: string;
    tags?: string[];
  }>;
  metadata: {
    totalCards: number;
    contextMetadata?: Record<string, string>;
    conversationKey?: string;
  };
}

class FlashcardsClient {
  constructor(private baseURL: string = "http://localhost:4000") {}

  async generateFlashcards(request: FlashcardsRequest): Promise<FlashcardsResponse> {
    const response = await fetch(
      `${this.baseURL}/flashcards/generate`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request)
      }
    );

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }
}

// Usage
const client = new FlashcardsClient();
const result = await client.generateFlashcards({
  content: "Your content...",
  systemInstruction: "Your instructions...",
  language: "he"
});
```

## Context Metadata Best Practices

The `contextMetadata` object helps organize and tag flashcards. Use meaningful key-value pairs:

```javascript
// Example 1: Academic Content
{
  subject: "Biology",
  topic: "Photosynthesis",
  chapter: "5",
  level: "High School"
}

// Example 2: Hebrew Literature
{
  author: "ש.י. עגנון",
  work: "ימי תלמיד",
  chapter: "I",
  theme: "Identity"
}

// Example 3: Programming
{
  language: "JavaScript",
  topic: "Async/Await",
  difficulty: "Intermediate"
}
```

These metadata values automatically populate the flashcard tags, making them searchable and filterable.

## Error Handling

```javascript
async function safeGenerateFlashcards(request) {
  try {
    const response = await fetch("http://localhost:4000/flashcards/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      console.error(`HTTP Error: ${response.status}`);
      return null;
    }

    const result = await response.json();

    if (!result.success) {
      console.error(`API Error: ${result.error}`);
      return null;
    }

    return result;

  } catch (error) {
    console.error("Network error:", error);
    return null;
  }
}
```

## Troubleshooting

### Issue: "Content is too short"
**Solution:** Ensure `content` is at least 20 characters. Provide meaningful text to analyze.

### Issue: "System instruction is too short"
**Solution:** Provide detailed instructions (min 50 characters). Include card type definitions and formatting examples.

### Issue: "Failed to generate flashcards"
**Solution:**
- Check that the AI response includes valid JSON
- Verify your system instruction requests JSON output
- Review the error message for specific issues

### Issue: Conversation context not preserved
**Solution:** Use the same `conversationKey` for related requests, or rely on automatic key generation from `systemInstruction + contextMetadata`.

## Performance Notes

- First request in a conversation includes the full system instruction (larger payload)
- Subsequent requests are smaller (system instruction only included once)
- Conversation history is limited to first + last exchange for efficiency
- `extraCards: true` may generate more flashcards but takes longer

## Hebrew Content Examples

See the tests directory for full Hebrew examples:
- `src/modules/politicalPhilosophyFlashcards/service.integration.test.ts` - Hebrew integration tests with real Gemini API calls
- Political philosophy, law, history, and more in Hebrew

## API Documentation

Full OpenAPI documentation available at:
- **Local:** `http://localhost:4000/docs`
- **JSON Schema:** `http://localhost:4000/docs/json`
