import { config } from 'dotenv';
import { z } from 'zod';

// Load environment variables
config({ path: '../../.env' });

const envSchema = z.object({
  API_PORT: z.string().default('5050'),
  API_HOST: z.string().default('0.0.0.0'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DUFFEL_KEY_SAVER_TRIPS: z.string().min(1, 'DUFFEL_KEY_SAVER_TRIPS is required'),
  DUFFEL_KEY_APEX_RESERVE: z.string().min(1, 'DUFFEL_KEY_APEX_RESERVE is required'),
  DUFFEL_KEY_GLOBEX_SYSTEMS: z.string().min(1, 'DUFFEL_KEY_GLOBEX_SYSTEMS is required'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:');
  console.error(parsed.error.flatten().fieldErrors);
  throw new Error('Invalid environment variables');
}

export const env = parsed.data;

