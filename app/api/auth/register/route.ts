import { NextRequest, NextResponse } from 'next/server';
import { registerUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password, name } = body;

        // Validations
        if (!email || !password || !name) {
            return NextResponse.json(
                { error: 'Todos los campos son requeridos' },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                { error: 'La contraseña debe tener al menos 6 caracteres' },
                { status: 400 }
            );
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: 'Correo electrónico inválido' },
                { status: 400 }
            );
        }

        const { user, error } = await registerUser(email, password, name);

        if (error) {
            return NextResponse.json({ error }, { status: 400 });
        }

        return NextResponse.json({ user, message: 'Usuario registrado exitosamente' }, { status: 201 });
    } catch (error) {
        console.error('Register API error:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}
