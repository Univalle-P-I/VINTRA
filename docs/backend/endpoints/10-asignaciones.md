# Asignaciones

> Las menciones a JWT, sesiones, roles y permisos son propuestas, no decisiones aprobadas; dependen de #54, #70 y #71. El formato común de respuestas sigue pendiente de #66.

## Endpoint 36. Consultar asignaciones

### 1. Información general

- **Método:** GET
- **Ruta:** `/api/v1/assignments`
- **Autenticación:** Bearer Token (JWT).
- **Body:** No requiere.

### 2. ¿Para qué sirve?

Permite consultar las asignaciones registradas en VINTRA, mostrando sus referencias al conductor, a la programación de microrruta y al vehículo. La cuadrilla y la microrruta se obtienen mediante esas relaciones.

### 3. Parámetros de consulta

| Parámetro              | Tipo          | Descripción                                                                                            |
| ---------------------- | ------------- | ------------------------------------------------------------------------------------------------------ |
| `driverId`             | UUID          | Filtrar por `assignment.driver_id`.                                                                    |
| `crewId`               | UUID          | Filtrar por la cuadrilla relacionada mediante `driver.crew_id`.                                        |
| `microrouteScheduleId` | UUID          | Filtrar por `assignment.microroute_schedule_id`.                                                       |
| `microrouteId`         | UUID          | Filtrar por la microrruta relacionada mediante `microroute_schedule.microroute_id`.                    |
| `vehicleId`            | UUID          | Filtrar por vehículo.                                                                                  |
| `assignmentStatus`     | string (ENUM) | Filtrar por el campo `assignment.assignment_status`. Sus valores en el SQL son marcadores de posición. |
| `scheduledStartAt`     | datetime      | Filtrar por inicio programado (`assignment.scheduled_start_at`).                                       |
| `scheduledEndAt`       | datetime      | Filtrar por fin programado (`assignment.scheduled_end_at`).                                            |
| `page`                 | integer       | Número de página.                                                                                      |
| `limit`                | integer       | Cantidad de registros por página.                                                                      |

### 4. Encabezados HTTP

```http
Authorization: Bearer <access_token>
Accept: application/json
```

### 5. Respuesta exitosa

**Código HTTP:** `200 OK`

```json
{
  "data": [
    {
      "id": "uuid-asignacion",
      "crew": {
        "id": "uuid-cuadrilla",
        "name": "Cuadrilla 01"
      },
      "microroute": {
        "id": "uuid-microrruta",
        "name": "Microrruta Norte"
      },
      "vehicle": {
        "id": "uuid-vehiculo",
        "plate": "ABC123"
      },
      "driverId": "uuid-conductor",
      "microrouteScheduleId": "uuid-programacion",
      "assignmentStatus": "scheduled",
      "scheduledStartAt": "2026-11-04T06:00:00Z",
      "scheduledEndAt": "2026-11-04T12:00:00Z",
      "startedAt": null,
      "endedAt": null,
      "isActive": true,
      "createdAt": "2026-11-04T08:00:00Z",
      "updatedAt": "2026-11-04T08:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 1
  }
}
```

### 6. Posibles errores

- **400 Bad Request:** Algún filtro tiene un formato inválido.
- **401 Unauthorized:** No se proporcionó un token válido.
- **403 Forbidden:** El usuario no tiene permisos para consultar las asignaciones.
- **500 Internal Server Error:** Ocurrió un error inesperado.

### 7. Validaciones

- Verificar el formato de los identificadores enviados como filtros.
- Validar que los filtros de intervalo tengan formato datetime válido.
- Comprobar que `assignmentStatus` corresponda a un valor permitido del ENUM confirmado.
- Validar que `page` y `limit` sean valores positivos.
- Consultar las relaciones correspondientes para mostrar los datos asociados.

### 8. Reglas de negocio

- La consulta debe mostrar las asignaciones registradas.
- Los filtros deben permitir localizar asignaciones por cuadrilla, microrruta, vehículo, estado o intervalo programado. La cuadrilla y microrruta se obtienen mediante las relaciones documentadas abajo.
- La consulta no debe modificar las asignaciones.

### 9. Relación con las historias de usuario

#### HU10. Asignar recursos a una microrruta

Este endpoint permite cumplir los siguientes criterios:

- Se deben poder consultar las asignaciones realizadas.
- Se debe identificar el vehículo, la cuadrilla y la microrruta asociados.
- Se debe conocer el estado de cada asignación.
- Se debe facilitar la identificación de los recursos que participan en la operación.

