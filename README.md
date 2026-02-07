# Gemini Proxy Service

A high-performance AI-powered content analysis microservice built with Bun, TypeScript, and Google's Gemini API. Specialized in intelligent text categorization, flashcard generation, and domain-specific content analysis with native Hebrew language support.

## Quick Start

```bash
# Install dependencies
bun install

# Set up environment
cp .env.example .env
# Edit .env and add your GOOGLE_API_KEY

# Start the server
bun run index.ts

# Server runs on http://localhost:3000
# Documentation available at http://localhost:3000/docs
```

## Features

- **Category Identification**: Intelligently match content to predefined categories with semantic understanding
- **Generic Flashcard Generation**: Create flashcards from any content using custom prompts
- **Domain-Specific Flashcards**: Pre-built modules for philosophical content (Political Philosophy, Kant)
- **YouTube Video Analysis**: Extract and analyze YouTube video content
- **Static Data Analysis**: Analyze titles and descriptions with optional YouTube-style output
- **Hebrew Language Support**: Full native support for Hebrew and Aramaic text
- **Interactive API Documentation**: Auto-generated OpenAPI/Scalar UI at `/docs`

## Architecture Overview

```
Client Request
    ↓
Controller (Validation & Routing)
    ↓
Service (Business Logic + Gemini API)
    ↓
Response
```

Each module follows a 3-layer architecture:
- **Controller**: HTTP route handling and request validation
- **Service**: Core business logic and AI interactions
- **Models**: TypeScript/Zod request/response schemas

## Core Modules

| Module | Purpose | Endpoints |
|--------|---------|-----------|
| **Category Identification** | Match content to categories | `POST /identifyCategories` |
| **Static Data Analysis** | Analyze titles/descriptions | `POST /analyzeStaticData` |
| **YouTube Analysis** | Analyze video content | `POST /analyzeYouTubeVideo` |
| **Generic Flashcards** | Create flashcards from any content | `POST /flashcards/generate` |
| **Philosophy Flashcards** | Specialized Anki-style cards | `POST /anki/philosophy/{type}/generate` |

## Setup

1. **Install dependencies**:
   ```bash
   bun install
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   ```

3. **Update `.env`** with your configuration:
   ```bash
   # Server Configuration
   PORT=3000
   HOST=localhost

   # Required
   GOOGLE_API_KEY=your-google-api-key

   # Optional
   GEMINI_MODEL=gemini-2.5-pro
   NODE_ENV=development
   LOG_LEVEL=info
   ```

4. **Get your API key** from [Google AI Studio](https://makersuite.google.com/app/apikey)

5. **Start the server**:
   ```bash
   bun run index.ts
   ```

## API Endpoints

### Category Identification
```bash
curl -X POST http://localhost:3000/identifyCategories \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Understanding Kant's Philosophy",
    "description": "An in-depth analysis of Kant's critical philosophy",
    "categories": ["Philosophy", "Metaphysics", "History", "Science"]
  }'
```

### Generate Flashcards
```bash
curl -X POST http://localhost:3000/flashcards/generate \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Your learning material here",
    "systemPrompt": "Create flashcards focused on key concepts",
    "numberOfCards": 5
  }'
```

### Analyze YouTube Video
```bash
curl -X POST http://localhost:3000/analyzeYouTubeVideo \
  -H "Content-Type: application/json" \
  -d '{
    "videoDescription": "Video description here",
    "categories": ["Philosophy", "History", "Science"]
  }'
```

## Documentation

- **[CLAUDE.md](./CLAUDE.md)** - AI/LLM-optimized documentation for Claude integration
- **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** - Complete API reference with all endpoints
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System design and module structure
- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Detailed development environment setup
- **Interactive Docs**: http://localhost:3000/docs

## Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | Server port | `3000` | No |
| `HOST` | Server host | `localhost` | No |
| `GOOGLE_API_KEY` | Gemini API key | - | **Yes** |
| `GEMINI_MODEL` | Gemini model version | `gemini-2.5-pro` | No |
| `NODE_ENV` | Environment | `development` | No |
| `LOG_LEVEL` | Log level | `info` | No |

## Project Structure

```
gemini-proxy/
├── index.ts                    # Server entry point
├── package.json                # Dependencies
├── tsconfig.json               # TypeScript config
├── .env.example                # Environment template
├── src/
│   ├── config/                 # Configuration management
│   └── modules/                # Feature modules
│       ├── shared/             # Shared utilities
│       ├── categoryIdentification/
│       ├── youtubeVideoAnalysis/
│       ├── staticDataAnalysis/
│       ├── flashcards/
│       └── anki/
└── docs/                       # Documentation
```

## Tech Stack

- **Runtime**: Bun (modern, fast JavaScript runtime)
- **Framework**: Elysia (lightweight web framework)
- **Language**: TypeScript (full type safety)
- **AI**: Google Generative AI SDK
- **Validation**: Zod (schema validation)
- **Documentation**: OpenAPI/Scalar UI

## Development

```bash
# Run with hot reload
bun run index.ts

# View interactive API docs
# Open http://localhost:3000/docs in your browser
```

## Key Concepts

### Modular Design
Each feature is self-contained with its own controller, service, and models.

### Type Safety
Full TypeScript with Zod validation ensures robust request handling and clear API contracts.

### Hebrew Support
Built-in utilities for Hebrew and Aramaic text processing with specialized prompts for Jewish philosophy content.

### Conversation Context
Flashcard generation maintains chat history for contextual, multi-turn interactions with Gemini.

## Contributing

When adding new modules:
1. Create a new directory under `src/modules/`
2. Implement the 3-layer architecture (controller/service/models)
3. Add routes to `index.ts`
4. Update API documentation
5. Add tests if applicable

## License

MIT
