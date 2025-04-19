import pool from '../config/db';

export interface Product {
  id: number;
  name: string;
  category?: string;
  price: number;
  created_at: Date;
}

export async function getAllProducts(): Promise<Product[]> {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM products ORDER BY name');
    return result.rows;
  } finally {
    client.release();
  }
}

export async function getProductById(id: number): Promise<Product | null> {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM products WHERE id = $1', [id]);
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM products WHERE category = $1', [category]);
    return result.rows;
  } finally {
    client.release();
  }
} 