import { neon } from '@neondatabase/serverless';

async function setup() {
    const sql = neon(process.env.DATABASE_URL!);

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
