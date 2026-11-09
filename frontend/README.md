# VINTRA Frontend

Aplicación React + Vite. La pantalla principal consulta la API NestJS y muestra por separado el estado del servicio y la conexión a PostgreSQL.

## Ejecución local

Desde la raíz del repositorio, crea `.env` copiando `.env.example`. El frontend carga `VITE_API_URL` desde ese archivo.

```powershell
cd frontend
npm ci
npm run dev
```

Abre `http://localhost:5173`. La API debe estar disponible en la URL indicada por `VITE_API_URL`.

## Validación

```powershell
npm test
npm run build
```
