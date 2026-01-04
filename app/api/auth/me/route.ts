import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get('session_token')?.value;

        if (!token) {
            return NextResponse.json({ user: null });
        }

        const user = await getUserFromToken(token);

        return NextResponse.json({ user });
    } catch (error) {
        console.error('Me API error:', error);
        return NextResponse.json({ user: null });
    }
}
