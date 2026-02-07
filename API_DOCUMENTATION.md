# Gemini Proxy API Documentation

Complete reference for all API endpoints, request/response formats, and usage examples.

## Base URL

```
http://localhost:3000
```

## Authentication

All endpoints are currently unauthenticated. The API key for Gemini is managed server-side via environment variables.

## Common Response Format

All endpoints return JSON responses with consistent structure:

```json
{
  "success": true,
  "data": { /* endpoint-specific data */ },
  "error": null
}
```

Or on error:

```json
{
  "success": false,
  "data": null,
  "error": "Error message describing what went wrong"
}
```

## Endpoints

### 1. POST /identifyCategories

Identifies matching categories from a provided list based on semantic analysis of title and description.

#### Request

```json
{
  "title": "Understanding Kant's Critique of Pure Reason",
  "description": "A comprehensive analysis of Kant's philosophical work and its implications for modern epistemology",
  "categories": ["Philosophy", "Metaphysics", "History", "Science", "Politics"]
}
```

#### Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `title` | string | Yes | Title of the content |
| `description` | string | Yes | Description of the content |
| `categories` | string[] | Yes | List of categories to match against (min 1, typically 3-5) |

#### Response

```json
{
  "success": true,
  "data": {
    "matchingCategories": ["Philosophy", "Metaphysics"],
    "totalCategoriesProvided": 5
  },
  "error": null
}
```

#### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `matchingCategories` | string[] | Up to 3 categories that best match the content |
| `totalCategoriesProvided` | number | Count of categories provided in request |

#### Examples

**Example 1: Academic Content**
```bash
curl -X POST http://localhost:3000/identifyCategories \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Machine Learning Fundamentals",
    "description": "Learn the basics of ML algorithms, neural networks, and data preprocessing techniques",
    "categories": ["Technology", "Science", "Education", "Business", "Health"]
  }'
```

Response:
```json
{
  "success": true,
  "data": {
    "matchingCategories": ["Technology", "Science", "Education"],
    "totalCategoriesProvided": 5
  },
  "error": null
}
```

**Example 2: Hebrew Categories**
```bash
curl -X POST http://localhost:3000/identifyCategories \
  -H "Content-Type: application/json" \
  -d '{
    "title": "הלכות שבת",
    "description": "חקירה מעמיקה בהלכות השבת כפי שהובאו בשולחן ערוך",
    "categories": ["חכמה", "הלכה", "תנ״ך", "עברית", "דת"]
  }'
```

#### Error Cases

**Missing Required Field:**
```json
{
  "success": false,
  "data": null,
  "error": "Validation failed: categories is required"
}
```

**Empty Categories:**
```json
{
  "success": false,
  "data": null,
  "error": "Validation failed: categories must not be empty"
}
```

**Gemini API Error:**
```json
{
  "success": false,
  "data": null,
  "error": "Failed to identify categories: [Gemini error message]"
}
```

---

### 2. POST /analyzeStaticData

Analyzes title and description to provide insights. Optionally generates YouTube-style description.

#### Request

```json
{
  "title": "The Evolution of Artificial Intelligence",
  "description": "From early AI research to modern deep learning breakthroughs",
  "isYoutube": false
}
```

#### Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `title` | string | Yes | Content title |
| `description` | string | Yes | Content description |
| `isYoutube` | boolean | No | If true, generates YouTube-style analysis (default: false) |

#### Response

**Standard Mode:**
```json
{
  "success": true,
  "data": {
    "analysis": "This content covers the comprehensive history and evolution of artificial intelligence...",
    "keyTopics": ["AI", "Deep Learning", "History", "Technology"],
    "contentType": "Educational"
  },
  "error": null
}
```

**YouTube Mode (isYoutube: true):**
```json
{
  "success": true,
  "data": {
    "analysis": "This video explores the fascinating journey of AI development...",
    "youtubeDescription": "In this video, we dive deep into the evolution of artificial intelligence, exploring how the field has transformed from early theoretical research to today's cutting-edge deep learning systems. We'll examine key milestones, influential researchers, and breakthrough technologies that shaped modern AI.",
    "keyTopics": ["AI", "Deep Learning", "Machine Learning", "Technology"],
    "contentType": "Educational"
  },
  "error": null
}
```

#### Examples

**Example 1: Standard Analysis**
```bash
curl -X POST http://localhost:3000/analyzeStaticData \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Quantum Computing Basics",
    "description": "Introduction to quantum bits, superposition, and quantum gates",
    "isYoutube": false
  }'
```

**Example 2: YouTube-Style Analysis**
```bash
curl -X POST http://localhost:3000/analyzeStaticData \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Quantum Computing Basics",
    "description": "Introduction to quantum bits, superposition, and quantum gates",
    "isYoutube": true
  }'
```

---

### 3. POST /analyzeYouTubeVideo

Analyzes YouTube video descriptions and identifies matching categories.

#### Request

```json
{
  "videoDescription": "In this episode, we explore the philosophical foundations of consciousness, examining theories from Descartes, Kant, and modern neuroscience...",
  "categories": ["Philosophy", "Science", "History", "Psychology", "Education"]
}
```

#### Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `videoDescription` | string | Yes | The YouTube video description to analyze |
| `categories` | string[] | Yes | Categories to match against |

#### Response

```json
{
  "success": true,
  "data": {
    "matchingCategories": ["Philosophy", "Science", "Psychology"],
    "description": "This video discusses philosophical and scientific perspectives on consciousness",
    "totalCategoriesProvided": 5
  },
  "error": null
}
```

#### Example

```bash
curl -X POST http://localhost:3000/analyzeYouTubeVideo \
  -H "Content-Type: application/json" \
  -d '{
    "videoDescription": "Learn about the history of philosophy from Socrates to Nietzsche, with special focus on epistemology and ethics.",
    "categories": ["Philosophy", "History", "Education", "Religion", "Science"]
  }'
```

---

### 4. POST /flashcards/generate

Generates generic flashcards from any content using a custom system prompt.

#### Request

```json
{
  "content": "Photosynthesis is the process by which plants convert light energy into chemical energy stored in glucose...",
  "systemPrompt": "Create educational flashcards with concise questions on one side and detailed answers on the other.",
  "numberOfCards": 5,
  "conversationHistory": []
}
```

#### Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `content` | string | Yes | The content to generate flashcards from |
| `systemPrompt` | string | Yes | Instructions for how to generate the flashcards |
| `numberOfCards` | number | No | Number of cards to generate (default: 5) |
| `conversationHistory` | object[] | No | Previous conversation turns for context |

#### Conversation History Format

Each entry in conversation history should be:
```json
{
  "role": "user",      // or "assistant"
  "content": "Your message here"
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "flashcards": [
      {
        "front": "What is photosynthesis?",
        "back": "Photosynthesis is the process by which plants convert light energy into chemical energy stored in glucose and oxygen."
      },
      {
        "front": "What are the inputs to photosynthesis?",
        "back": "The inputs are carbon dioxide (CO₂), water (H₂O), and light energy from the sun."
      },
      {
        "front": "Where does photosynthesis occur in the plant?",
        "back": "Photosynthesis primarily occurs in the chloroplasts of plant cells, specifically in the thylakoid membranes."
      }
    ],
    "numberOfCardsGenerated": 3
  },
  "error": null
}
```

#### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `flashcards` | object[] | Array of flashcard objects |
| `flashcards[].front` | string | Question or prompt side of the card |
| `flashcards[].back` | string | Answer or explanation side of the card |
| `numberOfCardsGenerated` | number | Count of cards actually generated |

#### Examples

**Example 1: Science Content**
```bash
curl -X POST http://localhost:3000/flashcards/generate \
  -H "Content-Type: application/json" \
  -d '{
    "content": "The water cycle involves evaporation, condensation, and precipitation. Water from oceans, lakes, and rivers evaporates due to solar heat, forming water vapor. This vapor rises and condenses into clouds at cooler altitudes. Finally, precipitation returns water to Earth as rain or snow.",
    "systemPrompt": "Create 4 clear flashcards about the water cycle.",
    "numberOfCards": 4
  }'
```

**Example 2: With Conversation History**
```bash
curl -X POST http://localhost:3000/flashcards/generate \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Additional content about advanced water cycle concepts",
    "systemPrompt": "Build on previous cards with more advanced concepts",
    "numberOfCards": 3,
    "conversationHistory": [
      {"role": "user", "content": "Create flashcards about the water cycle"},
      {"role": "assistant", "content": "Here are the initial cards..."}
    ]
  }'
```

---

### 5. POST /anki/philosophy/political/generate

Generates Anki-formatted flashcards specialized for political philosophy.

#### Request

```json
{
  "content": "In 'The Social Contract', Rousseau argues that legitimate political authority derives from a collective agreement where individuals surrender their natural rights to the community...",
  "numberOfCards": 5,
  "conversationHistory": []
}
```

#### Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `content` | string | Yes | Political philosophy content to analyze |
| `numberOfCards` | number | No | Number of cards (default: 5) |
| `conversationHistory` | object[] | No | Previous turns for context |

#### Response

```json
{
  "success": true,
  "data": {
    "flashcards": [
      {
        "front": "What is Rousseau's concept of the 'general will'?",
        "back": "The general will (volonté générale) is the collective consensus of a political community about the common good, representing the true interests of the people rather than individual desires."
      },
      {
        "front": "How does Rousseau's social contract differ from Hobbes?",
        "back": "While Hobbes emphasized submission to an absolute sovereign for security, Rousseau argued that legitimate authority must reflect the general will of all citizens, preserving collective freedom."
      }
    ],
    "numberOfCardsGenerated": 2,
    "domain": "Political Philosophy"
  },
  "error": null
}
```

#### Example

```bash
curl -X POST http://localhost:3000/anki/philosophy/political/generate \
  -H "Content-Type: application/json" \
  -d '{
    "content": "John Locke proposed the concept of natural rights including life, liberty, and property. He argued that governments are formed by social contract to protect these inherent rights, and that citizens have the right to revolution if the government fails to protect them.",
    "numberOfCards": 3
  }'
```