#### HU12. Trazabilidad de asignaciones

También contribuye a este requisito:

- Permite consultar las asignaciones sobre las cuales se necesita revisar la trazabilidad de los cambios.

### 10. Relación con la base de datos

#### Tablas involucradas

- `assignment`: contiene conductor, programación de microrruta, vehículo, estado ENUM, intervalo programado, fechas reales y `is_active`.
- `driver`: permite obtener el conductor y la cuadrilla a la que está asociado.
- `microroute_schedule`: permite obtener la programación seleccionada y su microrruta.
- `microroute`: contiene la información de la microrruta.
- `crew`: se obtiene mediante `driver.crew_id`; `assignment` no tiene `crew_id`.
- `vehicle`: contiene la información de los vehículos asignados.

#### Relaciones

- `assignment.driver_id` → `driver.id` → `driver.crew_id` → `crew.id`
- `assignment.microroute_schedule_id` → `microroute_schedule.id` → `microroute_schedule.microroute_id` → `microroute.id`
- `assignment.vehicle_id` → `vehicle.id`
- `assignment.assignment_status` es un ENUM, no una FK a `assignment_status`.

---

## Endpoint 37. Consultar una asignación

### 1. Información general — Endpoint 37

- **Método:** GET
- **Ruta:** `/api/v1/assignments/{id}`
- **Autenticación:** Bearer Token (JWT).
- **Body:** No requiere.

### 2. ¿Para qué sirve? — Endpoint 37

Permite consultar el detalle de una asignación específica, identificada mediante su ID.

Su finalidad es mostrar la información completa del recorrido programado, incluyendo la cuadrilla responsable, la microrruta, el vehículo asignado, su estado y las fechas correspondientes.

### 3. Parámetros de ruta

| Parámetro | Tipo | Obligatorio | Descripción                     |
| --------- | ---- | ----------- | ------------------------------- |
| `id`      | UUID | Sí          | Identificador de la asignación. |

### 4. Encabezados HTTP — Endpoint 37

```http
Authorization: Bearer <access_token>
Accept: application/json
```

### 5. Respuesta exitosa — Endpoint 37

**Código HTTP:** `200 OK`

```json
{
  "id": "uuid-asignacion",
  "crew": {
    "id": "uuid-cuadrilla",
    "name": "Cuadrilla 01"
  },
  "microroute": {
    "id": "uuid-microrruta",
    "name": "Microrruta Norte"
  },
  "vehicle": {
    "id": "uuid-vehiculo",
    "plate": "ABC123"
  },
  "driverId": "uuid-conductor",
  "microrouteScheduleId": "uuid-programacion",
  "assignmentStatus": "in_progress",
  "scheduledStartAt": "2026-11-04T06:00:00Z",
  "scheduledEndAt": "2026-11-04T12:00:00Z",
  "startedAt": "2026-11-04T08:00:00Z",
  "endedAt": null,
  "isActive": true,
  "createdAt": "2026-11-03T15:00:00Z",
  "updatedAt": "2026-11-04T08:00:00Z"
}
```

### 6. Posibles errores — Endpoint 37

- **400 Bad Request:** El identificador no tiene un formato UUID válido.
- **401 Unauthorized:** No se proporcionó un token válido.
- **403 Forbidden:** El usuario no tiene permisos para consultar la asignación.
- **404 Not Found:** No existe una asignación con el identificador proporcionado.
- **500 Internal Server Error:** Ocurrió un error inesperado.

### 7. Validaciones — Endpoint 37

- Verificar que el identificador tenga formato UUID.
- Comprobar que la asignación exista.
- Consultar los datos relacionados del conductor, su cuadrilla, la programación, la microrruta y el vehículo.

### 8. Reglas de negocio — Endpoint 37

- La información debe corresponder a la asignación solicitada.
- El estado se almacena en `assignment.assignment_status`, un ENUM cuyos valores SQL son marcadores de posición.
- La programación se obtiene mediante `assignment.microroute_schedule_id`.
- Las fechas programadas y reales corresponden a `scheduled_start_at`, `scheduled_end_at`, `started_at` y `ended_at`.

### 9. Relación con las historias de usuario — Endpoint 37

#### HU10. Asignar recursos a una microrruta — Endpoint 37

Este endpoint permite cumplir los siguientes criterios:

- Se debe poder consultar la información de una asignación específica.
- Se debe identificar la microrruta seleccionada.
- Se deben consultar los recursos asociados: vehículo y cuadrilla.
- Se debe conocer el estado de la asignación.

