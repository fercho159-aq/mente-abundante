import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, Section } from '@/lib/db';

// GET all sections
export async function GET() {
    try {
        const sections = await query<Section & { movie_count: number; video_count: number }>(`
      SELECT 
        s.*,
        COUNT(DISTINCT sm.movie_id)::int as movie_count,
        COUNT(DISTINCT v.id)::int as video_count
      FROM sections s
      LEFT JOIN section_movies sm ON s.id = sm.section_id
      LEFT JOIN videos v ON s.id = v.section_id
      GROUP BY s.id
      ORDER BY s.order_index
    `);

        return NextResponse.json(sections);
    } catch (error) {
        console.error('Error fetching sections:', error);
        return NextResponse.json(
            { error: 'Error fetching sections' },
            { status: 500 }
        );
    }
}

// POST create a new section
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { title, description, image_url } = body;

        if (!title) {
            return NextResponse.json(
                { error: 'Title is required' },
                { status: 400 }
            );
        }

        // Get the next order index
        const lastSection = await queryOne<{ max_order: number }>(
            'SELECT COALESCE(MAX(order_index), 0) as max_order FROM sections'
        );
        const orderIndex = (lastSection?.max_order || 0) + 1;

        const result = await queryOne<Section>(
            `INSERT INTO sections (title, description, order_index, image_url)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
            [title, description || null, orderIndex, image_url || null]
        );

        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        console.error('Error creating section:', error);
        return NextResponse.json(
            { error: 'Error creating section' },
            { status: 500 }
        );
    }
}
