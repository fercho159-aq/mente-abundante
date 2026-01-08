// Configuración para ambiente móvil y web
// En producción móvil, usa la URL de tu backend desplegado
// En desarrollo web, usa rutas relativas

const isCapacitor = typeof window !== 'undefined' &&
    (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor?.isNativePlatform?.();

// Cambia esta URL por la de tu backend desplegado en Vercel
export const API_BASE_URL = isCapacitor
    ? 'https://mente-abundante.vercel.app' // Tu URL de Vercel
    : '';

export const getApiUrl = (path: string): string => {
    return `${API_BASE_URL}${path}`;
};

export const config = {
    apiBaseUrl: API_BASE_URL,
    isNative: isCapacitor,
};
