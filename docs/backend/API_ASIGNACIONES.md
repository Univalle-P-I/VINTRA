# API_ASIGNACIONES.md

**Proyecto:** VINTRA – Sistema de gestión de recolección de residuos
**Módulo:** Asignaciones
**Ruta base:** `/api/v1/assignments`
**Última revisión:** 13 de noviembre de 2026

---

## 1. Objetivo

Documentar los endpoints del módulo de asignaciones de VINTRA, encargado de relacionar conductores, vehículos y programaciones de microrutas para organizar las operaciones de recolección.

El módulo permite crear, consultar, listar y actualizar asignaciones, así como consultar las asignaciones correspondientes al conductor autenticado.

## 2. Alcance

El módulo dispone de cinco endpoints:

| Método | Endpoint | Funcionalidad |
|---|---|---|
| GET | `/api/v1/assignments` | Listar asignaciones con filtros y paginación. |
| GET | `/api/v1/assignments/me` | Listar las asignaciones del conductor autenticado. |
| GET | `/api/v1/assignments/:id` | Consultar una asignación específica. |
| POST | `/api/v1/assignments` | Crear una asignación. |
| PATCH | `/api/v1/assignments/:id` | Actualizar una asignación. |

No se implementa un endpoint DELETE en el controlador revisado.

## 3. Autenticación y autorización

Todos los endpoints están protegidos mediante:

- `JwtAuthGuard`: verifica la autenticación mediante JWT.
- `RolesGuard`: comprueba que el usuario tenga el rol autorizado.
- `@ApiBearerAuth('access-token')`: documenta el uso del token Bearer en Swagger.

### 3.1. Roles autorizados

| Endpoint | ADMIN | OPERATIONS_MANAGER | DRIVER |
|---|:---:|:---:|:---:|
| GET `/assignments` | Sí | Sí | No |
| GET `/assignments/me` | No | No | Sí |
| GET `/assignments/:id` | Sí | Sí | No |
| POST `/assignments` | Sí | Sí | No |
| PATCH `/assignments/:id` | Sí | Sí | No |

### 3.2. Encabezados

Para todas las solicitudes:

```http
Authorization: Bearer <token>
```

Para solicitudes POST y PATCH con cuerpo JSON:

```http
Content-Type: application/json
```

No se identificaron encabezados personalizados adicionales en el controlador.

## 4. Endpoints

### 4.1. Listar asignaciones

**Método:** GET
**Ruta:** `/api/v1/assignments`
**Autenticación:** JWT obligatorio.
**Roles:** ADMIN, OPERATIONS_MANAGER.

**Descripción:**

Permite consultar las asignaciones registradas, aplicar filtros por conductor, cuadrilla, programación, microruta, vehículo, estado y fechas programadas, y obtener resultados paginados.

**Parámetros de consulta:**

| Parámetro | Tipo | Obligatorio | Validación |
|---|---|---|---|
| `driverId` | UUID | No | Identificador válido de conductor. |
| `crewId` | UUID | No | Identificador válido de cuadrilla. |
| `microrouteScheduleId` | UUID | No | Identificador válido de programación. |
| `microrouteId` | UUID | No | Identificador válido de microruta. |
| `vehicleId` | UUID | No | Identificador válido de vehículo. |
| `assignmentStatus` | Enum | No | Estado definido en `EstadoAsignacion`. |
| `scheduledStartAt` | Date | No | Fecha válida. |
| `scheduledEndAt` | Date | No | Fecha válida. |
| `page` | Number | No | Entero mayor o igual a 1. |
| `limit` | Number | No | Entero mayor o igual a 1. |

**Paginación predeterminada:**

- `page`: 1.
- `limit`: 20.
- No se establece un límite máximo en el DTO ni en el servicio revisado.

**Ejemplo de solicitud:**

```http
GET /api/v1/assignments?page=1&limit=20&assignmentStatus=scheduled
```

**Respuesta exitosa: 200 OK**

```json
{
  "items": [
    {
      "id": "uuid-asignacion",
      "estado": "scheduled",
      "inicioProgramado": "2026-11-13T10:00:00.000Z",
      "finProgramado": "2026-11-13T12:00:00.000Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 20
}
```

El objeto de cada elemento contiene las relaciones cargadas por el servicio. El ejemplo muestra únicamente algunos campos representativos.

**Funcionamiento interno:**

