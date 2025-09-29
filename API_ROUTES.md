# Gemini Proxy API - Routes and Usage Guide

## Overview

The Gemini Proxy API is a powerful AI-powered service that uses Google's Gemini AI to identify and match categories from text content. The API follows RESTful principles and provides comprehensive OpenAPI documentation.

## Base URL
```
http://localhost:4000
```

**Note:** The server may run on different ports based on your `.env` configuration. Check the console output when starting the server to confirm the exact port.

## Available Routes

### 1. Category Identification
**Endpoint:** `POST /identifyCategories`

**Purpose:** Analyzes a paragraph of text and identifies up to 3 categories that best match its content using Google Gemini AI.

#### Request

**Method:** `POST`
**Content-Type:** `application/json`

**Request Body:**
```json
{
  "categories": ["Technology", "Science", "Business", "Health", "Education"],
  "paragraph": "The rapid advancement in artificial intelligence and machine learning is transforming how businesses operate globally, creating new opportunities and challenges in the digital economy."
}
```

**Field Descriptions:**
- `categories` (required): Array of strings representing the available categories to match against. Must contain at least one category.
- `paragraph` (required): The text content to analyze for category identification. Should be meaningful text for AI analysis.

#### Response

**Success Response (200 OK):**
```json
{
  "success": true,
  "matchingCategories": ["Technology", "Business"],
  "totalCategoriesProvided": 5
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "Failed to process category identification",
  "message": "Categories array is required and must not be empty"
}
```

**Error Response (500 Internal Server Error):**
```json
{
  "success": false,
  "error": "Failed to process category identification",
  "message": "Failed to process category identification request"
}
```

#### Response Field Descriptions
- `success`: Boolean indicating if the request was processed successfully
- `matchingCategories`: Array of category names that best match the paragraph (maximum 3)
- `totalCategoriesProvided`: Total number of categories provided in the original request
- `error`: Error type/category (only in error responses)
- `message`: Detailed error message (only in error responses)

### 2. Interactive API Documentation
**Endpoint:** `GET /docs`

**Purpose:** Provides an interactive web interface for exploring and testing the API using Scalar UI.

#### Request

**Method:** `GET`
**No request body required**

**Browser Access:**
```
http://localhost:4000/docs
```

#### Features
- Interactive API documentation
- Try-it functionality for testing endpoints
- Schema visualization
- Example payloads and responses
- Real-time API testing

### 2. YouTube Video Analysis
**Endpoint:** `POST /analyzeYouTubeVideo`

**Purpose:** Analyzes a YouTube video from a Jewish philosophy website and identifies up to 3 categories that best match its content using Google Gemini AI. Returns both description and categories in Hebrew.

#### Request

**Method:** `POST`
**Content-Type:** `application/json`

**Request Body:**
```json
{
  "youtubeUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "categories": ["פילוסופיה יהודית", "תורה", "חסידות", "קבלה", "מחשבה יהודית"]
}
```

**Field Descriptions:**
- `youtubeUrl` (required): YouTube URL from a Jewish philosophy website to analyze. Must be a valid YouTube URL.
- `categories` (required): Array of category strings in Hebrew that will be used to match against the video content. Must contain at least one category.

#### Response

**Success Response (200 OK):**
```json
{
  "success": true,
  "description": "הסרטון דן ברעיונות הפילוסופיים של הרב קוק בעניין התחייה הלאומית והקשר בין האומה לטבע",
  "categories": ["פילוסופיה יהודית", "תורה", "מחשבה יהודית"]
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "Failed to process YouTube video analysis",
  "message": "YouTube URL is required and must be a non-empty string"
}
```

**Error Response (500 Internal Server Error):**
```json
{
  "success": false,
  "error": "Failed to process YouTube video analysis",
  "message": "Failed to process YouTube video analysis request"
}
```

#### Response Field Descriptions
- `success`: Boolean indicating if the request was processed successfully
- `description`: Description of the video content in Hebrew
- `categories`: Array of category names that best match the video content (maximum 3)
- `error`: Error type/category (only in error responses)
- `message`: Detailed error message (only in error responses)

### 3. Interactive API Documentation
**Endpoint:** `GET /docs`

**Purpose:** Provides an interactive web interface for exploring and testing the API using Scalar UI.

#### Request

**Method:** `GET`
**No request body required**

**Browser Access:**
```
http://localhost:4000/docs
```

#### Features
- Interactive API documentation
- Try-it functionality for testing endpoints
- Schema visualization
- Example payloads and responses
- Real-time API testing

### 4. OpenAPI Specification
**Endpoint:** `GET /docs/json`

**Purpose:** Returns the raw OpenAPI 3.0 specification in JSON format.

#### Request

**Method:** `GET`
**No request body required**

**Access URL:**
```
http://localhost:4000/docs/json
```

#### Response
Returns a complete OpenAPI 3.0 specification JSON document containing:
- API metadata
- Server information
- Endpoint definitions
- Request/response schemas
- Authentication requirements

## Usage Examples

### Example 1: YouTube Video Analysis

**cURL:**
```bash
curl -X POST http://localhost:4000/analyzeYouTubeVideo \
  -H "Content-Type: application/json" \
  -d '{
    "youtubeUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "categories": ["פילוסופיה יהודית", "תורה", "חסידות", "קבלה", "מחשבה יהודית"]
  }'
```