#### HU12. Trazabilidad de asignaciones — Endpoint 37

También contribuye a este requisito:

- Permite identificar la asignación específica cuyo historial de modificaciones se desea consultar.

### 10. Relación con la base de datos — Endpoint 37

#### Tablas involucradas: — Endpoint 37

- `assignment`: contiene las referencias y fechas de la asignación.
- `driver`: permite consultar al conductor y su cuadrilla.
- `microroute_schedule` y `microroute`: permiten consultar la programación y su microrruta.
- `vehicle`: permite consultar el vehículo asociado.
- `assignment_log`: conserva los cambios de asignaciones.

---

## Endpoint 38. Crear asignación

### 1. Información general — Endpoint 38 (3)

- **Método:** POST
- **Ruta:** `/api/v1/assignments`
- **Autenticación:** Bearer Token (JWT).

### 2. ¿Para qué sirve? — Endpoint 38 (3)

Permite registrar una asignación de un conductor, una programación de microrruta y un vehículo, con estado e intervalo programado. La cuadrilla se consulta mediante la relación del conductor; `assignment` no tiene un campo `crew_id`.

### 3. Encabezados HTTP

```http
Authorization: Bearer <access_token>
Content-Type: application/json
Accept: application/json
```

### 4. Cuerpo de la solicitud

```json
{
  "driverId": "uuid-conductor",
  "microrouteScheduleId": "uuid-programacion",
  "vehicleId": "uuid-vehiculo",
  "assignmentStatus": "scheduled",
  "scheduledStartAt": "2026-11-05T06:00:00Z",
  "scheduledEndAt": "2026-11-05T12:00:00Z"
}
```

#### Descripción de los campos

| Campo                  | Tipo          | Obligatorio | Descripción                                                                                                        |
| ---------------------- | ------------- | ----------- | ------------------------------------------------------------------------------------------------------------------ |
| `driverId`             | UUID          | Sí          | Identificador del conductor asignado; su cuadrilla se obtiene mediante `driver.crew_id`.                           |
| `microrouteScheduleId` | UUID          | Sí          | Identificador de la programación asociada en `microroute_schedule`; esta determina la microrruta y el turno.       |
| `vehicleId`            | UUID          | Sí          | Identificador del vehículo asignado.                                                                               |
| `assignmentStatus`     | string (ENUM) | Sí          | Valor del ENUM `assignment.assignment_status`. Los valores del SQL son marcadores de posición y deben confirmarse. |
| `scheduledStartAt`     | datetime      | Sí          | Inicio programado (`assignment.scheduled_start_at`).                                                               |
| `scheduledEndAt`       | datetime      | Sí          | Fin programado (`assignment.scheduled_end_at`).                                                                    |

### 5. Respuesta exitosa — Endpoint 38 (3)

**Código HTTP:** `201 Created`

```json
{
  "id": "uuid-asignacion",
  "driverId": "uuid-conductor",
  "microrouteScheduleId": "uuid-programacion",
  "vehicleId": "uuid-vehiculo",
  "assignmentStatus": "scheduled",
  "scheduledStartAt": "2026-11-05T06:00:00Z",
  "scheduledEndAt": "2026-11-05T12:00:00Z",
  "startedAt": null,
  "endedAt": null,
  "isActive": true,
  "createdAt": "2026-11-04T10:00:00Z",
  "updatedAt": "2026-11-04T10:00:00Z"
}
```

### 6. Posibles errores — Endpoint 38 (3)

- **400 Bad Request:** Faltan campos obligatorios o los datos enviados son inválidos.
- **401 Unauthorized:** No se proporcionó un token válido.
- **403 Forbidden:** El usuario no tiene permisos para crear asignaciones.
- **404 Not Found:** El conductor, la programación o el vehículo no existen.
- **409 Conflict:** Existe un conflicto con la disponibilidad de los recursos asignados, si se establece esa regla.
- **500 Internal Server Error:** Ocurrió un error inesperado.

### 7. Validaciones — Endpoint 38 (3)

