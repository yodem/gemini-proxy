# Gemini Proxy Service - Claude Integration Guide

This document provides AI/LLM-optimized context for Claude and other AI assistants working with this codebase.

## Executive Summary

**Gemini Proxy** is a TypeScript-based microservice that wraps Google's Gemini API with specialized content analysis capabilities. It's designed as a modular system where each feature (category identification, flashcard generation, etc.) operates independently through a 3-layer architecture (Controller → Service → Models).

**Primary Use Cases**:
- Category matching from text content (semantic understanding)
- Flashcard generation for education (generic + domain-specific)
- YouTube video analysis and categorization
- Hebrew/Aramaic text processing for Jewish philosophy content

## Architecture At a Glance

### Execution Flow
```
HTTP Request
  ↓
Elysia Controller (Route + Zod Validation)
  ↓
Service Layer (Gemini AI interaction)
  ↓
Typed Response
```

### Module Structure
Every module under `src/modules/` follows this pattern:

```typescript
// Controller (index.ts) - handles HTTP
// Service (service.ts) - business logic + Gemini
// Models (model.ts) - Zod schemas for validation
```

### Directory Layout
```
src/
├── config/index.ts              # Loads .env, validates required vars
├── modules/
│   ├── shared/
│   │   └── categoryUtils.ts     # Shared prompts, parsing, category validation
│   ├── categoryIdentification/  # Match text to categories
│   ├── youtubeVideoAnalysis/    # Analyze YouTube videos
│   ├── staticDataAnalysis/      # Analyze title + description
│   ├── flashcards/              # Generic flashcard generation
│   └── anki/philosophy/         # Domain-specific flashcards
└── index.ts                      # Main server + route registration
```

## API Surface (6 Main Endpoints)

### 1. `/identifyCategories` (POST)
**Purpose**: Semantic category matching
- **Input**: `title`, `description`, `categories[]`
- **Output**: Matched categories (semantic relevance)
- **AI Task**: "Match this text to 1-3 of these categories based on semantic meaning"
- **Special**: Supports Hebrew category names (e.g., "חכמה", "הלכה")

### 2. `/analyzeStaticData` (POST)
**Purpose**: Analyze text metadata
- **Input**: `title`, `description`, `isYoutube?` (optional flag)
- **Output**: Analysis results, optionally YouTube-style description
- **AI Task**: "Analyze these inputs; if YouTube mode, also generate description"
- **Special**: Multi-mode output based on `isYoutube` flag

### 3. `/analyzeYouTubeVideo` (POST)
**Purpose**: YouTube-specific analysis
- **Input**: `videoDescription`, `categories[]`
- **Output**: Category matches + extracted insights
- **AI Task**: "Extract key info from this video description and match categories"
- **Special**: Hebrew language support for content analysis

### 4. `/flashcards/generate` (POST)
**Purpose**: Generic flashcard creation
- **Input**: `content`, `systemPrompt`, `numberOfCards`, `conversationHistory?`
- **Output**: Array of flashcard objects with `front` and `back`
- **AI Task**: "Use this prompt to generate N flashcards from the content"
- **Special**: Maintains conversation history across requests (stateless in HTTP, but context-aware)

### 5. `/anki/philosophy/political/generate` (POST)
**Purpose**: Political philosophy Anki cards
- **Input**: `content`, `numberOfCards`, `conversationHistory?`
- **Output**: Anki-formatted flashcards focused on political philosophy
- **AI Task**: "Create Anki flashcards focused on political philosophy concepts"
- **Special**: Pre-configured prompt for philosophy domain

### 6. `/anki/philosophy/kant/generate` (POST)
**Purpose**: Kant-specific philosophy cards
- **Input**: `content`, `numberOfCards`, `conversationHistory?`
- **Output**: Kant-focused Anki flashcards
- **AI Task**: "Create cards specifically about Kant's philosophy"
- **Special**: Specialized prompt for Kant's critical philosophy

## Key Implementation Details

### Request Validation (Zod Schemas)
Every endpoint validates input through Zod schemas defined in `model.ts`. Examples:
- `categories` must be non-empty array of strings
- `content` must be non-empty string
- `numberOfCards` defaults to 5 if not provided

### Gemini Interaction Pattern
All services follow this pattern:
```typescript
1. Construct system prompt (from shared utils or module-specific)
2. Build user message with input content
3. Call `generativeModel.generateContent()`
4. Parse response (JSON extraction with fallback parsing)
5. Return typed result
```

### Error Handling Strategy
- **Validation**: Zod catches invalid inputs at controller layer
- **Gemini Errors**: Caught in service layer, returns error response
- **Parsing Failures**: Fallback regex parsing if JSON is malformed
- **Server Errors**: 500 responses with error message

### Hebrew Language Support
- Built-in utility functions in `shared/categoryUtils.ts`:
  - Hebrew acronym mappings (רס״ג, רמב״ם, etc.)
  - Book-to-author mappings (מורה נבוכים → רמב״ם)
  - חז״ל detection for Talmudic content
- Prompts can include Hebrew examples and contexts
- Response parsing handles Hebrew text

## Configuration & Environment

### Required Variables
- `GOOGLE_API_KEY`: Gemini API key from Google AI Studio

### Optional Variables
- `GEMINI_MODEL`: Which Gemini model to use (default: `gemini-2.5-pro`)
- `PORT`: Server port (default: 3000)
- `HOST`: Server host (default: localhost)
- `NODE_ENV`: Environment name (development, production)
- `LOG_LEVEL`: Logging verbosity (info, debug, etc.)

