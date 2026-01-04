'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';

export default function NewSectionPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        image_url: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/sections', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Error creating section');
            }

            const section = await response.json();
            router.push(`/admin/secciones/${section.id}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error creating section');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className={styles.main}>
            {/* Header */}
            <header className={styles.header}>
                <Link href="/admin" className={styles.backLink}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                    Volver al panel
                </Link>
                <h1 className={styles.pageTitle}>Nueva Sección</h1>
            </header>

            <div className={styles.container}>
                <form onSubmit={handleSubmit} className={styles.form}>
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

                    <div className={styles.formGroup}>
                        <label htmlFor="title" className={styles.label}>
                            Título de la Sección *
                        </label>
                        <input
                            type="text"
                            id="title"
                            className={styles.input}
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Ej: Introducción al Cine"
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="description" className={styles.label}>
                            Descripción
                        </label>
                        <textarea
                            id="description"
                            className={styles.textarea}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Describe el contenido de esta sección..."
                            rows={4}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="image_url" className={styles.label}>
                            URL de Imagen (opcional)
                        </label>
                        <input
                            type="url"
                            id="image_url"
                            className={styles.input}
                            value={formData.image_url}
                            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                            placeholder="https://example.com/image.jpg"
                        />
                        <span className={styles.hint}>
                            Imagen de fondo para la sección. Recomendado: 1920x1080px
                        </span>
                    </div>

                    <div className={styles.formActions}>
                        <Link href="/admin" className={styles.cancelButton}>
                            Cancelar
                        </Link>
                        <button
                            type="submit"
                            className={styles.submitButton}
                            disabled={loading || !formData.title}
                        >
                            {loading ? (
                                <>
                                    <span className={styles.spinner}></span>
                                    Creando...
                                </>
                            ) : (
                                <>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                                        <polyline points="17 21 17 13 7 13 7 21" />
                                        <polyline points="7 3 7 8 15 8" />
                                    </svg>
                                    Crear Sección
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </main>
    );
}
