# Sauce Bros API

Backend API for the Sauce Bros sales management system.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory with:
```ini
DB_HOST=localhost
DB_PORT=5432
DB_NAME=saucebros
DB_USER=postgres
DB_PASS=your_password
PORT=4000
```

3. Start the development server:
```bash
npm run dev:server
```

## API Endpoints

### Products

- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `GET /api/products/category/:category` - Get products by category

### Sales

- `GET /api/sales` - Get all sales
- `GET /api/sales/range?start=YYYY-MM-DD&end=YYYY-MM-DD` - Get sales by date range
- `GET /api/sales/product/:productId` - Get sales by product

## Database Schema

### Products Table
- id: SERIAL PRIMARY KEY
- name: VARCHAR(255) NOT NULL UNIQUE
- category: VARCHAR(100)
- price: DECIMAL(10,2)
- created_at: TIMESTAMP

### Sales Table
- id: SERIAL PRIMARY KEY
- date: DATE NOT NULL
- time: TIME
- product_id: INTEGER (references products.id)
- quantity: INTEGER
- price: DECIMAL(10,2)
- total_amount: DECIMAL(10,2)
- created_at: TIMESTAMP

## Tech Stack

- Node.js
- Express
- TypeScript
- PostgreSQL
- Next.js (Frontend)