1. Se establecen los valores predeterminados de paginación.
2. Se construye una consulta mediante `queryWithRelations()`.
3. Se cargan las relaciones de conductor, datos de usuario, cuadrilla, programación de microruta, microruta, horario, vehículo y tipo de vehículo.
4. Se ordenan los resultados por `inicioProgramado` de forma descendente.
5. Se aplican los filtros recibidos mediante `applyFilters()`.
6. Se ejecuta `getManyAndCount()` para recuperar los registros y el total.

**Filtros aplicados:**

| Filtro | Condición |
|---|---|
| `driverId` | Coincidencia con el conductor. |
| `crewId` | Coincidencia con la cuadrilla. |
| `microrouteScheduleId` | Coincidencia con la programación. |
| `microrouteId` | Coincidencia con la microruta. |
| `vehicleId` | Coincidencia con el vehículo. |
| `assignmentStatus` | Comparación del estado en mayúsculas. |
| `scheduledStartAt` | Inicio programado mayor o igual a la fecha indicada. |
| `scheduledEndAt` | Final programado menor o igual a la fecha indicada. |

Los filtros de fecha son límites independientes; no implementan una búsqueda de intervalos solapados.

**Errores posibles:**

| Código | Descripción |
|---|---|
| 400 | Parámetros de consulta inválidos. |
| 401 | JWT ausente, inválido o revocado. |
| 403 | Rol no autorizado. |

### 4.2. Listar asignaciones del conductor autenticado

**Método:** GET
**Ruta:** `/api/v1/assignments/me`
**Autenticación:** JWT obligatorio.
**Rol:** DRIVER.

**Descripción:**

Permite que un conductor consulte sus propias asignaciones sin tener que proporcionar su identificador de conductor.

**Parámetros de consulta:**

Utiliza `ConsultarAsignacionesDto`, por lo que admite los mismos filtros y parámetros de paginación del listado general.

**Ejemplo:**

```http
GET /api/v1/assignments/me?page=1&limit=20
```

**Respuesta exitosa: 200 OK**

```json
{
  "items": [],
  "total": 0,
  "page": 1,
  "limit": 20
}
```

**Funcionamiento interno:**

1. El controlador obtiene el usuario autenticado mediante `@UsuarioAutenticado()`.
2. Envía `actor.userId` al método `listarPropias()`.
3. El servicio busca al conductor relacionado con `datosUsuario.id`.
4. Recupera su identificador y su estado de actividad.
5. Comprueba que el conductor exista y esté activo.
6. Construye la consulta filtrando obligatoriamente por el identificador del conductor.
7. Aplica los filtros adicionales y la paginación.

**Reglas de negocio:**

- El conductor debe existir en el módulo de personal.
- El conductor debe estar activo.
- El identificador del conductor se obtiene desde el usuario autenticado.
- El servicio no confía en un `driverId` enviado por el cliente para determinar la identidad del conductor.
- Los filtros adicionales solo pueden restringir la consulta, pues se conserva la condición obligatoria del conductor autenticado.

**Errores posibles:**

| Código | Descripción |
|---|---|
| 400 | Parámetros de consulta inválidos. |
| 401 | JWT ausente, inválido o revocado. |
| 403 | Rol no autorizado o conductor inactivo. |
| 404 | No existe un registro de conductor relacionado con el usuario autenticado. |

### 4.3. Consultar una asignación por identificador

**Método:** GET
**Ruta:** `/api/v1/assignments/:id`
**Autenticación:** JWT obligatorio.
**Roles:** ADMIN, OPERATIONS_MANAGER.

**Descripción:**

Permite consultar una asignación específica mediante su identificador UUID.

**Parámetros de ruta:**

| Parámetro | Tipo | Obligatorio | Validación |
|---|---|---|---|
| `id` | UUID | Sí | `ParseUUIDPipe`. |

**Ejemplo:**

```http
GET /api/v1/assignments/uuid-asignacion
```

**Respuesta exitosa: 200 OK**

Devuelve la entidad `Asignacion` con las siguientes relaciones:

- `conductor`, incluyendo `datosUsuario`.
- `microrutaHorario`, incluyendo `microruta` y `horario`.
- `vehiculo`, incluyendo `tipoVehiculo`.

**Funcionamiento interno:**

El servicio ejecuta `findOne()` mediante el repositorio de asignaciones, busca por identificador y carga las relaciones especificadas.

Si no encuentra el registro, lanza `NotFoundException`.

**Errores posibles:**

