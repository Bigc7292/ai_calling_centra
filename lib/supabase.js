import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
// Load environment variables from the root .env file
config({ path: process.cwd() + '/.env' });
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase URL and service key must be provided.');
}
// This is the service role client, it should be used with caution
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
/**
 * Cache for Supabase clients instantiated with a user's JWT.
 */
const userClientCache = new Map();
/**
 * Returns a Supabase client.
 * If no auth header is provided, it returns the admin client (service role).
 * If an auth header is provided, it returns a client for that user, caching it for subsequent requests.
 *
 * @param authHeader The Authorization header from the request.
 * @returns A Supabase client.
 */
export const getSupabaseClient = (authHeader) => {
    if (!authHeader) {
        return supabaseAdmin;
    }
    const existingClient = userClientCache.get(authHeader);
    if (existingClient) {
        return existingClient;
    }
    const newClient = createClient(supabaseUrl, supabaseServiceKey, {
        global: {
            headers: {
                Authorization: authHeader,
            },
        },
    });
    userClientCache.set(authHeader, newClient);
    return newClient;
};
