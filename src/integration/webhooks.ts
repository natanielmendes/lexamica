import { Router, Request, Response } from 'express';
import { ProductCreatedHandler, ProductPaidHandler } from './webhookHandlers/ProductHandler';
import { RedisQueue } from './RedisQueue';

export default (redisQueue: RedisQueue) => {
  const webhookRouter = Router();

  webhookRouter.post('/product-created', async (req: Request, res: Response) => {
    const payload = req.body;
    if (!payload || Object.keys(payload).length === 0) {
      return res.status(400).json({ error: 'Missing payload in request body' });
    }
    try {
      const handler = new ProductCreatedHandler(redisQueue);
      await handler.handleEvent({ type: 'product.created', payload });
      res.status(200).json({ status: 'product.created event dispatched' });
    } catch (err) {
      console.error('Error dispatching product.created event:', err);
      res.status(500).json({ error: 'Failed to dispatch product.created event' });
    }
  });

  webhookRouter.post('/product-paid', async (req: Request, res: Response) => {
    const payload = req.body;
    if (!payload || Object.keys(payload).length === 0) {
      return res.status(400).json({ error: 'Missing payload in request body' });
    }
    try {
      const handler = new ProductPaidHandler(redisQueue);
      await handler.handleEvent({ type: 'product.paid', payload });
      res.status(200).json({ status: 'product.paid event dispatched' });
    } catch (err) {
      console.error('Error dispatching product.paid event:', err);
      res.status(500).json({ error: 'Failed to dispatch product.paid event' });
    }
  });

  return webhookRouter;
};
