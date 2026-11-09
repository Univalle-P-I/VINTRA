# Endpoints independientes: Turnos de microrrutas

> Las menciones a JWT, sesiones, roles y permisos son propuestas, no decisiones aprobadas; dependen de #54, #70 y #71. El formato común de respuestas sigue pendiente de #66.

## Endpoint 41. Listar turnos de una microrruta

### 1. Información general

- **Método:** GET
- **Ruta:** `/api/v1/microroutes/{id}/schedules`
- **Autenticación:** Bearer Token.
- **Body:** No requiere.

### 2. ¿Para qué sirve?

Permite consultar los turnos programados de una microrruta, indicando en qué día de la semana opera cada uno.

Se utiliza para administrar los horarios de la microrruta y para verificar en qué turnos puede asignarse personal y vehículos.

Por defecto, el sistema devuelve únicamente las programaciones activas.

### 3. Autenticación y autorización

Requiere una sesión activa y un Bearer Token válido.

El rol del usuario debe tener permisos para consultar rutas.

### 4. Encabezados HTTP

```http
Authorization: Bearer <access_token>
Accept: application/json
```

### 5. Parámetros de ruta y de consulta

No requiere cuerpo de solicitud.

**Descripción de los campos:**

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `id` | string (UUID) | Sí | Identificador único de la microrruta cuyos turnos se desean consultar. |
| `isActive` | boolean | No | Filtra las programaciones activas o inactivas. Por defecto devuelve únicamente las activas. |
| `dayOfWeek` | integer | No | Filtra por día de la semana; el rango y la codificación deben confirmarse, pues el SQL solo declara `SMALLINT`. |

### 6. Respuesta exitosa

**Código HTTP:** `200 OK`

```json
[
  {
    "id": "uuid-microroute-schedule",
    "dayOfWeek": 1,
    "schedule": {
      "id": "uuid-turno",
      "name": "Turno mañana",
      "startTime": "06:00",
      "endTime": "14:00"
    },
    "isActive": true,
    "createdAt": "2026-11-04T08:00:00Z",
    "updatedAt": "2026-11-04T08:00:00Z"
  }
]
```

### 7. Respuestas de error

- **400 Bad Request:** El identificador no tiene un formato UUID válido o algún parámetro de consulta tiene un valor inválido.
- **401 Unauthorized:** No se proporcionó un token válido, la sesión expiró o fue revocada.
- **403 Forbidden:** El usuario no tiene permisos para consultar rutas.
- **404 Not Found:** No existe una microrruta con el identificador enviado.
- **500 Internal Server Error:** Ocurrió un error inesperado durante la consulta.

### 8. Validaciones

Antes de devolver la información, el backend debe:

- Validar la sesión y comprobar que el rol tenga permiso para consultar rutas.
- Validar que el parámetro `id` tenga formato UUID.
- Validar que `isActive` tenga un valor booleano válido cuando se proporcione.
- Validar que `dayOfWeek` sea un entero cuando se proporcione; el rango y la correspondencia con los días de semana requieren confirmación, ya que el SQL solo define `SMALLINT`.
- Verificar que la microrruta exista en la tabla `microroute`.
- Consultar las programaciones en `microroute_schedule`, incluyendo el turno asociado desde `schedule`.
- Aplicar los filtros recibidos. Si no se envía `isActive`, devolver solo las activas.
- Ordenar los resultados por día de la semana y hora de inicio del turno.

### 9. Reglas de negocio

- **RN 01. Acceso según rol:** solamente los usuarios autorizados pueden consultar rutas.
- Por defecto, el sistema devuelve únicamente las programaciones activas.
- Una microrruta inactiva puede consultarse, pero sus programaciones no deben usarse para nuevas asignaciones.
- Una microrruta puede tener varias programaciones, en distintos días y turnos.

### 10. Relación con la base de datos

Este endpoint involucra principalmente tres tablas:

