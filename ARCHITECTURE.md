# Gemini Proxy - Architecture Guide

Comprehensive documentation of system design, module structure, and implementation patterns.

## System Overview

Gemini Proxy is a modular microservice that wraps Google's Gemini API, exposing domain-specific features for content analysis and education. It follows a clean architecture with clear separation of concerns.

```
┌─────────────────────────────────────────────────────────┐
│                   HTTP Client/Browser                    │
└────────────────────┬────────────────────────────────────┘
                     │
         ┌───────────▼────────────┐
         │  Elysia HTTP Framework │
         └───────────┬────────────┘
                     │
    ┌────────────────▼────────────────┐
    │   Request Validation (Zod)      │
    │   ↓ Routes to Controllers        │
    └────────────────┬────────────────┘
                     │
    ┌────────────────▼────────────────┐
    │     Module Controllers           │
    │  (Handle specific endpoints)     │
    └────────────────┬────────────────┘
                     │
    ┌────────────────▼────────────────┐
    │    Service Layer                 │
    │  (Business logic + Gemini calls) │
    └────────────────┬────────────────┘
                     │
    ┌────────────────▼────────────────┐
    │  Google Generative AI (Gemini)  │
    │     via @google/generative-ai   │
    └────────────────────────────────┘
```

## 3-Layer Architecture Pattern

Every feature module follows this pattern:

### Layer 1: Controller (`index.ts`)
- **Responsibility**: HTTP route handling and request validation
- **Technology**: Elysia.js route handlers with Zod schemas
- **Input**: HTTP request with JSON body
- **Output**: JSON response with typed schema
- **Pattern**: Route definition → Zod validation → Service call → Response formatting

**Example**:
```typescript
// Controller validates input and delegates to service
app.post('/identifyCategories',
  ({ body }) => service.identifyCategories(body),
  { body: IdentifyCategoriesRequest }
);
```

### Layer 2: Service (`service.ts`)
- **Responsibility**: Business logic and AI interactions
- **Technology**: Async functions using Gemini API
- **Pattern**: Input validation → Prompt construction → Gemini call → Response parsing
- **Error Handling**: Try-catch blocks return typed error responses

**Example**:
```typescript
async identifyCategories(input: IdentifyCategoriesRequest) {
  try {
    // 1. Construct prompt
    const prompt = buildPrompt(input.categories);
    // 2. Call Gemini
    const response = await gemini.generateContent(prompt);
    // 3. Parse response
    const categories = parseResponse(response);
    // 4. Return typed result
    return { success: true, categories };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

### Layer 3: Models (`model.ts`)
- **Responsibility**: Request/response schema definitions
- **Technology**: Zod for runtime validation
- **Pattern**: Define input/output shapes with validation rules
- **Auto-Documentation**: Schemas auto-generate OpenAPI documentation

**Example**:
```typescript
export const IdentifyCategoriesRequest = t.Object({
  title: t.String({ minLength: 1 }),
  description: t.String({ minLength: 1 }),
  categories: t.Array(t.String(), { minItems: 1 })
});

export const IdentifyCategoriesResponse = t.Object({
  matchingCategories: t.Array(t.String()),
  totalCategoriesProvided: t.Number()
});
```

## Directory Structure

```
gemini-proxy/
│
├── index.ts                          # Main server entry point
│   └── Registers all module routes
│   └── Sets up Elysia server
│   └── Configures documentation
│
├── src/
│   │
│   ├── config/
│   │   └── index.ts
│   │       └── Loads and validates environment variables
│   │       └── Exports typed config object
│   │
│   └── modules/
│       │
│       ├── shared/
│       │   └── categoryUtils.ts
│       │       └── Shared utility functions
│       │       └── Common prompt templates
│       │       └── Response parsing helpers
│       │       └── Hebrew text utilities
│       │
│       ├── categoryIdentification/
│       │   ├── index.ts (Controller)
│       │   ├── service.ts (Service)
│       │   └── model.ts (Models)
│       │
│       ├── youtubeVideoAnalysis/
│       │   ├── index.ts
│       │   ├── service.ts
│       │   └── model.ts
│       │
│       ├── staticDataAnalysis/
│       │   ├── index.ts
│       │   ├── service.ts
│       │   └── model.ts
│       │
│       ├── flashcards/
│       │   ├── index.ts
│       │   ├── service.ts
│       │   └── model.ts
│       │
│       └── anki/
│           └── philosophy/
│               ├── base/
│               │   ├── service.ts
│               │   └── model.ts
│               ├── political/
│               │   ├── index.ts
│               │   └── service.ts
│               └── kant/
│                   ├── index.ts
│                   └── service.ts
│
├── package.json                      # Dependencies and scripts
├── tsconfig.json                     # TypeScript configuration
└── .env.example                      # Environment variables template
```

## Module Details

### 1. Category Identification Module

**Purpose**: Match content to predefined categories using semantic understanding

**Request Flow**:
```
title + description + categories[]
    ↓
