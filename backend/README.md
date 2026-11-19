# VINTRA API

API REST base con NestJS. `GET /health` confirma que responde el backend y `GET /health/db` ejecuta una consulta real a PostgreSQL.

## Ejecución local

Desde la raíz del repositorio, copia `.env.example` a `.env` y arranca PostgreSQL:

```powershell
docker compose up -d postgres
cd backend
npm ci
$env:CORS_ORIGIN = 'http://localhost:5173'
npm run start:dev
```

La API escucha en `http://localhost:3002`. Comprueba el servicio y la base de datos con:

```powershell
Invoke-RestMethod http://localhost:3002/health
Invoke-RestMethod http://localhost:3002/health/db
```

## JWT

Las rutas requieren un bearer token JWT por defecto. Las rutas públicas se marcan
con `@Public()`; por ejemplo, el controlador de health. Para leer la identidad
validada dentro de un controlador, usa `@CurrentUser() user: AuthenticatedUser`.
`@Roles(...)` permite restringir una ruta a uno o más roles. Los tokens de acceso
se firman con HS256 y duran 15 minutos por defecto; configura `JWT_SECRET` con un
secreto aleatorio de al menos 32 caracteres y opcionalmente
`JWT_ACCESS_TOKEN_TTL` en formato como `15m` o `1h`.

La estrategia todavía no consulta la cuenta en la base de datos: hasta que exista
esa capa, valida la firma, expiración, subject y roles del token y construye una
identidad mínima. La autenticación de credenciales, refresh y revocación de
sesiones requieren esa capa y quedan fuera de este guard.

## Validación

```powershell
npm test -- --runInBand
npm run build
```
