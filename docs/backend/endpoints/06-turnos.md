# Módulo de Turnos

> Las menciones a JWT, sesiones, roles y permisos son propuestas, no decisiones aprobadas; dependen de #54, #70 y #71. El formato común de respuestas sigue pendiente de #66.

## Endpoint 24. Crear un turno

**Método y ruta:** `POST /api/v1/schedules`

### 1. ¿Para qué sirve?

Permite registrar un nuevo turno de trabajo en el sistema, definiendo su nombre, hora de inicio y hora de finalización.

Los turnos permiten organizar las jornadas de operación y posteriormente asociarlos a las microrrutas que serán atendidas durante determinados días de la semana.

### 2. Autenticación

Este endpoint requiere autenticación mediante un token de acceso JWT.

El backend debe verificar que el usuario tenga una sesión válida, activa y no revocada. Además, debe comprobar que su rol tenga permisos para registrar turnos.

### 3. Encabezados de la solicitud

- `Authorization: Bearer <token>`
- `Content-Type: application/json`
- `Accept: application/json`

### 4. Cuerpo de la solicitud

El endpoint recibe un objeto JSON con la información del turno.

#### Ejemplo

```json
{
  "name": "Turno Mañana",
  "startTime": "06:00:00",
  "endTime": "12:00:00"
}
```

#### Descripción de los campos

**Campo:** `name`

- Tipo: string.
- Obligatorio: Sí.
- Descripción: nombre asignado al turno de trabajo.
- Campo relacionado en la base de datos: `schedule.name`.

**Campo:** `startTime`

- Tipo: TIME.
- Obligatorio: Sí.
- Descripción: hora de inicio del turno.
- Campo relacionado en la base de datos: `schedule.start_time`.

**Campo:** `endTime`

- Tipo: TIME.
- Obligatorio: Sí.
- Descripción: hora de finalización del turno.
- Campo relacionado en la base de datos: `schedule.end_time`.

### 5. Respuesta exitosa

**Código HTTP:** `201 Created`

```json
{
  "status": "success",
  "message": "Turno creado correctamente",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440010",
    "name": "Turno Mañana",
    "startTime": "06:00:00",
    "endTime": "12:00:00",
    "isActive": true,
    "createdAt": "2026-11-05T13:00:00Z"
  }
}
```

### 6. Respuestas de error

- **400 Bad Request:** Algún campo enviado tiene un formato inválido o no cumple las validaciones requeridas.
- **401 Unauthorized:** No se proporcionó un token válido, la sesión expiró o fue revocada.
- **403 Forbidden:** El usuario no tiene permisos para crear turnos.
- **500 Internal Server Error:** Ocurrió un error inesperado durante el registro.

### 7. Validaciones

Antes de registrar la información, el backend debe:

1. Verificar que se haya enviado el token de autenticación.
2. Validar que corresponda a una sesión existente, no revocada y no expirada mediante la tabla `session`.
3. Comprobar que el rol del usuario tenga permisos para crear turnos.
4. Verificar que el campo `name` esté presente.
5. Validar que el nombre no contenga únicamente espacios en blanco.
6. Verificar que `startTime` y `endTime` estén presentes.
7. Validar que los horarios tengan un formato válido para el tipo de dato TIME.
8. Comprobar que el horario de inicio y finalización cumpla con las restricciones operativas definidas.

### 8. Reglas de negocio

**RN 01. Acceso según rol:** solamente los usuarios autorizados pueden registrar turnos.

**RN 02. Registro de turnos:** cada turno debe contar con un nombre, una hora de inicio y una hora de finalización.

**RN 03. Estado inicial:** debe confirmarse el valor inicial de `schedule.is_active`; el SQL no declara un valor predeterminado.

**RN 04. Identificación:** cada turno debe contar con un identificador UUID generado automáticamente por la base de datos.

**RN 05. Fecha de creación:** el campo `created_at` registra automáticamente la fecha y hora de creación del turno.

**RN 06. Horarios de operación:** los horarios registrados deben respetar las restricciones operativas definidas para las jornadas de trabajo.

### 9. Relación con la base de datos

Este endpoint utiliza principalmente la siguiente tabla:

#### Tabla: `schedule`

Almacena la información de los turnos registrados en el sistema.

#### Campos involucrados

- `id`: identificador UUID del turno.
- `name`: nombre del turno.
- `start_time`: hora de inicio.
- `end_time`: hora de finalización.
- `is_active`: estado del turno.
- `created_at`: fecha de creación.
- `updated_at`: fecha de actualización.

### 10. Relación con las historias de usuario

#### HU5. Gestionar cuadrillas y turnos

Este endpoint permite registrar los turnos de trabajo necesarios para organizar las jornadas operativas y posteriormente asociarlos a las microrrutas correspondientes.

