import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, Section } from '@/lib/db';

interface RouteContext {
    params: Promise<{ id: string }>;
}

// GET a single section
export async function GET(request: NextRequest, context: RouteContext) {
    try {
        const { id } = await context.params;
        const sectionId = parseInt(id);

        if (isNaN(sectionId)) {
            return NextResponse.json(
                { error: 'Invalid section ID' },
                { status: 400 }
            );
        }

        const section = await queryOne<Section>(
            'SELECT * FROM sections WHERE id = $1',
            [sectionId]
        );

        if (!section) {
            return NextResponse.json(
                { error: 'Section not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(section);
    } catch (error) {
        console.error('Error fetching section:', error);
        return NextResponse.json(
            { error: 'Error fetching section' },
            { status: 500 }
        );
    }
}

// PUT update a section
export async function PUT(request: NextRequest, context: RouteContext) {
    try {
        const { id } = await context.params;
        const sectionId = parseInt(id);

        if (isNaN(sectionId)) {
            return NextResponse.json(
                { error: 'Invalid section ID' },
                { status: 400 }
            );
        }

        const body = await request.json();
        const { title, description, order_index, image_url } = body;

        // Build update query dynamically based on provided fields
        const updates: string[] = [];
        const values: any[] = [];
        let paramIndex = 1;

        if (title !== undefined) {
            updates.push(`title = $${paramIndex++}`);
            values.push(title);
        }
        if (description !== undefined) {
            updates.push(`description = $${paramIndex++}`);
            values.push(description);
        }
        if (order_index !== undefined) {
            updates.push(`order_index = $${paramIndex++}`);
            values.push(order_index);
        }
        if (image_url !== undefined) {
            updates.push(`image_url = $${paramIndex++}`);
            values.push(image_url);
        }

        if (updates.length === 0) {
            return NextResponse.json(
                { error: 'No fields to update' },
                { status: 400 }
            );
        }

        updates.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(sectionId);

        const result = await queryOne<Section>(
            `UPDATE sections SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
            values
        );

        if (!result) {
            return NextResponse.json(
                { error: 'Section not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error updating section:', error);
        return NextResponse.json(
            { error: 'Error updating section' },
            { status: 500 }
        );
    }
}

// DELETE a section
export async function DELETE(request: NextRequest, context: RouteContext) {
    try {
        const { id } = await context.params;
        const sectionId = parseInt(id);

        if (isNaN(sectionId)) {
            return NextResponse.json(
                { error: 'Invalid section ID' },
                { status: 400 }
            );
        }

        const result = await queryOne<Section>(
            'DELETE FROM sections WHERE id = $1 RETURNING *',
            [sectionId]
        );

        if (!result) {
            return NextResponse.json(
                { error: 'Section not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ message: 'Section deleted successfully' });
    } catch (error) {
        console.error('Error deleting section:', error);
        return NextResponse.json(
            { error: 'Error deleting section' },
            { status: 500 }
        );
    }
}
