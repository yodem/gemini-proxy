import { Elysia } from 'elysia';
import { openapi } from '@elysiajs/openapi';
import { categoryIdentificationController } from './src/modules/categoryIdentification';
import { youtubeVideoAnalysisController } from './src/modules/youtubeVideoAnalysis';
import { staticDataAnalysisController } from './src/modules/staticDataAnalysis';
import { appConfig } from './src/config';

// Create main Elysia server with method chaining
const app = new Elysia({
  name: 'GeminiProxy.Server'
})
  // Configure OpenAPI documentation
  .use(openapi({
    documentation: {
      info: {
        title: 'Gemini Proxy API',
        description: 'AI-powered category identification service using Google Gemini',
        version: '1.0.0',
        contact: {
          name: 'API Support',
          email: 'support@gemini-proxy.dev'
        }
      },
      servers: [
        {
          url: `http://${appConfig.server.host}:${appConfig.server.port}`,
          description: `${appConfig.app.nodeEnv} server`
        }
      ],
      tags: [
        {
          name: 'Category Identification',
          description: 'AI-powered category matching using Gemini AI'
        },
        {
          name: 'YouTube Video Analysis',
          description: 'AI-powered analysis of YouTube videos using Gemini AI with Hebrew language support'
        },
        {
          name: 'Static Data Analysis',
          description: 'AI-powered analysis of static data (title and description) using Gemini AI with Hebrew language support'
        }
      ]
    },
    path: '/docs',
    specPath: '/docs/json'
  }))
  // Use the category identification controller module
  .use(categoryIdentificationController)
  // Use the YouTube video analysis controller module
  .use(youtubeVideoAnalysisController)
  // Use the static data analysis controller module
  .use(staticDataAnalysisController)
  // Start the server using configuration
  .listen({
    port: appConfig.server.port,
    hostname: appConfig.server.host
  }, () => {
    console.log(`🚀 Gemini Proxy Server running on http://${appConfig.server.host}:${appConfig.server.port}`);
    console.log('📁 Using modular architecture following ElysiaJS best practices');
    console.log(`🌍 Environment: ${appConfig.app.nodeEnv}`);
    console.log(`🤖 Gemini Model: ${appConfig.gemini.model}`);
    console.log(`📚 API Documentation: http://${appConfig.server.host}:${appConfig.server.port}/docs`);
    console.log(`🔗 OpenAPI Spec: http://${appConfig.server.host}:${appConfig.server.port}/docs/json`);
  });

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  app.stop();
  process.exit(0);
});

export default app;