| Código | Descripción |
|---|---|
| 400 | Identificador UUID inválido. |
| 401 | JWT ausente, inválido o revocado. |
| 403 | Rol no autorizado. |
| 404 | La asignación no existe. |

### 4.4. Crear una asignación

**Método:** POST
**Ruta:** `/api/v1/assignments`
**Autenticación:** JWT obligatorio.
**Roles:** ADMIN, OPERATIONS_MANAGER.
**Código de respuesta:** 201 Created.

**Descripción:**

Permite registrar una asignación relacionando un conductor activo, una programación de microruta activa y un vehículo activo.

**Cuerpo de la solicitud:**

```json
{
  "driverId": "uuid-conductor",
  "microrouteScheduleId": "uuid-programacion",
  "vehicleId": "uuid-vehiculo",
  "assignmentStatus": "scheduled",
  "scheduledStartAt": "2026-11-13T10:00:00.000Z",
  "scheduledEndAt": "2026-11-13T12:00:00.000Z"
}
```

**Campos del DTO:**

| Campo | Tipo | Obligatorio | Validación |
|---|---|---|---|
| `driverId` | UUID | Sí | `@IsUUID()`. |
| `microrouteScheduleId` | UUID | Sí | `@IsUUID()`. |
| `vehicleId` | UUID | Sí | `@IsUUID()`. |
| `assignmentStatus` | Enum | Sí | `@IsEnum(EstadoAsignacion)`. |
| `scheduledStartAt` | Date | Sí | `@Type(() => Date)` y `@IsDate()`. |
| `scheduledEndAt` | Date | Sí | `@Type(() => Date)` y `@IsDate()`. |

**Estados permitidos:**

- `scheduled`
- `in_progress`
- `completed`
- `cancelled`

**Funcionamiento interno:**

La creación se ejecuta mediante `ContextoAuditoriaService.ejecutar(actorId, ip, ...)`.

Dentro de la operación transaccional:

1. Se busca el conductor mediante su identificador y se exige que esté activo.
2. Se busca la programación de microruta y se exige que esté activa.
3. Se comprueba que el horario relacionado con esa programación también esté activo.
4. Se busca el vehículo y se exige que esté activo.
5. Se construye la asignación con las relaciones encontradas.
6. Se establece el estado recibido en el DTO.
7. Se guardan las fechas programadas.
8. Se inicializan las fechas reales en `null`.
9. Se establece `activo = true`.
10. Se guarda el registro.

**Reglas de negocio:**

- El conductor debe existir y estar activo.
- La programación de microruta debe existir y estar activa.
- El horario relacionado debe estar activo.
- El vehículo debe existir y estar activo.
- La combinación de programación y fecha de inicio programada debe ser única según la restricción declarada en la entidad.
- Las fechas reales comienzan en `null`.

**Errores posibles:**

| Código | Descripción |
|---|---|
| 400 | Datos de entrada inválidos. |
| 401 | JWT ausente, inválido o revocado. |
| 403 | Rol no autorizado. |
| 404 | Conductor, programación, horario o vehículo inexistente o inactivo. |
| 409 | Conflicto por violación de unicidad. |

**Observación sobre las fechas:**

El servicio no realiza una comparación explícita entre `scheduledStartAt` y `scheduledEndAt` durante la creación. La entidad declara una restricción `CHECK` para exigir que la fecha final sea igual o posterior a la inicial.

Esta validación depende de que la restricción correspondiente exista efectivamente en la base de datos.

### 4.5. Actualizar una asignación

**Método:** PATCH
**Ruta:** `/api/v1/assignments/:id`
**Autenticación:** JWT obligatorio.
**Roles:** ADMIN, OPERATIONS_MANAGER.

**Descripción:**

Permite actualizar parcialmente una asignación existente. Se pueden modificar sus relaciones operativas, estado, fechas programadas y fechas reales.

**Parámetros de ruta:**

| Parámetro | Tipo | Obligatorio | Validación |
|---|---|---|---|
| `id` | UUID | Sí | `ParseUUIDPipe`. |

**Cuerpo de la solicitud:**

Todos los campos son opcionales.

```json
{
  "driverId": "uuid-conductor",
  "microrouteScheduleId": "uuid-programacion",
  "vehicleId": "uuid-vehiculo",
  "assignmentStatus": "in_progress",
  "scheduledStartAt": "2026-11-13T10:00:00.000Z",
  "scheduledEndAt": "2026-11-13T12:00:00.000Z",
  "startedAt": "2026-11-13T10:15:00.000Z",
  "endedAt": null
}
```