- `microroute`: permite verificar que la microrruta exista.
- `microroute_schedule`: contiene las programaciones de la microrruta y el día de la semana.
- `schedule`: contiene el nombre y el horario de cada turno.

**Las relaciones principales son:**

- `microroute_schedule.microroute_id` → `microroute.id`
- `microroute_schedule.schedule_id` → `schedule.id`

### 11. Relación con las historias de usuario

**HU8. Crear microrrutas**

Permite consultar los turnos en los que opera la microrruta.

**HU10. Asignar recursos a una microrruta**

Permite identificar las programaciones disponibles para crear asignaciones.

---

## Endpoint 42. Asociar turno a una microrruta

### 1. Información general

- **Método:** POST
- **Ruta:** `/api/v1/microroutes/{id}/schedules`
- **Autenticación:** Bearer Token.
- **Body:** Sí requiere.

### 2. ¿Para qué sirve?

Permite programar una microrruta en un turno y un día de la semana.

La programación creada queda disponible para generar asignaciones de personal y vehículos.

Una microrruta puede tener varios turnos programados, en distintos días.

### 3. Autenticación y autorización

Requiere una sesión activa y un Bearer Token válido.

El rol del usuario debe tener permisos para administrar rutas.

### 4. Encabezados HTTP

```http
Authorization: Bearer <access_token>
Content-Type: application/json
Accept: application/json
```

### 5. Parámetros de ruta y cuerpo de la solicitud

**Cuerpo de la solicitud:**

```json
{
  "scheduleId": "uuid-turno",
  "dayOfWeek": 1
}
```

**Descripción de los campos:**

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `id` (parámetro de ruta) | string (UUID) | Sí | Identificador único de la microrruta a la que se asocia el turno. |
| `scheduleId` | string (UUID) | Sí | Identificador del turno. Debe existir en la tabla `schedule`. |
| `dayOfWeek` | integer | Sí | Día de la semana en que opera la microrruta en ese turno; el rango y la codificación deben confirmarse, pues el SQL solo declara `SMALLINT`. |

### 6. Respuesta exitosa

**Código HTTP:** `201 Created`

Devuelve la programación creada.

```json
{
  "id": "uuid-microroute-schedule",
  "dayOfWeek": 1,
  "schedule": {
    "id": "uuid-turno",
    "name": "Turno mañana",
    "startTime": "06:00",
    "endTime": "14:00"
  },
  "isActive": true,
  "createdAt": "2026-11-04T08:00:00Z",
  "updatedAt": "2026-11-04T08:00:00Z"
}
```

### 7. Respuestas de error

- **400 Bad Request:** Faltan campos obligatorios o los datos enviados no cumplen con el formato esperado.
- **401 Unauthorized:** No se proporcionó un token válido, la sesión expiró o fue revocada.
- **403 Forbidden:** El usuario no tiene permisos para administrar rutas.
- **404 Not Found:** No existe la microrruta o el turno enviado.
- **409 Conflict:** La microrruta ya tiene programado ese turno en ese día, o la microrruta o el turno se encuentran inactivos.
- **500 Internal Server Error:** Ocurrió un error inesperado durante el registro.

### 8. Validaciones

Antes de crear la programación, el backend debe:

- Validar la sesión y comprobar que el rol tenga permiso para administrar rutas.
- Validar que el parámetro `id` tenga formato UUID.
- Verificar que se hayan enviado todos los campos obligatorios.
- Validar que `scheduleId` tenga formato UUID.
- Validar que `dayOfWeek` sea un entero; el rango y la correspondencia con los días de semana requieren confirmación, ya que el SQL solo define `SMALLINT`.
- Verificar que la microrruta exista y se encuentre activa.
- Verificar que el turno exista y se encuentre activo en `schedule`.
- Verificar que no exista otra programación con la misma microrruta, turno y día de la semana.
- Definir el valor inicial de `is_active`; el SQL no establece un valor predeterminado.
- Registrar las fechas `created_at` y `updated_at`.
- Definir la auditoría de la programación: el DER no contiene una tabla de log específica para `microroute_schedule`; `microroute_log` referencia `microroute.id`, no la programación, y sus columnas son `old` y `new`.

