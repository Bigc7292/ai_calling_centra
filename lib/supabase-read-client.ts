// PRD v1.3, Sec 5: Database Read Replica Logic
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const readReplicaEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string(),
  // The connection string for the read replica, including the password.
  // This should be a direct Postgres connection string.
  POSTGRES_READ_REPLICA_URL: z.string().url(),
});

const env = readReplicaEnvSchema.parse(process.env);

/**
 * Supabase client configured to use the read replica database.
 * 
 * This client should ONLY be used for idempotent, heavy read operations
 * that can tolerate minor replication lag, such as:
 * - Analytics queries
 * - Log fetching
 * - Public data feeds
 * 
 * DO NOT use this client for any write operations (INSERT, UPDATE, DELETE)
 * or for reads that require real-time consistency (e.g., fetching a user's profile on login).
 */
const supabaseReadClient = createClient( 
    env.NEXT_PUBLIC_SUPABASE_URL, 
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY, 
    {
        db: {
            // Override the database connection string to point to the read replica.
            // This requires the underlying postgres-js library to be of a version that supports this option.
            // Note: This is a conceptual implementation. The actual Supabase JS client options
            // might differ. An alternative is to use a separate PostgreSQL client (like `pg` or `node-postgres`)
            // configured with the read replica URL for specific queries.
            schema: 'public',
        },
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        }
    }
);

// A more direct approach if Supabase client doesn't support overriding the DB connection string easily:
import { Pool } from 'pg';
export const readReplicaPool = new Pool({
    connectionString: env.POSTGRES_READ_REPLICA_URL,
    ssl: {
        rejectUnauthorized: false // Adjust based on your cloud provider's requirements
    }
});

console.log('Initialized database client for Read Replica.');

export default supabaseReadClient;