**Campos disponibles:**

| Campo | Tipo | Obligatorio | Validación |
|---|---|---|---|
| `driverId` | UUID | No | UUID válido, si se envía. |
| `microrouteScheduleId` | UUID | No | UUID válido, si se envía. |
| `vehicleId` | UUID | No | UUID válido, si se envía. |
| `assignmentStatus` | Enum | No | Estado válido, si se envía. |
| `scheduledStartAt` | Date | No | Fecha válida, si se envía. |
| `scheduledEndAt` | Date | No | Fecha válida, si se envía. |
| `startedAt` | Date o null | No | Fecha válida o null. |
| `endedAt` | Date o null | No | Fecha válida o null. |

`ActualizarAsignacionDto` hereda los campos de creación mediante `PartialType()`, por lo que los campos heredados pasan a ser opcionales. Además, incorpora las fechas reales.

**Funcionamiento interno:**

1. Se ejecuta dentro de `ContextoAuditoriaService.ejecutar(actorId, ip, ...)`.
2. Se busca la asignación por identificador.
3. Si no existe, se devuelve `404 Not Found`.
4. Si se envía un nuevo conductor, se comprueba que exista y esté activo.
5. Si se envía una nueva programación, se comprueba que exista, esté activa y tenga un horario activo.
6. Si se envía un nuevo vehículo, se comprueba que exista y esté activo.
7. Se modifican únicamente los campos enviados.
8. Se validan las relaciones cronológicas entre las fechas.
9. Se guarda la asignación.

**Reglas de negocio para las fechas:**

| Regla | Condición |
|---|---|
| Fechas programadas | La fecha final debe ser igual o posterior a la fecha inicial. |
| Fechas reales | Si existe una fecha real de finalización, debe existir una fecha real de inicio. |
| Orden de fechas reales | La fecha real de finalización debe ser igual o posterior a la fecha real de inicio. |

**Errores posibles:**

| Código | Descripción |
|---|---|
| 400 | UUID, DTO o reglas cronológicas inválidas. |
| 401 | JWT ausente, inválido o revocado. |
| 403 | Rol no autorizado. |
| 404 | Asignación o relación requerida inexistente o inactiva. |
| 409 | Conflicto por violación de unicidad. |

**Observaciones:**

- Se trata de una actualización parcial.
- Los campos omitidos conservan su valor anterior.
- `startedAt` y `endedAt` admiten `null` por la validación con `@IsOptional()`.
- El servicio no modifica `activo` mediante este DTO.
- El DTO permite un cuerpo vacío; si la asignación existe, el servicio puede terminar guardando el registro sin cambios.

## 5. Validaciones globales

### 5.1. Validaciones de identificadores

Los identificadores de conductor, vehículo, programación y asignación se validan mediante UUID.

El parámetro `:id` de las rutas individuales también utiliza `ParseUUIDPipe`.

### 5.2. Validaciones de fechas

Los DTO utilizan `class-transformer` y `class-validator`:

- `@Type(() => Date)` transforma los valores recibidos en fechas.
- `@IsDate()` comprueba que sean fechas válidas.

Las reglas cronológicas se aplican explícitamente en el método `actualizar()`.

La entidad declara restricciones adicionales para las fechas programadas y reales.

### 5.3. Validaciones de estado

El estado debe pertenecer al enum `EstadoAsignacion`.

El servicio convierte el estado a mayúsculas al construir el filtro de consulta.

### 5.4. Paginación

Los valores predeterminados son:

| Parámetro | Valor |
|---|---|
| `page` | 1 |
| `limit` | 20 |

El DTO exige enteros mayores o iguales a 1. No se identificó un límite máximo para `limit`.

## 6. Modelo de datos relacionado

La entidad principal es `Asignacion`, que representa la tabla `assignment`.

### 6.1. Tabla `assignment`

| Campo en base de datos | Tipo | Descripción |
|---|---|---|
| `id` | UUID | Identificador principal. |
| `driver_id` | Relación/FK | Referencia al conductor. |
| `microroute_schedule_id` | Relación/FK | Referencia a la programación de microruta. |
| `vehicle_id` | Relación/FK | Referencia al vehículo. |
| `assignment_status` | ENUM | Estado de la asignación. |
| `scheduled_start_at` | timestamptz | Inicio programado. |
| `scheduled_end_at` | timestamptz | Final programado. |
| `started_at` | timestamptz nullable | Inicio real. |
| `ended_at` | timestamptz nullable | Final real. |
| `is_active` | boolean | Indicador de actividad, predeterminado true. |
| `updated_at` | timestamptz | Fecha de actualización, predeterminada `now()`. |
| `created_at` | timestamptz | Fecha de creación, predeterminada `now()`. |

