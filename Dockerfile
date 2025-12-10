# ============================================
# STAGE 1: Build de la aplicación Angular
# ============================================
FROM node:22-alpine AS build

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci --silent

# Copiar código fuente
COPY . .

# Build de producción
RUN npm run build

# ============================================
# STAGE 2: Servidor nginx para producción
# ============================================
FROM nginx:alpine

# Copiar configuración personalizada de nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Copiar archivos compilados desde el stage de build
COPY --from=build /app/dist/ek-final-ui/browser /usr/share/nginx/html

# Exponer puerto 80
EXPOSE 80

# Comando de inicio
CMD ["nginx", "-g", "daemon off;"]
