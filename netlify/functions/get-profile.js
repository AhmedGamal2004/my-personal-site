import { neon } from '@netlify/neon';

export default async (req) => {
    const sql = neon(process.env.DATABASE_URL);
    try {
        const settings = await sql`SELECT * FROM settings WHERE id = 1`;
        return new Response(JSON.stringify(settings[0] || {}), {
            headers: { "Content-Type": "application/json" }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
};
