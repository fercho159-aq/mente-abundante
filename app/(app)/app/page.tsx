import Link from 'next/link';
import { query, Section } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import styles from './page.module.css';

async function getSections() {
    const sections = await query<Section & { movie_count: number; video_count: number }>(`
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
    return sections;
}

export const metadata = {
    title: 'Mi Transformación | Mente Abundante',
    description: 'Tu espacio de crecimiento personal a través del cine',
};

export default async function AppHomePage() {
    const user = await getCurrentUser();
    const sections = await getSections();

    return (
        <div className={styles.page}>
            {/* Welcome Header */}
            <section className={styles.welcomeSection}>
                <div className={styles.welcomeContent}>
                    <h1 className={styles.welcomeTitle}>
                        ¡Hola, <span className={styles.userName}>{user?.name.split(' ')[0]}</span>! 👋
                    </h1>
                    <p className={styles.welcomeText}>
                        Continúa tu viaje de transformación. Descubre lecciones de vida a través de las películas.
                    </p>
                </div>

                {/* Quick Stats */}
                <div className={styles.quickStats}>
                    <div className={styles.quickStat}>
                        <span className={styles.quickStatValue}>{sections.length}</span>
                        <span className={styles.quickStatLabel}>Secciones</span>
                    </div>
                    <div className={styles.quickStat}>
                        <span className={styles.quickStatValue}>
                            {sections.reduce((acc, s) => acc + (s.movie_count || 0), 0)}
                        </span>
                        <span className={styles.quickStatLabel}>Películas</span>
                    </div>
                </div>
            </section>

            {/* Sections Grid */}
            <section className={styles.sectionsContainer}>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                        </svg>
                        Secciones del Curso
                    </h2>
                </div>

                {sections.length === 0 ? (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>📚</div>
                        <h3>El contenido está en camino</h3>
                        <p>
                            Las secciones del curso estarán disponibles pronto.
                            ¡Vuelve más tarde!
                        </p>
                    </div>
                ) : (
                    <div className={styles.sectionsGrid}>
                        {sections.map((section, index) => (
                            <Link
                                key={section.id}
                                href={`/app/secciones/${section.id}`}
                                className={styles.sectionCard}
                            >
                                <div
                                    className={styles.sectionCardBg}
                                    style={{
                                        backgroundImage: section.image_url
                                            ? `url(${section.image_url})`
                                            : undefined
                                    }}
                                >
                                    <div className={styles.sectionCardOverlay}></div>
                                </div>

                                <div className={styles.sectionCardContent}>
                                    <span className={styles.sectionNumber}>
                                        {String(index + 1).padStart(2, '0')}
                                    </span>

                                    <div className={styles.sectionInfo}>
                                        <h3 className={styles.sectionName}>{section.title}</h3>
                                        {section.description && (
                                            <p className={styles.sectionDescription}>
                                                {section.description}
                                            </p>
                                        )}

                                        <div className={styles.sectionMeta}>
                                            <span>🎬 {section.movie_count} películas</span>
                                            <span>📺 {section.video_count} videos</span>
                                        </div>
                                    </div>

                                    <div className={styles.sectionArrow}>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M5 12h14M12 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