### 9. Reglas de negocio

- **RN 01. Acceso según rol:** solamente los usuarios autorizados pueden administrar rutas.
- La misma combinación de microrruta, turno y día de la semana no puede repetirse.
- El valor inicial de `is_active` requiere confirmación; el SQL no declara un valor predeterminado.
- El registro en el historial lo genera el sistema; no lo realiza el usuario.
- **Pendiente por definir:** si una microrruta puede tener dos turnos distintos el mismo día. El modelo de datos lo permite.
- **Pendiente de modelo de datos:** se recomienda agregar la restricción `UNIQUE (microroute_id, schedule_id, day_of_week)` en `microroute_schedule` para garantizar la regla anterior desde la base de datos.
- **Pendiente de definición:** `microroute_schedule` no tiene tabla de historial propia. El DER no determina si los cambios deben registrarse en `microroute_log`; esa tabla referencia la microrruta, no la programación.

### 10. Relación con la base de datos

Este endpoint involucra principalmente cuatro tablas:

- `microroute`: permite verificar que la microrruta exista y esté activa.
- `schedule`: permite verificar que el turno exista y esté activo.
- `microroute_schedule`: almacena la nueva programación.
- `microroute_log`: su vínculo es con `microroute`; no queda definido cómo identificar ahí cambios de una programación concreta.

**Las relaciones principales son:**

- `microroute_schedule.microroute_id` → `microroute.id`
- `microroute_schedule.schedule_id` → `schedule.id`
- `microroute_log.entity_id` → `microroute.id` (no a `microroute_schedule.id`)

### 11. Relación con las historias de usuario

**HU8. Crear microrrutas**

Permite definir los turnos en los que opera la microrruta.

**HU10. Asignar recursos a una microrruta**

Las programaciones creadas son la base para generar asignaciones.

---

## Endpoint 43. Actualizar turno programado de una microrruta

### 1. Información general

- **Método:** PATCH
- **Ruta:** `/api/v1/microroutes/{id}/schedules/{microrouteScheduleId}`
- **Autenticación:** Bearer Token.
- **Body:** Sí requiere.

### 2. ¿Para qué sirve?

Permite modificar el día de la semana de una programación existente o activarla y desactivarla.

La desactivación es lógica: el registro no se elimina, porque puede estar relacionado con asignaciones históricas.

Una programación inactiva no debe usarse para crear nuevas asignaciones.

Para cambiar el turno de una programación, se desactiva la existente y se crea una nueva.

### 3. Autenticación y autorización

Requiere una sesión activa y un Bearer Token válido.

El rol del usuario debe tener permisos para administrar rutas.

### 4. Encabezados HTTP

```http
Authorization: Bearer <access_token>
Content-Type: application/json
Accept: application/json
```

### 5. Parámetros de ruta y cuerpo de la solicitud

Todos los campos del cuerpo son opcionales individualmente, pero debe enviarse al menos uno.

**Cuerpo de la solicitud:**

```json
{
  "dayOfWeek": 2,
  "isActive": true
}
```

**Descripción de los campos:**

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `id` (parámetro de ruta) | string (UUID) | Sí | Identificador único de la microrruta. |
| `microrouteScheduleId` (parámetro de ruta) | string (UUID) | Sí | Identificador único de la programación que se desea modificar. |
| `dayOfWeek` | integer | No | Nuevo día de la semana; el rango y la codificación deben confirmarse, pues el SQL solo declara `SMALLINT`. |
| `isActive` | boolean | No | Indica si la programación se encuentra activa o inactiva. |

### 6. Respuesta exitosa

**Código HTTP:** `200 OK`

Devuelve la programación actualizada con la misma estructura del endpoint de listado de turnos.

