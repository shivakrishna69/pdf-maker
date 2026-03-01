import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config();

async function setup() {
    if (!process.env.DATABASE_URL) {
        console.error('DATABASE_URL is not set in .env');
        process.exit(1);
    }

    const sql = neon(process.env.DATABASE_URL);

    console.log('Creating reports table...');
    await sql`
        CREATE TABLE IF NOT EXISTS reports (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            slug TEXT UNIQUE NOT NULL,
            report_title TEXT,
            content JSONB NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_reports_slug ON reports(slug);`;

    console.log('Database setup complete!');
}

setup().catch(console.error);
