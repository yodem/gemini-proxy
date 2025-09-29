# YouTube Video Analysis API Integration Guide

## Overview
This guide provides instructions for AI agents to integrate with the YouTube Video Analysis API endpoint that analyzes YouTube videos from Jewish philosophy websites and returns descriptions and categories in Hebrew.

## API Endpoint
```
POST http://localhost:4000/analyzeYouTubeVideo
```

## Request Format

### Headers
```
Content-Type: application/json
```

### Body Schema
```json
{
  "youtubeUrl": "string (required)",
  "categories": "string[] (required, min 1 item)"
}
```

### Field Descriptions
- `youtubeUrl`: Valid YouTube URL (youtube.com or youtu.be)
- `categories`: Array of Hebrew category strings for matching

## Response Format

### Success Response (200)
```json
{
  "success": true,
  "description": "string (Hebrew description, 4-5 sentences)",
  "categories": ["string"] // max 3 matching categories from provided list only
}
```

### Error Response (400/500)
```json
{
  "success": false,
  "error": "string",
  "message": "string"
}
```

## Integration Examples

### JavaScript/Node.js
```javascript
async function analyzeYouTubeVideo(youtubeUrl, categories) {
  try {
    const response = await fetch('http://localhost:4000/analyzeYouTubeVideo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        youtubeUrl,
        categories
      })
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message);
    }

    return {
      description: result.description,
      categories: result.categories
    };
  } catch (error) {
    console.error('YouTube analysis error:', error.message);
    throw error;
  }
}

// Usage example
const result = await analyzeYouTubeVideo(
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  ['פילוסופיה יהודית', 'תורה', 'חסידות', 'קבלה', 'מחשבה יהודית']
);

console.log('Description:', result.description);
console.log('Categories:', result.categories);
```

### Python
```python
import requests
import json

def analyze_youtube_video(youtube_url, categories):
    """
    Analyze YouTube video content and return Hebrew description and categories.

    Args:
        youtube_url (str): Valid YouTube URL
        categories (list): List of Hebrew category strings

    Returns:
        dict: {'description': str, 'categories': list}

    Raises:
        Exception: If API call fails or returns error
    """
    try:
        response = requests.post(
            'http://localhost:4000/analyzeYouTubeVideo',
            json={
                'youtubeUrl': youtube_url,
                'categories': categories
            },
            headers={'Content-Type': 'application/json'}
        )

        result = response.json()

        if not result.get('success'):
            raise Exception(result.get('message', 'API request failed'))

        return {
            'description': result['description'],
            'categories': result['categories']
        }

    except requests.RequestException as e:
        raise Exception(f'Network error: {str(e)}')
    except json.JSONDecodeError as e:
        raise Exception(f'Invalid JSON response: {str(e)}')

# Usage example
try:
    result = analyze_youtube_video(
        'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        ['פילוסופיה יהודית', 'תורה', 'חסידות', 'קבלה', 'מחשבה יהודית']
    )

    print('תיאור:', result['description'])
    print('קטגוריות:', ', '.join(result['categories']))

except Exception as e:
    print(f'שגיאה: {str(e)}')
```

### cURL Command
```bash
curl -X POST http://localhost:4000/analyzeYouTubeVideo \
  -H "Content-Type: application/json" \
  -d '{
    "youtubeUrl": "https://www.youtube.com/watch?v=Cc6iBSv3fRk",
    "categories": ["פילוסופיה יהודית", "תורה", "חסידות", "קבלה", "מחשבה יהודית", "מוסר יהודי"]
  }'
```

**Expected Response (4-5 sentences in Hebrew):**
```json
{
  "success": true,
  "description": "פרופ׳ שלום צדיק מציג את ר׳ שלמה אבן גבירול, פילוסוף יהודי ניאו-פלטוני שחי בספרד במאה ה-11. ספרו הפילוסופי המרכזי, \\\"מקור חיים\\\", שנכתב במקור בערבית, השפיע רבות על הוגים נוצריים שאף זיהו אותו בטעות כנוצרי. אבן גבירול הציג תפיסת עולם של בריאה בה האל בורא חומר וצורה, וכל הדברים מורכבים מהם. רצון האל בתפיסתו הוא זרם טבעי וכוח אלוהי נטול אישיות. למרות להטו הדתי העמוק, האפיונים הפילוסופיים שלו מציגים גישה נטורליסטית ייחודית.",
  "categories": ["פילוסופיה יהודית", "מחשבה יהודית"]
}
```

**Note:** Uses Gemini 1.5 Pro with fileData for direct YouTube video analysis. Description will be 4-5 sentences focusing on Professor Shalom Tzadik's main topic. Categories will only include items from your provided list.

