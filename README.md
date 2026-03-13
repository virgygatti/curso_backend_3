# Backend E-commerce (Proyecto Final)

API REST para proyecto final de Coderhouse: sesiones, usuarios, productos, carritos, logger, mocks, documentación Swagger y tests.

## Requisitos

- Node.js 18+
- MongoDB (local o Atlas)

## Instalación

```bash
npm install
cp .env.example .env
# Editar .env con tu MONGODB_URI y, en producción, JWT_SECRET
```

## Ejecución

```bash
# Desarrollo
npm run dev

# Producción
npm start

# Tests (requiere MongoDB)
npm test
```

## Variables de entorno

Ver `.env.example`. Las principales:

- **MONGODB_URI**: URI de conexión a MongoDB.
- **PORT**: Puerto del servidor (default 8080).
- **JWT_SECRET**: Secreto para firmar el JWT (cambiar en producción).
- **NODE_ENV**: `development` o `production` (afecta al logger).

## Rutas principales

- `GET /api-docs` – Documentación Swagger (Sessions, Users, Products, Carts).
- `GET /loggerTest` – Prueba de niveles del logger.
- `POST /api/sessions/register`, `POST /api/sessions/login`, etc.
- `GET/POST /api/products`, `GET/POST /api/carts`, `GET/POST /api/users`.
- `POST /api/users/:uid/documents` – Subida de documentos (Multer).
- `GET/POST /api/mocks/*` – Mocks (mockingusers, mockingproducts, generateData).

## Docker

### Construir la imagen

```bash
docker build -t backend-ecommerce .
```

### Ejecutar el contenedor

```bash
docker run -p 8080:8080 \
  -e MONGODB_URI="mongodb+srv://user:pass@cluster.mongodb.net/backend3" \
  -e JWT_SECRET="tu-secreto-seguro" \
  backend-ecommerce
```

La aplicación escucha en el puerto 8080. MongoDB debe ser accesible desde el contenedor (Atlas o red del host).

### Imagen en Docker Hub

**Imagen Docker:** [virgygatti/backend-ecommerce](https://hub.docker.com/r/virgygatti/backend-ecommerce)

```bash
docker pull virgygatti/backend-ecommerce
```

## Tests

```bash
npm test
```

Requiere MongoDB (usa `MONGODB_URI` o `MONGODB_URI_TEST`; por defecto base de datos `backend3_test`).
