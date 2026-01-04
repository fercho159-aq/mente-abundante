const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

const sql = `
-- Secciones/Unidades del curso
CREATE TABLE IF NOT EXISTS sections (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Películas recomendadas
CREATE TABLE IF NOT EXISTS movies (
    id SERIAL PRIMARY KEY,
    tmdb_id INTEGER UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    original_title VARCHAR(255),
    overview TEXT,
    poster_path TEXT,
    backdrop_path TEXT,
    release_date DATE,
    vote_average DECIMAL(3,1),
    runtime INTEGER,
    genres JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Relación sección-película
CREATE TABLE IF NOT EXISTS section_movies (
    id SERIAL PRIMARY KEY,
    section_id INTEGER REFERENCES sections(id) ON DELETE CASCADE,
    movie_id INTEGER REFERENCES movies(id) ON DELETE CASCADE,
    order_index INTEGER NOT NULL,
    instructor_notes TEXT,
    UNIQUE(section_id, movie_id)
);

-- Videos del instructor
CREATE TABLE IF NOT EXISTS videos (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    video_type VARCHAR(50) NOT NULL, -- 'youtube', 'vimeo', 'uploaded'
    video_url TEXT NOT NULL,
    thumbnail_url TEXT,
    duration INTEGER, -- en segundos
    section_id INTEGER REFERENCES sections(id) ON DELETE CASCADE,
    movie_id INTEGER REFERENCES movies(id) ON DELETE SET NULL,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Proveedores de streaming por película
CREATE TABLE IF NOT EXISTS movie_streaming (
    id SERIAL PRIMARY KEY,
    movie_id INTEGER REFERENCES movies(id) ON DELETE CASCADE,
    provider_name VARCHAR(100) NOT NULL,
    provider_logo TEXT,
    link_type VARCHAR(50), -- 'stream', 'rent', 'buy'
    country_code VARCHAR(5) DEFAULT 'MX',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(movie_id, provider_name, link_type)
);
`;

async function main() {
  try {
    await client.connect();
    console.log('Connected to database');
    await client.query(sql);
    console.log('Database initialized successfully');
  } catch (err) {
    console.error('Error initializing database', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
