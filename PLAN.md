# Plan de Desarrollo - Mente Abundante 🧠✨

## Resumen del Proyecto
**Mente Abundante** es una plataforma de transformación personal que utiliza el poder de las películas para transmitir lecciones de vida. A través de contenido curado y análisis profundo, los usuarios descubren mensajes ocultos en el cine que pueden cambiar su perspectiva y potenciar su mentalidad hacia la abundancia.

## Concepto Central
El cine es una herramienta pedagógica poderosa. Las películas contienen mensajes, metáforas y lecciones que pueden inspirar cambios profundos en la vida de las personas. **Mente Abundante** organiza estos aprendizajes en secciones temáticas, donde cada película es analizada desde la perspectiva del crecimiento personal.

## Stack Tecnológico
- **Frontend**: Next.js 14+ (App Router) con React
- **Styling**: CSS Vanilla con sistema de diseño moderno
- **Base de Datos**: PostgreSQL (Neon)
- **API de Películas**: TMDB (The Movie Database)
- **Videos**: YouTube/Vimeo embeds + opción de subida directa

## Estructura de la Base de Datos

### Tablas

```sql
-- Secciones/Unidades del curso
CREATE TABLE sections (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Películas recomendadas
CREATE TABLE movies (
    id SERIAL PRIMARY KEY,
    tmdb_id INTEGER UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    original_title VARCHAR(255),
    overview TEXT,
    poster_path TEXT,
    backdrop_path TEXT,
    release_date DATE,
    vote_average DECIMAL(3,1),
    runtime INTEGER,
    genres JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Relación sección-película
CREATE TABLE section_movies (
    id SERIAL PRIMARY KEY,
    section_id INTEGER REFERENCES sections(id) ON DELETE CASCADE,
    movie_id INTEGER REFERENCES movies(id) ON DELETE CASCADE,
    order_index INTEGER NOT NULL,
    instructor_notes TEXT,
    UNIQUE(section_id, movie_id)
);

-- Videos del instructor
CREATE TABLE videos (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    video_type VARCHAR(50) NOT NULL, -- 'youtube', 'vimeo', 'uploaded'
    video_url TEXT NOT NULL,
    thumbnail_url TEXT,
    duration INTEGER, -- en segundos
    section_id INTEGER REFERENCES sections(id) ON DELETE CASCADE,
    movie_id INTEGER REFERENCES movies(id) ON DELETE SET NULL,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Proveedores de streaming por película
CREATE TABLE movie_streaming (
    id SERIAL PRIMARY KEY,
    movie_id INTEGER REFERENCES movies(id) ON DELETE CASCADE,
    provider_name VARCHAR(100) NOT NULL,
    provider_logo TEXT,
    link_type VARCHAR(50), -- 'stream', 'rent', 'buy'
    country_code VARCHAR(5) DEFAULT 'MX',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(movie_id, provider_name, link_type)
);
```

## API de TMDB - Endpoints a Usar

1. **Buscar películas**: `GET /search/movie`
2. **Detalles de película**: `GET /movie/{movie_id}`
3. **Proveedores de streaming**: `GET /movie/{movie_id}/watch/providers`
4. **Imágenes**: `GET /movie/{movie_id}/images`

## Estructura de Carpetas

```
/curso-app
├── app/
│   ├── layout.tsx
│   ├── page.tsx (Login)
│   ├── globals.css
│   ├── (app)/
│   │   └── app/
│   │       ├── page.tsx (Dashboard usuario)
│   │       ├── secciones/
│   │       └── peliculas/
│   ├── admin/
│   │   ├── page.tsx (Dashboard)
│   │   ├── secciones/
│   │   ├── peliculas/
│   │   └── videos/
│   └── api/
│       ├── sections/
│       ├── movies/
│       ├── videos/
│       └── tmdb/
├── components/
├── lib/
│   ├── db.ts
│   └── tmdb.ts
└── public/
    └── logo.png
```

## Fases de Desarrollo

### Fase 1: Configuración Base ✅
- [x] Inicializar proyecto Next.js
- [x] Configurar conexión a PostgreSQL
- [x] Crear esquema de base de datos
- [x] Configurar cliente TMDB

### Fase 2: API Backend ✅
- [x] CRUD de secciones
- [x] CRUD de películas (con integración TMDB)
- [x] CRUD de videos
- [x] Obtener streaming providers

### Fase 3: Frontend Público ✅
- [x] Página de login/registro
- [x] Dashboard de usuario
- [x] Vista de secciones
- [x] Detalle de película con streaming
- [x] Reproductor de videos

### Fase 4: Panel de Administración ✅
- [x] Gestión de secciones
- [x] Búsqueda y añadir películas
- [x] Subir/agregar videos

### Fase 5: Branding y UX ✅
- [x] Logo "Mente Abundante"
- [x] Actualización de textos y mensajes
- [x] Enfoque en transformación personal

## Notas Importantes

- **TMDB API Key**: Necesitas registrar una cuenta en themoviedb.org para obtener una API key gratuita
- **JustWatch Attribution**: Al usar datos de streaming de TMDB, se requiere atribución a JustWatch
- **Videos**: Recomiendo usar YouTube/Vimeo para simplicidad y mejor rendimiento
- **Filosofía**: Cada película seleccionada debe tener una lección clara de transformación personal
