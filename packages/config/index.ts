import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().optional().default(3001),
  SUPABASE_URL: z.string().min(2),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(2),
});

export const loadEnv = () => {
  return envSchema.parse(process.env);
};