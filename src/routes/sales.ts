import express from 'express';
import { getAllSales, getSalesByDateRange, getSalesByProduct } from '../models/Sale';

const router = express.Router();

// GET /api/sales
router.get('/', async (req, res) => {
  try {
    const sales = await getAllSales();
    res.json(sales);
  } catch (error) {
    console.error('Error fetching sales:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/sales/range?start=YYYY-MM-DD&end=YYYY-MM-DD
router.get('/range', async (req, res) => {
  try {
    const { start, end } = req.query;
    if (!start || !end) {
      return res.status(400).json({ error: 'Start and end dates are required' });
    }
    const sales = await getSalesByDateRange(start.toString(), end.toString());
    res.json(sales);
  } catch (error) {
    console.error('Error fetching sales by date range:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/sales/product/:productId
router.get('/product/:productId', async (req, res) => {
  try {
    const sales = await getSalesByProduct(parseInt(req.params.productId));
    res.json(sales);
  } catch (error) {
    console.error('Error fetching sales by product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 