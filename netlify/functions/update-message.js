import { neon } from '@netlify/neon';

export default async (req) => {
    if (req.method !== "POST") {
        return new Response("Method Not Allowed", { status: 405 });
    }

    try {
        const body = await req.json();
        const { id, content, title, artist } = body;

        if (!id) {
            return new Response("ID is required", { status: 400 });
        }

        const sql = neon(process.env.DATABASE_URL);

        if (content && title !== undefined && artist !== undefined) {
            // Updating audio metadata + content (rare but possible)
            await sql`UPDATE messages SET content = ${content}, title = ${title}, artist = ${artist} WHERE id = ${id}`;
        } else if (title !== undefined || artist !== undefined) {
            // Updating just metadata
            await sql`UPDATE messages SET title = ${title}, artist = ${artist} WHERE id = ${id}`;
        } else if (content) {
            // Standard text message update
            await sql`UPDATE messages SET content = ${content} WHERE id = ${id}`;
        }

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
