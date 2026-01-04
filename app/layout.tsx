import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-sans',
    display: 'swap',
});

const outfit = Outfit({
    subsets: ['latin'],
    variable: '--font-display',
    display: 'swap',
});

export const metadata: Metadata = {
    title: 'Mente Abundante | Transforma tu Vida a través del Cine',
    description: 'Descubre lecciones de vida poderosas a través de los mensajes de las películas. Transforma tu mentalidad y alcanza la abundancia.',
    keywords: 'mente abundante, transformación personal, lecciones de vida, películas, crecimiento personal, mentalidad de abundancia',
    openGraph: {
        title: 'Mente Abundante | Transforma tu Vida a través del Cine',
        description: 'Descubre lecciones de vida poderosas a través de los mensajes de las películas',
        type: 'website',
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="es" className={`${inter.variable} ${outfit.variable}`} suppressHydrationWarning>
            <body suppressHydrationWarning>{children}</body>
        </html>
    );
}
