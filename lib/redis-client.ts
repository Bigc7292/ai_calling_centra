// PRD v1.3, Sec 5: Redis for Caching
import Redis from 'ioredis';
import { z } from 'zod';

const redisEnvSchema = z.object({
  REDIS_URL: z.string().url(),
});

const env = redisEnvSchema.parse(process.env);

// Create a new Redis client instance.
// The client will automatically handle reconnections.
const redisClient = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: 20,
  enableReadyCheck: true,
  // Add TLS options if connecting to a managed Redis service like Memorystore/ElastiCache
  // tls: {
  //   rejectUnauthorized: false, 
  // },
});

redisClient.on('connect', () => {
  console.log('Connected to Redis successfully.');
});

redisClient.on('error', (error) => {
  console.error('Redis connection error:', error);
  // In production, you might want to implement a circuit breaker or graceful degradation.
});

export default redisClient;
