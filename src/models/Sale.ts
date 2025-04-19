import pool from '../config/db';

export interface Sale {
  id: number;
  date: Date;
  time?: string;
  product_id: number;
  quantity: number;
  price: number;
  total_amount: number;
  created_at: Date;
}

export interface SaleWithProduct extends Sale {
  product_name: string;
}

export async function getAllSales(): Promise<SaleWithProduct[]> {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT s.*, p.name as product_name 
      FROM sales s 
      JOIN products p ON s.product_id = p.id 
      ORDER BY s.date DESC, s.id DESC
    `);
    return result.rows;
  } finally {
    client.release();
  }
}

export async function getSalesByDateRange(startDate: string, endDate: string): Promise<SaleWithProduct[]> {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT s.*, p.name as product_name 
      FROM sales s 
      JOIN products p ON s.product_id = p.id 
      WHERE s.date BETWEEN $1 AND $2 
      ORDER BY s.date DESC, s.id DESC
    `, [startDate, endDate]);
    return result.rows;
  } finally {
    client.release();
  }
}

export async function getSalesByProduct(productId: number): Promise<Sale[]> {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM sales WHERE product_id = $1', [productId]);
    return result.rows;
  } finally {
    client.release();
  }
} 