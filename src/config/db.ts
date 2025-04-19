import { Pool } from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
});

// Function to create tables
export async function createTables() {
  const client = await pool.connect();
  try {
    // Drop existing tables if they exist
    await client.query('DROP TABLE IF EXISTS sales;');
    await client.query('DROP TABLE IF EXISTS products;');

    // Create products table
    await client.query(`
      CREATE TABLE products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        category VARCHAR(100),
        price DECIMAL(10,2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create sales table
    await client.query(`
      CREATE TABLE sales (
        id SERIAL PRIMARY KEY,
        date DATE NOT NULL,
        time TIME,
        product_id INTEGER REFERENCES products(id),
        quantity INTEGER,
        price DECIMAL(10,2),
        total_amount DECIMAL(10,2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('✅ Database tables created successfully');
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    throw error;
  } finally {
    client.release();
  }
}

export default pool; 