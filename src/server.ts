import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { createTables } from './config/db';
import productRoutes from './routes/products';
import salesRoutes from './routes/sales';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/products', productRoutes);
app.use('/api/sales', salesRoutes);

// Base route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Sauce Bros API' });
});

// Start server
async function startServer() {
  try {
    // Create tables if they don't exist
    await createTables();
    console.log('✅ Database tables created successfully');
    
    app.listen(port, () => {
      console.log(`🚀 Server running on http://localhost:${port}`);
      console.log('Available endpoints:');
      console.log('  GET  /api/products');
      console.log('  GET  /api/products/:id');
      console.log('  GET  /api/products/category/:category');
      console.log('  GET  /api/sales');
      console.log('  GET  /api/sales/range?start=YYYY-MM-DD&end=YYYY-MM-DD');
      console.log('  GET  /api/sales/product/:productId');
    });
  } catch (error) {
    console.error('❌ Error starting server:', error);
    process.exit(1);
  }
}

startServer(); 