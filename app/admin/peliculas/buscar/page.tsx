'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';

interface TMDBMovie {
    id: number;
    title: string;
    original_title: string;
    overview: string;
    poster_url: string | null;
    release_date: string;
    vote_average: number;
}

interface SearchResult {
    results: TMDBMovie[];
    total_pages: number;
    total_results: number;
    page: number;
}

import { Suspense } from 'react';

function SearchMoviesContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const sectionId = searchParams.get('section');

    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [addingId, setAddingId] = useState<number | null>(null);
    const [addedMovies, setAddedMovies] = useState<Set<number>>(new Set());

    const handleSearch = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        setError('');

        try {
            const response = await fetch(`/api/tmdb?query=${encodeURIComponent(query)}`);
            if (!response.ok) throw new Error('Error searching movies');
            const data = await response.json();
            setResults(data);
        } catch (err) {
            setError('Error al buscar películas. Verifica tu API key de TMDB.');
        } finally {
            setLoading(false);
        }
    };

    const handleAddMovie = async (movie: TMDBMovie) => {
        if (!sectionId) {
            alert('Selecciona una sección primero');
            return;
        }

        setAddingId(movie.id);

        try {
            const response = await fetch('/api/movies', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tmdb_id: movie.id,
                    section_id: parseInt(sectionId),
                }),
            });

            if (!response.ok) throw new Error('Error adding movie');

            setAddedMovies((prev) => new Set(prev).add(movie.id));
        } catch (err) {
            alert('Error al añadir la película');
        } finally {
            setAddingId(null);
        }
    };

    return (
        <main className={styles.main}>
            {/* Header */}
            <header className={styles.header}>
                <Link
                    href={sectionId ? `/admin/secciones/${sectionId}` : '/admin'}
                    className={styles.backLink}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                    {sectionId ? 'Volver a la sección' : 'Volver al panel'}
                </Link>
                <h1 className={styles.pageTitle}>Buscar Películas</h1>
                <p className={styles.pageDescription}>
                    Busca películas en TMDB para añadirlas al curso
                </p>
            </header>

            <div className={styles.container}>
                {/* Search Form */}
                <form onSubmit={handleSearch} className={styles.searchForm}>
                    <div className={styles.searchInputWrapper}>
                        <svg className={styles.searchIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8" />
                            <path d="M21 21l-4.35-4.35" />
                        </svg>
                        <input
                            type="text"
                            className={styles.searchInput}
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Buscar película por nombre..."
                            autoFocus
                        />
                    </div>
                    <button
                        type="submit"
                        className={styles.searchButton}
                        disabled={loading || !query.trim()}
                    >
                        {loading ? 'Buscando...' : 'Buscar'}
                    </button>
                </form>

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

                {/* Results */}
                {results && (
                    <div className={styles.results}>
                        <p className={styles.resultsCount}>
                            {results.total_results} resultados encontrados
                        </p>

                        <div className={styles.resultsGrid}>
                            {results.results.map((movie) => (
                                <div key={movie.id} className={styles.movieCard}>
                                    <div className={styles.moviePoster}>
                                        {movie.poster_url ? (
                                            <img src={movie.poster_url} alt={movie.title} />
                                        ) : (
                                            <div className={styles.posterPlaceholder}>🎬</div>
                                        )}
                                    </div>
                                    <div className={styles.movieInfo}>
                                        <h3 className={styles.movieTitle}>{movie.title}</h3>
                                        <div className={styles.movieMeta}>
                                            {movie.release_date && (
                                                <span>{new Date(movie.release_date).getFullYear()}</span>
                                            )}

                                        </div>
                                        {movie.overview && (
                                            <p className={styles.movieOverview}>{movie.overview}</p>
                                        )}
                                        <button
                                            className={`${styles.addMovieButton} ${addedMovies.has(movie.id) ? styles.added : ''}`}
                                            onClick={() => handleAddMovie(movie)}
                                            disabled={addingId === movie.id || addedMovies.has(movie.id) || !sectionId}
                                        >
                                            {addedMovies.has(movie.id) ? (
                                                <>
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <polyline points="20 6 9 17 4 12" />
                                                    </svg>
                                                    Añadida
                                                </>
                                            ) : addingId === movie.id ? (
                                                <>
                                                    <span className={styles.spinner}></span>
                                                    Añadiendo...
                                                </>
                                            ) : (
                                                <>
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <line x1="12" y1="5" x2="12" y2="19" />
                                                        <line x1="5" y1="12" x2="19" y2="12" />
                                                    </svg>
                                                    Añadir a Sección
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {!results && !loading && (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>🔍</div>
                        <h3>Busca una película</h3>
                        <p>Escribe el nombre de la película que quieres añadir al curso</p>
                    </div>
                )}
            </div>
        </main>
    );
}

export default function SearchMoviesPage() {
    return (
        <Suspense fallback={<div className={styles.loading}>Cargando buscador...</div>}>
            <SearchMoviesContent />
        </Suspense>
    );
}
