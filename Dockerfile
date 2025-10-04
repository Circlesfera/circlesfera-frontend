# Dockerfile para CircleSfera Frontend
FROM node:20-alpine

# Instalar dependencias del sistema
RUN apk add --no-cache libc6-compat wget

# Crear directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar todas las dependencias (incluyendo dev)
RUN npm install

# Copiar código fuente
COPY . .

# Variables de entorno
ENV NEXT_TELEMETRY_DISABLED 1
ENV PORT 3000

# Exponer puerto
EXPOSE 3000

# Comando de inicio para desarrollo
CMD ["npm", "run", "dev"]
