import { neon } from '@netlify/neon';

export default async (req) => {
    if (req.method !== "POST") {
        return new Response("Method Not Allowed", { status: 405 });
    }

    const body = await req.json();
    const content = body.content;
    const type = body.type || 'text';

    if (!content) {
        return new Response("Content is required", { status: 400 });
    }

    const sql = neon();

    // Insert message into database
    await sql`INSERT INTO messages (content, type) VALUES (${content}, ${type})`;

    return new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json" }
    });
};
