import { parse } from 'csv-parse';
import fs from 'fs';
import path from 'path';
import pool, { createTables } from '../config/db';

interface SalesRecord {
  item: string;
  quantity_sold: number;
  total_sales: number;
}

export async function loadSalesCSV(filePath: string): Promise<void> {
  try {
    // Ensure tables exist
    await createTables();
    
    const absolutePath = path.resolve(process.cwd(), filePath);
    console.log('Loading file:', absolutePath);
    
    const parser = fs
      .createReadStream(absolutePath)
      .pipe(parse({ 
        columns: true, 
        skip_empty_lines: true,
        trim: true,
        quote: '"'
      }));

    const client = await pool.connect();
    let recordCount = 0;
    
    try {
      await client.query('BEGIN');
      
      for await (const record of parser) {
        console.log('Processing record:', record);
        
        // Skip records with $0.00 total sales
        if (record['Total Sales'] === '$0.00') {
          console.log('Skipping $0 sale record:', record.Item);
          continue;
        }

        const salesRecord: SalesRecord = {
          item: record.Item.replace(/^"|"$/g, ''),  // Remove quotes if present
          quantity_sold: parseInt(record['Quantity Sold']),
          total_sales: parseFloat(record['Total Sales'].replace(/[$,]/g, ''))
        };

        console.log('Parsed record:', salesRecord);

        // Calculate price per item
        const price = salesRecord.total_sales / salesRecord.quantity_sold;

        // Insert or update product
        const productResult = await client.query(
          'INSERT INTO products (name, price) VALUES ($1, $2) ON CONFLICT (name) DO UPDATE SET price = $2 RETURNING id',
          [salesRecord.item, price]
        );

        const productId = productResult.rows[0].id;

        // Insert sales record
        await client.query(
          'INSERT INTO sales (date, product_id, quantity, price, total_amount) VALUES (CURRENT_DATE, $1, $2, $3, $4)',
          [
            productId,
            salesRecord.quantity_sold,
            price,
            salesRecord.total_sales
          ]
        );

        recordCount++;
      }

      await client.query('COMMIT');
      console.log(`✅ CSV data loaded successfully. Processed ${recordCount} records.`);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('❌ Error loading CSV:', error);
    throw error;
  }
} 