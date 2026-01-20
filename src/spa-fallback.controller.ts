import { Controller, Get, Res, Req, All } from '@nestjs/common';
import { Response, Request } from 'express';
import { join } from 'path';

@Controller()
export class SpaFallbackController {
  @Get('*path')
  serveIndex(@Req() req: Request, @Res() res: Response) {
    // Exclude API routes (they're handled by other controllers)
    if (req.path.startsWith('/api')) {
      res.status(404).json({ message: 'Not Found' });
      return;
    }

    // Serve index.html for all other routes (SPA fallback)
    res.sendFile(join(__dirname, '..', 'client', 'index.html'));
  }
}
