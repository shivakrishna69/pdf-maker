import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from './_db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        console.log('Running migration: ADD COLUMN user_id TO reports...');
        await sql`ALTER TABLE reports ADD COLUMN IF NOT EXISTS user_id TEXT;`;
        return res.status(200).json({ success: true, message: 'Migration successful: user_id column added.' });
    } catch (error: any) {
        console.error('Migration failed:', error);
        return res.status(500).json({ error: error.message });
    }
}
