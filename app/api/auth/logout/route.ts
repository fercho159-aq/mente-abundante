import { NextRequest, NextResponse } from 'next/server';
import { logoutUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        const token = request.cookies.get('session_token')?.value;

        if (token) {
            await logoutUser(token);
        }

        const response = NextResponse.json({ message: 'Sesión cerrada' });

        // Clear cookie
        response.cookies.set('session_token', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 0,
            path: '/',
        });

        return response;
    } catch (error) {
        console.error('Logout API error:', error);
        return NextResponse.json(
            { error: 'Error al cerrar sesión' },
            { status: 500 }
        );
    }
}
