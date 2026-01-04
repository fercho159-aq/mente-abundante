'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { User } from '@/lib/auth';
import styles from './AppNavbar.module.css';

interface AppNavbarProps {
    user: User;
}

export default function AppNavbar({ user }: AppNavbarProps) {
    const router = useRouter();
    const pathname = usePathname();
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            router.push('/');
            router.refresh();
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const isActive = (path: string) => {
        if (path === '/app') {
            return pathname === '/app';
        }
        return pathname.startsWith(path);
    };

    return (
        <>
            {/* Top Navbar - Desktop & Mobile */}
            <header className={styles.navbar}>
                <div className={styles.container}>
                    {/* Logo */}
                    <Link href="/app" className={styles.logo}>
                        <Image
                            src="/logo.png"
                            alt="Mente Abundante"
                            width={36}
                            height={36}
                            className={styles.logoImage}
                        />
                        <span className={styles.logoText}>Mente Abundante</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className={styles.desktopNav}>
                        <Link href="/app" className={`${styles.navLink} ${isActive('/app') ? styles.active : ''}`}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                <polyline points="9 22 9 12 15 12 15 22" />
                            </svg>
                            Inicio
                        </Link>
                        <Link href="/app/secciones" className={`${styles.navLink} ${isActive('/app/secciones') ? styles.active : ''}`}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                            </svg>
                            Secciones
                        </Link>
                        <Link href="/app/peliculas" className={`${styles.navLink} ${isActive('/app/peliculas') ? styles.active : ''}`}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
                                <line x1="7" y1="2" x2="7" y2="22" />
                                <line x1="17" y1="2" x2="17" y2="22" />
                                <line x1="2" y1="12" x2="22" y2="12" />
                            </svg>
                            Películas
                        </Link>
                    </nav>

                    {/* User Menu */}
                    <div className={styles.userSection}>
                        <button
                            className={styles.userButton}
                            onClick={() => setUserMenuOpen(!userMenuOpen)}
                        >
                            <div className={styles.avatar}>
                                {user.avatar_url ? (
                                    <img src={user.avatar_url} alt={user.name} />
                                ) : (
                                    <span>{user.name.charAt(0).toUpperCase()}</span>
                                )}
                            </div>
                            <span className={styles.userName}>{user.name.split(' ')[0]}</span>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="6 9 12 15 18 9" />
                            </svg>
                        </button>

                        {userMenuOpen && (
                            <div className={styles.userMenu}>
                                <div className={styles.userMenuHeader}>
                                    <span className={styles.userMenuName}>{user.name}</span>
                                    <span className={styles.userMenuEmail}>{user.email}</span>
                                </div>
                                <div className={styles.userMenuDivider}></div>
                                {user.role === 'admin' && (
                                    <Link href="/admin" className={styles.userMenuItem} onClick={() => setUserMenuOpen(false)}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <circle cx="12" cy="12" r="3" />
                                            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                                        </svg>
                                        Panel Admin
                                    </Link>
                                )}
                                <button onClick={handleLogout} className={styles.userMenuItem}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                        <polyline points="16 17 21 12 16 7" />
                                        <line x1="21" y1="12" x2="9" y2="12" />
                                    </svg>
                                    Cerrar Sesión
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Bottom Tab Bar - Mobile Only */}
            <nav className={styles.bottomNav}>
                <Link href="/app" className={`${styles.tabItem} ${isActive('/app') ? styles.tabActive : ''}`}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                        <polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                    <span>Inicio</span>
                </Link>
                <Link href="/app/secciones" className={`${styles.tabItem} ${isActive('/app/secciones') ? styles.tabActive : ''}`}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                    </svg>
                    <span>Lecciones</span>
                </Link>
                <Link href="/app/peliculas" className={`${styles.tabItem} ${isActive('/app/peliculas') ? styles.tabActive : ''}`}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
                        <line x1="7" y1="2" x2="7" y2="22" />
                        <line x1="17" y1="2" x2="17" y2="22" />
                        <line x1="2" y1="12" x2="22" y2="12" />
                    </svg>
                    <span>Películas</span>
                </Link>
                <Link href="/app/perfil" className={`${styles.tabItem} ${isActive('/app/perfil') ? styles.tabActive : ''}`}>
                    <div className={styles.tabAvatar}>
                        {user.avatar_url ? (
                            <img src={user.avatar_url} alt={user.name} />
                        ) : (
                            <span>{user.name.charAt(0).toUpperCase()}</span>
                        )}
                    </div>
                    <span>Perfil</span>
                </Link>
            </nav>
        </>
    );
}
