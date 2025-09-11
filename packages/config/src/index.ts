import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().optional().default(3001),
  SUPABASE_URL: z.string().url().min(2),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(2),
  SUPABASE_JWKS_URL: z.string().url().min(2), // Made required
  STRIPE_SECRET_KEY: z.string().min(2),
  STRIPE_WEBHOOK_SECRET: z.string().min(2),
  WEB_BASE_URL: z.string().url().default("http://localhost:3000"),
  PGHOST: z.string().optional(),
  PGPORT: z.coerce.number().optional(),
  PGDATABASE: z.string().optional(),
  PGUSER: z.string().optional(),
  PGPASSWORD: z.string().optional(),
});

export const loadEnv = () => {
  return envSchema.parse(process.env);
};
