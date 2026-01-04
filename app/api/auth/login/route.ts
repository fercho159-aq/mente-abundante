import { NextRequest, NextResponse } from 'next/server';
import { loginUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Correo y contraseña son requeridos' },
                { status: 400 }
            );
        }

        const { user, token, error } = await loginUser(email, password);

        if (error) {
            return NextResponse.json({ error }, { status: 401 });
        }

        // Create response with cookie
        const response = NextResponse.json({ user, message: 'Inicio de sesión exitoso' });

        // Set session cookie
        response.cookies.set('session_token', token!, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60, // 7 days
            path: '/',
        });

        return response;
    } catch (error) {
        console.error('Login API error:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}
