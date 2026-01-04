import Link from 'next/link';
import { query, Section } from '@/lib/db';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

async function getStats() {
    const [sections, movies, videos] = await Promise.all([
        query<{ count: string }>('SELECT COUNT(*) as count FROM sections'),
        query<{ count: string }>('SELECT COUNT(*) as count FROM movies'),
        query<{ count: string }>('SELECT COUNT(*) as count FROM videos'),
    ]);

    return {
        sections: parseInt(sections[0]?.count || '0'),
        movies: parseInt(movies[0]?.count || '0'),
        videos: parseInt(videos[0]?.count || '0'),
    };
}

async function getSections() {
    return query<Section & { movie_count: number; video_count: number }>(`
    SELECT 
      s.*,
      COUNT(DISTINCT sm.movie_id)::int as movie_count,
      COUNT(DISTINCT v.id)::int as video_count
    FROM sections s
    LEFT JOIN section_movies sm ON s.id = sm.section_id
    LEFT JOIN videos v ON s.id = v.section_id
    GROUP BY s.id
    ORDER BY s.order_index
  `);
}

export const metadata = {
    title: 'Panel de Administración | Mente Abundante',
    description: 'Gestiona el contenido de Mente Abundante',
};

export default async function AdminPage() {
    const [stats, sections] = await Promise.all([getStats(), getSections()]);

    return (
        <main className={styles.main}>
            {/* Header */}
            <header className={styles.header}>
                <div className={styles.headerContent}>
                    <div className={styles.headerLeft}>
                        <Link href="/" className={styles.backLink}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M19 12H5M12 19l-7-7 7-7" />
                            </svg>
                            Volver al sitio
                        </Link>
                        <h1 className={styles.headerTitle}>
                            <span className={styles.headerIcon}>🎬</span>
                            Panel de Administración
                        </h1>
                    </div>
                </div>
            </header>

            <div className={styles.container}>
                {/* Stats Cards */}
                <section className={styles.statsSection}>
                    <div className={styles.statsGrid}>
                        <div className={styles.statCard}>
                            <div className={styles.statIcon}>📚</div>
                            <div className={styles.statInfo}>
                                <span className={styles.statValue}>{stats.sections}</span>
                                <span className={styles.statLabel}>Secciones</span>
                            </div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statIcon}>🎬</div>
                            <div className={styles.statInfo}>
                                <span className={styles.statValue}>{stats.movies}</span>
                                <span className={styles.statLabel}>Películas</span>
                            </div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statIcon}>📺</div>
                            <div className={styles.statInfo}>
                                <span className={styles.statValue}>{stats.videos}</span>
                                <span className={styles.statLabel}>Videos</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Quick Actions */}
                <section className={styles.actionsSection}>
                    <h2 className={styles.sectionTitle}>Acciones Rápidas</h2>
                    <div className={styles.actionsGrid}>
                        <Link href="/admin/secciones/nueva" className={styles.actionCard}>
                            <span className={styles.actionIcon}>➕</span>
                            <div className={styles.actionInfo}>
                                <h3>Nueva Sección</h3>
                                <p>Crear una nueva unidad del curso</p>
                            </div>
                        </Link>
                        <Link href="/admin/peliculas/buscar" className={styles.actionCard}>
                            <span className={styles.actionIcon}>🔍</span>
                            <div className={styles.actionInfo}>
                                <h3>Buscar Película</h3>
                                <p>Buscar y añadir películas desde TMDB</p>
                            </div>
                        </Link>
                        <Link href="/admin/videos/nuevo" className={styles.actionCard}>
                            <span className={styles.actionIcon}>📹</span>
                            <div className={styles.actionInfo}>
                                <h3>Nuevo Video</h3>
                                <p>Agregar video explicativo</p>
                            </div>
                        </Link>
                    </div>
                </section>

                {/* Sections List */}
                <section className={styles.sectionsSection}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>Secciones del Curso</h2>
                        <Link href="/admin/secciones/nueva" className={styles.addButton}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="12" y1="5" x2="12" y2="19" />
                                <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                            Nueva Sección
                        </Link>
                    </div>

                    {sections.length === 0 ? (
                        <div className={styles.emptyState}>
                            <div className={styles.emptyIcon}>📚</div>
                            <h3>No hay secciones aún</h3>
                            <p>Comienza creando la primera sección del curso</p>
                            <Link href="/admin/secciones/nueva" className="btn btn-primary">
                                Crear Primera Sección
                            </Link>
                        </div>
                    ) : (
                        <div className={styles.sectionsList}>
                            {sections.map((section, index) => (
                                <Link
                                    key={section.id}
                                    href={`/admin/secciones/${section.id}`}
                                    className={styles.sectionCard}
                                >
                                    <span className={styles.sectionIndex}>{String(index + 1).padStart(2, '0')}</span>
                                    <div className={styles.sectionContent}>
                                        <h3 className={styles.sectionName}>{section.title}</h3>
                                        {section.description && (
                                            <p className={styles.sectionDescription}>{section.description}</p>
                                        )}
                                        <div className={styles.sectionMeta}>
                                            <span>🎬 {section.movie_count} películas</span>
                                            <span>📺 {section.video_count} videos</span>
                                        </div>
                                    </div>
                                    <svg className={styles.sectionArrow} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M9 18l6-6-6-6" />
                                    </svg>
                                </Link>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}
