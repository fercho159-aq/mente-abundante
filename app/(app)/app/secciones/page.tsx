import Link from 'next/link';
import { query, Section } from '@/lib/db';
import styles from './page.module.css';

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
    title: 'Lecciones | Mente Abundante',
    description: 'Explora todas las lecciones de transformación personal',
};

export default async function SectionsPage() {
    const sections = await getSections();

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <h1 className={styles.title}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                    </svg>
                    Secciones del Curso
                </h1>
                <p className={styles.subtitle}>
                    Explora cada unidad temática del curso
                </p>
            </div>

            {sections.length === 0 ? (
                <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>📚</div>
                    <h3>No hay secciones disponibles</h3>
                    <p>El contenido del curso se está preparando.</p>
                </div>
            ) : (
                <div className={styles.grid}>
                    {sections.map((section, index) => (
                        <Link
                            key={section.id}
                            href={`/app/secciones/${section.id}`}
                            className={styles.card}
                        >
                            <div
                                className={styles.cardBg}
                                style={{
                                    backgroundImage: section.image_url
                                        ? `url(${section.image_url})`
                                        : undefined
                                }}
                            >
                                <div className={styles.cardOverlay}></div>
                            </div>

                            <div className={styles.cardContent}>
                                <span className={styles.number}>
                                    {String(index + 1).padStart(2, '0')}
                                </span>
                                <h3 className={styles.cardTitle}>{section.title}</h3>
                                {section.description && (
                                    <p className={styles.cardDescription}>{section.description}</p>
                                )}
                                <div className={styles.cardMeta}>
                                    <span>🎬 {section.movie_count} películas</span>
                                    <span>📺 {section.video_count} videos</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
