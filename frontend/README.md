# Frontend de VINTRA

Aplicación React + Vite para la gestión de la recolección de residuos en Buenaventura. Incluye una landing pública, un inicio de sesión demostrativo y paneles por perfil.

## Ejecución local

Desde la raíz del repositorio, crea `.env` copiando `.env.example` y configura `VITE_API_URL` para consultar el estado de la API.

```powershell
cd frontend
npm ci
npm run dev
```

Abre `http://localhost:5173`. La aplicación también permite navegar por los paneles sin API; el estado del servicio y PostgreSQL aparece en el resumen del administrador.

## Alcance de la demostración

- Las credenciales son simuladas; cualquier usuario y contraseña permite entrar. Los roles solo controlan qué muestra la interfaz y no sustituyen la autorización del backend.
- Los registros creados en los módulos se conservan en memoria mientras dure la sesión de la aplicación.
- El mapa de la landing muestra rutas ilustrativas sobre calles de OpenStreetMap. El mapa operativo queda sin capas hasta que la API entregue geometrías y posiciones.
- Los mapas requieren conexión para cargar teselas de OpenStreetMap; la landing consulta Overpass si no encuentra datos de calles en caché o en el archivo estático opcional.

## Validación

```powershell
npm run lint
npm test
npm run build
```