Contribuye al cumplimiento del criterio que establece que el sistema debe permitir asociar una cuadrilla a un turno y organizar el personal disponible durante cada jornada.

---

## Endpoint 25. Listar turnos

**Método y ruta:** `GET /api/v1/schedules`

### 1. ¿Para qué sirve? — Endpoint 25

Permite consultar el listado de turnos registrados en el sistema, mostrando su información general, horarios y estado actual.

La consulta facilita la administración de las jornadas de trabajo y permite identificar los turnos disponibles para la planificación operativa.

### 2. Autenticación — Endpoint 25

Este endpoint requiere autenticación mediante un token JWT válido.

El backend debe verificar que la sesión del usuario se encuentre activa y que su rol tenga permisos para consultar turnos.

### 3. Encabezados de la solicitud — Endpoint 25

- `Authorization: Bearer <token>`
- `Accept: application/json`

### 4. Parámetros de consulta

Este endpoint permite utilizar parámetros de consulta opcionales para filtrar y organizar los resultados.

#### Ejemplo de solicitud

`GET /api/v1/schedules?isActive=true&page=0&size=10`

#### Descripción de los parámetros

**Campo:** `isActive`

- Tipo: boolean.
- Obligatorio: No.
- Descripción: permite filtrar los turnos según su estado. Acepta los valores `true` o `false`.

**Campo:** `page`

- Tipo: integer.
- Obligatorio: No.
- Descripción: indica el número de página que se desea consultar. Su valor predeterminado puede ser `0`.

**Campo:** `size`

- Tipo: integer.
- Obligatorio: No.
- Descripción: establece la cantidad máxima de registros que se devolverán por página.

### 5. Respuesta exitosa — Endpoint 25

**Código HTTP:** `200 OK`

```json
{
  "status": "success",
  "message": "Turnos consultados correctamente",
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440010",
      "name": "Turno Mañana",
      "startTime": "06:00:00",
      "endTime": "12:00:00",
      "isActive": true,
      "createdAt": "2026-11-05T13:00:00Z"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440011",
      "name": "Turno Tarde",
      "startTime": "13:00:00",
      "endTime": "18:00:00",
      "isActive": false,
      "createdAt": "2026-11-05T14:00:00Z"
    }
  ],
  "pagination": {
    "page": 0,
    "size": 10,
    "totalElements": 2,
    "totalPages": 1
  }
}
```

### 6. Respuestas de error — Endpoint 25

- **400 Bad Request:** Algún parámetro de consulta tiene un formato inválido.
- **401 Unauthorized:** No se proporcionó un token válido, la sesión expiró o fue revocada.
- **403 Forbidden:** El usuario no tiene permisos para consultar turnos.
- **500 Internal Server Error:** Ocurrió un error inesperado durante la consulta.

### 7. Validaciones — Endpoint 25

Antes de devolver la información, el backend debe:

1. Verificar que se haya enviado el token de autenticación.
2. Validar que corresponda a una sesión existente, no revocada y no expirada mediante la tabla `session`.
3. Comprobar que el rol del usuario tenga permisos para consultar turnos.
4. Validar que el parámetro `isActive`, cuando se envíe, contenga un valor booleano válido.
5. Validar que los parámetros de paginación tengan valores permitidos.
6. Consultar los turnos registrados aplicando los filtros enviados.

### 8. Reglas de negocio — Endpoint 25

**RN 01. Acceso según rol:** solamente los usuarios autorizados pueden consultar los turnos.

**RN 02. Consulta de turnos:** el sistema debe permitir visualizar los turnos registrados.

**RN 03. Identificación del estado:** cada turno debe mostrar si se encuentra activo o inactivo.

**RN 04. Filtrado:** el sistema debe permitir consultar los turnos según su estado.

**RN 05. Paginación:** la consulta debe permitir dividir los resultados en páginas cuando la cantidad de registros lo requiera.

### 9. Relación con la base de datos — Endpoint 25

Este endpoint utiliza la siguiente tabla:

#### Tabla: `schedule` — Endpoint 25

Contiene los registros de los turnos.

#### Campos involucrados: — Endpoint 25

- `id`
- `name`
- `start_time`
- `end_time`
- `is_active`
- `created_at`
- `updated_at`

### 10. Relación con las historias de usuario — Endpoint 25

#### HU5. Gestionar cuadrillas y turnos — Endpoint 25

Este endpoint permite consultar los turnos registrados para facilitar su administración y organización, identificando las jornadas disponibles para la planificación operativa.

---

## Endpoint 26. Consultar turno por ID

**Método y ruta:** `GET /api/v1/schedules/{id}`

### 1. ¿Para qué sirve? — Endpoint 26 (3)

Permite consultar la información detallada de un turno específico mediante su identificador UUID.

La consulta devuelve el nombre del turno, sus horarios y su estado actual, facilitando la identificación de la jornada de trabajo.

