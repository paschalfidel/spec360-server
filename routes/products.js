// server/routes/products.js
import express from 'express';
import upload from '../middleware/upload.js';
import Product from '../models/Product.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// GET all products — with optional ?category= and ?q= search
router.get('/', async (req, res) => {
  try {
    const { category, q, limit, sort } = req.query;
    const query = {};

    if (category) query.category = category;
    if (q) query.$or = [
      { name: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } },
    ];

    let dbQuery = Product.find(query);

    // Sorting
    if (sort === 'price_asc')  dbQuery = dbQuery.sort({ price: 1 });
    if (sort === 'price_desc') dbQuery = dbQuery.sort({ price: -1 });
    if (sort === 'newest')     dbQuery = dbQuery.sort({ createdAt: -1 });

    if (limit) dbQuery = dbQuery.limit(parseInt(limit));

    const products = await dbQuery.lean();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET products by category
router.get('/category/:category', async (req, res) => {
  try {
    const products = await Product.find({ category: req.params.category }).lean();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).lean();
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create product (protected, multipart image upload)
router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const imageUrl = req.file ? req.file.path : '';
    const product = new Product({
      name: req.body.name,
      category: req.body.category,
      price: Number(req.body.price),
      description: req.body.description,
      stock: Number(req.body.stock) || 10,
      imageUrl,
    });
    const saved = await product.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PATCH update product stock/price (protected)
router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ message: 'Product not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE product (protected)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST seed 5 sample products (protected — run once, then remove)
// Call: POST /api/products/seed  (with auth header)
router.post('/seed', authMiddleware, async (req, res) => {
  try {
    const existing = await Product.countDocuments();
    if (existing > 0) return res.status(400).json({ message: `Already have ${existing} products. Delete them first.` });

    const samples = [
      {
        name: 'iPhone 14 Clear Case', category: 'accessory', price: 8500,
        description: 'Crystal-clear slim case. MIL-grade drop protection, wireless charging compatible.',
        stock: 24, imageUrl: '',
      },
      {
        name: 'Samsung A54 Screen Replacement', category: 'part', price: 18000,
        description: 'OEM-grade AMOLED replacement screen. Includes tools & adhesive. Same-day fitting available in store.',
        stock: 8, imageUrl: '',
      },
      {
        name: '20W Fast Charger + Cable', category: 'accessory', price: 4500,
        description: 'Universal USB-C fast charger. Compatible with iPhone 15, Samsung Galaxy series, and more.',
        stock: 50, imageUrl: '',
      },
      {
        name: 'OEM Battery Replacement', category: 'part', price: 15000,
        description: 'Genuine OEM battery. 90-day warranty included. Walk in, walk out same day.',
        stock: 3, imageUrl: '',
      },
      {
        name: 'Tempered Glass Screen Guard', category: 'accessory', price: 3000,
        description: '9H hardness, anti-fingerprint coating. Available for all iPhone & Samsung models.',
        stock: 100, imageUrl: '',
      },
      {
        name: 'iPhone 13/14 Charging Port', category: 'part', price: 6500,
        description: 'OEM lightning/USB-C charging port flex cable. Fixes no-charge and loose port issues.',
        stock: 12, imageUrl: '',
      },
    ];

    const inserted = await Product.insertMany(samples);
    res.status(201).json({ message: `${inserted.length} sample products added.`, products: inserted });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
