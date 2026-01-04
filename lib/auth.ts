import { query, queryOne } from './db';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

// Types
export interface User {
    id: number;
    email: string;
    name: string;
    role: 'student' | 'instructor' | 'admin';
    avatar_url: string | null;
    created_at: Date;
    last_login: Date | null;
}

export interface Session {
    id: number;
    user_id: number;
    token: string;
    expires_at: Date;
}

// Generate random token
function generateToken(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < 64; i++) {
        token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
}

// Register a new user
export async function registerUser(
    email: string,
    password: string,
    name: string
): Promise<{ user: User | null; error: string | null }> {
    try {
        // Check if user exists
        const existingUser = await queryOne<User>(
            'SELECT id FROM users WHERE email = $1',
            [email.toLowerCase()]
        );

        if (existingUser) {
            return { user: null, error: 'Este correo ya está registrado' };
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 12);

        // Create user
        const user = await queryOne<User>(
            `INSERT INTO users (email, password_hash, name)
       VALUES ($1, $2, $3)
       RETURNING id, email, name, role, avatar_url, created_at, last_login`,
            [email.toLowerCase(), passwordHash, name]
        );

        return { user, error: null };
    } catch (error) {
        console.error('Register error:', error);
        return { user: null, error: 'Error al registrar usuario' };
    }
}

// Login user
export async function loginUser(
    email: string,
    password: string
): Promise<{ user: User | null; token: string | null; error: string | null }> {
    try {
        // Get user with password
        const user = await queryOne<User & { password_hash: string }>(
            'SELECT * FROM users WHERE email = $1',
            [email.toLowerCase()]
        );

        if (!user) {
            return { user: null, token: null, error: 'Credenciales incorrectas' };
        }

        // Verify password
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return { user: null, token: null, error: 'Credenciales incorrectas' };
        }

        // Create session
        const token = generateToken();
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

        await query(
            `INSERT INTO sessions (user_id, token, expires_at)
       VALUES ($1, $2, $3)`,
            [user.id, token, expiresAt]
        );

        // Update last login
        await query(
            'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
            [user.id]
        );

        // Remove password from user object
        const { password_hash, ...safeUser } = user;

        return { user: safeUser as User, token, error: null };
    } catch (error) {
        console.error('Login error:', error);
        return { user: null, token: null, error: 'Error al iniciar sesión' };
    }
}

// Get user from session token
export async function getUserFromToken(token: string): Promise<User | null> {
    try {
        const result = await queryOne<User>(
            `SELECT u.id, u.email, u.name, u.role, u.avatar_url, u.created_at, u.last_login
       FROM users u
       JOIN sessions s ON u.id = s.user_id
       WHERE s.token = $1 AND s.expires_at > NOW()`,
            [token]
        );

        return result;
    } catch (error) {
        console.error('Get user error:', error);
        return null;
    }
}

// Get current user from cookies (for server components)
export async function getCurrentUser(): Promise<User | null> {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('session_token')?.value;

        if (!token) {
            return null;
        }

        return getUserFromToken(token);
    } catch (error) {
        console.error('Get current user error:', error);
        return null;
    }
}

// Logout user
export async function logoutUser(token: string): Promise<void> {
    try {
        await query('DELETE FROM sessions WHERE token = $1', [token]);
    } catch (error) {
        console.error('Logout error:', error);
    }
}

// Delete expired sessions (cleanup)
export async function cleanupExpiredSessions(): Promise<void> {
    try {
        await query('DELETE FROM sessions WHERE expires_at < NOW()');
    } catch (error) {
        console.error('Cleanup error:', error);
    }
}
