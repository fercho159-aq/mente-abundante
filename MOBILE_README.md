# 📱 Mente Abundante - App Móvil

Este proyecto incluye configuración para generar aplicaciones nativas de Android e iOS usando **Capacitor**.

## 🚀 Requisitos

### Para Android:
- [Android Studio](https://developer.android.com/studio) instalado
- JDK 17 o superior
- Android SDK

### Para iOS:
- macOS con Xcode instalado
- Xcode Command Line Tools
- CocoaPods (`sudo gem install cocoapods`)

## 📦 Instalación

```bash
npm install
```

## 🔧 Configuración

1. **Edita `capacitor.config.ts`** y cambia la URL del servidor por tu dominio de Vercel:
```typescript
server: {
  url: 'https://TU-DOMINIO.vercel.app',
  cleartext: true,
}
```

2. **Sincroniza los cambios:**
```bash
npx cap sync
```

## 📱 Abrir en IDE

### Android Studio:
```bash
npm run cap:android
# o: npx cap open android
```

### Xcode (iOS):
```bash
npm run cap:ios
# o: npx cap open ios
```

## 🏗️ Compilar las Apps

### Android (APK/AAB):

1. Abre Android Studio:
```bash
npx cap open android
```

2. En Android Studio:
   - **Build > Generate Signed Bundle / APK**
   - Sigue el asistente para crear tu keystore
   - Genera APK para distribución o AAB para Play Store

### iOS (IPA):

1. Abre Xcode:
```bash
npx cap open ios
```

2. En Xcode:
   - Configura tu Team en Signing & Capabilities
   - **Product > Archive**
   - Distribuye a App Store o exporta para pruebas

## 🎨 Personalizar Iconos

### Método recomendado:

1. Instala el plugin de recursos:
```bash
npm install @capacitor/assets --save-dev
```

2. Coloca tu logo en `/resources/icon.png` (1024x1024 mínimo)

3. Genera los íconos:
```bash
npx capacitor-assets generate --iconBackgroundColor '#1a1a2e' --splashBackgroundColor '#1a1a2e'
```

### Método manual:
- Android: Edita los archivos en `android/app/src/main/res/`
- iOS: Edita `ios/App/App/Assets.xcassets/AppIcon.appiconset/`

## 🔄 Workflow de Desarrollo

1. Desarrolla la web normalmente: `npm run dev`
2. Despliega a Vercel
3. La app móvil cargará automáticamente los cambios (carga desde la URL de Vercel)

## ⚠️ Notas Importantes

- La app carga tu sitio web desde Vercel (modo WebView)
- Cualquier cambio en el backend se refleja automáticamente
- Para modo offline, necesitarías convertir a exportación estática

## 📋 Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia servidor de desarrollo web |
| `npm run build` | Compila la app web |
| `npm run cap:sync` | Sincroniza cambios con proyectos nativos |
| `npm run cap:android` | Abre proyecto en Android Studio |
| `npm run cap:ios` | Abre proyecto en Xcode |

## 🐛 Solución de Problemas

### La app muestra pantalla en blanco
- Verifica que tu sitio esté desplegado en Vercel
- Comprueba la URL en `capacitor.config.ts`

### Error de certificado SSL
- Asegúrate de usar HTTPS en producción
- En desarrollo, `cleartext: true` permite HTTP

### Los cambios no se reflejan
- Ejecuta `npx cap sync` después de cambios en configuración
- Limpia cache de la app en el dispositivo
