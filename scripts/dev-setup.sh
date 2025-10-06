#!/bin/bash

# Script de setup para desarrollo local - Frontend CircleSfera
# Este script configura el entorno de desarrollo automáticamente

set -e

echo "🚀 Configurando entorno de desarrollo - CircleSfera Frontend"
echo "============================================================="

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para mostrar mensajes
info() {
    echo -e "${GREEN}✓${NC} $1"
}

warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

error() {
    echo -e "${RED}✗${NC} $1"
}

# 1. Verificar Node.js
echo ""
echo "1️⃣ Verificando Node.js..."
if ! command -v node &> /dev/null; then
    error "Node.js no está instalado. Por favor instala Node.js >= 18.0.0"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    error "Node.js versión $NODE_VERSION detectada. Se requiere >= 18.0.0"
    exit 1
fi

info "Node.js $(node -v) detectado"

# 2. Verificar npm
echo ""
echo "2️⃣ Verificando npm..."
if ! command -v npm &> /dev/null; then
    error "npm no está instalado"
    exit 1
fi
info "npm $(npm -v) detectado"

# 3. Instalar dependencias
echo ""
echo "3️⃣ Instalando dependencias..."
npm install
info "Dependencias instaladas correctamente"

# 4. Verificar .env.local
echo ""
echo "4️⃣ Verificando variables de entorno..."
if [ ! -f .env.local ]; then
    warn "Archivo .env.local no encontrado"
    if [ -f .env.example ]; then
        cp .env.example .env.local
        info "Archivo .env.local creado desde .env.example"
        warn "⚠️  IMPORTANTE: Configura las variables en .env.local antes de continuar"
    else
        error "No se encontró .env.example. Crea un archivo .env.local manualmente"
        exit 1
    fi
else
    info "Archivo .env.local encontrado"
fi

# 5. Limpiar cache de Next.js
echo ""
echo "5️⃣ Limpiando cache de Next.js..."
rm -rf .next
info "Cache limpiado"

# 6. Verificar linting
echo ""
echo "6️⃣ Verificando linting..."
if npm run lint; then
    info "Linting verificado correctamente"
else
    warn "Hay errores de linting. Ejecuta 'npm run lint:fix' para corregirlos"
fi

# 7. Verificar tipos TypeScript
echo ""
echo "7️⃣ Verificando tipos TypeScript..."
if npm run type-check; then
    info "Tipos verificados correctamente"
else
    warn "Hay errores de tipos. Revisa la salida arriba"
fi

# 8. Generar iconos PWA
echo ""
echo "8️⃣ Generando iconos PWA..."
if [ -f scripts/generate-icons.js ]; then
    node scripts/generate-icons.js
    info "Iconos PWA generados"
fi

echo ""
echo "============================================================="
echo -e "${GREEN}✅ Setup completado exitosamente!${NC}"
echo ""
echo "📝 Próximos pasos:"
echo "  1. Configura las variables en .env.local"
echo "  2. Asegúrate de que el backend esté corriendo"
echo "  3. Ejecuta 'npm run dev' para iniciar el servidor"
echo "  4. Abre http://localhost:3000"
echo ""
echo "🔧 Comandos útiles:"
echo "  npm run dev         - Iniciar servidor en modo desarrollo"
echo "  npm run build       - Build de producción"
echo "  npm run lint        - Verificar código"
echo "  npm run type-check  - Verificar tipos"
echo "  npm run check       - Ejecutar todas las verificaciones"
echo ""