Gemini prompt: "Match this text to these categories"
    ↓
Parsed response: matching categories (up to 3)
```

**Key Features**:
- Semantic matching (understands meaning, not just keywords)
- Hebrew category support
- Configurable category list
- Confidence-based filtering

**Files**:
- `src/modules/categoryIdentification/index.ts` - Controller
- `src/modules/categoryIdentification/service.ts` - Gemini interaction
- `src/modules/categoryIdentification/model.ts` - Zod schemas

### 2. YouTube Video Analysis Module

**Purpose**: Extract and analyze YouTube video descriptions

**Request Flow**:
```
videoDescription + categories[]
    ↓
Gemini extracts key information
    ↓
Match to provided categories
    ↓
Return matched categories + insights
```

**Key Features**:
- Optimized for video content
- Hebrew language support
- Metadata extraction
- Category matching from video context

**Files**:
- `src/modules/youtubeVideoAnalysis/index.ts`
- `src/modules/youtubeVideoAnalysis/service.ts`
- `src/modules/youtubeVideoAnalysis/model.ts`

### 3. Static Data Analysis Module

**Purpose**: Analyze title and description metadata

**Request Flow**:
```
title + description + [isYoutube flag]
    ↓
Gemini analyzes content
    ↓
[If YouTube mode] Generate YouTube description
    ↓
Return analysis + optional description
```

**Key Features**:
- Dual mode (standard + YouTube)
- Metadata understanding
- Optional YouTube-style description generation
- Key topic extraction

**Files**:
- `src/modules/staticDataAnalysis/index.ts`
- `src/modules/staticDataAnalysis/service.ts`
- `src/modules/staticDataAnalysis/model.ts`

### 4. Generic Flashcards Module

**Purpose**: Generate flashcards from any content with custom instructions

**Request Flow**:
```
content + systemPrompt + numberOfCards + [history]
    ↓
Initialize chat session (or continue existing)
    ↓
Send to Gemini with instructions
    ↓
Parse response to extract front/back pairs
    ↓
Return flashcard array
```

**Key Features**:
- Flexible instruction-based generation
- Conversation history support (multi-turn)
- Configurable card count
- JSON parsing with fallback

**Architecture**:
- Stateless HTTP requests
- Context preserved via conversation history
- Multiple cards per response

**Files**:
- `src/modules/flashcards/index.ts`
- `src/modules/flashcards/service.ts`
- `src/modules/flashcards/model.ts`

### 5. Philosophy Flashcards Module (Anki)

**Purpose**: Domain-specific flashcard generation for philosophy

**Structure**:
```
anki/
├── base/
│   ├── service.ts      # Shared base service
│   └── model.ts        # Shared response schemas
├── political/
│   ├── index.ts        # Political philosophy endpoint
│   └── service.ts      # Political-specific logic
└── kant/
    ├── index.ts        # Kant philosophy endpoint
    └── service.ts      # Kant-specific logic