**Expected Response (4-5 sentences in Hebrew):**
```json
{
  "success": true,
  "description": "השיעור עוסק בבחירה החופשית במחשבה היהודית. הוא בוחן את קיומה של הבחירה החופשית ואת הגורמים המשפיעים עליה. הנושא נדון מתוך התייחסות למקורות קלאסיים ביהדות. השיעור מציע ניתוח פילוסופי-תיאולוגי מעמיק. הוא מתמקד בשאלות יסוד הנוגעות ליחסים בין רצון האדם לרצון שמיים.",
  "categories": ["פילוסופיה יהודית", "מחשבה יהודית"]
}
```

**Note:** The description will be exactly 4-5 sentences in Hebrew. Categories will only include items from your provided list.

### Example 2: Basic Category Identification

**cURL:**
```bash
curl -X POST http://localhost:4000/identifyCategories \
  -H "Content-Type: application/json" \
  -d '{
    "categories": ["Technology", "Science", "Business", "Health", "Education"],
    "paragraph": "The rapid advancement in artificial intelligence and machine learning is transforming how businesses operate globally."
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "matchingCategories": ["Technology", "Business"],
  "totalCategoriesProvided": 5
}
```

### Example 2: Technology Article Analysis

**cURL:**
```bash
curl -X POST http://localhost:4000/identifyCategories \
  -H "Content-Type: application/json" \
  -d '{
    "categories": ["Sports", "Politics", "Technology", "Entertainment", "Science"],
    "paragraph": "The new smartphone features cutting-edge AI capabilities and revolutionary camera technology that will change mobile photography forever."
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "matchingCategories": ["Technology"],
  "totalCategoriesProvided": 5
}
```

### Example 3: Error Handling - Empty Categories

**cURL:**
```bash
curl -X POST http://localhost:4000/identifyCategories \
  -H "Content-Type: application/json" \
  -d '{
    "categories": [],
    "paragraph": "This is a test paragraph."
  }'
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Failed to process category identification",
  "message": "Categories array is required and must not be empty"
}
```

### Example 4: Error Handling - Empty Paragraph

**cURL:**
```bash
curl -X POST http://localhost:4000/identifyCategories \
  -H "Content-Type: application/json" \
  -d '{
    "categories": ["Technology", "Science"],
    "paragraph": ""
  }'
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Failed to process category identification",
  "message": "Paragraph is required and must be a non-empty string"
}
```

## JavaScript/Node.js Examples

### Using fetch (Browser/Node.js)
```javascript
async function identifyCategories(categories, paragraph) {
  const response = await fetch('http://localhost:4000/identifyCategories', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      categories,
      paragraph
    })
  });

  const result = await response.json();
  return result;
}

// Usage
identifyCategories(
  ['Technology', 'Science', 'Business'],
  'AI and machine learning are revolutionizing business processes.'
).then(console.log);
```

### Using axios
```javascript
const axios = require('axios');

async function identifyCategories(categories, paragraph) {
  try {
    const response = await axios.post('http://localhost:4000/identifyCategories', {
      categories,
      paragraph
    });

    console.log('Success:', response.data);
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}
```

### Using node-fetch
```javascript
const fetch = require('node-fetch');

async function identifyCategories(categories, paragraph) {
  const response = await fetch('http://localhost:4000/identifyCategories', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      categories,
      paragraph
    })
  });

  const data = await response.json();
  return data;
}
```

## Python Examples

### Using requests
```python
import requests
import json

def identify_categories(categories, paragraph):
    url = 'http://localhost:4000/identifyCategories'
    payload = {
        'categories': categories,
        'paragraph': paragraph
    }

    try:
        response = requests.post(url, json=payload)
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error: {e}")
        return None

# Usage
result = identify_categories(
    ['Technology', 'Science', 'Business'],
    'AI and machine learning are transforming business processes worldwide.'
)
print(result)
```

### Using httpx (async)
```python
import httpx
import asyncio

async def identify_categories(categories, paragraph):
    async with httpx.AsyncClient() as client:
        response = await client.post(
            'http://localhost:4000/identifyCategories',
            json={
                'categories': categories,
                'paragraph': paragraph
            }
        )
        return response.json()

# Usage
result = asyncio.run(identify_categories(
    ['Technology', 'Science', 'Business'],
    'The latest developments in quantum computing are revolutionary.'
))
print(result)
```

## Error Handling

### Common Error Scenarios

1. **Invalid API Key**: When GOOGLE_API_KEY is not properly configured
   ```json
   {
     "success": false,
     "error": "Failed to process category identification",
     "message": "Failed to process category identification request"
   }
   ```

2. **Invalid Input**: Missing or empty required fields
   ```json
   {
     "success": false,
     "error": "Failed to process category identification",
     "message": "Categories array is required and must not be empty"
   }
   ```

3. **Network Issues**: Connectivity problems with Gemini AI service
   ```json
   {
     "success": false,
     "error": "Failed to process category identification",
     "message": "Failed to process category identification request"
   }
   ```

### HTTP Status Codes

- **200**: Success - Categories identified successfully
- **400**: Bad Request - Invalid input parameters
- **500**: Internal Server Error - Server or AI service error

## Best Practices

1. **Category Selection**: Provide relevant categories that could realistically match your content
2. **Text Quality**: Ensure paragraphs contain substantial, meaningful content for better AI analysis
3. **Error Handling**: Always check the `success` field in responses
4. **Rate Limiting**: Consider implementing appropriate delays between requests
5. **Input Validation**: Validate your inputs before sending to avoid unnecessary API calls

## Rate Limiting & Usage

- The API uses Google's Gemini AI service which has its own rate limits
- Consider implementing client-side caching for frequently analyzed content
- Monitor your usage through Google's AI Studio dashboard

## Support

For issues or questions:
- Check the interactive documentation at `/docs`
- Review the OpenAPI specification at `/docs/json`
- Ensure your GOOGLE_API_KEY is properly configured in the `.env` file
