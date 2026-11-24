# Rediseño de interfaz y experiencia de usuario

Resumen de lo implementado en el frontend y de lo que depende del backend.

## Sistema visual

- Una sola hoja para el panel: `frontend/src/styles/app.css` (tokens, layout y componentes). La landing y el login tienen su propia hoja (`landing-home.css`, `login-page.css`).
- Identidad: verde `#075c42`, azul océano para el mapa, ámbar solo para alertas. Tipografía del sistema (sin dependencias).
- Estados siempre con forma + texto (no solo color).
- Componentes compartidos en `src/ui.tsx`: botón, campo con error, tabla accesible (se apila en móvil), insignia, estado vacío, modal con foco gestionado y aviso de confirmación (`useToast.tsx`).

## Navegación y perfiles

`src/navigation.ts` define el menú de cada rol y qué módulos puede **gestionar** (`CAN_MANAGE`).

| Perfil | Ve | Gestiona |
| --- | --- | --- |
| Administrador | Resumen, operación, flota, personal, rutas, mapa | Todo |
| Jefe de operaciones | Los mismos módulos | Solo operación (flota, personal y rutas en consulta) |
| Conductor | Mi recorrido | — |
| Ciudadano | Rutas y horarios | **Próximamente** (deshabilitado en el login) |

> La autenticación no existe todavía: el perfil elegido en el login solo simula qué parte de la interfaz se muestra. Los permisos reales deben definirse en el backend.

## Módulos y modelo de datos

| Módulo | Entidades de referencia |
| --- | --- |
| Flota | `vehicle`, `vehicle_status`, `vehicle_type` (estado operativo e `is_active` son campos distintos) |
| Personal | `profile`, `user_account`, `user_role`, `user_data`, `crew`, `crew_member` |
| Rutas | `macroroute`, `microroute`, `schedule`, `microroute_schedule` |
| Operación | `assignment` (cuadrilla + microrruta + vehículo + estado + fecha); las horas provienen de `schedule` y la validación temporal depende del contrato acordado |
| Mapa | `macroroute.geom`, `microroute.geom`, `btura_neighborhood.geom`, `vehicle_position` (vinculada a `assignment`) |

Los datos viven en memoria de la sesión (`src/store.tsx`) hasta que existan endpoints. Los catálogos de estado y tipo de vehículo están aislados en `src/domain.ts` y deben sustituirse por la consulta real.

Las asignaciones nuevas se rechazan si reutilizan una cuadrilla o un vehículo en un intervalo que se solapa con una asignación existente. Los intervalos consecutivos sí se permiten.

El mapeo de esta interfaz toma como referencia `docs/DATABASE_DESIGN.md`. El diagrama de Lucid compartido no fue accesible desde el navegador de esta sesión; se debe contrastar con ese diagrama antes de cerrar el contrato de API.

## Mapa

- Leaflet + OpenStreetMap, cargado de forma diferida (`MapView.tsx` → `RouteMap.tsx`). Centro aproximado de Buenaventura en `src/mapData.ts`.
- Capas: macrorrutas, microrrutas, barrios y posiciones, con leyenda y detalle al seleccionar.
- Sin datos muestra el mapa base y explica qué falta. No se dibuja ninguna ruta inventada.
- Las teselas públicas de OSM sirven para desarrollo; en producción usar un proveedor propio.

## Landing y login

La landing tiene dos animaciones **distintas e independientes**, ambas automáticas (sin clics):

- **Portada** (`HeroRoutes.tsx` + `fleet.ts`): tres capas inclinadas con calles esquemáticas; los camiones salen solos hacia un punto, que se marca como destino. Es decorativa (`aria-hidden`) y no representa datos reales.
- **Mapa de Buenaventura** (`LandingMap.tsx`, `streets.ts`, `loadStreets.ts`): mapa real de OpenStreetMap con tres rutas de **demostración** generadas sobre calles reales y un camión por ruta que va y vuelve. Se rotula "Simulación ilustrativa". Las rutas se distinguen por color y por trazo (continua, rayada, punteada).

Cómo obtiene las calles (`loadStreets.ts`), en este orden:

1. Caché local (`localStorage`, 7 días).
2. Archivo estático opcional `frontend/public/data/buenaventura-streets.json`, con la misma forma que la respuesta de Overpass.
3. Consulta a Overpass (`overpass-api.de`) de las vías transitables del casco urbano (`STREETS_BBOX` en `streets.ts`).

> Para producción conviene guardar la respuesta de Overpass en el archivo estático (opción 2) y no depender de una instancia pública. Si no hay calles disponibles, el mapa muestra su base y un aviso con "Reintentar".

El mapa solo se descarga cuando la sección entra en pantalla. El scroll de la rueda no hace zoom (para no atrapar el desplazamiento de la página).

Login: perfil en chips, usuario, contraseña (con mostrar/ocultar) y una sola nota.

## Animaciones

Solo CSS y un bucle `requestAnimationFrame` en la simulación; entre 140 y 520 ms.

- Entre pantallas (landing → login → panel): la actual sale deslizándose y desvaneciéndose y la nueva entra escalonada (`App.jsx`, `styles/app.css`).
- Dentro del panel: los bloques de cada módulo entran en cascada.
- Revelado al desplazarse en la landing (`useReveal.ts`), cifras con cuenta progresiva, modales y avisos.
- `prefers-reduced-motion`: sin transiciones entre pantallas, camiones quietos en la portada y en el mapa, y contenido visible de inmediato.

## Pendiente (depende del backend)

- Endpoints de negocio y autenticación; hoy `/health` es lo único que existe.
- Geometrías de rutas y barrios, y orden de visita (`microroute_neighborhood`).
- Para mostrar vehículo y microrruta junto a una posición, la API debe resolver `vehicle_position.assignment_id` y sus relaciones con `vehicle` y `microroute`.
- Alinear el contrato de asignación con `scheduled_date`, `started_at`, `ended_at` y los horarios `schedule`/`microroute_schedule`; el diccionario no define una FK directa de `assignment` al horario.
- Campos `created_by` / `updated_by` en listados.
- Acciones del conductor (iniciar y finalizar recorrido) y la vista de ciudadano.

## Verificación

- Frontend: `npm test`, `npm run lint`, `npm run build`.
- Backend: `npm test` requiere **Node 24** (ver `backend/Dockerfile`); con Node 22 las suites fallan por módulos ESM.
