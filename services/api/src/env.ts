import { config as loadEnv } from 'dotenv';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Root .env first, then services/api/.env overrides (matches CLI / tsx behavior)
const rootEnvPath = resolve(__dirname, '../../../.env');
const apiEnvPath = resolve(__dirname, '../.env');

loadEnv({ path: rootEnvPath });
loadEnv({ path: apiEnvPath, override: true });

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function optional(name: string, fallback = ''): string {
  return process.env[name] ?? fallback;
}

export const env = {
  port: Number(optional('PORT', '3001')),
  nodeEnv: optional('NODE_ENV', 'development'),
  corsOrigin: optional('CORS_ORIGIN', 'http://localhost:5174'),
  get supabaseUrl() {
    return optional('SUPABASE_URL');
  },
  get supabaseServiceRoleKey() {
    return optional('SUPABASE_SERVICE_ROLE_KEY');
  },
  get supabaseConfigured() {
    return Boolean(this.supabaseUrl && this.supabaseServiceRoleKey);
  },
  requireSupabase() {
    return {
      url: required('SUPABASE_URL'),
      serviceRoleKey: required('SUPABASE_SERVICE_ROLE_KEY'),
    };
  },
  get openaiApiKey() {
    return optional('OPENAI_API_KEY');
  },
  get openaiConfigured() {
    return Boolean(process.env.OPENAI_API_KEY);
  },
  requireOpenAI() {
    return required('OPENAI_API_KEY');
  },
};
