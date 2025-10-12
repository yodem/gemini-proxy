import { config } from 'dotenv';

// Load environment variables from .env file
config();

// Configuration interface
export interface AppConfig {
  server: {
    port: number;
    host: string;
  };
  gemini: {
    apiKey: string;
    model: string;
  };
  app: {
    nodeEnv: string;
    logLevel: string;
  };
}

// Validate and parse environment variables
function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key] || defaultValue;
  if (!value) {
    throw new Error(`Environment variable ${key} is required but not set`);
  }
  return value;
}

function getEnvNumber(key: string, defaultValue?: number): number {
  const value = process.env[key];
  if (value) {
    const parsed = parseInt(value, 10);
    if (isNaN(parsed)) {
      throw new Error(`Environment variable ${key} must be a valid number`);
    }
    return parsed;
  }
  if (defaultValue !== undefined) {
    return defaultValue;
  }
  throw new Error(`Environment variable ${key} is required but not set`);
}

// Build configuration object
export const appConfig: AppConfig = {
  server: {
    port: getEnvNumber('PORT', 3000),
    host: getEnvVar('HOST', 'localhost'),
  },
  gemini: {
    apiKey: getEnvVar('GOOGLE_API_KEY'),
    model: getEnvVar('GEMINI_MODEL', 'gemini-2.5-pro'),
  },
  app: {
    nodeEnv: getEnvVar('NODE_ENV', 'development'),
    logLevel: getEnvVar('LOG_LEVEL', 'info'),
  },
};

// Validate critical configuration
if (!appConfig.gemini.apiKey || appConfig.gemini.apiKey === 'your-google-api-key-here') {
  console.warn('⚠️  WARNING: GOOGLE_API_KEY is not set or using placeholder value. Gemini API calls will fail.');
  console.warn('   Please set your Google API key in the .env file.');
}

export default appConfig;
