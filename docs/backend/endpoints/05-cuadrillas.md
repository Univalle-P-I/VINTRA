# Módulo de Cuadrillas

> Las menciones a JWT, sesiones, roles y permisos son propuestas, no decisiones aprobadas; dependen de #54, #70 y #71. El formato común de respuestas sigue pendiente de #66.

## Endpoint 20. Crear una cuadrilla

**Método y ruta:** `POST /api/v1/crews`

### 1. ¿Para qué sirve?

Permite registrar una nueva cuadrilla de trabajo en VINTRA, asignándole un nombre para identificarla dentro de la operación.

Las cuadrillas permiten organizar al personal operativo que participará en las actividades de recolección. Posteriormente, podrán estar conformadas por conductores y recolectores registrados en el sistema.

### 2. Autenticación

Este endpoint requiere autenticación mediante un token de acceso JWT.

El backend debe verificar que el usuario tenga una sesión válida, activa y no revocada. Además, debe comprobar que su rol tenga permisos para registrar cuadrillas.

### 3. Encabezados de la solicitud

- `Authorization: Bearer <token>`
- `Content-Type: application/json`
- `Accept: application/json`

### 4. Cuerpo de la solicitud

El endpoint recibe un objeto JSON con el nombre de la cuadrilla.

#### Ejemplo

```json
{
  "name": "Cuadrilla Norte"
}
```

#### Descripción de los campos

**Campo:** `name`

- Tipo: string.
- Obligatorio: Sí.
- Descripción: nombre asignado a la cuadrilla.
- Campo relacionado en la base de datos: `crew.name`.

### 5. Respuesta exitosa

**Código HTTP:** `201 Created`

```json
{
  "status": "success",
  "message": "Cuadrilla creada correctamente",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Cuadrilla Norte",
    "isActive": true,
    "createdAt": "2026-11-05T13:00:00Z"
  }
}
```

### 6. Respuestas de error

- **400 Bad Request:** La información enviada no cumple con las validaciones requeridas.
- **401 Unauthorized:** No se proporcionó un token válido, la sesión expiró o fue revocada.
- **403 Forbidden:** El usuario no tiene permisos para crear cuadrillas.
- **500 Internal Server Error:** Ocurrió un error inesperado durante el registro.

### 7. Validaciones

Antes de registrar la información, el backend debe:

1. Verificar que se haya enviado el token de autenticación.
2. Validar que corresponda a una sesión existente, no revocada y no expirada mediante la tabla `session`.
3. Comprobar que el rol del usuario tenga permisos para crear cuadrillas.
4. Verificar que el campo `name` esté presente.
5. Validar que el nombre no esté vacío ni contenga únicamente espacios en blanco.
6. Comprobar que la información cumpla con las restricciones definidas para el campo `name`.

### 8. Reglas de negocio

**RN 01. Acceso según rol:** solamente los usuarios autorizados pueden crear cuadrillas.

**RN 02. Registro de cuadrillas:** toda cuadrilla debe contar con un nombre que permita identificarla dentro del sistema.

**RN 03. Estado inicial:** debe confirmarse el valor inicial de `crew.is_active`; el SQL no declara un valor predeterminado.

**RN 04. Identificación:** cada cuadrilla debe contar con un identificador UUID generado automáticamente por la base de datos.

**RN 05. Fecha de creación:** el campo `created_at` registra automáticamente la fecha y hora de creación de la cuadrilla.

### 9. Relación con la base de datos

Este endpoint utiliza principalmente la siguiente tabla:

#### Tabla: `crew`

Almacena la información de las cuadrillas registradas en el sistema.

#### Campos involucrados

- `id`: identificador UUID de la cuadrilla.
- `name`: nombre de la cuadrilla.
- `is_active`: estado de la cuadrilla.
- `created_at`: fecha de creación.
- `updated_at`: fecha de actualización.

### 10. Relación con las historias de usuario

#### HU5. Gestionar cuadrillas y turnos