### 2. Autenticación — Endpoint 26 (3)

Este endpoint requiere autenticación mediante un token JWT válido.

El backend debe verificar que la sesión del usuario se encuentre activa y que su rol tenga permisos para consultar la información detallada de los turnos.

### 3. Encabezados de la solicitud — Endpoint 26 (3)

- `Authorization: Bearer <token>`
- `Accept: application/json`

### 4. Parámetros de ruta

**Parámetro:** `id`

- Tipo: UUID.
- Obligatorio: Sí.
- Descripción: identificador único del turno que se desea consultar.

#### Ejemplo de solicitud: — Endpoint 26

`GET /api/v1/schedules/550e8400-e29b-41d4-a716-446655440010`

### 5. Respuesta exitosa — Endpoint 26 (3)

**Código HTTP:** `200 OK`

```json
{
  "status": "success",
  "message": "Turno consultado correctamente",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440010",
    "name": "Turno Mañana",
    "startTime": "06:00:00",
    "endTime": "12:00:00",
    "isActive": true,
    "createdAt": "2026-11-05T13:00:00Z",
    "updatedAt": "2026-11-05T13:00:00Z"
  }
}
```

### 6. Respuestas de error — Endpoint 26 (3)

- **400 Bad Request:** El identificador enviado no tiene un formato UUID válido.
- **401 Unauthorized:** No se proporcionó un token válido, la sesión expiró o fue revocada.
- **403 Forbidden:** El usuario no tiene permisos para consultar la información de los turnos.
- **404 Not Found:** No se encontró un turno con el identificador proporcionado. Este código debe contemplarse y confirmarse en el contrato definitivo de la API.
- **500 Internal Server Error:** Ocurrió un error inesperado durante la consulta.

### 7. Validaciones — Endpoint 26 (3)

Antes de devolver la información, el backend debe:

1. Verificar que se haya enviado el token de autenticación.
2. Validar que corresponda a una sesión existente, no revocada y no expirada mediante la tabla `session`.
3. Comprobar que el rol del usuario tenga permisos para consultar turnos.
4. Validar que el parámetro `id` tenga un formato UUID válido.
5. Comprobar que exista un turno con el identificador proporcionado.
6. Recuperar la información correspondiente al turno solicitado.

### 8. Reglas de negocio — Endpoint 26 (3)

**RN 01. Acceso según rol:** solamente los usuarios autorizados pueden consultar la información detallada de los turnos.

**RN 02. Consulta individual:** el sistema debe permitir consultar un turno específico mediante su identificador.

**RN 03. Información del turno:** la respuesta debe incluir su nombre, horario de inicio, horario de finalización y estado actual.

**RN 04. Integridad de la información:** la consulta debe devolver los datos correspondientes al registro existente en la tabla `schedule`.

### 9. Relación con la base de datos — Endpoint 26 (3)

Este endpoint utiliza la siguiente tabla:

#### Tabla: `schedule` — Endpoint 26 (3)

Contiene la información del turno solicitado.

#### Campos involucrados: — Endpoint 26 (3)

- `id`
- `name`
- `start_time`
- `end_time`
- `is_active`
- `created_at`
- `updated_at`

### 10. Relación con las historias de usuario — Endpoint 26 (3)

#### HU5. Gestionar cuadrillas y turnos — Endpoint 26 (3)

Este endpoint permite consultar individualmente los turnos registrados, facilitando su administración y la organización de las jornadas de trabajo.

---

## Endpoint 27. Actualizar turno

**Método y ruta:** `PATCH /api/v1/schedules/{id}`

### 1. ¿Para qué sirve? — Endpoint 27 (4)

Permite actualizar parcialmente la información de un turno existente mediante su identificador UUID.

La operación permite modificar el nombre del turno, su hora de inicio, su hora de finalización y su estado, según las necesidades de organización de las jornadas operativas.

### 2. Autenticación — Endpoint 27 (4)

Este endpoint requiere autenticación mediante un token JWT válido.

El backend debe verificar que la sesión del usuario se encuentre activa y que su rol tenga permisos para actualizar la información de los turnos.

### 3. Encabezados de la solicitud — Endpoint 27 (4)

- `Authorization: Bearer <token>`
- `Content-Type: application/json`
- `Accept: application/json`

### 4. Parámetros de entrada

**Parámetro de ruta:** `id`

- Tipo: UUID.
- Obligatorio: Sí.
- Descripción: identificador del turno que se desea actualizar.

#### Ejemplo de solicitud: — Endpoint 27 (3)

`PATCH /api/v1/schedules/550e8400-e29b-41d4-a716-446655440010`

#### Cuerpo de la solicitud (JSON)

```json
{
  "name": "Turno Mañana Actualizado",
  "startTime": "05:30:00",
  "endTime": "11:30:00",
  "isActive": true
}
```

