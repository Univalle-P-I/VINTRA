# Frontend

Guía de la aplicación web de VINTRA y de su integración con el backend.

## Stack y requisitos

- React con Vite y componentes en JavaScript/TypeScript.
- Axios para consultar la API.
- Node.js 22.13 o superior; CI usa Node.js 22 y el Dockerfile usa Node.js 22 Alpine.
- npm con las versiones fijadas en [frontend/package-lock.json](../../frontend/package-lock.json).

## Estructura actual

```text
frontend/
├── Dockerfile
├── index.html
├── package.json
├── vite.config.js
├── public/                 # Recursos estáticos
└── src/
    ├── main.jsx            # Punto de entrada
    ├── App.jsx             # Navegación entre landing, acceso y consola
    ├── LandingPage.tsx
    ├── LoginPage.tsx
    ├── Shell.tsx           # Navegación administrativa
    ├── AdminPanel.tsx
    ├── FleetPanel.tsx
    ├── PeoplePanel.tsx
    ├── RoutePanel.tsx
    ├── OperationsPanel.tsx
    ├── ConnectionStatus.jsx
    ├── ui.tsx              # Componentes compartidos
    ├── styles/
    └── test/
```

La separación en carpetas `components/`, `views/`, `context/` y `services/` es una posible evolución; esas carpetas todavía no existen en esta versión.

## Integración y alcance

[ConnectionStatus.jsx](../../frontend/src/ConnectionStatus.jsx) lee `VITE_API_URL` y consulta `GET /health` y `GET /health/db` mediante Axios. Los contratos implementados se describen en la [guía de ejecución del backend](../../backend/README.md). Las propuestas de endpoints adicionales se mantienen en la [documentación del backend](../backend/README.md).

El acceso de la consola es una simulación visual: todavía no autentica contra la API. Los registros de flota, personal, rutas y recorridos se mantienen en el estado local de cada pantalla y no tienen persistencia. El mapa, el seguimiento y las notificaciones requieren integración posterior.

## Ejecución y validación

Sigue el [README raíz](../../README.md#ejecutar-frontend-y-api-en-modo-desarrollo) para preparar `.env`, PostgreSQL y el origen CORS de desarrollo. Desde `frontend/`:

```bash
npm ci
npm run dev
```

Para validar y compilar:

```bash
npm run lint
npm test
npm run build
npm run preview
```

Vite genera la salida de producción en `frontend/dist/`. `VITE_API_URL` y `VITE_BASE_PATH` se fijan durante la compilación; cambia esos valores antes de construir la imagen para cada entorno.

## Responsabilidad documental

- Estado: `En revisión`.
- Responsable: Célula Backend / Frontend, con aportes de UI/UX.
- Mantén aquí las rutas, pantallas, roles visibles, estados de error y criterios de accesibilidad.
- Enlaza las decisiones compartidas desde [arquitectura](../arquitectura/README.md) y los flujos desde [UI/UX](../ui-ux/README.md).
