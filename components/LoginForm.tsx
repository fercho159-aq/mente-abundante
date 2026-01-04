'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import styles from './LoginForm.module.css';

export default function LoginForm() {
    const router = useRouter();
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
            const body = isLogin
                ? { email: formData.email, password: formData.password }
                : formData;

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error en la solicitud');
            }

            if (isLogin) {
                router.push('/app');
                router.refresh();
            } else {
                // After register, switch to login
                setIsLogin(true);
                setFormData({ ...formData, password: '' });
                setError('');
                alert('¡Registro exitoso! Ahora puedes iniciar sesión.');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error desconocido');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.background}>
                <div className={styles.gradient}></div>
                <div className={styles.noise}></div>
            </div>

            <div className={styles.content}>
                {/* Logo */}
                <div className={styles.logo}>
                    <Image
                        src="/logo.png"
                        alt="Mente Abundante"
                        width={200}
                        height={200}
                        className={styles.logoImage}
                        priority
                    />
                </div>

                {/* Form Card */}
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h2 className={styles.cardTitle}>
                            {isLogin ? 'Bienvenido de vuelta' : 'Crea tu cuenta'}
                        </h2>
                        <p className={styles.cardDescription}>
                            {isLogin
                                ? 'Ingresa tus credenciales para comenzar tu transformación'
                                : 'Regístrate para descubrir lecciones de vida a través del cine'}
                        </p>
                    </div>

                    {error && (
                        <div className={styles.error}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className={styles.form}>
                        {!isLogin && (
                            <div className={styles.formGroup}>
                                <label htmlFor="name" className={styles.label}>
                                    Nombre completo
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    className={styles.input}
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Tu nombre"
                                    required={!isLogin}
                                />
                            </div>
                        )}

                        <div className={styles.formGroup}>
                            <label htmlFor="email" className={styles.label}>
                                Correo electrónico
                            </label>
                            <input
                                type="email"
                                id="email"
                                className={styles.input}
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="tu@correo.com"
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="password" className={styles.label}>
                                Contraseña
                            </label>
                            <input
                                type="password"
                                id="password"
                                className={styles.input}
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                placeholder="••••••••"
                                required
                                minLength={6}
                            />
                        </div>

                        <button
                            type="submit"
                            className={styles.submitButton}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className={styles.spinner}></span>
                                    {isLogin ? 'Iniciando sesión...' : 'Registrando...'}
                                </>
                            ) : (
                                <>
                                    {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M5 12h14M12 5l7 7-7 7" />
                                    </svg>
                                </>
                            )}
                        </button>
                    </form>

                    <div className={styles.divider}>
                        <span>o</span>
                    </div>

                    <button
                        type="button"
                        onClick={() => {
                            setIsLogin(!isLogin);
                            setError('');
                        }}
                        className={styles.switchButton}
                    >
                        {isLogin
                            ? '¿No tienes cuenta? Regístrate'
                            : '¿Ya tienes cuenta? Inicia sesión'}
                    </button>
                </div>

                {/* Footer */}
                <p className={styles.footer}>
                    Transforma tu vida a través de los mensajes del cine
                </p>
            </div>
        </div>
    );
}
