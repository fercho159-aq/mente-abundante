const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

const VIDEO = {
    title: 'Introducción - Bolitas 1',
    description: 'Video introductorio de la primera lección',
    video_type: 'youtube',
    video_url: 'https://youtube.com/watch?v=qDXqOCMb9tg',
    section_id: 1,
    order_index: 1
};

async function main() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        await client.connect();
        console.log('✅ Conectado a la base de datos');

        // Verificar si ya existe
        const existing = await client.query(
            'SELECT id FROM videos WHERE video_url = $1 AND section_id = $2',
            [VIDEO.video_url, VIDEO.section_id]
        );

        if (existing.rows.length > 0) {
            console.log('⚠️ El video ya existe');
            return;
        }

        // Insertar el video
        const result = await client.query(
            `INSERT INTO videos (title, description, video_type, video_url, section_id, movie_id, order_index)
             VALUES ($1, $2, $3, $4, $5, NULL, $6)
             RETURNING id`,
            [VIDEO.title, VIDEO.description, VIDEO.video_type, VIDEO.video_url, VIDEO.section_id, VIDEO.order_index]
        );

        console.log(`✅ Video agregado con ID: ${result.rows[0].id}`);

    } catch (err) {
        console.error('❌ Error:', err);
    } finally {
        await client.end();
    }
}

main();
