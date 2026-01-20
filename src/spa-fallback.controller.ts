import { Controller, Get, Res, Req, NotFoundException } from '@nestjs/common';
import { Response, Request } from 'express';
import { join } from 'path';

/**
 * SpaFallbackController handles the SPA fallback for non-API routes.
 * It serves index.html for all routes that don't match an API endpoint.
 *
 * IMPORTANT: This controller is registered under '/api' prefix but with
 * a wildcard route that catches unknown API paths. The actual SPA fallback
 * for non-API routes is handled by a separate method.
 */
@Controller()
export class SpaFallbackController {
  /**
   * Serves index.html for all non-API routes (SPA fallback).
   * This route has lower priority because it's a catch-all.
   */
  @Get('*path')
  serveIndex(@Req() req: Request, @Res() res: Response) {
    // For API routes, let NestJS return its standard 404
    if (req.path.startsWith('/api')) {
      throw new NotFoundException();
    }

    // Serve index.html for all other routes (SPA fallback)
    res.sendFile(join(__dirname, '..', 'client', 'index.html'));
  }
}
