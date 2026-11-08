# VINTRA Frontend

Aplicación React + Vite. La pantalla principal consulta la API NestJS y muestra por separado el estado del servicio y la conexión a PostgreSQL.

## Requisitos y ejecución local

Usa Node.js 22.12+ o Node.js 24 y npm, en concordancia con Vite 8 y CI.

Desde `frontend/`, crea `.env` copiando `.env.example`. Vite carga `VITE_API_URL` desde el directorio del frontend. La raíz tiene otro `.env.example` para Docker Compose y el backend.

```powershell
cd frontend
Copy-Item .env.example .env
npm ci
npm run dev
```

Abre `http://localhost:5173`. La API debe estar disponible en la URL indicada por `VITE_API_URL`.

## Validación

```powershell
npm test
npm run lint
npm run build
```
