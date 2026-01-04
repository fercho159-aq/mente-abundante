const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

// URL base del servidor de desarrollo local
const LOCAL_API_URL = 'http://localhost:3000/api';

// Contenido de la Sección 1
const SECCION_1 = {
    title: 'Bolitas 1',
    description: `Comencemos: 

En un mundo moderno con su incesante agitación, su preocupación por el tiempo, su culto a la eficiencia y su obsesión por los resultados inmediatos - ha olvidado una verdad sencilla; 

*DIOS PRIMERO*

No como idea piadosa, ni como hábito de sábado o concepto religioso aprendido en la infancia…

Si bien, como Ley Espiritual…

Una Ley tan precisa como la gravedad, tan inevitable como el amanecer…. 

El mundo ha invertido el orden, ha pensado que lo urgente es más importante que lo Eterno... 

En este proceso recordaremos lo que el alma ya sabe, y reorientaremos el Espíritu, para volver a la verdadera identidad; 

No pediremos fe ciega, al contrario, suplicaremos por comprensión y disciplina, para que no existan dudas en la obtención del secreto olvidado, que nunca falla…

Por lo que a partir de este momento comienza tu viaje, el más extraordinario de tu vida… !!

Teniendo en cuenta, que todo aquello que desees, todo aquello que anheles, los sueños más profundos de tu SER… serán entregados en tus manos;

Como una llave de Bendición, que siempre ha estado ahí...

Haciéndote observar, que la finalidad, es tener un claro entendimiento de cómo funciona el Mundo Espiritual …. para poder vivir realizado en el mundo material… 

Ya que ambos se encuentran edificados sobre Leyes precisas que fueron diseñadas en la creación del universo…

Teniendo en cuenta que la sabiduría no es exclusiva, y el sendero de esta travesía contiene infinidad de caminos…. 

Todas las respuestas a las preguntas más enigmáticas, las obtendrás…

Aunque antes de comenzar en este proceso; debes contar con un conocimiento previo; totalmente diferente a lo aprendido con anterioridad…

Por lo que te instó a participar e interactuar con tu familia, ya que la integración corresponde a la unidad.

Clase: *Bolitas 1*

*Observarás con atención los diálogos que corresponden a cada una de las siguientes películas*

Ya que en los diálogos encontraremos el orden requerido para encontrar este gran principio.. 

*Primero Dios, Después Dios y Siempre Dios…*`
};

// Películas para la Sección 1 con sus IDs de TMDB
// Nota: Algunos documentales como "Samadhi" y "The Zohar Secret" pueden no estar en TMDB
const PELICULAS = [
    { nombre: 'Kung Fu Panda', tmdb_id: 9502 },
    { nombre: 'Kung Fu Panda 3', tmdb_id: 140300 },
    { nombre: 'The Matrix', tmdb_id: 603 },
    { nombre: 'The Matrix Resurrections', tmdb_id: 624860 },
    { nombre: 'Free Guy', tmdb_id: 550988 },
    { nombre: 'Doctor Strange', tmdb_id: 284052 },
    { nombre: 'Men in Black: International', tmdb_id: 479455 },
    { nombre: 'Jupiter Ascending', tmdb_id: 76757 },
    // Documentales - pueden necesitar verificación manual
    // { nombre: 'Samadhi', tmdb_id: null },
    // { nombre: 'The Zohar Secret', tmdb_id: null },
];

// Función para agregar película mediante la API local
async function addMovieViaAPI(tmdbId, sectionId) {
    const response = await fetch(`${LOCAL_API_URL}/movies`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            tmdb_id: tmdbId,
            section_id: sectionId,
        }),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`API error: ${response.status} - ${error}`);
    }

    return response.json();
}

async function main() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        await client.connect();
        console.log('✅ Conectado a la base de datos');

        // 1. Crear/Actualizar la sección
        console.log('\n📝 Creando sección 1...');

        // Verificar si ya existe
        const existingSection = await client.query(
            'SELECT id FROM sections WHERE title = $1',
            [SECCION_1.title]
        );

        let sectionId;
        if (existingSection.rows.length > 0) {
            sectionId = existingSection.rows[0].id;
            console.log(`   Sección "${SECCION_1.title}" ya existe (ID: ${sectionId})`);

            // Actualizar descripción
            await client.query(
                'UPDATE sections SET description = $1 WHERE id = $2',
                [SECCION_1.description, sectionId]
            );
            console.log('   Descripción actualizada');
        } else {
            // Obtener el siguiente order_index
            const lastOrder = await client.query(
                'SELECT COALESCE(MAX(order_index), 0) as max_order FROM sections'
            );
            const orderIndex = lastOrder.rows[0].max_order + 1;

            const result = await client.query(
                `INSERT INTO sections (title, description, order_index) 
                 VALUES ($1, $2, $3) 
                 RETURNING id`,
                [SECCION_1.title, SECCION_1.description, orderIndex]
            );
            sectionId = result.rows[0].id;
            console.log(`   ✅ Sección creada con ID: ${sectionId}`);
        }

        // 2. Agregar películas usando la API local
        console.log('\n🎬 Agregando películas mediante API local (asegúrate de que npm run dev esté corriendo)...');

        for (let i = 0; i < PELICULAS.length; i++) {
            const pelicula = PELICULAS[i];
            console.log(`\n   [${i + 1}/${PELICULAS.length}] ${pelicula.nombre}...`);

            try {
                // Verificar si la película ya está vinculada a esta sección
                const existingLink = await client.query(
                    `SELECT sm.id, m.title 
                     FROM section_movies sm 
                     JOIN movies m ON sm.movie_id = m.id 
                     WHERE sm.section_id = $1 AND m.tmdb_id = $2`,
                    [sectionId, pelicula.tmdb_id]
                );

                if (existingLink.rows.length > 0) {
                    console.log(`      ✓ Ya está en la sección: "${existingLink.rows[0].title}"`);
                } else {
                    // Agregar mediante API local (que maneja TMDB internamente)
                    const movie = await addMovieViaAPI(pelicula.tmdb_id, sectionId);
                    console.log(`      ✅ Agregada: "${movie.title}"`);
                }
            } catch (err) {
                console.error(`      ❌ Error: ${err.message}`);
            }
        }

        console.log('\n✨ ¡Configuración completada!\n');

        // Mostrar resumen
        const movies = await client.query(`
            SELECT m.title, m.release_date, m.vote_average
            FROM movies m
            JOIN section_movies sm ON m.id = sm.movie_id
            WHERE sm.section_id = $1
            ORDER BY sm.order_index
        `, [sectionId]);

        console.log('📊 Resumen de la Sección 1 - "Bolitas 1":');
        console.log(`   Total de películas: ${movies.rows.length}`);
        console.log('\n   Películas:');
        movies.rows.forEach((movie, idx) => {
            const year = movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A';
            const rating = movie.vote_average ? `⭐ ${movie.vote_average.toFixed(1)}` : '';
            console.log(`      ${idx + 1}. ${movie.title} (${year}) ${rating}`);
        });

    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    } finally {
        await client.end();
    }
}

main();
