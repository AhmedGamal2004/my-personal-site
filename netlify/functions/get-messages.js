import { neon } from '@netlify/neon';

export default async (req) => {
    const sql = neon();

    // Get all messages ordered by newest first
    const messages = await sql`SELECT * FROM messages ORDER BY created_at DESC`;

    return new Response(JSON.stringify(messages), {
        headers: { "Content-Type": "application/json" }
    });
};