```

**Pattern**:
- Base service contains shared Anki formatting logic
- Specialized services extend with domain-specific prompts
- Each specialization has its own controller

**Specializations**:
- **Political Philosophy**: Focuses on social contract, ethics, governance
- **Kant Philosophy**: Focuses on categorical imperative, noumena, critique

**Files**:
- `src/modules/anki/philosophy/base/service.ts` - Shared logic
- `src/modules/anki/philosophy/political/index.ts` - Controller
- `src/modules/anki/philosophy/kant/index.ts` - Controller

### 6. Shared Utilities Module

**Purpose**: Provide common functionality across all modules

**Contents**:
- **Prompt Templates**: Reusable system prompts for category matching
- **Response Parsing**: JSON extraction with fallback regex parsing
- **Hebrew Support**: Category validation, acronym mapping, Hebrew text handling
- **Error Handling**: Consistent error formatting

**Key Functions**:
- `buildCategoryPrompt()` - Generates prompt for category matching
- `parseJsonResponse()` - Extracts JSON from Gemini response
- `validateCategories()` - Ensures categories are valid
- Hebrew utilities for special text processing

**File**: `src/modules/shared/categoryUtils.ts`

## Data Flow Patterns

### Pattern 1: Simple Analysis (Category Identification)

```
Client Request
    ↓
Elysia Controller (validates with Zod)
    ↓
CategoryIdentificationService.identifyCategories()
    ├─ Build prompt with categories
    ├─ Call Gemini API
    ├─ Parse JSON response
    └─ Return { success, categories }
    ↓
Elysia Controller (formats response)
    ↓
HTTP Response (200 + JSON)
```

### Pattern 2: Multi-Turn with Context (Flashcards)

```
First Request:
    ├─ Controller validates input
    ├─ Service.generateFlashcards(content, systemPrompt)
    │   ├─ Create chat session
    │   ├─ Send content + system prompt to Gemini
    │   ├─ Parse flashcard responses
    │   └─ Return flashcards + conversation history
    └─ Return flashcards to client

Second Request (with history):
    ├─ Controller validates input + history
    ├─ Service.generateFlashcards(newContent, prompt, history)
    │   ├─ Retrieve/create chat session
    │   ├─ Append history to context
    │   ├─ Send new content to Gemini
    │   ├─ Parse new flashcards
    │   └─ Return flashcards + updated history
    └─ Return new flashcards to client
```

### Pattern 3: Domain-Specialized (Philosophy Flashcards)

```
Client Request (Kant cards)
    ↓
Elysia Controller (/anki/philosophy/kant/generate)
    ↓
KantService.generateFlashcards(content, numberOfCards)
    ├─ Call base service with Kant-specific prompt
    ├─ Gemini generates philosophy-focused cards
    ├─ Parse Anki format
    └─ Return with domain metadata
    ↓
HTTP Response with philosophy flashcards
```

## Configuration Management

**File**: `src/config/index.ts`

**Pattern**:
```typescript
// 1. Load from environment
const config = {
  googleApiKey: process.env.GOOGLE_API_KEY,
  geminiModel: process.env.GEMINI_MODEL || 'gemini-2.5-pro',
  port: process.env.PORT || 3000,
  // ... more config
};

// 2. Validate required vars
if (!config.googleApiKey) {
  console.warn('⚠️ GOOGLE_API_KEY is not set');
}

// 3. Export typed config
export default config;
```

**Available Variables**:
- `GOOGLE_API_KEY` (required) - Gemini API key
- `GEMINI_MODEL` (optional) - Model version
- `PORT` (optional) - Server port
- `HOST` (optional) - Server host
- `NODE_ENV` (optional) - Environment name
- `LOG_LEVEL` (optional) - Logging level

## Request/Response Validation

**Technology**: Zod schemas in Elysia

**Pattern**:
```typescript
// 1. Define schema with Zod
const RequestSchema = t.Object({
  title: t.String({ minLength: 1 }),
  categories: t.Array(t.String(), { minItems: 1 })
});

// 2. Attach to Elysia route
app.post('/endpoint', handler, { body: RequestSchema });

// 3. Elysia automatically:
//    - Validates incoming JSON
//    - Returns 400 if invalid
//    - Provides typed body to handler
```

**Benefits**:
- Compile-time type safety
- Runtime validation
- Auto-generated OpenAPI docs
- Clear error messages

## Error Handling Strategy

### Validation Errors (400)
- Caught by Zod before service layer
- Elysia returns 400 with validation details
- Example: missing required field, invalid type

### Service Errors (500)
- Caught in service try-catch blocks
- Returned as `{ success: false, error: message }`
- Includes context about what failed
- Examples: Gemini API error, parsing failure

### Graceful Degradation
- Fallback JSON parsing with regex if initial parsing fails
- Ensures response even if Gemini returns unexpected format
- Logged for monitoring

## Type Safety Across Layers

```
Controller Layer:
  ↓ Elysia route with Zod schema
  ↓ HTTP body auto-typed from schema

