import { Router, Request, Response } from 'express';

export const healthCheckRouter = Router();

healthCheckRouter.get('/', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
