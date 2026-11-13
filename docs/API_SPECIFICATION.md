# Especificación de API de VINTRA

## Estado y convenciones

Contrato de referencia. El backend ya expone rutas provisionales descritas más adelante, construidas con las entidades y DTO actuales; no deben interpretarse como decisiones funcionales aprobadas. El issue #66 pide cerrar rutas, JSON, errores, validaciones, permisos y OpenAPI. Las PR #47/#49/#50 aún están abiertas.

- Las rutas de negocio usan `/api/v1`; health checks permanecen en `/health` y `/health/db`. Swagger UI está disponible en `/api/docs` y el documento JSON en `/api/docs-json`.
- JSON UTF-8. Fechas en ISO 8601 con zona/offset explícito; la zona operativa debe aprobarse. IDs opacos y estables, sin exponer detalles de base.
- Las colecciones paginadas aplican los valores predeterminados documentados en cada DTO. Los límites son decisiones técnicas provisionales, pendientes de revisión con #66.
- Filtros permitidos documentados por recurso. DTOs con lista permitida; rechazar propiedades desconocidas en operaciones de escritura.
- La implementación usa JWT Bearer y perfiles consultados en PostgreSQL; la política de roles continúa provisional hasta revisar #54/#70/#71.
- Las operaciones evitan el borrado físico y usan `is_active` solo en entidades que tienen esa columna. No se incorporan tablas ni reglas de negocio ajenas al modelo disponible.
- OpenAPI describe únicamente controladores implementados. Los DTO de entrada se generan desde sus tipos y validaciones; cada operación declara códigos HTTP, tipo general de respuesta y, cuando aplica, parámetros y requisitos de rol.

## Swagger / OpenAPI

- En desarrollo local, abre `http://localhost:3002/api/docs`; el documento JSON está en `http://localhost:3002/api/docs-json`.
- Las operaciones se agrupan por módulo. Las rutas protegidas declaran `Bearer JWT`; usa **Authorize** con `accessToken` obtenido mediante `POST /api/v1/auth/login`.
- Los DTO de request se describen con el plugin de `@nestjs/swagger`. Los errores usan el formato estándar de excepciones NestJS; el formato propuesto en esta especificación no está implementado.
- Los permisos y la equivalencia del rol `OPERATIONS_MANAGER` con el valor `OP` persistido en la migración del PR #115 son provisionales. El JWT no incluye roles ni datos personales.
- No se publican rutas de recuperación de contraseña o verificación de correo: existen DTO/entidades, pero no hay flujo implementado ni proveedor de correo.

## Formato de errores

El siguiente formato es una propuesta para #66; la aplicación todavía usa el formato estándar de excepciones de NestJS.

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

### `GET /`

Devuelve el mensaje básico de `AppService` (`"Hello World!"`). No requiere autenticación.

### `GET /health`

Comprueba que el proceso responde. No requiere autenticación si el entorno necesita health checks del orquestador; la política de exposición debe confirmarse. No consulta ni revela datos de la DB.

Respuesta `200`:

```json
{"status":"ok","service":"vintra-backend"}
```

### `GET /health/db`

Comprueba disponibilidad de la conexión PostgreSQL para readiness. No muestra host, nombre de base, usuario ni error técnico.

Respuesta `200`: `{"status":"ok","database":"connected","time":"<fecha ISO 8601>"}`.
Respuesta `503`: `{"status":"error","database":"disconnected"}`.

El chequeo de DB queda separado del liveness. No revela el host, la base, credenciales ni el error técnico del driver.

## Autenticación

