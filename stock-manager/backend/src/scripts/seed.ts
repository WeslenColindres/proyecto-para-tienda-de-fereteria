import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'stock_manager',
    password: process.env.DB_PASSWORD || 'postgres',
    port: parseInt(process.env.DB_PORT || '5432'),
});

async function seed() {
    const client = await pool.connect();
    try {
        console.log('🌱 Starting database seeding...');

        // 1. Read SQL file
        const seedSqlPath = path.join(__dirname, 'seed.sql');
        const seedSql = fs.readFileSync(seedSqlPath, 'utf-8');

        // 2. Execute SQL
        console.log('Executing SQL statements...');
        await client.query(seedSql);

        // 3. Update passwords with bcrypt hash
        console.log('Hashing passwords...');
        const salt = await bcrypt.genSalt(10);
        const adminHash = await bcrypt.hash('admin123', salt);
        const sellerHash = await bcrypt.hash('vendedor123', salt);

        await client.query('UPDATE usuarios SET password_hash = $1 WHERE username = $2', [adminHash, 'admin']);
        await client.query('UPDATE usuarios SET password_hash = $1 WHERE username = $2', [sellerHash, 'vendedor']);

        console.log('✅ Database seeded successfully!');
    } catch (error) {
        console.error('❌ Error seeding database:', error);
    } finally {
        client.release();
        await pool.end();
    }
}

seed();
