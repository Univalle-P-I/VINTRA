# Backend de VINTRA

API REST con NestJS, TypeORM y PostgreSQL. La configuración de TypeORM mantiene `synchronize: false`; la aplicación no crea ni modifica el esquema.

## Requisitos

- Node.js 24 o superior y npm.
- Docker Compose si se utiliza PostgreSQL localmente.

## Configuración segura del entorno

Desde la raíz del repositorio:

```powershell
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
node -e "console.log(require('node:crypto').randomBytes(48).toString('base64url'))"
```

Genera dos valores aleatorios independientes y reemplaza en `.env` los valores vacíos de `POSTGRES_PASSWORD` y `JWT_SECRET`. No compartas ni confirmes `.env`; el archivo está excluido por `.gitignore`. `JWT_SECRET` debe tener al menos 32 bytes.

Valores locales de referencia:

- `DB_HOST=localhost` y `DB_PORT=5433` al ejecutar el backend desde el host.
- `POSTGRES_PORT=5433` para publicar PostgreSQL solo en `127.0.0.1`.
- `PORT=3002` y `VITE_API_URL=http://localhost:3002`.
- `CORS_ORIGIN=http://localhost:5173,http://localhost:5174` admite Vite local y el frontend de Compose.

## Ejecutar en desarrollo

El esquema y las migraciones del PR #115 son provisionales y no se ejecutan automáticamente. Para levantar únicamente la base local:

```powershell
docker compose up -d postgres
```

En otra terminal:

```powershell
Set-Location backend
npm ci
npm run start:dev
```

La API escucha en `http://localhost:3002`. Comprueba:

```powershell
Invoke-RestMethod http://localhost:3002/health
Invoke-RestMethod http://localhost:3002/health/db
```

`/health/db` comprueba conectividad, no que el esquema o las migraciones estén instalados.

## Docker Compose

Después de completar `POSTGRES_PASSWORD` y `JWT_SECRET` en `.env`, desde la raíz:

```powershell
docker compose up --build
```

El frontend se publica en `http://localhost:5174`, la API en `http://localhost:3002` y PostgreSQL/PostGIS en `localhost:5433`. Los puertos se enlazan a loopback. Compose conserva el volumen existente `postgres_data`; no ejecuta migraciones ni inicializa tablas.

## Swagger / OpenAPI

- Swagger UI: `http://localhost:3002/api/docs`
- Documento OpenAPI JSON: `http://localhost:3002/api/docs-json`

Los endpoints se agrupan por módulo. Las operaciones protegidas indican Bearer JWT y roles. Para probarlas:

1. Ejecuta `POST /api/v1/auth/login` con `email` y `password`.
2. Copia `accessToken` de la respuesta.
3. Pulsa **Authorize** en Swagger UI e introduce el token como Bearer.
4. Prueba las rutas protegidas disponibles para el rol de esa cuenta.

La documentación se genera desde los DTO y sus validaciones. Solo se incluyen controladores realmente implementados; los flujos de recuperación de contraseña y validación de correo no tienen endpoints activos.

El inventario completo está en [`../docs/API_SPECIFICATION.md`](../docs/API_SPECIFICATION.md).

## Patrón de referencia

Usa **Autenticación** como referencia para un módulo que necesita controles de seguridad:

- `autenticacion.module.ts` registra repositorios y el módulo JWT.
- `autenticacion.controller.ts` define rutas, DTO y metadatos OpenAPI.
- `autenticacion.service.ts` concentra la lógica de login/logout, Argon2id y sesión.
- `jwt-auth.guard.ts`, `roles.guard.ts` y los decoradores compartidos protegen las rutas.
- Las pruebas unitarias mockean servicios/repositorios; no requieren PostgreSQL.

En módulos operativos, conserva la separación `*.module.ts`, `*.controller.ts`, `*.service.ts`, `dto/` y `entidades/`. Valida inputs con DTO, usa repositorios inyectados para persistencia y `ContextoAuditoriaService` para las operaciones auditadas.

## Validación

Desde `backend/`:

```powershell
npm run build
npm run lint
npm test -- --runInBand
```

Estas pruebas no son una integración real con PostgreSQL. No ejecutes migraciones del PR abierto sin aprobación del equipo de BD.
