import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, Video } from '@/lib/db';

// GET all videos
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const sectionId = searchParams.get('section_id');
        const movieId = searchParams.get('movie_id');

        let videos;

        if (sectionId && movieId) {
            // Get videos for a specific movie in a section
            videos = await query<Video>(
                'SELECT * FROM videos WHERE section_id = $1 AND movie_id = $2 ORDER BY order_index',
                [parseInt(sectionId), parseInt(movieId)]
            );
        } else if (sectionId) {
            // Get all videos for a section (excluding movie-specific ones)
            videos = await query<Video>(
                'SELECT * FROM videos WHERE section_id = $1 AND movie_id IS NULL ORDER BY order_index',
                [parseInt(sectionId)]
            );
        } else if (movieId) {
            // Get videos for a specific movie
            videos = await query<Video>(
                'SELECT * FROM videos WHERE movie_id = $1 ORDER BY order_index',
                [parseInt(movieId)]
            );
        } else {
            // Get all videos
            videos = await query<Video>('SELECT * FROM videos ORDER BY section_id, order_index');
        }

        return NextResponse.json(videos);
    } catch (error) {
        console.error('Error fetching videos:', error);
        return NextResponse.json(
            { error: 'Error fetching videos' },
            { status: 500 }
        );
    }
}

// POST create a new video
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { title, description, video_type, video_url, thumbnail_url, duration, section_id, movie_id } = body;

        if (!title || !video_type || !video_url || !section_id) {
            return NextResponse.json(
                { error: 'Title, video_type, video_url, and section_id are required' },
                { status: 400 }
            );
        }

        // Validate video_type
        if (!['youtube', 'vimeo', 'uploaded'].includes(video_type)) {
            return NextResponse.json(
                { error: 'video_type must be youtube, vimeo, or uploaded' },
                { status: 400 }
            );
        }

        // Get the next order index
        const lastVideo = await queryOne<{ max_order: number }>(
            movie_id
                ? 'SELECT COALESCE(MAX(order_index), 0) as max_order FROM videos WHERE section_id = $1 AND movie_id = $2'
                : 'SELECT COALESCE(MAX(order_index), 0) as max_order FROM videos WHERE section_id = $1 AND movie_id IS NULL',
            movie_id ? [section_id, movie_id] : [section_id]
        );
        const orderIndex = (lastVideo?.max_order || 0) + 1;

        const result = await queryOne<Video>(
            `INSERT INTO videos (title, description, video_type, video_url, thumbnail_url, duration, section_id, movie_id, order_index)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
            [
                title,
                description || null,
                video_type,
                video_url,
                thumbnail_url || null,
                duration || null,
                section_id,
                movie_id || null,
                orderIndex,
            ]
        );

        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        console.error('Error creating video:', error);
        return NextResponse.json(
            { error: 'Error creating video' },
            { status: 500 }
        );
    }
}
