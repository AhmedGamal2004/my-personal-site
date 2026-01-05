import { neon } from '@netlify/neon';

export default async (req) => {
    if (req.method !== "POST") {
        return new Response("Method Not Allowed", { status: 405 });
    }

    try {
        const body = await req.json();
        const { id, content } = body;

        if (!id || !content) {
            return new Response("ID and Content are required", { status: 400 });
        }

        const sql = neon(process.env.DATABASE_URL);
        await sql`UPDATE messages SET content = ${content} WHERE id = ${id}`;

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
