# Imagen base Node.js LTS
FROM node:20-alpine

WORKDIR /app

# Copiar archivos de dependencias
COPY package.json package-lock.json ./

# Instalar solo dependencias de producción
RUN npm ci --omit=dev

# Copiar código de la aplicación
COPY src ./src
COPY views ./views

# Puerto por defecto
ENV PORT=8080
EXPOSE 8080

# La app espera MONGODB_URI y opcionalmente JWT_SECRET, etc. (ver .env.example)
CMD ["node", "src/server.js"]