```json
{
  "id": "uuid-microroute-schedule",
  "dayOfWeek": 2,
  "schedule": {
    "id": "uuid-turno",
    "name": "Turno mañana",
    "startTime": "06:00",
    "endTime": "14:00"
  },
  "isActive": true,
  "createdAt": "2026-11-04T08:00:00Z",
  "updatedAt": "2026-11-05T09:00:00Z"
}
```

### 7. Respuestas de error

- **400 Bad Request:** El cuerpo está vacío, contiene campos desconocidos o presenta datos con formato inválido.
- **401 Unauthorized:** No se proporcionó un token válido, la sesión expiró o fue revocada.
- **403 Forbidden:** El usuario no tiene permisos para administrar rutas.
- **404 Not Found:** No existe la microrruta o la programación, o la programación no pertenece a esa microrruta.
- **409 Conflict:** Ya existe otra programación con ese turno y día, o la programación no puede desactivarse porque tiene asignaciones pendientes o en curso, si esta restricción es aprobada.
- **500 Internal Server Error:** Ocurrió un error inesperado durante el proceso.

### 8. Validaciones

Antes de actualizar la información, el backend debe:

- Validar la sesión y comprobar que el rol tenga permiso para administrar rutas.
- Validar que los parámetros `id` y `microrouteScheduleId` tengan formato UUID.
- Verificar que la microrruta exista.
- Verificar que la programación exista y pertenezca a la microrruta indicada.
- Comprobar que se haya enviado al menos un campo en el cuerpo de la solicitud.
- Rechazar los campos que no estén definidos para esta operación, como `scheduleId`.
- Validar que `dayOfWeek` sea un entero cuando se proporcione; aplicar el rango y la codificación que confirme el equipo.
- Verificar que el nuevo día no genere una programación duplicada para la misma microrruta y turno.
- Validar que `isActive` tenga un valor booleano válido cuando se proporcione.
- Verificar si la programación puede desactivarse cuando tenga asignaciones en estado `scheduled` o `in_progress` en la tabla `assignment`; los valores son marcadores de posición y la regla requiere confirmación.
- Actualizar `updated_at` con la fecha y hora de la modificación.
- Definir la auditoría de los cambios; el DER no contiene una tabla de log específica para `microroute_schedule`. `microroute_log` tiene `old`/`new` y referencia `microroute.id`, no la programación.

### 9. Reglas de negocio

- **RN 01. Acceso según rol:** solamente los usuarios autorizados pueden administrar rutas.
- La programación no se elimina físicamente; se desactiva mediante el campo `is_active`.
- Una programación inactiva no puede usarse en nuevas asignaciones, de acuerdo con HU10.
- La información histórica se conserva para no afectar las asignaciones anteriores.
- El registro en el historial lo genera el sistema; no lo realiza el usuario.
- **Pendiente por definir:** qué ocurre con las asignaciones pendientes cuando se desactiva o se cambia el día de una programación.
- **Pendiente por definir:** si se permite desactivar una programación con asignaciones en curso.

### 10. Relación con la base de datos

Este endpoint involucra principalmente cuatro tablas:

- `microroute`: permite verificar que la microrruta exista.
- `microroute_schedule`: permite actualizar `day_of_week`, `is_active` y `updated_at`.
- `assignment`: permite verificar si la programación tiene asignaciones pendientes o en curso.
- `microroute_log`: registra cambios de microrruta; su uso para auditar cambios de programación queda pendiente.

**Las relaciones principales son:**

- `microroute_schedule.microroute_id` → `microroute.id`
- `assignment.microroute_schedule_id` → `microroute_schedule.id`
- `microroute_log.entity_id` → `microroute.id`

### 11. Relación con las historias de usuario

**HU8. Crear microrrutas**

Permite mantener actualizados los turnos en los que opera la microrruta.

**HU10. Asignar recursos a una microrruta**

Una programación inactiva deja de estar disponible para crear nuevas asignaciones.