// PRD v1.3, Sec 5: Caching Middleware
import { Request, Response, NextFunction } from 'express';
import redisClient from '@/lib/redis-client'; // Assuming alias for /lib

const CACHE_TTL_SECONDS = 60;

const cachingMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  // Only cache idempotent GET requests
  if (req.method !== 'GET') {
    return next();
  }

  const cacheKey = `cache:${req.originalUrl}`;

  try {
    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
      console.log(`[Cache] HIT for ${cacheKey}`);
      return res.status(200).json(JSON.parse(cachedData));
    }

    // If not in cache, proceed to the handler and cache the response
    console.log(`[Cache] MISS for ${cacheKey}`);
    const originalSend = res.send;

    res.send = function (body) {
      // Cache the successful response
      if (res.statusCode >= 200 && res.statusCode < 300) {
        redisClient.setex(cacheKey, CACHE_TTL_SECONDS, JSON.stringify(body));
        console.log(`[Cache] SET for ${cacheKey}`);
      }
      return originalSend.call(this, body);
    };

    next();

  } catch (error) {
    console.error('[Cache] Redis error:', error);
    // If Redis fails, proceed without caching (graceful degradation)
    return next();
  }
};

export default cachingMiddleware;
