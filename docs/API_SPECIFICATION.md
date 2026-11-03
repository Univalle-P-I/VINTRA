# Especificación de API de VINTRA

## Estado y convenciones

Contrato propuesto para discutir con frontend y backend. El issue #66 pide cerrar rutas, JSON, errores, validaciones, permisos y OpenAPI. No se debe presentar como API ya implementada. Las PR #47/#49/#50 aún están abiertas; #47 propone NestJS y health checks; deben alinearse sus nombres/rutas con el contrato aprobado.

- Prefijo sugerido: `/api/v1`; publicar OpenAPI desde la aplicación y versionar cambios incompatibles.
- JSON UTF-8. Fechas en ISO 8601 con zona/offset explícito; la zona operativa debe aprobarse. IDs opacos y estables, sin exponer detalles de base.
- Paginación solo para colecciones que la necesiten; definir límites máximos configurables/aprobados y orden estable antes de implementación (#66). No introducir un tamaño arbitrario en el código.
- Filtros permitidos documentados por recurso. DTOs con lista permitida; rechazar propiedades desconocidas en operaciones de escritura.
- La autenticación está pendiente de #54/#71. En los ejemplos `Bearer` es marcador de contrato, no elección final de mecanismo.
- Las rutas de operación siguientes son candidatas conforme al MVP modelado; mantenerlas pendientes hasta depurar HUs y aprobar modelo (#55/#63).

## Formato de errores

```json
{
  "statusCode": 400,
  "code": "VALIDATION_ERROR",
  "message": "La solicitud contiene campos no válidos.",
  "details": [{"field": "capacity", "reason": "Debe cumplir la unidad y el rango aprobados."}],
  "requestId": "id-de-correlacion"
}
```

`details` no debe incluir SQL, stack traces, secretos ni datos personales. Códigos de dominio candidatos: `AUTHENTICATION_REQUIRED`, `FORBIDDEN`, `NOT_FOUND`, `CONFLICT`, `VALIDATION_ERROR`, `DEPENDENCY_UNAVAILABLE`, `INTERNAL_ERROR`. El catálogo definitivo se revisa en #66.

## Health checks

### `GET /health`

Comprueba que el proceso responde. No requiere autenticación si el entorno necesita health checks del orquestador; la política de exposición debe confirmarse. No consulta ni revela datos de la DB.

Respuesta `200`:

```json
{"status":"ok"}
```

### `GET /health/db`

Comprueba disponibilidad de la conexión PostgreSQL para readiness. No muestra host, nombre de base, usuario ni error técnico.

Respuesta `200`: `{"status":"ok","dependencies":{"database":"ok"}}`.
Respuesta `503`: `{"status":"error","dependencies":{"database":"unavailable"},"requestId":"..."}`.

La PR #47 propone ambos chequeos. Confirmar la ruta exacta con #66 y mantener el chequeo de DB separado del liveness.

## Autenticación

La autenticación no está aprobada. No definir endpoints `login`, refresh o recuperación hasta seleccionar método, expiración, almacenamiento y flujo de identidad (#54/#71). Una vez aprobada, definir aquí request/response, cookies o token, revocación y códigos de respuesta. Las operaciones protegidas requieren identidad y permiso explícito según matriz #70.

## Recursos candidatos del MVP

Ejemplo de esquema genérico para vehículos, que el issue #66 propone como ejemplo a validar:

### `GET /api/v1/vehicles`

Consulta vehículos; parámetros candidatos `status`, `type`, `cursor`/`page` definidos al aprobar paginación. Permiso sugerido: `vehicles:read` según #70.

`200`:

```json
{"items":[{"id":"veh_...","identifier":"...","type":"...","capacity":{"value":0,"unit":"..."},"status":"..."}],"page":{"nextCursor":null}}
```

Los valores `...` se reemplazan por campos/catálogos aprobados; `0` ilustra tipo numérico y no es valor válido de negocio.

### `POST /api/v1/vehicles`

Permiso sugerido: `vehicles:create`.

Request conceptual:

```json
{"identifier":"...","type":"...","capacity":{"value":1,"unit":"unidad-aprobada"}}
```

Validar campos requeridos, identificador duplicado, formato, tipo permitido, unidad y rango aprobado. Respuestas `201`, `400`, `401`, `403`, `409`.

### `GET /api/v1/vehicles/{vehicleId}`

Devuelve vehículo o `404`; no filtra información interna.

### `PATCH /api/v1/vehicles/{vehicleId}`

Actualiza campos expresamente permitidos. Proteger cambios de estado con reglas aprobadas. Respuestas `200`, `400`, `401`, `403`, `404`, `409`.

### `GET /api/v1/routes` y `POST /api/v1/routes`

Rutas de API candidatas. El diccionario de BD propone `macroroute` (nombre y geometría de área), `microroute` (macroruta, nombre y geometría de trayecto), `btura_neighborhood` (comuna, nombre y geometría) y relaciones de microruta con barrios/horarios. Los nombres HTTP, campos públicos, alcance GIS y operaciones CRUD se cierran con BD/producto en #54/#63/#66/#78/#79. Si se aprueba geometría, el contrato debe fijar SRID y formato; no aceptar coordenadas sin referencia espacial.

### `GET /api/v1/assignments` y `POST /api/v1/assignments`

`POST` es una operación transaccional. El diccionario de BD propone `microroute_id`, `crew_id`, `vehicle_id`, `assignment_status_id` y `scheduled_date`, con `started_at`/`ended_at` opcionales. El contrato final debe alinearse con esos campos aprobados y resolver cómo se selecciona el horario, porque `assignment` no incluye una referencia a `microroute_schedule`. La hoja propone una asignación única por microruta y fecha; confirmar que no bloquee el segundo viaje de HU11 antes de crear esa restricción. Respuestas candidatas: `201`, `400`, `401`, `403`, `404`, `409` y `503`.

Validaciones obligatorias una vez fijadas reglas: disponibilidad, compatibilidad, conflicto temporal, estado habilitado, referencias válidas y concurrencia. Una respuesta `409` debe identificar el conflicto con un código seguro y accionable. No permitir que dos solicitudes concurrentes creen la misma asignación incompatible; usar transacción y restricción/estrategia aprobada.

### `GET /api/v1/assignments/{assignmentId}`

Consulta asignación y estado autorizado. `404` si no existe o no puede exponerse según política de seguridad.

### Auditoría y órdenes

`GET /api/v1/assignments/{assignmentId}/history` y `GET /api/v1/work-orders/{id}` son candidatos sujetos a #84/#85 y autorización. No exponer historial a todo rol por defecto. Impresión de orden es P2 según issue #85, no parte del contrato inicial hasta priorización.

## Matriz preliminar de permisos

| Recurso/acción | Permiso candidato | Validación de acceso |
| --- | --- | --- |
| Consultar vehículos/rutas | `vehicles:read`, `routes:read` | Sesión/identidad y rol con acción autorizada |
| Crear/editar vehículos | `vehicles:create`, `vehicles:update` | Roles admin definidos por #70 |
| Consultar personal/cuadrillas | `staff:read`, `crews:read` | Minimizar campos personales |
| Crear/editar asignación | `assignments:create`, `assignments:update` | Actor autorizado y reglas transaccionales |
| Leer auditoría | `assignments:audit:read` | Solo roles aprobados; registrar acceso si política lo exige |

Esto es vocabulario de propuesta, no roles confirmados. El issue #70 define que en MVP solo se consideran roles administrativos; los roles públicos/de campo requieren aprobación de alcance.

## Códigos HTTP

| Código | Uso |
| --- | --- |
| `200` | Consulta o actualización exitosa |
| `201` | Recurso creado |
| `204` | Éxito sin cuerpo, solo si contrato lo requiere |
| `400` | JSON, parámetros o validación de dominio inválidos |
| `401` | Falta autenticación válida |
| `403` | Identidad sin permiso |
| `404` | Recurso inexistente/no visible |
| `409` | Duplicado o conflicto de estado/operación |
| `422` | Solo si se acuerda diferenciar validación semántica de `400` |
| `500` | Error inesperado sin detalles internos |
| `503` | Dependencia necesaria no disponible |

Elegir entre `400` y `422` para validación semántica en #66; no emitir ambos inconsistentemente.

## Validación, observabilidad y compatibilidad

- Validar en borde con DTO y repetir invariantes críticos en dominio/DB.
- `requestId` generado o propagado de forma segura para correlación.
- No registrar credenciales, tokens, documentos personales o payloads completos sensibles.
- OpenAPI debe incluir esquemas, ejemplos inocuos, códigos de error y seguridad por operación.
- Cambios aditivos compatibles dentro de versión; cambios que rompen clientes requieren migración/versionado anunciado.
- SonarQube revisa calidad del backend propuesto por PR #47; la cobertura debe importarse desde el pipeline y el quality gate bloquear PR según política aprobada. Sonar no valida que un contrato sea correcto ni sustituye pruebas.

## Alineación con el diccionario de BD

El diccionario compartido por el equipo de BD es una propuesta de esquema, no una API publicada. Estos nombres deben guiar el mapeo del backend cuando el modelo quede aprobado:

| Recurso | Campos propuestos en el modelo | Consideración para el contrato |
| --- | --- | --- |
| Vehículo | `plate`, `vehicle_type_id`, `vehicle_status_id`, `capacity_kg`, `capacity_yd3`, `is_active` | Validar unicidad de placa, unidades/rangos y catálogos con #64/#72. |
| Cuenta/perfil | `user_account`, `user_data`, `profile`, `user_role` | No publicar documentos, hashes ni datos personales en responses generales. Los endpoints de autenticación todavía requieren decisión. |
| Cuadrilla | `crew`, `crew_member`, conductor asociado | Acordar si los integrantes son cuentas o solo nombres y resolver perfiles/permisos de conductor. |
| Ruta | Macroruta, microruta, barrio, horarios y relaciones de días | Confirmar PostGIS/SRID y qué datos necesita realmente el frontend. |
| Asignación | Microruta, cuadrilla, vehículo, estado, fecha y tiempos reales | Resolver unicidad por día, segundo viaje y conflictos de horario antes del contrato definitivo. |
| Seguimiento | `vehicle_position` con punto geográfico y marca de tiempo | No exponer posiciones hasta aprobar necesidad, autorización, frecuencia y retención (#91). |

Las operaciones y esquemas JSON de esta especificación siguen siendo candidatos hasta que BD y producto confirmen el diccionario y las HUs. No codificar límites, estados o valores de catálogo por inferencia.

## Fuentes y decisiones abiertas

Issue #66 (contrato), #70 (permisos), #71 (auth), #72 (vehículos), #78–#79 (rutas), #81/#93 (asignaciones), #84 (auditoría), #85 (órdenes), PR #47 (health), PR #50 (alcance y reglas todavía pendientes). Esta especificación no declara implementados endpoints de negocio.