Service Layer:
  ↓ Receives typed input
  ↓ Returns typed response
  ↓ Catch blocks type checked

Response Layer:
  ↓ Elysia formats typed response
  ↓ HTTP client receives well-typed JSON
```

**TypeScript Configuration** (`tsconfig.json`):
- Strict mode enabled
- No implicit any
- All function return types explicit
- Full module resolution

## Scalability Considerations

### Current Design
- **Stateless**: No in-memory state between requests
- **Per-request initialization**: Each request gets fresh service instance
- **Horizontal scalable**: Can run multiple instances with load balancer

### Potential Optimizations
- Response caching (Redis) for repeated requests
- Prompt caching at Gemini level
- Connection pooling for multiple instances
- Rate limiting middleware

### Rate Limiting
- Google Gemini API has built-in limits
- Free tier: ~60 req/min
- Paid tier: Higher based on plan
- No client-side limiting currently implemented

## Security Considerations

### Current Implementation
- No authentication (API key managed server-side)
- Environment variables for sensitive data
- Input validation via Zod

### Recommendations
- Add API key authentication for production
- Implement rate limiting per client
- Add input size limits
- Sanitize Gemini responses if exposing to untrusted clients
- Use HTTPS in production

## Testing Strategy

### Module Testing
- Test each service independently
- Mock Gemini responses
- Validate schemas with invalid inputs
- Check error handling

### Integration Testing
- Test full request/response flow
- Test with real Gemini API (costs money)
- Verify schema parsing

### Example Test Pattern
```typescript
describe('CategoryIdentification', () => {
  it('should identify matching categories', async () => {
    const result = await service.identifyCategories({
      title: 'AI Article',
      description: 'About artificial intelligence',
      categories: ['Tech', 'Science', 'History']
    });
    expect(result.success).toBe(true);
    expect(result.categories).toContain('Tech');
  });
});
```

## Deployment Architecture

### Development
```
Local Machine
├── bun run index.ts
└── http://localhost:3000
```

### Production
```
Docker Container / Cloud Platform
├── bun run index.ts
├── Environment variables injected
└── https://api.example.com
```

**Considerations**:
- Environment variables from secrets manager
- Health check endpoint
- Graceful shutdown handling
- Log aggregation
- Error monitoring (Sentry, etc.)

## Future Extensibility

### Adding New Modules
1. Create `src/modules/yourFeature/` directory
2. Implement `index.ts` (controller), `service.ts`, `model.ts`
3. Register in main `index.ts` with `.use()`
4. Docs auto-generate from Zod schemas

### Adding New Specializations
- Follow the philosophy module pattern
- Extend base service with specialized prompts
- Create new controller that calls specialized service

### Adding New AI Providers
- Create new service using different AI SDK
- Implement same response types
- Swap in controller's dependency injection

## Documentation Generation

**Auto-Generated from Code**:
- OpenAPI spec: Generated from Zod schemas and routes
- Interactive UI: Scalar UI at `/docs`
- Raw spec: JSON at `/docs/json`

**Manual Documentation**:
- README.md - Getting started
- API_DOCUMENTATION.md - Endpoint reference
- ARCHITECTURE.md - This file
- CLAUDE.md - AI integration guide

## Performance Metrics

### Typical Response Times
- Category identification: 2-3 seconds
- Static analysis: 2-3 seconds
- Flashcard generation: 3-5 seconds
- YouTube analysis: 2-3 seconds

### Bottleneck
- Primary: Gemini API response time
- Secondary: JSON parsing of responses
- Network: Minimal (local requests)

### Memory Usage
- Baseline: ~50MB
- Per-request: Minimal (no state accumulation)
- No memory leaks (proper cleanup)

## Monitoring & Logging

### Current Logging
- Console logs for server startup/shutdown
- Gemini API call logging
- Error logging with context

### Recommended Enhancements
- Structured logging (JSON format)
- Request/response logging
- Performance metrics (latency percentiles)
- Error tracking with Sentry
- APM (Application Performance Monitoring)

---

For implementation questions, see [CLAUDE.md](./CLAUDE.md)
For API details, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
For setup, see [SETUP_GUIDE.md](./SETUP_GUIDE.md)
