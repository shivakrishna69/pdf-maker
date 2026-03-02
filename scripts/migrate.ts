import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });
dotenv.config({ path: join(__dirname, '../.env.local') });

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not defined');
}

const sql = neon(process.env.DATABASE_URL);

async function migrate() {
    console.log('Running migration: ADD COLUMN user_id TO reports...');
    try {
        await sql`ALTER TABLE reports ADD COLUMN IF NOT EXISTS user_id TEXT;`;
        console.log('Migration successful: user_id column added.');
    } catch (error) {
        console.error('Migration failed:', error);
    }
}

migrate();