### 6.2. Relaciones

La entidad establece tres relaciones `ManyToOne`, todas obligatorias:

| Relación | Entidad relacionada | Columna |
|---|---|---|
| `conductor` | `Conductor` | `driver_id` |
| `microrutaHorario` | `MicrorutaHorario` | `microroute_schedule_id` |
| `vehiculo` | `Vehiculo` | `vehicle_id` |

### 6.3. Estados de asignación

El enum `EstadoAsignacion` define:

| Valor utilizado en TypeScript/API | Valor almacenado |
|---|---|
| `scheduled` | `SCHEDULED` |
| `in_progress` | `IN_PROGRESS` |
| `completed` | `COMPLETED` |
| `cancelled` | `CANCELLED` |

El `ValueTransformer` realiza la conversión entre los valores de la aplicación y los valores almacenados en PostgreSQL.

### 6.4. Restricciones e índices

La entidad declara:

| Nombre | Tipo | Función |
|---|---|---|
| `assignment_pkey` | Primary Key | Identifica cada asignación. |
| `fk_assignment_driver` | Foreign Key | Relaciona la asignación con el conductor. |
| `fk_assignment_microroute_schedule` | Foreign Key | Relaciona la asignación con la programación. |
| `fk_assignment_vehicle` | Foreign Key | Relaciona la asignación con el vehículo. |
| `uq_assignment_schedule_start` | Unique | Impide repetir programación y fecha de inicio programada. |
| `ck_assignment_scheduled_range` | Check | Exige fecha final programada igual o posterior a la inicial. |
| `ck_assignment_actual_range` | Check | Exige fecha real de inicio cuando existe fecha real de finalización y respeta el orden cronológico. |

Índices:

- `idx_assignment_driver_id`
- `idx_assignment_microroute_schedule_id`
- `idx_assignment_vehicle_id`
- `idx_assignment_scheduled_start_at`

**Importante:** estas son las restricciones e índices declarados en la entidad TypeORM. Su existencia efectiva en la base de datos debe verificarse cuando las migraciones correspondientes estén aprobadas y aplicadas.

## 7. Auditoría

Las operaciones de escritura utilizan `ContextoAuditoriaService.ejecutar()`:

- `POST /api/v1/assignments`
- `PATCH /api/v1/assignments/:id`

El controlador obtiene:

- `actor.userId`, mediante `@UsuarioAutenticado()`.
- La IP de la solicitud, mediante `@Ip()`.

Estos valores se envían al servicio para establecer el contexto transaccional de auditoría.

El contexto de auditoría permite que las operaciones se ejecuten dentro de una transacción y que la base de datos disponga de los datos del usuario y de la solicitud para los mecanismos de auditoría correspondientes.

El servicio no inserta directamente registros de auditoría en este código. La generación efectiva de dichos registros depende de los mecanismos configurados en la base de datos, incluidos los triggers cuando correspondan.

## 8. Manejo de errores

El módulo utiliza excepciones de NestJS:

| Excepción | Código HTTP | Situación |
|---|---|---|
| `BadRequestException` | 400 | Fechas programadas o reales con orden inválido durante actualización. |
| `UnauthorizedException` gestionada por el guard | 401 | JWT ausente, inválido o revocado. |
| `ForbiddenException` | 403 | Rol no autorizado o conductor inactivo en `/me`. |
| `NotFoundException` | 404 | Asignación o relación requerida inexistente o inactiva. |
| `ConflictException` | 409 | Violación de unicidad PostgreSQL, código `23505`. |

El método `throwIfUniqueViolation()` identifica el código PostgreSQL `23505` y lo transforma en `ConflictException`.

Mensaje asociado:

`Ya existe una asignación para ese horario y fecha de inicio.`

Las demás excepciones no reconocidas por este método se propagan.

## 9. Pruebas unitarias

**Archivo:** `src/asignaciones/asignaciones.service.spec.ts`

**Comando ejecutado:**

```powershell
npm test -- --runInBand src/asignaciones/asignaciones.service.spec.ts
```

**Resultado obtenido el 13 de noviembre de 2026:**

