import fs from 'fs';
import path from 'path';
import pool from '../src/infrastructure/database/postgres';

async function runMigration() {
    const migrationFile = path.join(__dirname, '../migrations/006_extend_suppliers_module.sql');

    try {
        console.log(`Reading migration file: ${migrationFile}`);
        const sql = fs.readFileSync(migrationFile, 'utf8');

        console.log('Executing migration...');
        await pool.query(sql);

        console.log('Migration executed successfully!');
    } catch (error) {
        console.error('Error executing migration:', error);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

runMigration();