Este endpoint permite registrar las cuadrillas que posteriormente serán conformadas con personal operativo y asociadas a los turnos correspondientes.

Contribuye al cumplimiento del criterio que establece que el sistema debe permitir conformar cuadrillas con personal registrado.

---

## Endpoint 21. Listar cuadrillas

**Método y ruta:** `GET /api/v1/crews`

### 1. ¿Para qué sirve? — Endpoint 21

Permite consultar el listado de cuadrillas registradas en el sistema, mostrando su información general y estado actual.

La consulta facilita la administración de las cuadrillas y permite identificar cuáles se encuentran activas o inactivas.

### 2. Autenticación — Endpoint 21

Este endpoint requiere autenticación mediante un token JWT válido.

El backend debe verificar que la sesión del usuario se encuentre activa y que su rol tenga permisos para consultar cuadrillas.

### 3. Encabezados de la solicitud — Endpoint 21

- `Authorization: Bearer <token>`
- `Accept: application/json`

### 4. Parámetros de consulta

Este endpoint permite utilizar parámetros de consulta opcionales para filtrar y organizar los resultados.

#### Ejemplo de solicitud

`GET /api/v1/crews?isActive=true&page=0&size=10`

#### Descripción de los parámetros

**Campo:** `isActive`

- Tipo: boolean.
- Obligatorio: No.
- Descripción: permite filtrar las cuadrillas según su estado. Acepta los valores `true` o `false`.

**Campo:** `page`

- Tipo: integer.
- Obligatorio: No.
- Descripción: indica el número de página que se desea consultar. Su valor predeterminado puede ser `0`.

**Campo:** `size`

- Tipo: integer.
- Obligatorio: No.
- Descripción: establece la cantidad máxima de registros que se devolverán por página.

### 5. Respuesta exitosa — Endpoint 21

**Código HTTP:** `200 OK`