### Config Loading (`src/config/index.ts`)
- Loads from `.env` via `dotenv`
- Validates required variables at startup
- Logs warning if `GOOGLE_API_KEY` is missing or placeholder
- Exports typed config object for use throughout app

## Common Development Tasks

### Adding a New API Endpoint
1. Create `src/modules/yourFeature/` directory
2. Implement `index.ts` (Elysia controller), `service.ts` (logic), `model.ts` (schemas)
3. Import and register in `index.ts` root file with `.use()`
4. Test via HTTP or interactive docs at `/docs`

### Modifying an Existing Service
- Edit `service.ts` for business logic
- Edit `model.ts` if changing request/response shape
- Update prompts in `shared/categoryUtils.ts` if they're shared
- Test via `/docs` endpoint tester

### Adding Hebrew Content Support
- Use `categoryUtils.ts` utility functions
- Include Hebrew examples in system prompts
- Test with Hebrew input strings
- Hebrew parsing is automatic in response handling

### Working with Conversation History
For endpoints that support `conversationHistory`:
- Client sends previous turns as array of `{ role, content }`
- Service appends to Gemini chat session
- Enables contextual, multi-turn interactions
- Useful for iterative flashcard refinement

## Testing & Debugging

### Interactive Testing
- Start server: `bun run index.ts`
- Open browser: `http://localhost:3000/docs`
- Use Scalar UI to test endpoints with real requests

### Manual Testing with Curl
```bash
curl -X POST http://localhost:3000/identifyCategories \
  -H "Content-Type: application/json" \
  -d '{"title":"Example","description":"Content here","categories":["A","B","C"]}'
```

### Monitoring Output
- Server logs all requests and Gemini interactions
- Check console for debug info, warnings, errors
- Error responses include detailed messages for troubleshooting

## Performance Considerations

### Gemini API Calls
- Each endpoint makes one primary Gemini call (except flashcards with history)
- Caching: No built-in caching (implement if needed for repeated calls)
- Rate limiting: Subject to Google's rate limits (typically 60 requests/min for free tier)

### Scalability
- Stateless design (no in-memory state between requests)
- Can be horizontally scaled by running multiple instances
- Database: None (all computation is real-time via Gemini)

## TypeScript & Type Safety

### Key Types
- `Elysia` - Web framework with type inference
- `Zod` - Runtime schema validation
- Request/response types auto-generated from Zod schemas
- Full end-to-end type safety from HTTP request to response

### No Implicit Any
- `tsconfig.json` enforces strict TypeScript
- All functions have explicit return types
- All parameters are typed

## Documentation Endpoints

### OpenAPI/Swagger
- **Interactive UI**: `GET /docs`
- **Raw Spec**: `GET /docs/json`
- Auto-generated from Elysia schema definitions
- Includes request/response examples

## Deployment Notes

### Prerequisites
- Bun runtime installed
- Google Gemini API key
- Network access to Google API endpoints

### Environment Setup
- Set `NODE_ENV=production` for production deployments
- Use environment-specific `.env` files
- Ensure `GOOGLE_API_KEY` is securely injected (not in git)

### Process Management
- Server gracefully handles SIGINT (Ctrl+C) for clean shutdown
- No persistent state, safe to restart anytime
- Logs startup messages including port and mode

## Code Style & Patterns

### Naming Conventions
- Controllers: Elysia `.post()` routes named after action
- Services: `Service` suffix (e.g., `CategoryIdentificationService`)
- Models: Zod schemas with uppercase names (e.g., `IdentifyCategoriesRequest`)
- Utilities: Descriptive names in `categoryUtils.ts`

### Error Handling
- Controllers validate input with Zod
- Services catch Gemini errors and return { success: false }
- Fallback parsing for malformed JSON responses
- All errors logged to console

### Prompting Strategy
- System prompts define AI behavior (stored in shared utils or module service)
- User prompts provide the actual content to analyze
- Hebrew support through example-based prompting
- Prompt engineering focuses on accuracy over length

## Gotchas & Common Issues

1. **Missing API Key**: Server logs warning at startup
2. **Rate Limiting**: Google API has request limits; implement caching if needed
3. **Hebrew Parsing**: Response parsing expects JSON; provide clear JSON format in prompts
4. **Conversation History**: Must be valid array of `{ role: string, content: string }` objects
5. **Category Validation**: Max 3 categories returned; list is semantic-match based

## Quick Reference: When to Use Each Endpoint

| Scenario | Endpoint | Why |
|----------|----------|-----|
| "Does this text fit these topics?" | `/identifyCategories` | Semantic matching |
| "Generate study cards from text" | `/flashcards/generate` | Generic, flexible |
| "Create philosophy cards" | `/anki/philosophy/{type}/generate` | Domain-optimized |
| "Analyze a video's content" | `/analyzeYouTubeVideo` | Video-specific extraction |
| "Understand this title + desc" | `/analyzeStaticData` | Metadata analysis |

## Related Files Worth Reading

- `src/shared/categoryUtils.ts` - Shared prompts and utilities
- `src/modules/flashcards/service.ts` - How conversation history is used
- `src/config/index.ts` - Configuration loading and validation
- `index.ts` - Route registration and server setup

## For AI Assistants

When working on this codebase:
1. **Always check** `src/config/index.ts` for how env vars are loaded
2. **Always validate** using Zod schemas before touching service logic
3. **Always test** endpoints via `/docs` interactive UI after changes
4. **Always preserve** the 3-layer architecture (Controller → Service → Models)
5. **Always handle** Gemini API errors gracefully with try/catch
6. **Always type** all function parameters and return types
7. **Always remember** Hebrew support is built-in; test with Hebrew text

Good luck! This is a well-structured, maintainable codebase. Feel free to reach out (or extend this doc) with questions.
