#!/usr/bin/env ts-node
import express, { Request, Response } from 'express';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

const app = express();
app.use(express.json());

interface Product {
  id: string;
  name: string;
  paid: boolean;
  sku: string;
}
const products: Product[] = [
  { id: '1', name: 'Sample Product 1', paid: true, sku: 'SKU12345' },
  { id: '2', name: 'Sample Product 2', paid: false, sku: 'SKU12346' },
  { id: '3', name: 'Sample Product 3', paid: true, sku: 'SKU12347' },
];

// Create Product
app.post('/product', async (req: Request, res: Response) => {
  const { name, sku, quantity, paid } = req.body;
  if (!name || !sku || typeof quantity !== 'number') {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  // Check for duplicate SKU
  if (products.some((p: Product) => p.sku === sku)) {
    return res.status(409).json({ error: 'SKU must be unique' });
  }
  const id = uuidv4();
  const product: Product = { id, name, sku, paid: !!paid };
  products.push(product);
  res.status(201).json(product);
});

// Get Product by ID
app.get('/product/:id', (req: Request, res: Response) => {
  const product = products.find(p => p.id === req.params.id);
  if (!product) return res.status(404).json({ error: 'Not found' });
  res.json(product);
});

// List all Products
app.get('/product', (req: Request, res: Response) => {
  res.json(products);
});

// Track SKUs that have already been sent via /paid-products
const sentPaidSkus = new Set<string>();

// List only paid products
app.get('/paid-products', (req: Request, res: Response) => {
  // Only return paid products whose SKU has not been sent yet
  const newPaidProducts = products.filter(
    p => p.paid && !sentPaidSkus.has(p.sku)
  );
  // Mark these SKUs as sent
  newPaidProducts.forEach(p => sentPaidSkus.add(p.sku));
  res.json(newPaidProducts);
});

const PORT = Number(process.env.MOCK_PORT) || 4000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Mock third-party system running on port ${PORT}`);
});
