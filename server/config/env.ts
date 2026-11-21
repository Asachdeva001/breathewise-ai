import { z } from 'zod';

const envSchema = z.object({
  PORT: z.string().default('5000').transform((v) => parseInt(v, 10)),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CLIENT_ORIGIN: z.string().default('http://localhost:3000'),
  GOOGLE_CLOUD_PROJECT: z.string().default('breathewise-ai-demo'),
  GCP_REGION: z.string().default('us-central1'),
  VERTEX_AI_MODEL_ID: z.string().default('gemini-1.5-flash'),
  FIRESTORE_MODE: z.enum(['memory', 'firestore']).default('memory'),
  WAQI_API_KEY: z.string().optional().default(''),
});

export type EnvConfig = z.infer<typeof envSchema>;

let parsedEnv: EnvConfig;
try {
  parsedEnv = envSchema.parse(process.env);
} catch (error) {
  console.warn('⚠️ Environment validation warning, falling back to safe defaults:', error);
  parsedEnv = envSchema.parse({});
}

export const env = parsedEnv;
