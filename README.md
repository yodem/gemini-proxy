# Gemini Proxy Server

A fast ElysiaJS server that provides AI-powered content analysis using Google's Gemini models, including YouTube video analysis and category identification.

## Setup

1. Install dependencies:
```bash
bun install
```

2. Configure environment variables:
Copy the example file and update it with your values:
```bash
cp .env.example .env
```

Then edit the `.env` file with your configuration:
```bash
# Server Configuration
PORT=4000
HOST=localhost

# Gemini AI Configuration (REQUIRED)
GOOGLE_API_KEY=your-actual-google-api-key-here
GEMINI_MODEL=gemini-1.5-pro

# Application Configuration
NODE_ENV=development
LOG_LEVEL=info
```

3. Set up your Google API key:
Get your Google API key from [Google AI Studio](https://makersuite.google.com/app/apikey) and replace `your-actual-google-api-key-here` in the `.env` file.

## Running the Server

```bash
bun run index.ts
```

The server will start on `http://localhost:4000` with the following endpoints:

- **API Server**: `http://localhost:4000`
- **API Documentation**: `http://localhost:4000/docs`
- **OpenAPI Specification**: `http://localhost:4000/docs/json`

## 📖 API Documentation

For detailed information about all available routes, request/response formats, and usage examples, see:

- **[API_ROUTES.md](API_ROUTES.md)** - Comprehensive guide with examples in multiple programming languages
- **Interactive Docs** - Visit `http://localhost:4000/docs` for live API testing
- **OpenAPI Spec** - Raw specification available at `http://localhost:4000/docs/json`

## API Endpoints

### POST /identifyCategories

Identifies up to 3 matching categories from a provided list based on paragraph content using Gemini AI.

#### Request Body
```json
{
  "categories": ["Technology", "Science", "Business", "Health", "Education"],
  "paragraph": "The rapid advancement in artificial intelligence and machine learning is transforming how businesses operate globally..."
}
```

#### Response
```json
{
  "success": true,
  "matchingCategories": ["Technology", "Business"],
  "totalCategoriesProvided": 5
}
```

#### Request Schema
- `categories`: Array of strings (required, non-empty)
- `paragraph`: String (required, non-empty)

#### Response Schema
- `success`: Boolean indicating if the request was processed successfully
- `matchingCategories`: Array of matching category strings (max 3)
- `totalCategoriesProvided`: Number of categories in the original request

#### Error Handling
The API includes comprehensive validation and error handling:
- Validates that categories is a non-empty array
- Validates that paragraph is a non-empty string
- Handles Gemini API errors gracefully
- Includes fallback parsing for unexpected responses

## Features

- **Fast**: Built with ElysiaJS and Bun runtime
- **AI-Powered**: Uses Google's Gemini 2.0 Flash for intelligent category matching
- **Robust**: Comprehensive input validation and error handling
- **Type-Safe**: Full TypeScript support with Elysia schema validation
- **Graceful Shutdown**: Proper cleanup on process termination
- **Auto-Documented**: Complete OpenAPI/Swagger documentation with interactive UI
- **Modular Architecture**: Following ElysiaJS best practices with separated concerns

## Example Usage

```bash
# Start the server
bun run index.ts

# In another terminal, test the endpoint
curl -X POST http://localhost:3000/identifyCategories \
  -H "Content-Type: application/json" \
  -d '{
    "categories": ["Sports", "Politics", "Technology", "Entertainment"],
    "paragraph": "The new smartphone features cutting-edge AI capabilities and revolutionary camera technology that will change mobile photography forever."
  }'
```

Expected response:
```json
{
  "success": true,
  "matchingCategories": ["Technology"],
  "totalCategoriesProvided": 4
}
```

## API Documentation

This project includes comprehensive OpenAPI documentation powered by ElysiaJS.

### Interactive Documentation
Visit `http://localhost:4000/docs` to access the interactive Scalar UI documentation where you can:
- Explore all available endpoints
- Test API calls directly from the browser
- View detailed request/response schemas
- See example payloads and responses

### OpenAPI Specification
The raw OpenAPI specification is available at `http://localhost:4000/docs/json` for:
- Integration with API clients
- Code generation tools
- Documentation platforms
- API testing frameworks

### Documentation Features
- **Complete Schema Information**: All request/response models are fully documented
- **Example Values**: Realistic examples for all parameters and responses
- **Error Documentation**: Detailed error responses with status codes
- **Interactive Testing**: Try out the API directly from the documentation

## Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | Server port number | `4000` | No |
| `HOST` | Server hostname | `localhost` | No |
| `GOOGLE_API_KEY` | Google Gemini API key | - | **Yes** |
| `GEMINI_MODEL` | Gemini model to use | `gemini-2.0-flash-exp` | No |
| `NODE_ENV` | Application environment | `development` | No |
| `LOG_LEVEL` | Logging level | `info` | No |

## Architecture

This project follows ElysiaJS best practices with a modular architecture:

```
src/
├── config/           # Environment configuration
├── modules/
│   └── categoryIdentification/
│       ├── index.ts  # Controller (Elysia routes)
│       ├── service.ts # Business logic (Gemini AI)
│       └── model.ts  # Data validation schemas
└── index.ts          # Main server entry point
```

This project was created using `bun init` in bun v1.2.21. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.
