# Setup Guide - Gemini Proxy

Complete step-by-step instructions for setting up and running the Gemini Proxy service.

## Prerequisites

Before starting, ensure you have:

### Required Software
- **Bun** (JavaScript runtime) - [Install Bun](https://bun.sh)
  - Verify: `bun --version` (should show v1.0+)
- **A Google Account** - For accessing Gemini API
- **Git** (optional) - For cloning the repository

### Required Credentials
- **Google Gemini API Key** - [Get from Google AI Studio](https://makersuite.google.com/app/apikey)

## Step 1: Clone or Download the Project

### Option A: Using Git
```bash
git clone <repository-url>
cd gemini-proxy
```

### Option B: Direct Download
1. Download the project files
2. Extract to a folder of your choice
3. Open terminal in that folder

## Step 2: Install Dependencies

From the project root directory:

```bash
bun install
```

This will:
- Create a `node_modules` directory
- Install all dependencies from `package.json`
- Install Bun package manager if needed

**Expected output:**
```
bun install v1.x.x
+ @elysiajs/openapi
+ @google/generative-ai
+ dotenv
+ elysia
✓ packages installed [5 packages in 1.5s]
```

## Step 3: Configure Environment Variables

### Create `.env` File

From the project root, create or copy the environment template:

```bash
# Copy the example file
cp .env.example .env
```

Or create manually:

```bash
touch .env
```

### Edit `.env` File

Open `.env` in your text editor and add:

```bash
# Server Configuration
PORT=3000
HOST=localhost

# Gemini AI Configuration (REQUIRED - Replace with your actual key)
GOOGLE_API_KEY=your-actual-google-api-key-here

# Optional Configuration
GEMINI_MODEL=gemini-2.5-pro
NODE_ENV=development
LOG_LEVEL=info
```

### Get Your Google API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Create API Key"
3. Select or create a Google Cloud project
4. Copy the generated API key
5. Paste into `.env` as `GOOGLE_API_KEY=your_key_here`

**Important Security Notes:**
- Never commit `.env` to version control
- `.env` is in `.gitignore` (check if exists)
- Never share your API key publicly
- Treat API key like a password

## Step 4: Verify Setup

Before running, verify your configuration:

```bash
# Check Bun is installed
bun --version

# Check you're in the right directory
ls src/modules

# Check .env file exists
cat .env | grep GOOGLE_API_KEY
```

**You should see:**
- Bun version output
- List of module directories
- Your API key (verify it's not a placeholder)

## Step 5: Start the Server

From the project root:

```bash
bun run index.ts
```

**Expected output:**
```
✅ Elysia server running at http://localhost:3000
📚 Documentation available at http://localhost:3000/docs
Server running on http://localhost:3000/docs
```

The server is now running! Keep this terminal window open.

## Step 6: Test the API

### Option A: Interactive Testing (Recommended)

Open your browser and go to:
```
http://localhost:3000/docs
```

You'll see the Scalar UI documentation interface where you can:
1. Select an endpoint from the list
2. Fill in the request parameters
3. Click "Send" to test
4. See the response in real-time

**Try this first:**
- Endpoint: `/identifyCategories`
- Fill in sample data
- Click "Send"

### Option B: Command Line Testing (Advanced)

In another terminal, test with curl:

```bash
curl -X POST http://localhost:3000/identifyCategories \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Artificial Intelligence Fundamentals",
    "description": "Learn the basics of machine learning and neural networks",
    "categories": ["Technology", "Science", "Education", "Business"]
  }'
```

**Expected response:**
```json
{
  "success": true,
  "data": {
    "matchingCategories": ["Technology", "Science", "Education"],
    "totalCategoriesProvided": 4
  },
  "error": null
}
```

### Option C: Node.js/JavaScript Testing

Create a test script `test.js`:

```javascript
async function testAPI() {
  const response = await fetch('http://localhost:3000/identifyCategories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'Test Article',
      description: 'This is a test description',
      categories: ['Tech', 'Science', 'History']
    })
  });

  const data = await response.json();
  console.log('Response:', data);
}

testAPI();
```

Run it:
```bash
bun run test.js
```

## Step 7: Explore the Documentation

### Interactive API Docs
- URL: `http://localhost:3000/docs`
- Scalar UI interface for testing endpoints
- Shows all parameters and response formats
- Try-it-out feature for each endpoint

### API Specification
- URL: `http://localhost:3000/docs/json`
- Raw OpenAPI specification in JSON
- Use with API client generators
- Import into Postman, Insomnia, etc.

### Documentation Files
- `README.md` - Overview and quick start
- `API_DOCUMENTATION.md` - Complete endpoint reference
- `ARCHITECTURE.md` - System design and patterns
- `CLAUDE.md` - AI integration guide (for Claude/LLMs)

## Stopping the Server

To stop the server:

1. In the terminal window running `bun run index.ts`
2. Press `Ctrl+C`

The server will shut down gracefully.

## Troubleshooting

### Error: "Cannot find module 'bun'"

**Solution:**
- Install Bun: `curl -fsSL https://bun.sh/install | bash`
- Add to PATH if needed: `export PATH=$PATH:$HOME/.bun/bin`

### Error: "GOOGLE_API_KEY is not set"

**Solution:**
- Check `.env` file exists in project root
- Verify `GOOGLE_API_KEY=` line is present
- Ensure the key is not empty or a placeholder
- Get a new key from [Google AI Studio](https://makersuite.google.com/app/apikey)

### Error: "Failed to identify categories: Invalid API key"

**Solution:**
- Verify API key is correct (no extra spaces)
- Check the key works in [Google AI Studio](https://makersuite.google.com/app/apikey)
- Generate a new key if needed
- Ensure project has Gemini API enabled

### Error: "Connection refused" or "Cannot connect"

**Solution:**
- Verify server is running: `bun run index.ts` in another terminal
- Check port 3000 is not in use: `lsof -i :3000`
- If port in use, change PORT in `.env` file
- Ensure `HOST=localhost` is set in `.env`

### Port Already in Use

**Solution:**
1. Find what's using port 3000:
   ```bash
   lsof -i :3000
   ```

2. Kill the process:
   ```bash
   kill -9 <PID>
   ```

3. Or change the port in `.env`:
   ```bash
   PORT=3001
   ```

### Slow Responses (3-5 seconds)

This is normal! Gemini API takes 2-3 seconds to respond. This is expected behavior.

### "No matching categories found"

Possible causes:
- Content doesn't match the provided categories
- Categories are too specific
- Content is ambiguous

Try:
- Provide more generic categories
- Check content is clear and descriptive
- Use the interactive docs to test different inputs

## Development Mode

### Running with Auto-Reload

For development, Bun can reload on file changes. However, the current setup uses `bun run index.ts` which doesn't auto-reload. To enable:

```bash
# Option 1: Use --hot flag
bun --hot run index.ts

# Option 2: Use bun watch
bun run --watch index.ts
```

Note: Auto-reload may restart the server, which is fine for development.

### Checking Logs

The server logs important information:
- Startup messages
- API requests (with endpoint called)
- Errors with context
- Gemini API interactions

Keep an eye on the console output while testing.

## Production Deployment

### Before Deploying

1. **Security**:
   - Move `GOOGLE_API_KEY` to environment secrets (not `.env`)
   - Set `NODE_ENV=production`
   - Enable HTTPS (use reverse proxy)
   - Add authentication if exposing publicly

2. **Configuration**:
   - Set appropriate `PORT` for your platform
   - Configure `HOST` for your domain
   - Consider rate limiting middleware

3. **Testing**:
   - Test all endpoints with real data
   - Test error scenarios
   - Verify API key works with expected usage

### Docker Deployment (Example)

Create `Dockerfile`:
```dockerfile
FROM oven/bun:latest
WORKDIR /app
COPY package.json .
RUN bun install
COPY . .
ENV PORT=3000
ENV HOST=0.0.0.0
EXPOSE 3000
CMD ["bun", "run", "index.ts"]
```

Build and run:
```bash
docker build -t gemini-proxy .
docker run -p 3000:3000 \
  -e GOOGLE_API_KEY=your_key \
  gemini-proxy
```

### Vercel Deployment (Alternative)

1. Push code to GitHub
2. Create Vercel account
3. Import project
4. Set environment variables:
   - `GOOGLE_API_KEY`
   - `GEMINI_MODEL` (optional)
5. Deploy

Note: Serverless platforms may have timeout limits (Vercel has 60s) which could affect flashcard generation.

## Next Steps

After successful setup:

1. **Read the Documentation**:
   - [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - Learn all endpoints
   - [ARCHITECTURE.md](./ARCHITECTURE.md) - Understand the design

2. **Test All Endpoints**:
   - Use `/docs` interactive interface
   - Try different content types
   - Experiment with categories

3. **Integrate with Your App**:
   - See examples in API_DOCUMENTATION.md
   - Implement error handling
   - Add retry logic for API failures

4. **Customize** (if needed):
   - Modify prompts in service files
   - Add new endpoints following the module pattern
   - Configure logging and monitoring

## Performance Tips

### Response Time Optimization
- Gemini API typically takes 2-3 seconds
- This is normal and cannot be reduced client-side
- Consider caching repeated requests

### Rate Limiting Awareness
- Google Gemini API has rate limits:
  - Free tier: ~60 requests/minute
  - Paid tier: Higher based on plan
- Implement retry logic with exponential backoff
- Consider request queuing for high volume

### Monitoring
- Track API response times
- Monitor error rates
- Alert on API key failures
- Track Gemini API quota usage

## Support

If you encounter issues:

1. **Check Logs**: Look at console output for error messages
2. **Review Troubleshooting**: See section above
3. **Verify Configuration**: Check `.env` file
4. **Test API Key**: Verify in [Google AI Studio](https://makersuite.google.com/app/apikey)
5. **Check Documentation**: Read [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
6. **Review Architecture**: See [ARCHITECTURE.md](./ARCHITECTURE.md) for design details

## Common Commands Reference

```bash
# Install dependencies
bun install

# Start the server
bun run index.ts

# Start with auto-reload
bun --hot run index.ts

# Test an endpoint
curl -X POST http://localhost:3000/identifyCategories \
  -H "Content-Type: application/json" \
  -d '{...}'

# View API documentation
# Open in browser: http://localhost:3000/docs

# Stop the server
# Press Ctrl+C in the terminal running the server
```

## Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GOOGLE_API_KEY` | ✅ Yes | - | Google Gemini API key from AI Studio |
| `GEMINI_MODEL` | No | `gemini-2.5-pro` | Which Gemini model to use |
| `PORT` | No | `3000` | Server port |
| `HOST` | No | `localhost` | Server host/IP address |
| `NODE_ENV` | No | `development` | Environment (development/production) |
| `LOG_LEVEL` | No | `info` | Logging verbosity level |

---

**You're all set!** The Gemini Proxy service is now running and ready to use. Start with the interactive docs at `http://localhost:3000/docs` and explore the available endpoints.

For detailed API information, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md).
