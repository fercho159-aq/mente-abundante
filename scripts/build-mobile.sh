#!/bin/bash

# Script para build móvil de Mente Abundante
# Mueve temporalmente las carpetas que no son compatibles con export estático

echo "🚀 Iniciando build móvil..."

# Crear directorio temporal
mkdir -p .mobile-temp

# Mover carpetas que tienen código de servidor
echo "📦 Moviendo carpetas de servidor temporalmente..."
mv app/api .mobile-temp/api 2>/dev/null || true
mv app/admin .mobile-temp/admin 2>/dev/null || true

# Ejecutar build
echo "🔨 Ejecutando build..."
MOBILE_BUILD=true npm run build
BUILD_RESULT=$?

# Restaurar carpetas
echo "📦 Restaurando carpetas..."
mv .mobile-temp/api app/api 2>/dev/null || true
mv .mobile-temp/admin app/admin 2>/dev/null || true
rmdir .mobile-temp 2>/dev/null || true

if [ $BUILD_RESULT -eq 0 ]; then
    echo "✅ Build completado exitosamente!"
    echo "📱 Ejecutando: npx cap sync"
    npx cap sync
else
    echo "❌ Error en el build"
    exit 1
fi
