import { notFound } from 'next/navigation';
import Link from 'next/link';
import { query, queryOne, Movie, Video, MovieStreaming } from '@/lib/db';
import { getPosterUrl, getBackdropUrl, getProviderLogoUrl } from '@/lib/tmdb';
import styles from './page.module.css';

interface PageProps {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ section?: string }>;
}

async function getMovie(id: number) {
    return queryOne<Movie>('SELECT * FROM movies WHERE id = $1', [id]);
}

async function getMovieStreaming(movieId: number) {
    return query<MovieStreaming>(
        'SELECT * FROM movie_streaming WHERE movie_id = $1',
        [movieId]
    );
}

async function getMovieVideos(movieId: number) {
    return query<Video>(
        'SELECT * FROM videos WHERE movie_id = $1 ORDER BY order_index',
        [movieId]
    );
}

export async function generateMetadata({ params }: PageProps) {
    const { id } = await params;
    const movie = await getMovie(parseInt(id));

    if (!movie) {
        return { title: 'Película no encontrada' };
    }

    return {
        title: `${movie.title} | Mente Abundante`,
        description: movie.overview || `Lección de vida: ${movie.title}`,
    };
}

export default async function MovieDetailPage({ params, searchParams }: PageProps) {
    const { id } = await params;
    const { section } = await searchParams;
    const movieId = parseInt(id);

    if (isNaN(movieId)) {
        notFound();
    }

    const movie = await getMovie(movieId);

    if (!movie) {
        notFound();
    }

    const [streaming, videos] = await Promise.all([
        getMovieStreaming(movieId),
        getMovieVideos(movieId),
    ]);

    const streamingByType = {
        stream: streaming.filter((s) => s.link_type === 'stream'),
        rent: streaming.filter((s) => s.link_type === 'rent'),
        buy: streaming.filter((s) => s.link_type === 'buy'),
    };

    const backdropUrl = getBackdropUrl(movie.backdrop_path);
    const posterUrl = getPosterUrl(movie.poster_path, 'w500');

    return (
        <div className={styles.page}>
            {/* Hero */}
            <section className={styles.hero}>
                <div
                    className={styles.heroBg}
                    style={{
                        backgroundImage: backdropUrl ? `url(${backdropUrl})` : undefined,
                    }}
                >
                    <div className={styles.heroOverlay}></div>
                </div>

                <div className={styles.heroContent}>
                    <Link
                        href={section ? `/app/secciones/${section}` : '/app/peliculas'}
                        className={styles.backLink}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                        Volver
                    </Link>

                    <div className={styles.movieLayout}>
                        <div className={styles.posterWrapper}>
                            {posterUrl ? (
                                <img src={posterUrl} alt={movie.title} className={styles.poster} />
                            ) : (
                                <div className={styles.posterPlaceholder}>🎬</div>
                            )}
                        </div>

                        <div className={styles.movieInfo}>
                            <h1 className={styles.movieTitle}>{movie.title}</h1>

                            {movie.original_title && movie.original_title !== movie.title && (
                                <p className={styles.originalTitle}>{movie.original_title}</p>
                            )}

                            <div className={styles.meta}>
                                {movie.release_date && (
                                    <span>📅 {new Date(movie.release_date).getFullYear()}</span>
                                )}
                                {movie.runtime && (
                                    <span>⏱️ {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}min</span>
                                )}
                                {movie.vote_average && (
                                    <span>⭐ {Number(movie.vote_average).toFixed(1)}</span>
                                )}
                            </div>

                            {movie.genres && movie.genres.length > 0 && (
                                <div className={styles.genres}>
                                    {movie.genres.map((genre) => (
                                        <span key={genre.id} className={styles.genre}>
                                            {genre.name}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {movie.overview && (
                                <p className={styles.overview}>{movie.overview}</p>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Streaming */}
            {streaming.length > 0 && (
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                            <line x1="8" y1="21" x2="16" y2="21" />
                            <line x1="12" y1="17" x2="12" y2="21" />
                        </svg>
                        Dónde Ver
                    </h2>

                    <div className={styles.streamingGrid}>
                        {streamingByType.stream.length > 0 && (
                            <div className={styles.streamingCategory}>
                                <h3>📺 Streaming</h3>
                                <div className={styles.providers}>
                                    {streamingByType.stream.map((p) => (
                                        <div key={p.id} className={styles.provider} title={p.provider_name}>
                                            {p.provider_logo ? (
                                                <img src={getProviderLogoUrl(p.provider_logo)} alt={p.provider_name} />
                                            ) : (
                                                <span>{p.provider_name}</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {streamingByType.rent.length > 0 && (
                            <div className={styles.streamingCategory}>
                                <h3>🎟️ Alquiler</h3>
                                <div className={styles.providers}>
                                    {streamingByType.rent.map((p) => (
                                        <div key={p.id} className={styles.provider} title={p.provider_name}>
                                            {p.provider_logo ? (
                                                <img src={getProviderLogoUrl(p.provider_logo)} alt={p.provider_name} />
                                            ) : (
                                                <span>{p.provider_name}</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {streamingByType.buy.length > 0 && (
                            <div className={styles.streamingCategory}>
                                <h3>🛒 Compra</h3>
                                <div className={styles.providers}>
                                    {streamingByType.buy.map((p) => (
                                        <div key={p.id} className={styles.provider} title={p.provider_name}>
                                            {p.provider_logo ? (
                                                <img src={getProviderLogoUrl(p.provider_logo)} alt={p.provider_name} />
                                            ) : (
                                                <span>{p.provider_name}</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <p className={styles.attribution}>
                        Datos de disponibilidad proporcionados por{' '}
                        <a href="https://www.justwatch.com/" target="_blank" rel="noopener noreferrer">
                            JustWatch
                        </a>
                    </p>
                </section>
            )}

            {/* Videos */}
            {videos.length > 0 && (
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polygon points="5 3 19 12 5 21 5 3" />
                        </svg>
                        Análisis del Instructor
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
                                    ) : video.video_type === 'vimeo' ? (
                                        <iframe
                                            src={`https://player.vimeo.com/video/${extractVimeoId(video.video_url)}`}
                                            title={video.title}
                                            allow="autoplay; fullscreen; picture-in-picture"
                                            allowFullScreen
                                        />
                                    ) : (
                                        <video controls src={video.video_url} />
                                    )}
                                </div>
                                <div className={styles.videoInfo}>
                                    <h3>{video.title}</h3>
                                    {video.description && <p>{video.description}</p>}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}

function extractYouTubeId(url: string): string {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : url;
}

function extractVimeoId(url: string): string {
    const regex = /(?:vimeo\.com\/)(\d+)/;
    const match = url.match(regex);
    return match ? match[1] : url;
}