#### Descripción de los campos: — Endpoint 27

**Campo:** `name`

- Tipo: string.
- Obligatorio: No.
- Descripción: permite modificar el nombre del turno.
- Campo relacionado en la base de datos: `schedule.name`.

**Campo:** `startTime`

- Tipo: TIME.
- Obligatorio: No.
- Descripción: permite modificar la hora de inicio del turno.
- Campo relacionado en la base de datos: `schedule.start_time`.

**Campo:** `endTime`

- Tipo: TIME.
- Obligatorio: No.
- Descripción: permite modificar la hora de finalización del turno.
- Campo relacionado en la base de datos: `schedule.end_time`.

**Campo:** `isActive`

- Tipo: boolean.
- Obligatorio: No.
- Descripción: permite activar o desactivar el turno. Acepta valores `true` o `false`.
- Campo relacionado en la base de datos: `schedule.is_active`.

Todos los campos del cuerpo de la solicitud son opcionales, debido a que el método `PATCH` permite actualizar parcialmente la información.

### 5. Respuesta exitosa — Endpoint 27 (4)

**Código HTTP:** `200 OK`

```json
{
  "status": "success",
  "message": "Turno actualizado correctamente",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440010",
    "name": "Turno Mañana Actualizado",
    "startTime": "05:30:00",
    "endTime": "11:30:00",
    "isActive": true,
    "createdAt": "2026-11-05T13:00:00Z",
    "updatedAt": "2026-11-05T15:00:00Z"
  }
}
```

### 6. Respuestas de error — Endpoint 27 (4)

- **400 Bad Request:** Algún campo enviado tiene un formato inválido o no cumple las validaciones requeridas.
- **401 Unauthorized:** No se proporcionó un token válido, la sesión expiró o fue revocada.
- **403 Forbidden:** El usuario no tiene permisos para actualizar turnos.
- **404 Not Found:** No se encontró un turno con el identificador proporcionado. Este código debe contemplarse y confirmarse en el contrato definitivo de la API.
- **500 Internal Server Error:** Ocurrió un error inesperado durante la actualización.

### 7. Validaciones — Endpoint 27 (4)

Antes de actualizar la información, el backend debe:

1. Verificar que se haya enviado el token de autenticación.
2. Validar que corresponda a una sesión existente, no revocada y no expirada mediante la tabla `session`.
3. Comprobar que el rol del usuario tenga permisos para actualizar turnos.
4. Validar que el parámetro `id` tenga un formato UUID válido.
5. Comprobar que exista un turno con el identificador proporcionado.
6. Verificar que al menos uno de los campos permitidos haya sido enviado.
7. Validar que el nombre, cuando se envíe, no esté vacío ni contenga únicamente espacios en blanco.
8. Validar que las horas enviadas tengan un formato válido para el tipo de dato TIME.
9. Comprobar que los horarios cumplan con las restricciones operativas establecidas.
10. Validar que `isActive`, cuando se envíe, contenga un valor booleano válido.
11. Actualizar el campo `updated_at` con la fecha y hora de la modificación.

### 8. Reglas de negocio — Endpoint 27 (4)

**RN 01. Acceso según rol:** solamente los usuarios autorizados pueden modificar la información de los turnos.

**RN 02. Actualización parcial:** el sistema debe permitir modificar únicamente los campos enviados en la solicitud, conservando los demás valores.

**RN 03. Modificación de horarios:** los horarios de inicio y finalización deben respetar las restricciones operativas definidas para las jornadas de trabajo.

**RN 04. Activación y desactivación:** el sistema debe permitir activar o desactivar un turno según las necesidades de la planificación.

**RN 05. Estado del turno:** cuando un turno se desactive, debe quedar identificado mediante `is_active = false`.

**RN 06. Fecha de actualización:** cada modificación debe actualizar el campo `updated_at`.

### 9. Relación con la base de datos — Endpoint 27 (4)

Este endpoint utiliza la siguiente tabla:

#### Tabla: `schedule` — Endpoint 27 (4)

Almacena y permite actualizar la información del turno.

#### Campos involucrados: — Endpoint 27 (4)

- `id`: identificador UUID del turno.
- `name`: nombre del turno.
- `start_time`: hora de inicio.
- `end_time`: hora de finalización.
- `is_active`: estado del turno.
- `created_at`: fecha de creación.
- `updated_at`: fecha de actualización.

### 10. Relación con las historias de usuario — Endpoint 27 (4)

#### HU5. Gestionar cuadrillas y turnos — Endpoint 27 (4)

Este endpoint permite modificar la información de los turnos y controlar su estado para facilitar la organización de las jornadas de trabajo.

Contribuye al cumplimiento de los criterios relacionados con la gestión de turnos y la disponibilidad del personal operativo.

---
