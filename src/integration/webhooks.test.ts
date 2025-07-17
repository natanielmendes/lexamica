import express from 'express';
import http from 'http';
import bodyParser from 'body-parser';
import webhookRouterFactory from './webhooks';

// Mock RedisQueue
class MockRedisQueue {
  enqueue = jest.fn();
}

let app: express.Express;
let server: http.Server;
let baseUrl: string;
let redisQueue: MockRedisQueue;

beforeAll((done) => {
  redisQueue = new MockRedisQueue();
  app = express();
  app.use(bodyParser.json());
  app.use('/webhook', webhookRouterFactory(redisQueue as any));
  server = app.listen(0, () => {
    const address = server.address();
    if (typeof address === 'object' && address && 'port' in address) {
      baseUrl = `http://127.0.0.1:${address.port}`;
    }
    done();
  });
});
afterAll((done) => {
  server.close(done);
});
afterEach(() => {
  jest.clearAllMocks();
});

async function fetchJson(path: string, options: any = {}) {
  const res = await fetch(baseUrl + path, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  let body;
  try { body = await res.json(); } catch { body = undefined; }
  return { status: res.status, body };
}

describe('Webhook routes', () => {
  describe('POST /webhook/product-created', () => {
    it('should dispatch product.created event', async () => {
      const payload = { foo: 'bar' };
      const res = await fetchJson('/webhook/product-created', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      expect(res.status).toBe(200);
      expect(res.body.status).toMatch(/product\.created/);
      expect(redisQueue.enqueue).toHaveBeenCalledWith(
        'product_created_events',
        expect.stringContaining('product.created')
      );
    });
    it('should return 400 if missing payload', async () => {
      const res = await fetchJson('/webhook/product-created', {
        method: 'POST',
        body: ''
      });
      expect(res.status).toBe(400);
    });
    it('should return 500 if handler throws', async () => {
      redisQueue.enqueue.mockImplementationOnce(() => { throw new Error('fail'); });
      const res = await fetchJson('/webhook/product-created', {
        method: 'POST',
        body: JSON.stringify({ foo: 'bar' })
      });
      expect(res.status).toBe(500);
    });
  });

  describe('POST /webhook/product-paid', () => {
    it('should dispatch product.paid event', async () => {
      const payload = { foo: 'baz' };
      const res = await fetchJson('/webhook/product-paid', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      expect(res.status).toBe(200);
      expect(res.body.status).toMatch(/product\.paid/);
      expect(redisQueue.enqueue).toHaveBeenCalledWith(
        'product_paid_events',
        expect.stringContaining('product.paid')
      );
    });
    it('should return 400 if missing payload', async () => {
      const res = await fetchJson('/webhook/product-paid', {
        method: 'POST',
        body: ''
      });
      expect(res.status).toBe(400);
    });
    it('should return 500 if handler throws', async () => {
      redisQueue.enqueue.mockImplementationOnce(() => { throw new Error('fail'); });
      const res = await fetchJson('/webhook/product-paid', {
        method: 'POST',
        body: JSON.stringify({ foo: 'baz' })
      });
      expect(res.status).toBe(500);
    });
  });
}); 