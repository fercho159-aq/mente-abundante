import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.menteabundante.app',
  appName: 'Mente Abundante',
  webDir: 'out',
  // Configuración del servidor - usa tu URL de Vercel desplegada
  server: {
    // ⚠️ IMPORTANTE: Cambia esta URL por tu dominio real de Vercel
    url: 'https://mente-abundante.vercel.app',
    cleartext: true,
  },
  // Configuración de Android
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true, // Quitar en producción
  },
  // Configuración de iOS
  ios: {
    contentInset: 'automatic',
    allowsLinkPreview: true,
  },
  // Plugins
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#1a1a2e',
      showSpinner: false,
    },
  },
};

export default config;