- Verificar que se hayan enviado todos los campos obligatorios.
- Verificar que el conductor exista y revisar `driver.is_active` como indicador de registro activo; esto no determina por sí solo su disponibilidad operativa. Obtener su cuadrilla mediante `driver.crew_id`.
- Verificar que la programación exista y que sus relaciones con la microrruta y el turno sean válidas.
- Comprobar que el vehículo exista y revisar `vehicle.is_active` separadamente de su estado operativo `vehicle.vehicle_status`.
- Validar que `assignmentStatus` corresponda a un valor permitido del ENUM confirmado.
- Validar los formatos de `scheduledStartAt` y `scheduledEndAt`, y que el intervalo sea consistente.
- Comprobar disponibilidad y conflictos de conductor, cuadrilla y vehículo según las reglas operativas pendientes de aprobación; aplicar control transaccional/concurrencia.
- Verificar compatibilidad del intervalo con la programación seleccionada según la regla que acuerde el equipo.

### 8. Reglas de negocio — Endpoint 38 (3)

- Toda asignación se relaciona con un conductor, una programación de microrruta y un vehículo; la cuadrilla se deriva del conductor.
- La asignación registra estado operativo e intervalo programado. La disponibilidad, compatibilidad y reglas de conflicto se deben implementar según las reglas de negocio aprobadas.

### 9. Relación con las historias de usuario — Endpoint 38 (3)

#### HU10. Asignar recursos a una microrruta — Endpoint 38 (3)

Este endpoint permite cumplir los siguientes criterios:

- Se debe poder seleccionar una microrruta.
- Se debe poder seleccionar un vehículo disponible.
- Se debe poder seleccionar una cuadrilla disponible.
- El sistema debe detectar conflictos de asignación.
- El sistema debe impedir completar la asignación cuando exista un conflicto.
- Una asignación sin conflictos debe poder completarse correctamente.

#### HU11. Gestionar doble recorrido de vehículo de 7 yd³

El DER permite registrar intervalos de asignación, pero no identifica explícitamente cuál es el primer o segundo recorrido. La forma de representar y validar el segundo recorrido queda pendiente de definición.

### 10. Relación con la base de datos — Endpoint 38 (3)

#### Tablas involucradas: — Endpoint 38 (3)

- `assignment`
- `driver`
- `crew` (mediante `driver.crew_id`)
- `microroute_schedule`
- `microroute`
- `schedule`
- `vehicle`

#### Relaciones: — Endpoint 38

- `assignment.driver_id` → `driver.id`
- `driver.crew_id` → `crew.id`
- `assignment.microroute_schedule_id` → `microroute_schedule.id`
- `microroute_schedule.microroute_id` → `microroute.id`
- `microroute_schedule.schedule_id` → `schedule.id`
- `assignment.vehicle_id` → `vehicle.id`
- `assignment.assignment_status` es ENUM, no FK a una tabla.

La tabla `assignment` almacena `driver_id`, `microroute_schedule_id`, `vehicle_id`, `assignment_status`, `scheduled_start_at`, `scheduled_end_at`, `started_at`, `ended_at` e `is_active`. Los valores ENUM del SQL son marcadores de posición.

---

## Endpoint 39. Modificar asignación

### 1. Información general — Endpoint 39 (4)

- **Método:** PATCH
- **Ruta:** `/api/v1/assignments/{id}`
- **Autenticación:** Bearer Token (JWT).

### 2. ¿Para qué sirve? — Endpoint 39 (4)

Permite modificar parcialmente una asignación existente. Los datos actualizables deben corresponder a los campos de `assignment`; la cuadrilla y la microrruta se obtienen mediante sus relaciones.

### 3. Parámetros de ruta — Endpoint 39

| Parámetro | Tipo | Obligatorio | Descripción                                            |
| --------- | ---- | ----------- | ------------------------------------------------------ |
| `id`      | UUID | Sí          | Identificador de la asignación que se desea modificar. |

### 4. Encabezados HTTP — Endpoint 39 (3)

```http
Authorization: Bearer <access_token>
Content-Type: application/json
Accept: application/json
```

### 5. Cuerpo de la solicitud

Al ser un método PATCH, los campos son opcionales. Solo deben enviarse los datos que se desean modificar.

```json
{
  "driverId": "uuid-nuevo-conductor",
  "microrouteScheduleId": "uuid-nueva-programacion",
  "vehicleId": "uuid-nuevo-vehiculo",
  "assignmentStatus": "in_progress",
  "scheduledStartAt": "2026-11-06T06:00:00Z",
  "scheduledEndAt": "2026-11-06T12:00:00Z"
}
```

#### Descripción de los campos: — Endpoint 39

