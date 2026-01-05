import Link from 'next/link';
import { query, Movie } from '@/lib/db';
import { getPosterUrl } from '@/lib/tmdb';
import styles from './page.module.css';

async function getMovies() {
    return query<Movie>(`
    SELECT DISTINCT m.* FROM movies m
    JOIN section_movies sm ON m.id = sm.movie_id
    ORDER BY m.title
  `);
}

export const metadata = {
    title: 'Películas | Mente Abundante',
    description: 'Películas con lecciones de vida poderosas',
};

export default async function MoviesPage() {
    const movies = await getMovies();

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <h1 className={styles.title}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
                        <line x1="7" y1="2" x2="7" y2="22" />
                        <line x1="17" y1="2" x2="17" y2="22" />
                        <line x1="2" y1="12" x2="22" y2="12" />
                    </svg>
                    Todas las Películas
                </h1>
                <p className={styles.subtitle}>
                    {movies.length} películas en el curso
                </p>
            </div>

            {movies.length === 0 ? (
                <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>🎬</div>
                    <h3>No hay películas disponibles</h3>
                    <p>Las películas del curso se añadirán pronto.</p>
                </div>
            ) : (
                <div className={styles.grid}>
                    {movies.map((movie) => (
                        <Link
                            key={movie.id}
                            href={`/app/peliculas/${movie.id}`}
                            className={styles.card}
                        >
                            <div className={styles.poster}>
                                {movie.poster_path ? (
                                    <img
                                        src={getPosterUrl(movie.poster_path, 'w342') || ''}
                                        alt={movie.title}
                                        loading="lazy"
                                    />
                                ) : (
                                    <div className={styles.posterPlaceholder}>🎬</div>
                                )}
                                <div className={styles.overlay}>
                                    <span className={styles.viewBtn}>Ver más</span>
                                </div>
                            </div>
                            <div className={styles.info}>
                                <h3 className={styles.movieTitle}>{movie.title}</h3>
                                <div className={styles.meta}>
                                    {movie.release_date && (
                                        <span>{new Date(movie.release_date).getFullYear()}</span>
                                    )}

                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
