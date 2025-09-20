// PRD v1.3, Sec 5: Rate Limiting Middleware
import { Request, Response } from 'express';
import rateLimit from 'express-rate-limit';

// This is a simplified check. In a real app, this would be more robust,
// likely checking for a valid JWT or session attached by previous auth middleware.
const isAuthenticated = (req: Request): boolean => {
  return req.headers.authorization !== undefined || (req as any).user !== undefined;
};

const rateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  limit: (req: Request, res: Response) => {
    // PRD Sec 5: Custom logic for authenticated vs unauthenticated users
    if (isAuthenticated(req)) {
      return 500; // 500 requests per minute for authenticated users
    }
    return 100; // 100 requests per minute for unauthenticated users
  },
  standardHeaders: 'draft-7', // Recommended standard for rate limit headers
  legacyHeaders: false,
  keyGenerator: (req: Request): string => {
    // Use the user's ID if authenticated, otherwise use their IP address
    if (isAuthenticated(req) && (req as any).user?.id) {
      return (req as any).user.id;
    }
    return req.ip || 'unknown-ip';
  },
  handler: (req, res, next, options) => {
    res.status(options.statusCode).json({
      message: `Too many requests. You are limited to ${options.limit} requests per minute.`,
    });
  },
});

export default rateLimiter;
