import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from './_db';
import { getAuth } from '@clerk/nextjs/server'; // Note: Using clerk/backend is better for plain node but vercel handles this well.

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const { method } = req;

    // In a real Vercel app with Clerk, we verify the JWT.
    // For now, we'll expect the userId to be passed in the headers or body,
    // but ideally we'd use Clerk's middleware to verify.
    // Since this is a custom API folder, we'll use a secret or Clerk's backend SDK.

    try {
        const userId = req.headers['x-user-id'] as string;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized: User ID missing' });
        }

        if (method === 'GET') {
            // List all reports for this user
            const result = await sql`
                SELECT id, slug, report_title as "reportTitle", status, updated_at as "updatedAt", content
                FROM reports 
                WHERE user_id = ${userId}
                ORDER BY updated_at DESC
            `;

            // Map content back to our Report type
            const history = result.map(r => ({
                ...r.content,
                id: r.id,
                reportTitle: r.reportTitle,
                status: r.status,
                updatedAt: r.updatedAt
            }));

            return res.status(200).json(history);
        }

        if (method === 'POST') {
            const report = req.body;
            const { id, reportTitle, status, updatedAt } = report;

            // Upsert report for this user
            await sql`
                INSERT INTO reports (id, user_id, report_title, status, content, updated_at)
                VALUES (${id}, ${userId}, ${reportTitle}, ${status}, ${report}, ${updatedAt})
                ON CONFLICT (id) DO UPDATE SET
                    report_title = EXCLUDED.report_title,
                    status = EXCLUDED.status,
                    content = EXCLUDED.content,
                    updated_at = EXCLUDED.updated_at
                WHERE reports.user_id = ${userId}
            `;

            return res.status(200).json({ success: true });
        }

        if (method === 'DELETE') {
            const { id } = req.query;
            if (!id) return res.status(400).json({ error: 'Report ID required' });

            await sql`
                DELETE FROM reports 
                WHERE id = ${id} AND user_id = ${userId}
            `;

            return res.status(200).json({ success: true });
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error: any) {
        console.error('API Error:', error);
        return res.status(500).json({ error: error.message });
    }
}