| Campo                  | Tipo          | Obligatorio | Descripción                                                                                  |
| ---------------------- | ------------- | ----------- | -------------------------------------------------------------------------------------------- |
| `driverId`             | UUID          | No          | Nuevo conductor; su cuadrilla se obtiene mediante `driver.crew_id`.                          |
| `microrouteScheduleId` | UUID          | No          | Nueva programación de microrruta.                                                            |
| `vehicleId`            | UUID          | No          | Nuevo vehículo asignado.                                                                     |
| `assignmentStatus`     | string (ENUM) | No          | Nuevo valor para `assignment.assignment_status`; los valores SQL son marcadores de posición. |
| `scheduledStartAt`     | datetime      | No          | Nuevo inicio programado.                                                                     |
| `scheduledEndAt`       | datetime      | No          | Nuevo fin programado.                                                                        |

### 6. Respuesta exitosa

**Código HTTP:** `200 OK`

```json
{
  "id": "uuid-asignacion",
  "driverId": "uuid-nuevo-conductor",
  "microrouteScheduleId": "uuid-nueva-programacion",
  "vehicleId": "uuid-nuevo-vehiculo",
  "assignmentStatus": "in_progress",
  "scheduledStartAt": "2026-11-06T06:00:00Z",
  "scheduledEndAt": "2026-11-06T12:00:00Z",
  "startedAt": null,
  "endedAt": null,
  "isActive": true,
  "createdAt": "2026-11-04T10:00:00Z",
  "updatedAt": "2026-11-04T11:00:00Z"
}
```

### 7. Posibles errores

- **400 Bad Request:** El identificador no tiene un formato UUID válido o los datos enviados son inválidos.
- **401 Unauthorized:** No se proporcionó un token válido, la sesión expiró o fue revocada.
- **403 Forbidden:** El usuario no tiene permisos para modificar la asignación.
- **404 Not Found:** No existe una asignación con el identificador enviado.
- **409 Conflict:** Puede presentarse un conflicto si los recursos seleccionados no están disponibles, de acuerdo con las reglas de asignación.
- **500 Internal Server Error:** Ocurrió un error inesperado durante la modificación.

### 8. Validaciones

- Verificar que el identificador de la asignación sea válido.
- Comprobar que la asignación exista.
- Verificar que se haya enviado al menos un campo para modificar.
- Validar las referencias modificadas (`driver`, `microroute_schedule` y `vehicle`) y sus relaciones.
- Validar el formato de los valores de estado e intervalo programado.
- Revalidar la disponibilidad y los conflictos conforme a las reglas operativas aprobadas.
- Validar que el cambio de estado corresponda a una transición permitida.
- Comprobar que no se modifiquen datos que deban permanecer inalterables una vez iniciado o finalizado el recorrido.

### 9. Reglas de negocio

- Solo se deben actualizar los campos enviados en la solicitud.
- No se deben modificar asignaciones inexistentes.
- Los cambios deben respetar las reglas de disponibilidad y conflicto acordadas.
- Los cambios de estado deben respetar el ciclo de vida de la asignación.
- Una asignación finalizada no debe modificarse libremente.
- Las modificaciones deben quedar registradas para mantener la trazabilidad.

### 10. Relación con las historias de usuario

#### HU10. Asignar recursos a una microrruta — Endpoint 39 (4)

La modificación de una asignación permite actualizar los recursos relacionados con una microrruta, siempre que se cumplan las condiciones de disponibilidad y las reglas de asignación.

#### HU12. Trazabilidad de asignaciones — Endpoint 39 (3)

Este endpoint se relaciona con el requisito de trazabilidad porque:

- Las modificaciones deben quedar registradas.
- Se deben conservar los cambios realizados sobre la asignación.
- Se debe poder identificar qué información cambió y quién realizó la modificación mediante los registros de auditoría.

### 11. Relación con la base de datos

#### Tablas involucradas: — Endpoint 39 (4)

- `assignment`: contiene la información de la asignación y permite actualizar sus datos, como las referencias a la cuadrilla, microrruta, vehículo y estado, así como la fecha programada.
- `driver`: permite validar el conductor y obtener su cuadrilla.
- `microroute_schedule`: permite validar la programación seleccionada y obtener la microrruta.
- `microroute` y `schedule`: se consultan mediante `microroute_schedule`.
- `vehicle`: permite validar el vehículo seleccionado.
- `assignment_log`: almacena los registros de auditoría de la asignación.

La actualización se realiza sobre `assignment`, utilizando las relaciones descritas anteriormente.

La trazabilidad de los cambios se representa en `assignment_log`, con `entity_id`, `actor_id`, `action`, `old` y `new`.

---

## Endpoint 40. Consultar historial de una asignación

### 1. Información general — Endpoint 40 (5)