```json
{
  "status": "success",
  "message": "Cuadrillas consultadas correctamente",
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Cuadrilla Norte",
      "isActive": true,
      "createdAt": "2026-11-05T13:00:00Z"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "name": "Cuadrilla Sur",
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

### 6. Respuestas de error — Endpoint 21

- **400 Bad Request:** Algún parámetro de consulta tiene un formato inválido.
- **401 Unauthorized:** No se proporcionó un token válido, la sesión expiró o fue revocada.
- **403 Forbidden:** El usuario no tiene permisos para consultar cuadrillas.
- **500 Internal Server Error:** Ocurrió un error inesperado durante la consulta.

### 7. Validaciones — Endpoint 21

Antes de devolver la información, el backend debe:

1. Verificar que se haya enviado el token de autenticación.
2. Validar que corresponda a una sesión existente, no revocada y no expirada mediante la tabla `session`.
3. Comprobar que el rol del usuario tenga permisos para consultar cuadrillas.
4. Validar que el parámetro `isActive`, cuando se envíe, contenga un valor booleano válido.
5. Validar que los parámetros de paginación tengan valores permitidos.
6. Consultar únicamente los registros que cumplan con los filtros enviados.

### 8. Reglas de negocio — Endpoint 21

**RN 01. Acceso según rol:** solamente los usuarios autorizados pueden consultar las cuadrillas.

**RN 02. Consulta de cuadrillas:** el sistema debe permitir visualizar las cuadrillas registradas.

**RN 03. Identificación del estado:** cada cuadrilla debe mostrar si se encuentra activa o inactiva.

**RN 04. Filtrado:** el sistema debe permitir filtrar las cuadrillas según su estado.

**RN 05. Paginación:** cuando la cantidad de registros sea elevada, la consulta debe permitir dividir los resultados en páginas.

### 9. Relación con la base de datos — Endpoint 21

Este endpoint utiliza la siguiente tabla:

#### Tabla: `crew` — Endpoint 21

Contiene los registros de las cuadrillas.

#### Campos involucrados: — Endpoint 21

- `id`
- `name`
- `is_active`
- `created_at`
- `updated_at`

### 10. Relación con las historias de usuario — Endpoint 21

#### HU5. Gestionar cuadrillas y turnos — Endpoint 21

Este endpoint permite consultar las cuadrillas registradas para facilitar su organización y administración, así como identificar cuáles se encuentran activas para la planificación operativa.

---

## Endpoint 22. Consultar cuadrilla por ID

**Método y ruta:** `GET /api/v1/crews/{id}`

### 1. ¿Para qué sirve? — Endpoint 22 (3)

Permite consultar la información detallada de una cuadrilla específica mediante su identificador UUID.

La respuesta incluye los datos generales de la cuadrilla y el personal asociado a ella, permitiendo identificar los conductores y recolectores que la conforman.

Es importante diferenciar ambos tipos de personal, ya que los conductores cuentan con una cuenta de usuario asociada, mientras que los recolectores se registran como integrantes del personal operativo sin necesidad de una cuenta de acceso.

### 2. Autenticación — Endpoint 22 (3)

Este endpoint requiere autenticación mediante un token JWT válido.

El backend debe verificar que la sesión del usuario se encuentre activa y que su rol tenga permisos para consultar la información detallada de una cuadrilla.

### 3. Encabezados de la solicitud — Endpoint 22 (3)

- `Authorization: Bearer <token>`
- `Accept: application/json`

### 4. Parámetros de ruta

**Parámetro:** `id`

- Tipo: UUID.
- Obligatorio: Sí.
- Descripción: identificador único de la cuadrilla que se desea consultar.

#### Ejemplo de solicitud: — Endpoint 22

`GET /api/v1/crews/550e8400-e29b-41d4-a716-446655440000`

### 5. Respuesta exitosa — Endpoint 22 (3)

**Código HTTP:** `200 OK`

```json
{
  "status": "success",
  "message": "Cuadrilla consultada correctamente",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Cuadrilla Norte",
    "isActive": true,
    "createdAt": "2026-11-05T13:00:00Z",
    "updatedAt": "2026-11-05T13:00:00Z",
    "drivers": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "firstName": "Carlos",
        "lastName": "Pérez",
        "isActive": true
      }
    ],
    "crewMembers": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440003",
        "fullName": "Juan Rodríguez",
        "isActive": true
      }
    ]
  }
}
```

#### Descripción de la información devuelta

- `id`: identificador de la cuadrilla.
- `name`: nombre de la cuadrilla.
- `isActive`: estado de la cuadrilla.
- `createdAt`: fecha de creación.
- `updatedAt`: fecha de última actualización.
- `drivers`: listado de conductores asociados a la cuadrilla.
- `crewMembers`: listado de recolectores asociados a la cuadrilla.

#### Información de los conductores

- `id`: identificador del conductor.
- `firstName`: nombre del conductor.
- `lastName`: apellido del conductor.
- `isActive`: estado de su vinculación.

#### Información de los recolectores

- `id`: identificador del recolector.
- `fullName`: nombre completo del recolector.
- `isActive`: estado de su vinculación.

### 6. Respuestas de error — Endpoint 22 (3)

- **400 Bad Request:** El identificador enviado no tiene un formato UUID válido.
- **401 Unauthorized:** No se proporcionó un token válido, la sesión expiró o fue revocada.
- **403 Forbidden:** El usuario no tiene permisos para consultar la información detallada de una cuadrilla.
- **404 Not Found:** No se encontró una cuadrilla con el identificador proporcionado. Este código debe contemplarse y confirmarse en el contrato definitivo de la API.
- **500 Internal Server Error:** Ocurrió un error inesperado durante la consulta.

### 7. Validaciones — Endpoint 22 (3)

Antes de devolver la información, el backend debe:

1. Verificar que se haya enviado el token de autenticación.
2. Validar que corresponda a una sesión existente, no revocada y no expirada mediante la tabla `session`.
3. Comprobar que el rol del usuario tenga permisos para consultar cuadrillas.
4. Validar que el parámetro `id` tenga un formato UUID válido.
5. Comprobar que exista una cuadrilla con el identificador proporcionado.
6. Consultar los conductores relacionados mediante `driver.crew_id`.
7. Consultar los datos personales de los conductores mediante la relación `driver.user_data_id`.
8. Consultar los recolectores relacionados mediante `crew_member.crew_id`.
9. Devolver el estado actual de cada integrante según su correspondiente campo `is_active`.

### 8. Reglas de negocio — Endpoint 22 (3)

**RN 01. Acceso según rol:** solamente los usuarios autorizados pueden consultar la información detallada de una cuadrilla.

**RN 02. Consulta de integrantes:** el sistema debe mostrar el personal asociado a la cuadrilla.

**RN 03. Identificación del personal:** los conductores y recolectores deben mostrarse diferenciados según su tipo de registro.

**RN 04. Estado del personal:** el sistema debe identificar si cada integrante se encuentra activo o inactivo dentro de la cuadrilla, de acuerdo con su correspondiente registro.

**RN 05. Integridad de la información:** la consulta debe respetar las relaciones establecidas entre `crew`, `driver`, `user_data` y `crew_member`.

### 9. Relación con la base de datos — Endpoint 22 (3)

Este endpoint involucra cuatro tablas principales:

#### Tabla: `crew` — Endpoint 22 (3)

Almacena la información general de la cuadrilla.

#### Tabla: `driver`

Registra los conductores asociados a una cuadrilla. Los conductores tienen una cuenta de usuario vinculada.

#### Tabla: `user_data`

Proporciona los datos personales de los conductores.

#### Tabla: `crew_member`

Almacena los recolectores asociados a una cuadrilla. Estos registros no requieren una cuenta de usuario.

#### Relaciones principales

- `driver.crew_id → crew.id`
- `driver.user_data_id → user_data.id`
- `crew_member.crew_id → crew.id`

### 10. Relación con las historias de usuario — Endpoint 22 (3)

#### HU5. Gestionar cuadrillas y turnos — Endpoint 22 (3)

Este endpoint permite consultar la composición de una cuadrilla e identificar el personal que la integra, cumpliendo con el criterio de mostrar los integrantes asociados a cada cuadrilla.

También contribuye a la organización del personal operativo para su posterior asignación a los turnos correspondientes.

---

## Endpoint 23. Actualizar cuadrilla

**Método y ruta:** `PATCH /api/v1/crews/{id}`

### 1. ¿Para qué sirve? — Endpoint 23 (4)

Permite actualizar parcialmente la información de una cuadrilla existente mediante su identificador UUID.

La operación permite modificar el nombre de la cuadrilla y cambiar su estado para activarla o desactivarla según las necesidades de la operación.

### 2. Autenticación — Endpoint 23 (4)

Este endpoint requiere autenticación mediante un token JWT válido.

El backend debe verificar que la sesión del usuario se encuentre activa y que su rol tenga permisos para actualizar la información de las cuadrillas.

### 3. Encabezados de la solicitud — Endpoint 23 (4)

- `Authorization: Bearer <token>`
- `Content-Type: application/json`
- `Accept: application/json`

### 4. Parámetros de entrada

**Parámetro de ruta:** `id`

- Tipo: UUID.
- Obligatorio: Sí.
- Descripción: identificador de la cuadrilla que se desea actualizar.

#### Ejemplo de solicitud: — Endpoint 23 (3)

`PATCH /api/v1/crews/550e8400-e29b-41d4-a716-446655440000`

#### Cuerpo de la solicitud (JSON)

```json
{
  "name": "Cuadrilla Norte Actualizada",
  "isActive": false
}
```

#### Descripción de los campos: — Endpoint 23

**Campo:** `name`

- Tipo: string.
- Obligatorio: No.
- Descripción: permite modificar el nombre de la cuadrilla.
- Campo relacionado en la base de datos: `crew.name`.

**Campo:** `isActive`

- Tipo: boolean.
- Obligatorio: No.
- Descripción: permite cambiar el estado de la cuadrilla. Acepta valores `true` o `false`.
- Campo relacionado en la base de datos: `crew.is_active`.

Ambos campos son opcionales, debido a que el método `PATCH` permite actualizar parcialmente la información.

### 5. Respuesta exitosa — Endpoint 23 (4)

**Código HTTP:** `200 OK`

```json
{
  "status": "success",
  "message": "Cuadrilla actualizada correctamente",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Cuadrilla Norte Actualizada",
    "isActive": false,
    "createdAt": "2026-11-05T13:00:00Z",
    "updatedAt": "2026-11-05T15:00:00Z"
  }
}
```

### 6. Respuestas de error — Endpoint 23 (4)

- **400 Bad Request:** Algún parámetro o campo enviado tiene un formato inválido o no cumple las validaciones.
- **401 Unauthorized:** No se proporcionó un token válido, la sesión expiró o fue revocada.
- **403 Forbidden:** El usuario no tiene permisos para actualizar cuadrillas.
- **404 Not Found:** No se encontró una cuadrilla con el identificador proporcionado. Este código debe contemplarse y confirmarse en el contrato definitivo de la API.
- **500 Internal Server Error:** Ocurrió un error inesperado durante la actualización.

### 7. Validaciones — Endpoint 23 (4)

Antes de actualizar la información, el backend debe:

1. Verificar que se haya enviado el token de autenticación.
2. Validar que corresponda a una sesión existente, no revocada y no expirada mediante la tabla `session`.
3. Comprobar que el rol del usuario tenga permisos para actualizar cuadrillas.
4. Validar que el parámetro `id` tenga un formato UUID válido.
5. Comprobar que exista una cuadrilla con el identificador proporcionado.
6. Verificar que al menos uno de los campos permitidos haya sido enviado.
7. Validar que el nombre, cuando se envíe, no esté vacío ni contenga únicamente espacios en blanco.
8. Validar que `isActive`, cuando se envíe, contenga un valor booleano válido.
9. Actualizar el campo `updated_at` con la fecha y hora de la modificación.

### 8. Reglas de negocio — Endpoint 23 (4)

**RN 01. Acceso según rol:** solamente los usuarios autorizados pueden modificar la información de las cuadrillas.

**RN 02. Actualización parcial:** el sistema debe permitir modificar únicamente los campos enviados en la solicitud, conservando los demás valores.

**RN 03. Activación y desactivación:** una cuadrilla puede activarse o desactivarse según las necesidades de la operación.

**RN 04. Estado de la cuadrilla:** cuando una cuadrilla se desactive, debe quedar identificada como inactiva mediante `is_active = false`.

**RN 05. Fecha de actualización:** cada modificación debe actualizar el campo `updated_at`.

**RN 06. Integridad de la información:** la actualización no debe modificar ni eliminar los registros históricos del personal asociado a la cuadrilla.

### 9. Relación con la base de datos — Endpoint 23 (4)

Este endpoint utiliza la siguiente tabla:

#### Tabla: `crew` — Endpoint 23 (4)

Almacena y permite actualizar la información de la cuadrilla.

#### Campos involucrados: — Endpoint 23 (3)

- `id`: identificador UUID de la cuadrilla.
- `name`: nombre de la cuadrilla.
- `is_active`: estado de la cuadrilla.
- `created_at`: fecha de creación.
- `updated_at`: fecha de actualización.

### 10. Relación con las historias de usuario — Endpoint 23 (4)

#### HU5. Gestionar cuadrillas y turnos — Endpoint 23 (4)

Este endpoint permite administrar las cuadrillas registradas, modificar su información y controlar su estado para facilitar la organización del personal operativo.

Contribuye al cumplimiento de los criterios de conformación y administración de cuadrillas establecidos en la historia de usuario.

---