## Error Handling

### Common Error Scenarios
1. **Invalid YouTube URL**
   ```json
   {
     "success": false,
     "error": "Failed to process YouTube video analysis",
     "message": "Invalid YouTube URL format"
   }
   ```

2. **Empty Categories**
   ```json
   {
     "success": false,
     "error": "Failed to process YouTube video analysis",
     "message": "Categories array is required and must not be empty"
   }
   ```

3. **API Service Error**
   ```json
   {
     "success": false,
     "error": "Failed to process YouTube video analysis",
     "message": "Failed to process YouTube video analysis request"
   }
   ```

### Recommended Error Handling Pattern
```javascript
async function safeAnalyzeYouTubeVideo(youtubeUrl, categories) {
  try {
    const result = await analyzeYouTubeVideo(youtubeUrl, categories);
    return result;
  } catch (error) {
    // Log error for debugging
    console.error('YouTube Analysis Failed:', error.message);

    // Return fallback response
    return {
      description: 'לא ניתן היה לנתח את הסרטון. אנא נסה שוב מאוחר יותר.',
      categories: []
    };
  }
}
```

## Best Practices

### Input Validation
- Always validate YouTube URLs before sending
- Ensure categories array is not empty
- Use meaningful Hebrew categories for better results

### Rate Limiting
- Implement appropriate delays between requests
- Consider caching results for frequently analyzed videos

### Response Processing
- Always check `success` field first
- Handle both successful and error responses
- Expect Hebrew text in description field
- Categories array will contain max 3 items

### Example Categories
```javascript
const jewishPhilosophyCategories = [
  'פילוסופיה יהודית',
  'תורה',
  'חסידות',
  'קבלה',
  'מחשבה יהודית',
  'מוסר יהודי',
  'הלכה',
  'אגדה',
  'תפילה',
  'גמילות חסדים'
];
```

## Server Requirements

### Environment Setup
- Ensure server is running on `http://localhost:4000`
- Verify Google Gemini API key is configured
- Check that all dependencies are installed

### Health Check
```bash
# Test server availability
curl http://localhost:4000/docs/json

# Test endpoint with minimal data
curl -X POST http://localhost:4000/analyzeYouTubeVideo \
  -H "Content-Type: application/json" \
  -d '{"youtubeUrl":"https://www.youtube.com/watch?v=dQw4w9WgXcQ","categories":["test"]}'
```

## Integration Checklist

- [ ] Server is running on port 4000
- [ ] Google Gemini API key is configured
- [ ] Endpoint returns valid JSON responses
- [ ] Hebrew text encoding is handled properly
- [ ] Error cases are handled gracefully
- [ ] Input validation is implemented
- [ ] Rate limiting is considered
- [ ] Logging is in place for debugging

## Troubleshooting

### Common Issues
1. **Server not responding**: Check if server is running on port 4000
2. **Invalid response format**: Verify API key and network connectivity
3. **Hebrew encoding issues**: Ensure UTF-8 encoding in your application
4. **Rate limiting**: Add delays between consecutive requests

### Debug Mode
```javascript
// Enable detailed logging
const DEBUG = true;

async function debugAnalyzeYouTubeVideo(youtubeUrl, categories) {
  if (DEBUG) {
    console.log('Request:', { youtubeUrl, categories });
  }

  const result = await analyzeYouTubeVideo(youtubeUrl, categories);

  if (DEBUG) {
    console.log('Response:', result);
  }

  return result;
}
```</contents>
</xai:function_call >The file /Users/yotamfromm/dev/gemini-proxy/YOUTUBE_ANALYSIS_INTEGRATION.md has been written. Let me also create a quick summary of the key points for easy reference. 

## Integration Summary

**Endpoint:** `POST http://localhost:4000/analyzeYouTubeVideo`

**Quick Start:**
```javascript
const result = await fetch('http://localhost:4000/analyzeYouTubeVideo', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    youtubeUrl: 'https://www.youtube.com/watch?v=VIDEO_ID',
    categories: ['פילוסופיה יהודית', 'תורה', 'חסידות']
  })
}).then(r => r.json());
```

**Response:**
```javascript
{
  success: true,
  description: "תיאור בעברית", // Hebrew description
  categories: ["קטגוריה 1", "קטגוריה 2"] // Max 3 categories
}
```

The integration guide is now ready for copy-paste use! The document includes comprehensive instructions, code examples in multiple languages, error handling patterns, and best practices for AI agents to integrate with the YouTube video analysis API. 🚀
