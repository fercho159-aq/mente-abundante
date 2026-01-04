import { notFound } from 'next/navigation';
import Link from 'next/link';
import { query, queryOne, Section, Movie, Video } from '@/lib/db';
import { getPosterUrl } from '@/lib/tmdb';
import styles from './page.module.css';

interface PageProps {
    params: Promise<{ id: string }>;
}

async function getSection(id: number) {
    return queryOne<Section>('SELECT * FROM sections WHERE id = $1', [id]);
}

async function getSectionMovies(sectionId: number) {
    return query<Movie & { order_index: number; instructor_notes: string | null }>(`
    SELECT m.*, sm.order_index, sm.instructor_notes
    FROM movies m
    JOIN section_movies sm ON m.id = sm.movie_id
    WHERE sm.section_id = $1
    ORDER BY sm.order_index
  `, [sectionId]);
}

async function getSectionVideos(sectionId: number) {
    return query<Video>(`
    SELECT * FROM videos
    WHERE section_id = $1 AND movie_id IS NULL
    ORDER BY order_index
  `, [sectionId]);
}

export async function generateMetadata({ params }: PageProps) {
    const { id } = await params;
    const section = await getSection(parseInt(id));

    if (!section) {
        return { title: 'Sección no encontrada' };
    }

    return {
        title: `Editar: ${section.title} | Admin Mente Abundante`,
    };
}

export default async function AdminSectionPage({ params }: PageProps) {
    const { id } = await params;
    const sectionId = parseInt(id);

    if (isNaN(sectionId)) {
        notFound();
    }

    const section = await getSection(sectionId);

    if (!section) {
        notFound();
    }

    const [movies, videos] = await Promise.all([
        getSectionMovies(sectionId),
        getSectionVideos(sectionId),
    ]);

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
                <div className={styles.headerContent}>
                    <div>
                        <h1 className={styles.pageTitle}>{section.title}</h1>
                        {section.description && (
                            <p className={styles.pageDescription}>{section.description}</p>
                        )}
                    </div>
                    <Link href={`/curso/${section.id}`} className={styles.viewButton} target="_blank">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                            <polyline points="15 3 21 3 21 9" />
                            <line x1="10" y1="14" x2="21" y2="3" />
                        </svg>
                        Ver en el sitio
                    </Link>
                </div>
            </header>

            <div className={styles.container}>
                {/* Movies Section */}
                <section className={styles.contentSection}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>
                            <span className={styles.sectionIcon}>🎬</span>
                            Películas ({movies.length})
                        </h2>
                        <Link href={`/admin/peliculas/buscar?section=${sectionId}`} className={styles.addButton}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="12" y1="5" x2="12" y2="19" />
                                <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                            Añadir Película
                        </Link>
                    </div>

                    {movies.length === 0 ? (
                        <div className={styles.emptyState}>
                            <p>No hay películas en esta sección</p>
                            <Link href={`/admin/peliculas/buscar?section=${sectionId}`} className="btn btn-primary">
                                Buscar y Añadir Películas
                            </Link>
                        </div>
                    ) : (
                        <div className={styles.moviesGrid}>
                            {movies.map((movie, index) => (
                                <div key={movie.id} className={styles.movieCard}>
                                    <span className={styles.movieOrder}>{index + 1}</span>
                                    <div className={styles.moviePoster}>
                                        {movie.poster_path ? (
                                            <img
                                                src={getPosterUrl(movie.poster_path, 'w185') || ''}
                                                alt={movie.title}
                                            />
                                        ) : (
                                            <div className={styles.posterPlaceholder}>🎬</div>
                                        )}
                                    </div>
                                    <div className={styles.movieInfo}>
                                        <h3 className={styles.movieTitle}>{movie.title}</h3>
                                        {movie.release_date && (
                                            <span className={styles.movieYear}>
                                                {new Date(movie.release_date).getFullYear()}
                                            </span>
                                        )}
                                        {movie.instructor_notes && (
                                            <p className={styles.movieNotes}>{movie.instructor_notes}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Videos Section */}
                <section className={styles.contentSection}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>
                            <span className={styles.sectionIcon}>📺</span>
                            Videos del Instructor ({videos.length})
                        </h2>
                        <Link href={`/admin/videos/nuevo?section=${sectionId}`} className={styles.addButton}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="12" y1="5" x2="12" y2="19" />
                                <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                            Añadir Video
                        </Link>
                    </div>

                    {videos.length === 0 ? (
                        <div className={styles.emptyState}>
                            <p>No hay videos en esta sección</p>
                            <Link href={`/admin/videos/nuevo?section=${sectionId}`} className="btn btn-primary">
                                Añadir Primer Video
                            </Link>
                        </div>
                    ) : (
                        <div className={styles.videosList}>
                            {videos.map((video, index) => (
                                <div key={video.id} className={styles.videoCard}>
                                    <span className={styles.videoOrder}>{index + 1}</span>
                                    <div className={styles.videoIcon}>
                                        {video.video_type === 'youtube' ? '📺' :
                                            video.video_type === 'vimeo' ? '🎥' : '📁'}
                                    </div>
                                    <div className={styles.videoInfo}>
                                        <h3 className={styles.videoTitle}>{video.title}</h3>
                                        {video.description && (
                                            <p className={styles.videoDescription}>{video.description}</p>
                                        )}
                                        <span className={styles.videoType}>{video.video_type}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}
