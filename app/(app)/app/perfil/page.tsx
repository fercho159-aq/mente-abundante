'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';

type Theme = 'dark' | 'light';

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    avatar_url?: string;
}

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [theme, setThemeState] = useState<Theme>('dark');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Get theme from localStorage
        const savedTheme = localStorage.getItem('theme') as Theme || 'dark';
        setThemeState(savedTheme);

        // Fetch user data
        fetch('/api/auth/me')
            .then(res => res.json())
            .then(data => {
                if (data.user) {
                    setUser(data.user);
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const handleThemeChange = (newTheme: Theme) => {
        setThemeState(newTheme);
        localStorage.setItem('theme', newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
    };

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            router.push('/');
            router.refresh();
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    if (loading) {
        return (
            <div className={styles.page}>
                <div className={styles.loading}>Cargando...</div>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <Link href="/app" className={styles.backLink}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                    Volver
                </Link>
                <h1 className={styles.title}>Mi Perfil</h1>
            </header>

            {/* User Info Card */}
            <section className={styles.card}>
                <div className={styles.userInfo}>
                    <div className={styles.avatar}>
                        {user?.avatar_url ? (
                            <img src={user.avatar_url} alt={user.name} />
                        ) : (
                            <span>{user?.name?.charAt(0).toUpperCase() || '?'}</span>
                        )}
                    </div>
                    <div className={styles.userDetails}>
                        <h2 className={styles.userName}>{user?.name}</h2>
                        <p className={styles.userEmail}>{user?.email}</p>
                        {user?.role === 'admin' && (
                            <span className={styles.badge}>Administrador</span>
                        )}
                    </div>
                </div>
            </section>

            {/* Theme Settings */}
            <section className={styles.card}>
                <h3 className={styles.cardTitle}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="5" />
                        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                    </svg>
                    Apariencia
                </h3>
                <div className={styles.themeOptions}>
                    <button
                        className={`${styles.themeOption} ${theme === 'dark' ? styles.themeActive : ''}`}
                        onClick={() => handleThemeChange('dark')}
                    >
                        <div className={styles.themePreview} data-theme="dark">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                            </svg>
                        </div>
                        <span>Oscuro</span>
                    </button>
                    <button
                        className={`${styles.themeOption} ${theme === 'light' ? styles.themeActive : ''}`}
                        onClick={() => handleThemeChange('light')}
                    >
                        <div className={styles.themePreview} data-theme="light">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="5" />
                                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                            </svg>
                        </div>
                        <span>Claro</span>
                    </button>
                </div>
            </section>

            {/* Admin Link */}
            {user?.role === 'admin' && (
                <section className={styles.card}>
                    <h3 className={styles.cardTitle}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="3" />
                            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                        </svg>
                        Administración
                    </h3>
                    <Link href="/admin" className={styles.adminLink}>
                        <span>Panel de Administración</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </Link>
                </section>
            )}

            {/* Logout */}
            <button onClick={handleLogout} className={styles.logoutButton}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Cerrar Sesión
            </button>
        </div>
    );
}
