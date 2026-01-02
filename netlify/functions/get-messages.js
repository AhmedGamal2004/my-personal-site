import { neon } from '@netlify/neon';

export default async (req) => {
    try {
        const sql = neon(process.env.DATABASE_URL);
        const messages = await sql`SELECT * FROM messages ORDER BY created_at DESC`;

        return new Response(JSON.stringify(messages), {
            headers: { "Content-Type": "application/json" }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
};
