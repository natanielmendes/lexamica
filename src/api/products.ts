import { Router, Request, Response } from 'express';
import { Product } from '../models/Product';
import { HTTP_STATUS, MONGO_ERROR_CODE } from '../utils/constants';
import { paginate } from '../utils/paginate';

const router = Router();

// Create Product
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, sku, quantity, customFields } = req.body;
    
    if (!name || !sku || typeof quantity !== 'number') {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: 'Missing required fields' });
    }
    
    const product = new Product({ name, sku, quantity, customFields });
    await product.save();
    res.status(201).json(product);
  } catch (err: any) {
    if (err.code === MONGO_ERROR_CODE.DUPLICATE_KEY) {
      return res.status(HTTP_STATUS.CONFLICT).json({ error: 'SKU must be unique' });
    }
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: 'Server error' });
  }
});

// Get Products (paginated)
router.get('/', paginate(Product));

// Get Product by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(HTTP_STATUS.NOT_FOUND).json({ error: 'Not found' });
    res.json(product);
  } catch (err) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: 'Server error' });
  }
});

// Update Product
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { name, sku, quantity, customFields } = req.body;
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { name, sku, quantity, customFields },
      { new: true, runValidators: true }
    );
    if (!product) return res.status(HTTP_STATUS.NOT_FOUND).json({ error: 'Not found' });
    res.json(product);
  } catch (err) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: 'Server error' });
  }
});

// Delete Product
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(HTTP_STATUS.NOT_FOUND).json({ error: 'Not found' });
    res.status(HTTP_STATUS.NO_CONTENT).send();
  } catch (err) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: 'Server error' });
  }
});

export default router;
