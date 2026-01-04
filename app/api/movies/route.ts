import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, Movie } from '@/lib/db';
import { getMovieDetails, getWatchProvidersForCountry, getPosterUrl, getBackdropUrl } from '@/lib/tmdb';

// GET all movies
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const sectionId = searchParams.get('section_id');

        let movies;

        if (sectionId) {
            movies = await query<Movie & { order_index: number; instructor_notes: string | null }>(`
        SELECT m.*, sm.order_index, sm.instructor_notes
        FROM movies m
        JOIN section_movies sm ON m.id = sm.movie_id
        WHERE sm.section_id = $1
        ORDER BY sm.order_index
      `, [parseInt(sectionId)]);
        } else {
            movies = await query<Movie>('SELECT * FROM movies ORDER BY title');
        }

        return NextResponse.json(movies);
    } catch (error) {
        console.error('Error fetching movies:', error);
        return NextResponse.json(
            { error: 'Error fetching movies' },
            { status: 500 }
        );
    }
}

// POST create a new movie (from TMDB ID)
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { tmdb_id, section_id, instructor_notes } = body;

        if (!tmdb_id) {
            return NextResponse.json(
                { error: 'TMDB ID is required' },
                { status: 400 }
            );
        }

        // Check if movie already exists
        let movie = await queryOne<Movie>(
            'SELECT * FROM movies WHERE tmdb_id = $1',
            [tmdb_id]
        );

        // If not, fetch from TMDB and create
        if (!movie) {
            const tmdbMovie = await getMovieDetails(tmdb_id);

            movie = await queryOne<Movie>(
                `INSERT INTO movies (tmdb_id, title, original_title, overview, poster_path, backdrop_path, release_date, vote_average, runtime, genres)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING *`,
                [
                    tmdbMovie.id,
                    tmdbMovie.title,
                    tmdbMovie.original_title,
                    tmdbMovie.overview,
                    tmdbMovie.poster_path,
                    tmdbMovie.backdrop_path,
                    tmdbMovie.release_date || null,
                    tmdbMovie.vote_average,
                    tmdbMovie.runtime || null,
                    JSON.stringify(tmdbMovie.genres || []),
                ]
            );

            // Fetch and store streaming providers
            if (movie) {
                try {
                    const providers = await getWatchProvidersForCountry(tmdb_id, 'MX');

                    if (providers) {
                        // Store streaming providers
                        for (const provider of providers.streaming) {
                            await query(
                                `INSERT INTO movie_streaming (movie_id, provider_name, provider_logo, link_type, country_code)
                 VALUES ($1, $2, $3, 'stream', 'MX')
                 ON CONFLICT (movie_id, provider_name, link_type) DO UPDATE SET provider_logo = $3, updated_at = CURRENT_TIMESTAMP`,
                                [movie.id, provider.provider_name, provider.logo_path]
                            );
                        }

                        // Store rent providers
                        for (const provider of providers.rent) {
                            await query(
                                `INSERT INTO movie_streaming (movie_id, provider_name, provider_logo, link_type, country_code)
                 VALUES ($1, $2, $3, 'rent', 'MX')
                 ON CONFLICT (movie_id, provider_name, link_type) DO UPDATE SET provider_logo = $3, updated_at = CURRENT_TIMESTAMP`,
                                [movie.id, provider.provider_name, provider.logo_path]
                            );
                        }

                        // Store buy providers
                        for (const provider of providers.buy) {
                            await query(
                                `INSERT INTO movie_streaming (movie_id, provider_name, provider_logo, link_type, country_code)
                 VALUES ($1, $2, $3, 'buy', 'MX')
                 ON CONFLICT (movie_id, provider_name, link_type) DO UPDATE SET provider_logo = $3, updated_at = CURRENT_TIMESTAMP`,
                                [movie.id, provider.provider_name, provider.logo_path]
                            );
                        }
                    }
                } catch (streamingError) {
                    console.error('Error fetching streaming providers:', streamingError);
                    // Continue even if streaming fetch fails
                }
            }
        }

        // If section_id is provided, link movie to section
        if (section_id && movie) {
            // Get the next order index for this section
            const lastMovie = await queryOne<{ max_order: number }>(
                'SELECT COALESCE(MAX(order_index), 0) as max_order FROM section_movies WHERE section_id = $1',
                [section_id]
            );
            const orderIndex = (lastMovie?.max_order || 0) + 1;

            await query(
                `INSERT INTO section_movies (section_id, movie_id, order_index, instructor_notes)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (section_id, movie_id) DO UPDATE SET instructor_notes = $4`,
                [section_id, movie.id, orderIndex, instructor_notes || null]
            );
        }

        return NextResponse.json(movie, { status: 201 });
    } catch (error) {
        console.error('Error creating movie:', error);
        return NextResponse.json(
            { error: 'Error creating movie' },
            { status: 500 }
        );
    }
}
