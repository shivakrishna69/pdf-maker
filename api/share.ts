import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from './_db';
import { nanoid } from 'nanoid';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const { method } = req;

    try {
        if (method === 'POST') {
            const { content, reportTitle } = req.body;

            // Generate slug: kebab-case title + random suffix
            const baseSlug = reportTitle
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');

            const slug = `${baseSlug || 'report'}-${nanoid(10)}`;

            const result = await sql`
        INSERT INTO reports (slug, report_title, content)
        VALUES (${slug}, ${reportTitle}, ${content})
        RETURNING slug
      `;

            return res.status(200).json({ slug: result[0].slug });
        }

        if (method === 'GET') {
            const { slug } = req.query;

            if (!slug || typeof slug !== 'string') {
                return res.status(400).json({ error: 'Slug is required' });
            }

            const result = await sql`
        SELECT content, report_title FROM reports WHERE slug = ${slug}
      `;

            if (result.length === 0) {
                return res.status(404).json({ error: 'Report not found' });
            }

            return res.status(200).json(result[0]);
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error: any) {
        console.error('SERVER FATAL ERROR:', error);
        return res.status(500).json({
            error: error.message || 'Internal server error',
            db_defined: !!process.env.DATABASE_URL,
            stack: error.stack
        });
    }
}