| Indicador | Resultado |
|---|---:|
| Suites aprobadas | 1 |
| Suites fallidas | 0 |
| Pruebas aprobadas | 18 |
| Pruebas fallidas | 0 |
| Tiempo de ejecución | 4.74 s |

### 9.1. Casos cubiertos

- Aplicación de filtros y paginación en el listado general.
- Carga de relaciones operativas.
- Identificación del conductor autenticado.
- Rechazo de conductores inactivos.
- Respuesta cuando el conductor no existe.
- Consulta individual de asignaciones.
- Respuesta cuando una asignación no existe.
- Creación con conductor, programación y vehículo activos.
- Rechazo de relaciones inexistentes o inactivas.
- Conversión de violaciones de unicidad a conflicto HTTP.
- Actualización parcial.
- Sustitución de relaciones por registros activos.
- Validación de fechas programadas.
- Validación de fechas reales.
- Uso del contexto transaccional de auditoría.

**Limitación de las pruebas:** se utilizan repositorios simulados y un contexto transaccional simulado. No demuestran por sí solas la correcta ejecución de las restricciones físicas de PostgreSQL, las relaciones desplegadas ni los triggers de auditoría.

## 10. Aspectos pendientes de verificación

1. **Validación de fechas en creación:** el servicio no compara explícitamente la fecha final programada con la inicial durante `crear()`. La entidad declara una restricción CHECK, pero debe verificarse su aplicación efectiva en la base de datos.

2. **Límite de paginación:** no existe un máximo explícito para `limit`. Se recomienda evaluar un límite superior para evitar consultas excesivamente grandes.

3. **Fechas nulas:** `startedAt` y `endedAt` admiten `null`. Debe comprobarse el comportamiento esperado en cada transición operativa.

4. **Estados de asignación:** el DTO permite cualquiera de los cuatro estados del enum. No se observa una máquina de estados que restrinja transiciones específicas, por ejemplo, impedir que una asignación completada vuelva a estar programada.

5. **Disponibilidad de recursos:** el servicio comprueba que conductor, programación, horario y vehículo estén activos, pero no se observa una validación explícita de disponibilidad del vehículo ni de conflictos de asignación de un conductor.

6. **Campo `is_active`:** la entidad contiene este campo, pero no se modifica mediante el DTO de actualización revisado.

7. **Actualización de `updated_at`:** la entidad utiliza `@Column` con valor predeterminado `now()`, no `@UpdateDateColumn`. Debe verificarse cómo se actualizará este campo.

8. **Pruebas de integración:** se recomienda probar las restricciones, relaciones y transacciones con PostgreSQL cuando el esquema esté aprobado.

9. **Autorización:** las pruebas revisadas corresponden al servicio. No sustituyen pruebas específicas de los guards y del controlador.

10. **Auditoría:** debe verificarse el comportamiento de los triggers y registros de auditoría una vez aprobadas las migraciones.

11. **Migraciones:** las migraciones del PR #115 continúan pendientes de aprobación. La entidad y las restricciones descritas son referencias de desarrollo, no confirmación de que estén aplicadas en la base de datos compartida.

## 11. Archivos de referencia

| Archivo | Responsabilidad |
|---|---|
| `src/asignaciones/asignaciones.controller.ts` | Define las rutas HTTP y la autorización. |
| `src/asignaciones/asignaciones.service.ts` | Contiene la lógica de negocio y las consultas. |
| `src/asignaciones/asignaciones.module.ts` | Configura el módulo y sus dependencias. |
| `src/asignaciones/entidades/asignacion.entity.ts` | Define la entidad y sus restricciones. |
| `src/asignaciones/dto/crear-asignacion.dto.ts` | Valida los datos de creación. |
| `src/asignaciones/dto/actualizar-asignacion.dto.ts` | Valida los datos de actualización. |
| `src/asignaciones/dto/consultar-asignaciones.dto.ts` | Valida filtros y paginación. |
| `src/asignaciones/asignaciones.service.spec.ts` | Contiene las pruebas unitarias. |
| `src/comun/contexto-auditoria.service.ts` | Proporciona el contexto transaccional de auditoría. |
| `src/personal/entidades/conductor.entity.ts` | Define la entidad del conductor. |
| `src/turnos/entidades/microruta-horario.entity.ts` | Define la programación de microruta. |
| `src/vehiculos/entidades/vehiculo.entity.ts` | Define la entidad del vehículo. |

---

**Fin de la documentación del módulo de Asignaciones.**