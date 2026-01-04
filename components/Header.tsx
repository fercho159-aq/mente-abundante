'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './Header.module.css';

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <header className={styles.header}>
            <div className={styles.container}>
                <Link href="/" className={styles.logo}>
                    <Image
                        src="/logo.png"
                        alt="Mente Abundante"
                        width={40}
                        height={40}
                        className={styles.logoImage}
                    />
                    <span className={styles.logoText}>Mente Abundante</span>
                </Link>

                <nav className={`${styles.nav} ${isMenuOpen ? styles.navOpen : ''}`}>
                    <Link href="/curso" className={styles.navLink}>
                        El Curso
                    </Link>
                    <Link href="/curso" className={styles.navLink}>
                        Secciones
                    </Link>
                    <Link href="#about" className={styles.navLink}>
                        Sobre Nosotros
                    </Link>
                </nav>

                <div className={styles.actions}>
                    <Link href="/admin" className={styles.adminLink}>
                        Panel Admin
                    </Link>
                    <button
                        className={styles.menuButton}
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        <span className={`${styles.menuIcon} ${isMenuOpen ? styles.menuIconOpen : ''}`}></span>
                    </button>
                </div>
            </div>
        </header>
    );
}
