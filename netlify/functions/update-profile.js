import { neon } from '@netlify/neon';

export default async (req) => {
    if (req.method !== "POST") {
        return new Response("Method Not Allowed", { status: 405 });
    }

    try {
        const sql = neon(process.env.DATABASE_URL);
        const body = await req.json();
        const { name, bio, avatar, cover } = body;

        await sql`
            UPDATE settings 
            SET 
                name = COALESCE(${name || null}, name),
                bio = COALESCE(${bio || null}, bio),
                avatar = COALESCE(${avatar || null}, avatar),
                cover = COALESCE(${cover || null}, cover)
            WHERE id = 1
        `;

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
