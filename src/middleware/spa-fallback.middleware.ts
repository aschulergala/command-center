import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { join } from 'path';
import { existsSync } from 'fs';

/**
 * SPA Fallback Middleware
 * Serves index.html for any GET request that:
 * 1. Does not start with /api
 * 2. Does not have a file extension (not a static file request)
 *
 * This enables client-side routing for Vue Router.
 */
@Injectable()
export class SpaFallbackMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Skip for API routes - check both path and originalUrl
    // (path may be modified by routers, originalUrl is the original request URL)
    const requestPath = req.originalUrl || req.path;
    if (requestPath.startsWith('/api')) {
      return next();
    }

    // Skip for non-GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Skip for requests with file extensions (static files)
    if (/\.\w+$/.test(requestPath)) {
      return next();
    }

    // Serve index.html for SPA routes
    const indexPath = join(__dirname, '..', '..', 'client', 'index.html');
    if (existsSync(indexPath)) {
      return res.sendFile(indexPath);
    }

    // If index.html doesn't exist (dev mode without build), continue
    next();
  }
}
