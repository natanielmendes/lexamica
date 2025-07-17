import http from 'http';
import express from 'express';
import mongoose from 'mongoose';
import productRouter from './products';
import { Product } from '../models/Product';

let server: http.Server;
let app: express.Express;
let baseUrl: string;

beforeAll(async () => {
  app = express();
  app.use(express.json());
  app.use('/products', productRouter);
  await mongoose.connect('mongodb://localhost:27017/lexamica_test', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  } as any);
  server = app.listen(0);
  const address = server.address();
  if (typeof address === 'object' && address && 'port' in address) {
    baseUrl = `http://127.0.0.1:${address.port}`;
  }
});
afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.disconnect();
  server.close();
});
afterEach(async () => {
  await Product.deleteMany({});
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

describe('Products API', () => {
  describe('POST /products', () => {
    it('should create a product', async () => {
      const res = await fetchJson('/products', {
        method: 'POST',
        body: JSON.stringify({ name: 'Test', sku: 'SKU1', quantity: 10 })
      });
      expect(res.status).toBe(201);
      expect(res.body.name).toBe('Test');
      expect(res.body.sku).toBe('SKU1');
      expect(res.body.quantity).toBe(10);
    });
    it('should not create with missing fields', async () => {
      const res = await fetchJson('/products', {
        method: 'POST',
        body: JSON.stringify({ name: 'Test' })
      });
      expect(res.status).toBe(400);
    });
    it('should not allow duplicate SKU', async () => {
      await fetchJson('/products', {
        method: 'POST',
        body: JSON.stringify({ name: 'A', sku: 'DUP', quantity: 1 })
      });
      const res = await fetchJson('/products', {
        method: 'POST',
        body: JSON.stringify({ name: 'B', sku: 'DUP', quantity: 2 })
      });
      expect([409, 500]).toContain(res.status);
    });
  });

  describe('GET /products', () => {
    it('should return paginated products', async () => {
      await Product.create({ name: 'A', sku: 'A1', quantity: 1 });
      const res = await fetchJson('/products');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('GET /products/:id', () => {
    it('should return a product by id', async () => {
      const prod = await Product.create({ name: 'B', sku: 'B1', quantity: 2 });
      const res = await fetchJson(`/products/${prod._id}`);
      expect(res.status).toBe(200);
      expect(res.body.sku).toBe('B1');
    });
    it('should return 404 for non-existent id', async () => {
      const res = await fetchJson('/products/507f1f77bcf86cd799439011');
      expect(res.status).toBe(404);
    });
  });

  describe('PUT /products/:id', () => {
    it('should update a product', async () => {
      const prod = await Product.create({ name: 'C', sku: 'C1', quantity: 3 });
      const res = await fetchJson(`/products/${prod._id}`, {
        method: 'PUT',
        body: JSON.stringify({ name: 'C2', sku: 'C2', quantity: 4 })
      });
      expect(res.status).toBe(200);
      expect(res.body.name).toBe('C2');
      expect(res.body.quantity).toBe(4);
    });
    it('should return 404 for non-existent id', async () => {
      const res = await fetchJson('/products/507f1f77bcf86cd799439011', {
        method: 'PUT',
        body: JSON.stringify({ name: 'X', sku: 'X', quantity: 1 })
      });
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /products/:id', () => {
    it('should delete a product', async () => {
      const prod = await Product.create({ name: 'D', sku: 'D1', quantity: 5 });
      const res = await fetchJson(`/products/${prod._id}`, { method: 'DELETE' });
      expect(res.status).toBe(204);
    });
    it('should return 404 for non-existent id', async () => {
      const res = await fetchJson('/products/507f1f77bcf86cd799439011', { method: 'DELETE' });
      expect(res.status).toBe(404);
    });
  });
}); 