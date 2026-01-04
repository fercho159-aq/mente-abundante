import { Pool } from 'pg';

// Singleton pattern for database connection
let pool: Pool | null = null;

export function getPool(): Pool {
    if (!pool) {
        pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: {
                rejectUnauthorized: false
            }
        });
    }
    return pool;
}

export async function query<T = any>(text: string, params?: any[]): Promise<T[]> {
    const pool = getPool();
    const result = await pool.query(text, params);
    return result.rows as T[];
}

export async function queryOne<T = any>(text: string, params?: any[]): Promise<T | null> {
    const rows = await query<T>(text, params);
    return rows[0] || null;
}

// Types for database models
export interface Section {
    id: number;
    title: string;
    description: string | null;
    order_index: number;
    image_url: string | null;
    created_at: Date;
    updated_at: Date;
}

export interface Movie {
    id: number;
    tmdb_id: number;
    title: string;
    original_title: string | null;
    overview: string | null;
    poster_path: string | null;
    backdrop_path: string | null;
    release_date: Date | null;
    vote_average: number | null;
    runtime: number | null;
    genres: { id: number; name: string }[] | null;
    created_at: Date;
}

export interface SectionMovie {
    id: number;
    section_id: number;
    movie_id: number;
    order_index: number;
    instructor_notes: string | null;
}

export interface Video {
    id: number;
    title: string;
    description: string | null;
    video_type: 'youtube' | 'vimeo' | 'uploaded';
    video_url: string;
    thumbnail_url: string | null;
    duration: number | null;
    section_id: number;
    movie_id: number | null;
    order_index: number;
    created_at: Date;
}

export interface MovieStreaming {
    id: number;
    movie_id: number;
    provider_name: string;
    provider_logo: string | null;
    link_type: 'stream' | 'rent' | 'buy';
    country_code: string;
    updated_at: Date;
}
