# VINTRA API

API REST base con NestJS. `GET /health` confirma que responde el backend y `GET /health/db` ejecuta una consulta real a PostgreSQL.

## Ejecución local

Desde la raíz del repositorio, copia `.env.example` a `.env` y arranca PostgreSQL:

```powershell
docker compose up -d postgres
cd vintra-api
npm ci
npm run start:dev
```

La API escucha en `http://localhost:3002`. Comprueba el servicio y la base de datos con:

```powershell
Invoke-RestMethod http://localhost:3002/health
Invoke-RestMethod http://localhost:3002/health/db
```

## Validación

```powershell
npm test -- --runInBand
npm run build
```
