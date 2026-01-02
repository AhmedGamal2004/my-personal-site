import { neon } from '@netlify/neon';

export default async (req) => {
    if (req.method !== "POST") {
        return new Response("Method Not Allowed", { status: 405 });
    }

    try {
        const body = await req.json();
        const content = body.content;
        const type = body.type || 'text';

        if (!content) {
            return new Response("Content is required", { status: 400 });
        }

        const sql = neon(process.env.DATABASE_URL);
        await sql`INSERT INTO messages (content, type) VALUES (${content}, ${type})`;

        return new Response(JSON.stringify({ success: true }), {
            headers: { "Content-Type": "application/json" }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
};
