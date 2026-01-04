import { NextRequest, NextResponse } from 'next/server';
import { searchMovies, getMovieDetails, getPosterUrl } from '@/lib/tmdb';

// GET search TMDB for movies
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const queryParam = searchParams.get('query');
        const id = searchParams.get('id');
        const page = searchParams.get('page') || '1';

        // If ID is provided, get movie details
        if (id) {
            const movieId = parseInt(id);
            if (isNaN(movieId)) {
                return NextResponse.json(
                    { error: 'Invalid movie ID' },
                    { status: 400 }
                );
            }

            const movie = await getMovieDetails(movieId);

            return NextResponse.json({
                ...movie,
                poster_url: getPosterUrl(movie.poster_path, 'w342'),
            });
        }

        // Otherwise, search for movies
        if (!queryParam) {
            return NextResponse.json(
                { error: 'Query parameter is required' },
                { status: 400 }
            );
        }

        const results = await searchMovies(queryParam, parseInt(page));

        // Add poster URLs to results
        const moviesWithPosters = results.results.map((movie) => ({
            ...movie,
            poster_url: getPosterUrl(movie.poster_path, 'w185'),
        }));

        return NextResponse.json({
            ...results,
            results: moviesWithPosters,
        });
    } catch (error) {
        console.error('Error searching TMDB:', error);
        return NextResponse.json(
            { error: 'Error searching movies' },
            { status: 500 }
        );
    }
}
