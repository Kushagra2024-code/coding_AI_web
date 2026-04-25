import dotenv from 'dotenv'
import { z } from 'zod'

dotenv.config()

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(8080),
  MONGODB_URI: z.string().url().optional(),
  JWT_SECRET: z.string().min(12).default('dev-only-secret-change-me'),
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),
  GEMINI_API_KEY: z.string().optional(),
  JUDGE0_API_URL: z.string().url().optional(),
  JUDGE0_API_KEY: z.string().optional(),
})

const parsed = envSchema.safeParse(process.env)
if (!parsed.success) {
  console.error('Invalid environment configuration', parsed.error.flatten().fieldErrors)
  process.exit(1)
}

export const env = parsed.data
