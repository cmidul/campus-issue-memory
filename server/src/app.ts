import { Router, type Express, type Request, type Response } from 'express';
import express from 'express';

/**
 * Creates the Express application.
 *
 * Keeping app construction separate from `index.ts` lets tests mount the app
 * with supertest without opening a real network port.
 *
 * Security baseline (rate limiting, headers, auth) is added in Milestone 2
 * together with the database layer — see docs/ROADMAP.md.
 */
export function createApp(): Express {
  const app = express();

  app.disable('x-powered-by');
  app.use(express.json({ limit: '100kb' }));

  const api = Router();

  api.get('/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'campus-issue-memory-api',
      version: '0.1.0',
    });
  });

  app.use('/api', api);

  app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: 'Not found' });
  });

  return app;
}