La implementación actual usa provisionalmente JWT Bearer. Esto no constituye la aprobación final de la política de identidad, sesiones o permisos (#54/#70/#71).

### `POST /api/v1/auth/login`

Inicia sesión con el correo y la contraseña de una cuenta activa. El correo se normaliza con espacios eliminados y minúsculas. Las contraseñas se verifican contra hashes Argon2id almacenados en `user_account.pwd_hash`.

Request:

```json
{
  "email": "persona@example.com",
  "password": "contraseña"
}
```

Respuesta `200`:

```json
{
  "accessToken": "<jwt>",
  "tokenType": "Bearer",
  "expiresIn": 900
}
```

Un cuerpo inválido devuelve `400`. Las credenciales incorrectas, las cuentas inactivas y las cuentas bloqueadas devuelven `401` con un mensaje genérico. El JWT contiene el UUID de la cuenta en `sub`; no incluye roles ni datos personales. La duración inicial es de 900 segundos y se configura con `JWT_ACCESS_TOKEN_TTL_SECONDS`. `JWT_SECRET` es obligatorio, debe tener al menos 32 bytes y no debe guardarse en el repositorio.

Las rutas protegidas usan el guard JWT compartido. La aplicación conserva una sesión asociada a una huella SHA-256 del token, verifica sesión y cuenta en cada solicitud y revoca la sesión al cerrar sesión. `RolesGuard` consulta perfiles activos en cada petición. La asignación inicial de permisos es provisional: `ADMIN` administra cuentas, perfiles y auditoría; `ADMIN` y `OPERATIONS_MANAGER` administran recursos operativos; `DRIVER` consulta catálogos y solo sus asignaciones y posiciones. No se implementan refresh ni flujos de recuperación o validación por correo porque no existe un proveedor de correo configurado. No se probaron estas operaciones contra PostgreSQL.

## Rutas de negocio implementadas provisionalmente

Los métodos y DTO son los contratos actualmente implementados. Los recursos de catálogo no permiten borrado físico. Los nombres de campos responden a las entidades y DTO actuales, no sustituyen la aprobación de producto o de base de datos.

| Módulo | Rutas |
|---|---|
| Sistema | `GET /` |
| Usuarios | `GET/POST /api/v1/users`, `GET /api/v1/users/{id}`, `GET/PATCH /api/v1/users/me` |
| Perfiles | `GET /api/v1/users/{userId}/profiles`, `POST /api/v1/profiles`, `PATCH /api/v1/profiles/{id}` |
| Vehículos | `GET /api/v1/vehicle-types`, `POST /api/v1/vehicle-types`, `PATCH /api/v1/vehicle-types/{id}`, `GET/POST /api/v1/vehicles`, `GET/PATCH /api/v1/vehicles/{id}` |
| Personal | `GET/POST /api/v1/personal/conductores`, `GET /api/v1/personal/conductores/{id}`, `GET /api/v1/personal/conductores/me`, `PATCH /api/v1/personal/conductores/{id}` |
| Cuadrillas | `GET/POST /api/v1/crews`, `GET/PATCH /api/v1/crews/{id}`, `GET/POST /api/v1/crew-members`, `PATCH /api/v1/crew-members/{id}` |
| Rutas | `GET/POST /api/v1/neighborhoods`, `GET/PATCH /api/v1/neighborhoods/{id}`, `GET/POST /api/v1/macroroutes`, `GET/PATCH /api/v1/macroroutes/{id}`, `GET/POST /api/v1/microroutes`, `GET/PATCH /api/v1/microroutes/{id}`, `GET/POST /api/v1/microroute-neighborhoods`, `PATCH /api/v1/microroute-neighborhoods/{id}` |
| Turnos | `GET/POST /api/v1/schedules`, `GET/PATCH /api/v1/schedules/{id}`, `GET/POST /api/v1/microroute-schedules`, `PATCH /api/v1/microroute-schedules/{id}` |
| Asignaciones | `GET/POST /api/v1/assignments`, `GET /api/v1/assignments/{id}`, `GET /api/v1/assignments/me`, `PATCH /api/v1/assignments/{id}` |
| Seguimiento | `GET /api/v1/vehicle-positions/assignments/{assignmentId}`, `GET /api/v1/vehicle-positions/me/assignments/{assignmentId}`, `POST /api/v1/vehicle-positions`, `POST /api/v1/vehicle-positions/me` |
| Auditoría | `GET /api/v1/audit-logs/{resource}` para `user-accounts`, `user-data`, `profiles`, `drivers`, `crews`, `crew-members`, `macroroutes`, `microroutes`, `vehicles` o `assignments`; devuelve identificador, actor, acción, IP y fecha, no los snapshots `old`/`new`. |

Decisiones técnicas conservadoras de esta primera implementación:

- Los campos GeoJSON se validan contra el tipo geométrico de cada columna (`Point`, `MultiLineString` o `MultiPolygon`); la columna define SRID 4326.
- El alta de conductor requiere contraseña inicial Argon2id y crea en una transacción cuenta, datos, perfil y conductor. No marca el correo como verificado ni envía mensajes.
- Las asignaciones requieren conductor, horario de microruta y vehículo activos, y obedecen las restricciones definidas por las entidades. No se inventan reglas de compatibilidad de carga, concurrencia de viajes ni transiciones de estado.
- El conductor solo puede consultar o registrar posiciones de asignaciones propias; el rol de operaciones consulta datos operativos.
- Los valores predeterminados de paginación y los permisos deben revisarse con producto y seguridad antes de considerar estable el contrato.

Quedan fuera de esta entrega los flujos de recuperación/validación de correo, órdenes de trabajo, reglas de disponibilidad de recursos y validación funcional contra PostgreSQL.

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

## Alineación con el modelo provisional

El PR #115 sigue abierto y no está aprobado. El backend usa sus migraciones como referencia técnica provisional; no se ejecutaron. Las respuestas y los permisos de esta API no convierten el DER ni el diccionario en un contrato aprobado.

| Recurso | DDL/entity usados por el backend | Pendiente |
| --- | --- | --- |
| Vehículo | `vehicle_status`; capacidades `NUMERIC` se representan como cadenas. | Confirmar unidades y rangos con #64/#72. |
| Cuenta/perfil | `user_status_enum`, `document_type_enum`, `user_role`; el hash Argon2id nunca se serializa. | Aprobar políticas de identidad, verificación y administración. |
| Cuadrilla/conductor | `crew_member` conserva nombre; `driver` referencia `user_data_id` y `crew_id` opcional. | Confirmar la relación entre cuenta/persona y cuadrilla. |
| Ruta | `macroroute`, `microroute`, `btura_neighborhood`, relaciones a barrios/horarios; geometrías con SRID 4326. | Resolver el tipo geométrico contradictorio de macroroute y confirmar PostGIS. |
| Asignación | El DDL y las entidades relacionan conductor, microroute-schedule y vehículo; incluyen estado y tiempos. | Resolver la diferencia con el diccionario y validar disponibilidad con #81/#93. |
| Seguimiento | `vehicle_position` referencia una asignación y guarda un punto con marca de tiempo. | Confirmar frecuencia y retención con #91. |
| Auditoría | Diez tablas `*_log`; la API administrativa omite snapshots para no exponer datos sensibles. | Aprobar acceso, retención y formato de actor. |

### Diferencias conocidas entre el diccionario y las migraciones

- `user_data.phone`: el diccionario indica `VARCHAR(10)`, pero `002_create_user_data.sql` declara `VARCHAR(20)`.
- Roles: la migración define `user_role` como `ADMIN`, `OP` y `DRIVER`; la API usa el nombre funcional `OPERATIONS_MANAGER`, que el transformer mapea a `OP`. Confirmar esa equivalencia con BD/producto.
- Catálogos de estado/rol: el diccionario describe tablas para `user_role`, `user_status`, `document_type`, `vehicle_status` y `assignment_status`; las migraciones los implementan como tipos ENUM, no como tablas de catálogo.
- `crew`: la descripción del diccionario incluye `user_data_id`, pero `015_create_crew.sql` no incluye dicha columna.
- Geometría de `macroroute`: `009_create_macroroute.sql` declara `GEOMETRY(MULTILINESTRING, 4326)`, mientras el diseño local la describe como `MULTIPOLYGON`.
- `assignment`: el diccionario describe `crew_id`, `microroute_id`, `assignment_status_id` y `scheduled_date`; `018_create_assignment.sql` usa `driver_id`, `microroute_schedule_id`, `assignment_status` ENUM y tiempos programados.
- Tipos y longitudes: el diccionario describe capacidades como `FLOAT`, pero `008_create_vehicle.sql` usa `NUMERIC`; indica `schedule.name VARCHAR(100)` frente a `VARCHAR(20)` en `012_create_schedule.sql`; y `btura_neighborhood.commune/name VARCHAR(100)/VARCHAR(150)` frente a `VARCHAR(80)/VARCHAR(120)` en `011_create_btura_neighborhood.sql`.

Las rutas y esquemas de respuesta siguen siendo provisionales hasta que BD y producto confirmen el diseño y las HUs. No se ejecutó integración funcional con PostgreSQL.

## Fuentes y decisiones abiertas

Issue #66 (contrato), #70 (permisos), #71 (auth), #72 (vehículos), #78–#79 (rutas), #81/#93 (asignaciones), #84 (auditoría), #85 (órdenes), PR #47 (health), PR #50 (alcance y reglas todavía pendientes). La matriz de rutas describe lo implementado provisionalmente; no sustituye la aprobación del contrato.
