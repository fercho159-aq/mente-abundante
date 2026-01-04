const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

// Get API key from environment
function getApiKey(): string {
    const apiKey = process.env.TMDB_API_KEY;
    if (!apiKey) {
        throw new Error('TMDB_API_KEY environment variable is not set');
    }
    return apiKey;
}

// Helper for making TMDB API requests
async function tmdbFetch<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
    const apiKey = getApiKey();
    const searchParams = new URLSearchParams({
        api_key: apiKey,
        language: 'es-MX',
        ...params
    });

    const response = await fetch(`${TMDB_BASE_URL}${endpoint}?${searchParams}`);

    if (!response.ok) {
        throw new Error(`TMDB API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
}

// Types for TMDB responses
export interface TMDBMovie {
    id: number;
    title: string;
    original_title: string;
    overview: string;
    poster_path: string | null;
    backdrop_path: string | null;
    release_date: string;
    vote_average: number;
    vote_count: number;
    runtime?: number;
    genres?: { id: number; name: string }[];
}

export interface TMDBSearchResult {
    page: number;
    results: TMDBMovie[];
    total_pages: number;
    total_results: number;
}

export interface TMDBWatchProvider {
    logo_path: string;
    provider_id: number;
    provider_name: string;
    display_priority: number;
}

export interface TMDBWatchProviders {
    id: number;
    results: {
        [countryCode: string]: {
            link: string;
            flatrate?: TMDBWatchProvider[];
            rent?: TMDBWatchProvider[];
            buy?: TMDBWatchProvider[];
        };
    };
}

// TMDB API Functions

/**
 * Search for movies by query string
 */
export async function searchMovies(query: string, page = 1): Promise<TMDBSearchResult> {
    return tmdbFetch<TMDBSearchResult>('/search/movie', {
        query,
        page: page.toString(),
        include_adult: 'false'
    });
}

/**
 * Get movie details by TMDB ID
 */
export async function getMovieDetails(movieId: number): Promise<TMDBMovie> {
    return tmdbFetch<TMDBMovie>(`/movie/${movieId}`);
}

/**
 * Get watch providers (streaming platforms) for a movie
 */
export async function getWatchProviders(movieId: number): Promise<TMDBWatchProviders> {
    return tmdbFetch<TMDBWatchProviders>(`/movie/${movieId}/watch/providers`);
}

/**
 * Get watch providers for a specific country (defaults to Mexico)
 */
export async function getWatchProvidersForCountry(
    movieId: number,
    countryCode = 'MX'
): Promise<{
    link: string;
    streaming: TMDBWatchProvider[];
    rent: TMDBWatchProvider[];
    buy: TMDBWatchProvider[];
} | null> {
    const providers = await getWatchProviders(movieId);
    const countryData = providers.results[countryCode];

    if (!countryData) {
        return null;
    }

    return {
        link: countryData.link,
        streaming: countryData.flatrate || [],
        rent: countryData.rent || [],
        buy: countryData.buy || []
    };
}

/**
 * Get popular movies
 */
export async function getPopularMovies(page = 1): Promise<TMDBSearchResult> {
    return tmdbFetch<TMDBSearchResult>('/movie/popular', {
        page: page.toString()
    });
}

/**
 * Get now playing movies
 */
export async function getNowPlayingMovies(page = 1): Promise<TMDBSearchResult> {
    return tmdbFetch<TMDBSearchResult>('/movie/now_playing', {
        page: page.toString()
    });
}

// Image URL builders
export function getPosterUrl(posterPath: string | null, size: 'w92' | 'w154' | 'w185' | 'w342' | 'w500' | 'w780' | 'original' = 'w500'): string | null {
    if (!posterPath) return null;
    return `${TMDB_IMAGE_BASE_URL}/${size}${posterPath}`;
}

export function getBackdropUrl(backdropPath: string | null, size: 'w300' | 'w780' | 'w1280' | 'original' = 'w1280'): string | null {
    if (!backdropPath) return null;
    return `${TMDB_IMAGE_BASE_URL}/${size}${backdropPath}`;
}

export function getProviderLogoUrl(logoPath: string, size: 'w45' | 'w92' | 'w154' | 'original' = 'w92'): string {
    return `${TMDB_IMAGE_BASE_URL}/${size}${logoPath}`;
}
