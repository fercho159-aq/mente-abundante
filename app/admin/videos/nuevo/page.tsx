'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';

interface Section {
    id: number;
    title: string;
}

function NewVideoForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const sectionId = searchParams.get('section');
    const movieId = searchParams.get('movie');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [sections, setSections] = useState<Section[]>([]);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        video_type: 'youtube' as 'youtube' | 'vimeo' | 'uploaded',
        video_url: '',
        section_id: sectionId || '',
        movie_id: movieId || '',
    });

    useEffect(() => {
        // Fetch sections for dropdown
        fetch('/api/sections')
            .then((res) => res.json())
            .then((data) => setSections(data))
            .catch(console.error);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/videos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    section_id: parseInt(formData.section_id),
                    movie_id: formData.movie_id ? parseInt(formData.movie_id) : null,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Error creating video');
            }

            router.push(`/admin/secciones/${formData.section_id}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error creating video');
        } finally {
            setLoading(false);
        }
    };

    return (
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
                <label htmlFor="section_id" className={styles.label}>
                    Sección *
                </label>
                <select
                    id="section_id"
                    className={styles.select}
                    value={formData.section_id}
                    onChange={(e) => setFormData({ ...formData, section_id: e.target.value })}
                    required
                >
                    <option value="">Selecciona una sección</option>
                    {sections.map((section) => (
                        <option key={section.id} value={section.id}>
                            {section.title}
                        </option>
                    ))}
                </select>
            </div>

            <div className={styles.formGroup}>
                <label htmlFor="title" className={styles.label}>
                    Título del Video *
                </label>
                <input
                    type="text"
                    id="title"
                    className={styles.input}
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Ej: Introducción al análisis cinematográfico"
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
                    placeholder="Descripción del contenido del video..."
                    rows={3}
                />
            </div>

            <div className={styles.formRow}>
                <div className={styles.formGroup}>
                    <label htmlFor="video_type" className={styles.label}>
                        Tipo de Video *
                    </label>
                    <select
                        id="video_type"
                        className={styles.select}
                        value={formData.video_type}
                        onChange={(e) => setFormData({ ...formData, video_type: e.target.value as 'youtube' | 'vimeo' | 'uploaded' })}
                        required
                    >
                        <option value="youtube">YouTube</option>
                        <option value="vimeo">Vimeo</option>
                        <option value="uploaded">Video Propio (URL)</option>
                    </select>
                </div>
            </div>

            <div className={styles.formGroup}>
                <label htmlFor="video_url" className={styles.label}>
                    URL del Video *
                </label>
                <input
                    type="url"
                    id="video_url"
                    className={styles.input}
                    value={formData.video_url}
                    onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                    placeholder={
                        formData.video_type === 'youtube'
                            ? 'https://www.youtube.com/watch?v=...'
                            : formData.video_type === 'vimeo'
                                ? 'https://vimeo.com/...'
                                : 'https://tu-servidor.com/video.mp4'
                    }
                    required
                />
                <span className={styles.hint}>
                    {formData.video_type === 'youtube' && 'Pega el enlace completo del video de YouTube'}
                    {formData.video_type === 'vimeo' && 'Pega el enlace completo del video de Vimeo'}
                    {formData.video_type === 'uploaded' && 'URL directa al archivo de video (mp4, webm, etc.)'}
                </span>
            </div>

            <div className={styles.formActions}>
                <Link href={sectionId ? `/admin/secciones/${sectionId}` : '/admin'} className={styles.cancelButton}>
                    Cancelar
                </Link>
                <button
                    type="submit"
                    className={styles.submitButton}
                    disabled={loading || !formData.title || !formData.video_url || !formData.section_id}
                >
                    {loading ? (
                        <>
                            <span className={styles.spinner}></span>
                            Guardando...
                        </>
                    ) : (
                        <>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                                <polyline points="17 21 17 13 7 13 7 21" />
                                <polyline points="7 3 7 8 15 8" />
                            </svg>
                            Guardar Video
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}

export default function NewVideoPage() {
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
                <h1 className={styles.pageTitle}>Nuevo Video</h1>
            </header>

            <div className={styles.container}>
                <Suspense fallback={<div>Cargando...</div>}>
                    <NewVideoForm />
                </Suspense>
            </div>
        </main>
    );
}
