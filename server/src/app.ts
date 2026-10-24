import { Router, type Express, type Request, type Response } from 'express';
import express from 'express';
import { createAuthRouter } from './auth/routes';
import { readAuthConfig, type AuthConfig } from './auth/google';

/**
 * Creates the Express application.
 *
 * Keeping app construction separate from `index.ts` lets tests mount the app
 * with supertest without opening a real network port. Tests may inject an
 * `AuthConfig` directly instead of mutating `process.env`.
 *
 * Rate limiting and security headers arrive with Milestone 2 — see
 * docs/ROADMAP.md.
 */
export function createApp(config: AuthConfig = readAuthConfig(process.env)): Express {
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

  api.use('/auth', createAuthRouter(config));

  app.use('/api', api);

  app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: 'Not found' });
  });

  return app;
}
