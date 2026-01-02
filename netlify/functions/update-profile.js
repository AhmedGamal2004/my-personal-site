import { neon } from '@netlify/neon';

export const handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const sql = neon(process.env.DATABASE_URL);
    const { name, bio, avatar, cover } = JSON.parse(event.body);

    try {
        await sql`
      UPDATE settings 
      SET 
        name = COALESCE(${name}, name),
        bio = COALESCE(${bio}, bio),
        avatar = COALESCE(${avatar}, avatar),
        cover = COALESCE(${cover}, cover)
      WHERE id = 1
    `;

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Profile updated successfully' }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
};