---

### 6. POST /anki/philosophy/kant/generate

Generates Anki-formatted flashcards specialized for Kantian philosophy.

#### Request

```json
{
  "content": "Kant's categorical imperative states that an action is moral only if one can will that it becomes a universal law...",
  "numberOfCards": 5,
  "conversationHistory": []
}
```

#### Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `content` | string | Yes | Kant philosophy content |
| `numberOfCards` | number | No | Number of cards (default: 5) |
| `conversationHistory` | object[] | No | Previous turns for context |

#### Response

```json
{
  "success": true,
  "data": {
    "flashcards": [
      {
        "front": "What is Kant's categorical imperative?",
        "back": "A moral principle stating that one should act only in accordance with maxims that one can will should become universal laws. It's the foundation of Kant's deontological ethics."
      },
      {
        "front": "Explain Kant's notion of 'thing-in-itself' (Noumenon)",
        "back": "The thing-in-itself is reality as it exists independent of human perception. Unlike phenomena (things as they appear to us), noumena cannot be directly known, only inferred."
      }
    ],
    "numberOfCardsGenerated": 2,
    "domain": "Kant Philosophy"
  },
  "error": null
}
```

#### Example

```bash
curl -X POST http://localhost:3000/anki/philosophy/kant/generate \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Kant made a distinction between analytic and synthetic judgments. Analytic judgments expand our understanding through logical analysis, while synthetic judgments provide new knowledge about the world. His critical philosophy challenged the notion that all knowledge must be either purely rational or purely empirical.",
    "numberOfCards": 4
  }'
```

---

## Documentation Endpoints

### GET /docs

Interactive API documentation using Scalar UI.

**Response**: HTML page with interactive endpoint explorer

**Example:**
```bash
curl http://localhost:3000/docs
# Opens interactive Scalar UI in browser
```

### GET /docs/json

Raw OpenAPI specification in JSON format.

**Response**: OpenAPI 3.0.0 specification

**Example:**
```bash
curl http://localhost:3000/docs/json | jq .
```

---

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad request (validation error) |
| 500 | Server error (Gemini API error or internal issue) |

---

## Rate Limiting

The Gemini API has rate limits. Depending on your API tier:
- **Free tier**: ~60 requests per minute
- **Paid tier**: Higher limits based on your plan

If rate limited, Gemini returns an error that is caught and returned as a 500 response.

---

## Best Practices

### 1. Category Lists
- Keep categories concise (1-5 items typically)
- Use clear, single-word or short-phrase categories
- Categories should be mutually distinguishable for best results

### 2. Content Length
- Works best with content between 100-5000 characters
- Very short content may yield less reliable matches
- Very long content may timeout (consider chunking)

### 3. Flashcard Generation
- System prompt heavily influences output quality
- Specific instructions yield better results than generic ones
- Use conversation history for refinement across multiple calls

### 4. Hebrew Content
- Full support for Hebrew and Aramaic
- Include Hebrew categories if analyzing Hebrew content
- The system has built-in knowledge of Jewish texts and concepts

### 5. Error Handling
- Always check `success` field in response
- Read `error` message for debugging
- Retry logic recommended for rate limit errors (429 would be returned if implemented)

---

## Example Integration: Node.js

```typescript
async function identifyCategories(
  title: string,
  description: string,
  categories: string[]
) {
  const response = await fetch('http://localhost:3000/identifyCategories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, description, categories })
  });

  const result = await response.json();

  if (result.success) {
    console.log('Matching categories:', result.data.matchingCategories);
  } else {
    console.error('Error:', result.error);
  }

  return result;
}
```

---

## Example Integration: Python

```python
import requests
import json

def generate_flashcards(content, system_prompt, number_of_cards=5):
    response = requests.post(
        'http://localhost:3000/flashcards/generate',
        json={
            'content': content,
            'systemPrompt': system_prompt,
            'numberOfCards': number_of_cards
        }
    )

    data = response.json()

    if data['success']:
        for card in data['data']['flashcards']:
            print(f"Q: {card['front']}")
            print(f"A: {card['back']}\n")
    else:
        print(f"Error: {data['error']}")

    return data
```

---

## Troubleshooting

### "Failed to identify categories: Invalid API key"
- Ensure `GOOGLE_API_KEY` is set in `.env`
- Verify the key is valid and has Gemini API enabled
- Check that the key has proper permissions

### "Validation failed: ..."
- Review the request body against the required parameters
- Ensure all string fields are non-empty
- Check array fields are not empty

### No response / Timeout
- Gemini API calls can take 2-5 seconds
- Check network connectivity
- Verify server is running (`bun run index.ts`)

### Unexpected category matches
- Try refining your category list
- Use more specific categories rather than generic ones
- Adjust content title/description for clarity

---

## Support

For more information:
- See [README.md](./README.md) for setup instructions
- See [CLAUDE.md](./CLAUDE.md) for AI integration guide
- See [ARCHITECTURE.md](./ARCHITECTURE.md) for system design details
- Visit `http://localhost:3000/docs` for interactive testing
