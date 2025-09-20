// Per TASK COMMAND: Zod schemas for validation
import { z } from 'zod';

// Per PRD Sec 2.2: Email/password with min 8 chars
export const SignupFormSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters long.' }),
});

// Schema for the backend API endpoint
export const SignupApiSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8), // Password will be handled by Supabase Auth
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid wallet address'),
});
