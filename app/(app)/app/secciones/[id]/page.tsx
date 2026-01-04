import { notFound } from 'next/navigation';
import Link from 'next/link';
import { query, queryOne, Section, Movie, Video, MovieStreaming } from '@/lib/db';
import { getPosterUrl, getProviderLogoUrl } from '@/lib/tmdb';
import styles from './page.module.css';

interface PageProps {
    params: Promise<{ id: string }>;
}

interface MovieWithStreaming extends Movie {
    order_index: number;
    instructor_notes: string | null;
    streaming: MovieStreaming[];
}

async function getSection(id: number) {
    return queryOne<Section>('SELECT * FROM sections WHERE id = $1', [id]);
}

async function getSectionMoviesWithStreaming(sectionId: number): Promise<MovieWithStreaming[]> {
    const movies = await query<Movie & { order_index: number; instructor_notes: string | null }>(`
    SELECT m.*, sm.order_index, sm.instructor_notes
    FROM movies m
    JOIN section_movies sm ON m.id = sm.movie_id
    WHERE sm.section_id = $1
    ORDER BY sm.order_index
  `, [sectionId]);

    // Get streaming for all movies
    const moviesWithStreaming = await Promise.all(
        movies.map(async (movie) => {
            const streaming = await query<MovieStreaming>(
                'SELECT * FROM movie_streaming WHERE movie_id = $1',
                [movie.id]
            );
            return { ...movie, streaming };
        })
    );

    return moviesWithStreaming;
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
        title: `${section.title} | Mente Abundante`,
        description: section.description || `Lección: ${section.title}`,
    };
}

export default async function SectionDetailPage({ params }: PageProps) {
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
        getSectionMoviesWithStreaming(sectionId),
        getSectionVideos(sectionId),
    ]);

    return (
        <div className={styles.page}>
            {/* Header */}
            <header className={styles.header}>
                <Link href="/app/secciones" className={styles.backLink}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                    Volver a secciones
                </Link>

                <h1 className={styles.title}>{section.title}</h1>
                {section.description && (
                    <p className={styles.description}>{section.description}</p>
                )}

                <div className={styles.stats}>
                    <span>🎬 {movies.length} películas</span>
                    <span>📺 {videos.length} videos</span>
                </div>
            </header>

            {/* Videos Section */}
            {videos.length > 0 && (
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polygon points="5 3 19 12 5 21 5 3" />
                        </svg>
                        Videos del Instructor
                    </h2>

                    <div className={styles.videosGrid}>
                        {videos.map((video) => (
                            <div key={video.id} className={styles.videoCard}>
                                <div className={styles.videoPlayer}>
                                    {video.video_type === 'youtube' ? (
                                        <iframe
                                            src={`https://www.youtube.com/embed/${extractYouTubeId(video.video_url)}`}
                                            title={video.title}
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        />
                                    ) : (
                                        <div className={styles.videoPlaceholder}>
                                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                                <polygon points="5 3 19 12 5 21 5 3" />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                                <div className={styles.videoInfo}>
                                    <h3 className={styles.videoTitle}>{video.title}</h3>
                                    {video.description && (
                                        <p className={styles.videoDescription}>{video.description}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Movies Section - Accordion Style */}
            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
                        <line x1="7" y1="2" x2="7" y2="22" />
                        <line x1="17" y1="2" x2="17" y2="22" />
                        <line x1="2" y1="12" x2="22" y2="12" />
                    </svg>
                    Películas Recomendadas
                </h2>

                {movies.length === 0 ? (
                    <div className={styles.emptyState}>
                        <p>No hay películas en esta sección aún.</p>
                    </div>
                ) : (
                    <div className={styles.moviesList}>
                        {movies.map((movie, index) => (
                            <details key={movie.id} className={styles.movieAccordion}>
                                <summary className={styles.movieHeader}>
                                    <span className={styles.movieNumber}>{index + 1}</span>
                                    <span className={styles.movieHeaderTitle}>{movie.title}</span>
                                    <div className={styles.movieHeaderMeta}>
                                        {movie.release_date && (
                                            <span>{new Date(movie.release_date).getFullYear()}</span>
                                        )}
                                        {movie.vote_average && (
                                            <span className={styles.rating}>⭐ {Number(movie.vote_average).toFixed(1)}</span>
                                        )}
                                    </div>
                                    <svg className={styles.chevron} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polyline points="6 9 12 15 18 9" />
                                    </svg>
                                </summary>

                                <div className={styles.movieContent}>
                                    <div className={styles.movieLayout}>
                                        {/* Poster */}
                                        <div className={styles.moviePoster}>
                                            {movie.poster_path ? (
                                                <img
                                                    src={getPosterUrl(movie.poster_path, 'w342') || ''}
                                                    alt={movie.title}
                                                    loading="lazy"
                                                />
                                            ) : (
                                                <div className={styles.posterPlaceholder}>🎬</div>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className={styles.movieDetails}>
                                            {movie.overview && (
                                                <p className={styles.movieOverview}>{movie.overview}</p>
                                            )}

                                            {movie.genres && movie.genres.length > 0 && (
                                                <div className={styles.genres}>
                                                    {movie.genres.map((genre) => (
                                                        <span key={genre.id} className={styles.genre}>
                                                            {genre.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Streaming Providers */}
                                            {movie.streaming.length > 0 && (
                                                <div className={styles.streamingSection}>
                                                    <h4 className={styles.streamingTitle}>📺 Dónde verla:</h4>
                                                    <div className={styles.providers}>
                                                        {movie.streaming
                                                            .filter(s => s.link_type === 'stream')
                                                            .map((provider) => (
                                                                <div key={provider.id} className={styles.provider} title={provider.provider_name}>
                                                                    {provider.provider_logo ? (
                                                                        <img
                                                                            src={getProviderLogoUrl(provider.provider_logo)}
                                                                            alt={provider.provider_name}
                                                                        />
                                                                    ) : (
                                                                        <span>{provider.provider_name}</span>
                                                                    )}
                                                                </div>
                                                            ))}
                                                    </div>
                                                    {movie.streaming.filter(s => s.link_type === 'rent' || s.link_type === 'buy').length > 0 && (
                                                        <div className={styles.rentBuy}>
                                                            <span className={styles.rentBuyLabel}>Alquiler/Compra:</span>
                                                            <div className={styles.providers}>
                                                                {movie.streaming
                                                                    .filter(s => s.link_type === 'rent' || s.link_type === 'buy')
                                                                    .slice(0, 5)
                                                                    .map((provider) => (
                                                                        <div key={provider.id} className={styles.providerSmall} title={provider.provider_name}>
                                                                            {provider.provider_logo ? (
                                                                                <img
                                                                                    src={getProviderLogoUrl(provider.provider_logo)}
                                                                                    alt={provider.provider_name}
                                                                                />
                                                                            ) : (
                                                                                <span>{provider.provider_name}</span>
                                                                            )}
                                                                        </div>
                                                                    ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            <Link href={`/app/peliculas/${movie.id}?section=${sectionId}`} className={styles.viewMoreBtn}>
                                                Ver más detalles
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                                </svg>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </details>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

function extractYouTubeId(url: string): string {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : url;
}
