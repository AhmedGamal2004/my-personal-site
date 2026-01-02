import { neon } from '@netlify/neon';

export const handler = async (event) => {
    const sql = neon(process.env.DATABASE_URL);

    try {
        const settings = await sql`SELECT * FROM settings WHERE id = 1`;
        return {
            statusCode: 200,
            body: JSON.stringify(settings[0] || {}),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
};