- **Método:** GET
- **Ruta:** `/api/v1/assignments/{id}/history`
- **Autenticación:** Bearer Token.
- **Body:** No requiere.

### 2. ¿Para qué sirve? — Endpoint 40 (5)

Permite consultar el historial de modificaciones realizadas sobre una asignación, incluyendo:

- Qué información fue modificada.
- Qué acción se realizó (creación, modificación o eliminación).
- Quién realizó el cambio.
- Cuándo ocurrió.

El historial lo registra el sistema de forma automática; este endpoint solo permite consultarlo.

Se utiliza para mantener la trazabilidad de los cambios realizados sobre una asignación.

### 3. Autenticación y autorización

Requiere una sesión activa y un Bearer Token válido.

El rol del usuario debe tener permisos para consultar el historial de cambios.

### 4. Encabezados HTTP — Endpoint 40 (4)

```http
Authorization: Bearer <access_token>
Accept: application/json
```

### 5. Parámetros de ruta

No requiere cuerpo de solicitud.

#### Descripción de los campos: — Endpoint 40 (3)

| Campo | Tipo          | Obligatorio | Descripción                                                             |
| ----- | ------------- | ----------- | ----------------------------------------------------------------------- |
| `id`  | string (UUID) | Sí          | Identificador único de la asignación cuyo historial se desea consultar. |

### 6. Respuesta exitosa — Endpoint 40

**Código HTTP:** `200 OK`

Devuelve los cambios registrados, del más reciente al más antiguo. Si la asignación no tiene cambios registrados, `history` se devuelve vacío.

```json
{
  "assignmentId": "uuid-asignacion",
  "history": [
    {
      "id": "uuid-registro-historial",
      "actorId": "uuid-usuario",
      "action": "UPDATE",
      "old": {
        "vehicle_id": "uuid-vehiculo-anterior",
        "assignment_status": "scheduled"
      },
      "new": {
        "vehicle_id": "uuid-vehiculo-nuevo",
        "assignment_status": "in_progress"
      },
      "createdAt": "2026-11-04T11:00:00Z"
    }
  ]
}
```

### 7. Respuestas de error

- **400 Bad Request:** El identificador no tiene un formato UUID válido.
- **401 Unauthorized:** No se proporcionó un token válido, la sesión expiró o fue revocada.
- **403 Forbidden:** El usuario no tiene permisos para consultar el historial.
- **404 Not Found:** No existe una asignación con el identificador enviado.
- **500 Internal Server Error:** Ocurrió un error inesperado durante la consulta.

### 8. Validaciones — Endpoint 40

Antes de devolver la información, el backend debe:

- Validar la sesión y comprobar que el rol tenga permiso para consultar el historial.
- Validar que el parámetro `id` tenga formato UUID.
- Verificar que la asignación exista en la tabla `assignment`.
- Consultar los registros de `assignment_log` filtrando por `entity_id`.
- Ordenar los resultados del cambio más reciente al más antiguo.
- Responder con código 404 si la asignación no existe.

### 9. Reglas de negocio — Endpoint 40

- **RN 01. Acceso según rol:** solamente los usuarios autorizados pueden consultar el historial de cambios.
- El historial corresponde únicamente a la asignación solicitada.
- Los registros del historial los genera el sistema de forma automática; no se crean ni se modifican desde este endpoint.
- Cada registro identifica al responsable mediante `actor_id` (FK a `user_account`) y la acción mediante el ENUM `log_action`.
- `assignment_log` contiene `old` y `new` como snapshots JSON, además de `request_ip` y `created_at`; no se infieren cambios que no estén registrados en esas columnas.
- La forma pública de los snapshots y la inclusión de `request_ip` en la respuesta deben definirse conforme al contrato común y las reglas de privacidad.

### 10. Relación con la base de datos — Endpoint 40 (4)

Este endpoint involucra principalmente dos tablas:

- `assignment`: permite verificar que la asignación exista y obtener su estado actual.
- `assignment_log`: almacena el historial de la asignación: `actor_id`, `action`, `old`, `new`, `request_ip` y `created_at`.

#### Relación principal

- `assignment_log.entity_id` → `assignment.id`
- `assignment_log.actor_id` → `user_account.id`

### 11. Relación con las historias de usuario

#### HU12. Historial de cambios

Este endpoint permite cumplir los siguientes criterios:

- Permite consultar cuándo se modificó una asignación y qué información cambió.
- Permite identificar al responsable de cada modificación y conservar la trazabilidad de los cambios.
