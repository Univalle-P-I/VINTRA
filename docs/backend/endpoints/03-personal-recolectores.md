# Módulo de personal operativo — Recolectores

> Las menciones a JWT, sesiones, roles y permisos son propuestas, no decisiones aprobadas; dependen de #54, #70 y #71. El formato común de respuestas sigue pendiente de #66.

## Información general

Este módulo contiene los endpoints destinados a gestionar la información de los recolectores registrados en VINTRA.

Permite consultar el listado de recolectores, consultar su información individual, registrar nuevos integrantes y actualizar sus datos, incluyendo la asociación a una cuadrilla y su estado de actividad.

Los recolectores se almacenan en la tabla `crew_member` y no requieren una cuenta de usuario para ser registrados en el sistema.

### Endpoints incluidos

| N.º | Operación                             | Método | Ruta                     |
| --- | ------------------------------------- | ------ | ------------------------ |
| 12  | Listar personal                       | GET    | `/api/v1/personnel`      |
| 13  | Consultar integrante del personal     | GET    | `/api/v1/personnel/{id}` |
| 14  | Registrar integrante del personal     | POST   | `/api/v1/personnel`      |
| 15  | Actualizar información del integrante | PATCH  | `/api/v1/personnel/{id}` |

> **Nota:** Los endpoints documentados corresponden a una propuesta inicial para revisión. Su inclusión en este documento no significa que ya estén implementados en el backend.

---

## Endpoint 12 — Listar personal

### 1. Información general

- **Método:** GET
- **Ruta:** `/api/v1/personnel`
- **Autenticación:** Bearer Token (JWT).
- **Body:** No requiere.

### 2. ¿Para qué sirve?

Permite consultar los recolectores registrados en las cuadrillas del sistema.

El listado permite identificar a qué cuadrilla pertenece cada recolector, consultar su nombre completo y conocer si se encuentra activo o inactivo.

También permite filtrar los registros por cuadrilla, buscar por nombre completo y filtrar según el estado de actividad.

Este endpoint está destinado exclusivamente a los recolectores registrados en `crew_member`. Los conductores se consultan mediante los endpoints específicos del módulo de conductores.

La disponibilidad del personal según el turno no se determina mediante este listado, ya que corresponde a las reglas de disponibilidad de la HU6.

### 3. Autenticación y permisos

Requiere una sesión activa y un Bearer Token válido.

El sistema debe identificar al usuario autenticado y verificar que su rol tenga permisos para consultar la información de los recolectores, de acuerdo con la matriz de roles y permisos definida en HU1.

### 4. Encabezados HTTP

```http
Authorization: Bearer <access_token>
Accept: application/json
```

### 5. Parámetros de consulta

No requiere un cuerpo de solicitud.

Los criterios de búsqueda, filtrado y paginación se envían mediante parámetros en la URL.

| Campo      | Tipo          | Obligatorio | Descripción                                                                                                              |
| ---------- | ------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------ |
| `crewId`   | String (UUID) | No          | Filtra los recolectores pertenecientes a una cuadrilla específica.                                                       |
| `search`   | String        | No          | Busca recolectores por su nombre completo almacenado en `full_name`.                                                     |
| `isActive` | Boolean       | No          | Filtra los recolectores según su estado de actividad. Por defecto, el sistema devuelve únicamente los registros activos. |
| `page`     | Integer       | No          | Número de página. Por defecto es 1.                                                                                      |
| `limit`    | Integer       | No          | Cantidad de registros por página. Por defecto es 20, con un máximo de 100.                                               |

#### Ejemplo de consulta

```http
GET /api/v1/personnel?crewId=uuid-cuadrilla&search=Juan&isActive=true&page=1&limit=20
```

### 6. Respuesta exitosa

**Código HTTP:** `200 OK`

Devuelve el listado de integrantes que cumplen con los criterios de búsqueda y filtrado.

```json
{
  "data": [
    {
      "id": "uuid-integrante",
      "crewId": "uuid-cuadrilla",
      "fullName": "Juan Pérez",
      "isActive": true,
      "createdAt": "2026-11-03T08:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 1
  }
}
```

### 7. Respuestas de error

- **400 Bad Request:** Algún parámetro de consulta tiene un formato inválido o se encuentra fuera de los rangos permitidos.
- **401 Unauthorized:** No se proporcionó un token válido, la sesión expiró o fue revocada.
- **403 Forbidden:** El usuario no tiene permisos para consultar el personal.
- **500 Internal Server Error:** Ocurrió un error inesperado durante la consulta.

### 8. Validaciones del backend

Antes de devolver la información, el backend debe:

1. Verificar que el usuario tenga una sesión activa y un Bearer Token válido.
2. Comprobar que el rol del usuario tenga permisos para consultar los recolectores.
3. Validar que `crewId` tenga formato UUID cuando sea proporcionado.
4. Verificar que la cuadrilla utilizada como filtro exista en la tabla `crew`.
5. Validar que `search` tenga un formato permitido cuando se proporcione.
6. Validar que `isActive` tenga un valor booleano válido.
7. Validar que `page` sea un número entero mayor o igual a 1.
8. Validar que `limit` sea un número entero mayor o igual a 1 y no supere 100.
9. Aplicar los valores predeterminados de paginación cuando no se proporcionen.
10. Consultar los registros de `crew_member` y establecer la relación con `crew`.
11. Aplicar los filtros de búsqueda, cuadrilla y estado de actividad.
12. Realizar la paginación de los resultados.
13. Devolver los registros correspondientes junto con los metadatos de paginación.

### 9. Reglas de negocio

- **RN-01. Acceso según rol:** Solamente los usuarios autorizados pueden consultar la información de los recolectores.
- **RN-02. Asociación a cuadrillas:** Cada recolector debe estar asociado a una cuadrilla existente.
- **RN-03. Consulta de personal activo:** Por defecto, el sistema debe devolver únicamente los recolectores activos.
- **RN-04. Búsqueda por nombre:** La búsqueda por texto no debe distinguir entre mayúsculas y minúsculas.
- **RN-05. Separación de tipos de personal:** Este endpoint consulta exclusivamente los registros de `crew_member`. Los conductores se gestionan mediante sus endpoints específicos.
- **RN-06. Estado de actividad:** El campo `isActive` indica si el registro del recolector está activo, pero no representa su disponibilidad para un turno específico.

### 10. Relación con la base de datos

Este endpoint involucra principalmente dos tablas:

- **`crew_member`:** Contiene los recolectores registrados, incluyendo su identificador, cuadrilla, nombre completo, estado de actividad y fechas de creación y actualización.
- **`crew`:** Permite identificar la cuadrilla a la que pertenece cada recolector.

#### Relación principal

```text
crew_member.crew_id → crew.id
```

### 11. Relación con las historias de usuario

#### HU4 — Gestionar personal operativo

Este endpoint permite cumplir los siguientes criterios:

- Consultar el personal operativo registrado.
- Consultar los recolectores registrados.
- Identificar el nombre completo de cada recolector.
- Identificar la cuadrilla a la que pertenece.
- Filtrar los recolectores por cuadrilla y estado de actividad.

---

## Endpoint 13 — Consultar integrante del personal

### 1. Información general — Endpoint 13

- **Método:** GET
- **Ruta:** `/api/v1/personnel/{id}`
- **Autenticación:** Bearer Token (JWT).
- **Body:** No requiere.

### 2. ¿Para qué sirve? — Endpoint 13

Permite consultar el detalle de un recolector específico registrado en el sistema.

Devuelve su identificador, nombre completo, cuadrilla a la que pertenece y estado de actividad.

Se utiliza para mostrar la información individual del recolector y consultar sus datos antes de realizar una modificación.

Este endpoint consulta exclusivamente los registros almacenados en `crew_member`. Los conductores se consultan mediante el endpoint correspondiente al módulo de conductores.

### 3. Autenticación y permisos — Endpoint 13

Requiere una sesión activa y un Bearer Token válido.

El sistema debe identificar al usuario autenticado y verificar que su rol tenga permisos para consultar la información de los recolectores.

### 4. Encabezados HTTP — Endpoint 13

```http
Authorization: Bearer <access_token>
Accept: application/json
```

### 5. Parámetros de ruta

No requiere un cuerpo de solicitud.

El identificador del integrante se envía directamente en la URL.

| Campo | Tipo          | Obligatorio | Descripción                                                |
| ----- | ------------- | ----------- | ---------------------------------------------------------- |
| `id`  | String (UUID) | Sí          | Identificador único del recolector que se desea consultar. |

#### Ejemplo de consulta: — Endpoint 13

```http
GET /api/v1/personnel/uuid-integrante
```

### 6. Respuesta exitosa — Endpoint 13

**Código HTTP:** `200 OK`

Devuelve la información detallada del integrante consultado.

```json
{
  "id": "uuid-integrante",
  "crewId": "uuid-cuadrilla",
  "crewName": "Cuadrilla Norte",
  "fullName": "Juan Pérez",
  "isActive": true,
  "createdAt": "2026-11-03T08:00:00Z",
  "updatedAt": "2026-11-03T08:00:00Z"
}
```

### 7. Respuestas de error — Endpoint 13

- **400 Bad Request:** El identificador enviado no tiene un formato UUID válido.
- **401 Unauthorized:** No se proporcionó un token válido, la sesión expiró o fue revocada.
- **403 Forbidden:** El usuario no tiene permisos para consultar el personal.
- **404 Not Found:** No existe un integrante con el identificador enviado.
- **500 Internal Server Error:** Ocurrió un error inesperado durante la consulta.

### 8. Validaciones del backend — Endpoint 13

Antes de devolver la información, el backend debe:

1. Verificar que se haya proporcionado un token de autenticación.
2. Validar que corresponda a una sesión existente, vigente y no revocada.
3. Comprobar que el rol del usuario tenga permisos para consultar el personal.
4. Validar que el parámetro `id` tenga un formato UUID válido.
5. Buscar el integrante en la tabla `crew_member`.
6. Obtener la información de la cuadrilla mediante su relación con `crew`.
7. Responder con código `404 Not Found` si el integrante no existe.

### 9. Reglas de negocio — Endpoint 13

- **RN-01. Acceso según rol:** Solamente los usuarios autorizados pueden consultar la información de los recolectores.
- **RN-02. Identificación del integrante:** El detalle debe permitir identificar al recolector mediante su nombre completo y la cuadrilla a la que pertenece.
- **RN-03. Consulta de registros inactivos:** Un recolector inactivo puede consultarse, pero el sistema debe indicar claramente su estado mediante el campo `isActive`.
- **RN-04. Separación de tipos de personal:** La consulta corresponde exclusivamente a los recolectores registrados en `crew_member`.

La consulta del detalle no debe confundirse con la disponibilidad del recolector para un turno específico.

### 10. Relación con la base de datos — Endpoint 13

Este endpoint involucra principalmente dos tablas:

- **`crew_member`:** Contiene la información del recolector, incluyendo su identificador, nombre completo, estado de actividad y fecha de creación.
- **`crew`:** Permite consultar la cuadrilla a la que pertenece el integrante.

#### Relación principal: — Endpoint 13

```text
crew_member.crew_id → crew.id
```

### 11. Relación con las historias de usuario — Endpoint 13

#### HU4 — Gestionar personal operativo. — Endpoint 13

Este endpoint permite:

- Consultar la información individual de un recolector registrado.
- Identificar su nombre completo.
- Consultar la cuadrilla a la que pertenece.
- Identificar si se encuentra activo o inactivo.

---

## Endpoint 14 — Registrar integrante del personal

### 1. Información general — Endpoint 14 (3)

- **Método:** POST
- **Ruta:** `/api/v1/personnel`
- **Autenticación:** Bearer Token (JWT).
- **Body:** Sí requiere.

### 2. ¿Para qué sirve? — Endpoint 14 (3)

Permite que el jefe de operaciones registre un nuevo recolector y lo asocie a una cuadrilla existente.

El registro almacena el nombre completo del recolector y establece su relación con la cuadrilla correspondiente.

Los recolectores no requieren una cuenta de usuario para ser registrados, ya que su información operativa se almacena directamente en la tabla `crew_member`.

Esta información será utilizada posteriormente para consultar los integrantes de las cuadrillas y organizar los recursos operativos.

### 3. Autenticación y permisos — Endpoint 14 (3)

Requiere una sesión activa y un Bearer Token válido.

El sistema debe identificar al usuario autenticado y verificar que su rol tenga permisos para registrar recolectores.

La matriz de roles y permisos está pendiente de definición en HU1.

### 4. Encabezados HTTP — Endpoint 14 (3)

```http
Authorization: Bearer <access_token>
Content-Type: application/json
Accept: application/json
```

### 5. Cuerpo de la solicitud

El registro requiere un cuerpo de solicitud en formato JSON.

```json
{
  "crewId": "uuid-cuadrilla",
  "fullName": "Juan Pérez"
}
```

| Campo      | Tipo          | Obligatorio | Descripción                                                                 |
| ---------- | ------------- | ----------- | --------------------------------------------------------------------------- |
| `crewId`   | String (UUID) | Sí          | Identificador de la cuadrilla existente a la que pertenecerá el recolector. |
| `fullName` | String        | Sí          | Nombre completo del recolector que se desea registrar.                      |

### 6. Respuesta exitosa — Endpoint 14 (3)

**Código HTTP:** `201 Created`

Devuelve el integrante creado con su información correspondiente.

```json
{
  "id": "uuid-integrante",
  "crewId": "uuid-cuadrilla",
  "crewName": "Cuadrilla Norte",
  "fullName": "Juan Pérez",
  "isActive": true,
  "createdAt": "2026-11-04T08:00:00Z",
  "updatedAt": "2026-11-04T08:00:00Z"
}
```

### 7. Respuestas de error — Endpoint 14 (3)

- **400 Bad Request:** Faltan campos obligatorios o los datos enviados no cumplen con el formato esperado.
- **401 Unauthorized:** No se proporcionó un token válido, la sesión expiró o fue revocada.
- **403 Forbidden:** El usuario no tiene permisos para registrar personal.
- **404 Not Found:** La cuadrilla indicada no existe.
- **500 Internal Server Error:** Ocurrió un error inesperado durante el registro.

### 8. Validaciones del backend — Endpoint 14 (3)

Antes de registrar el integrante, el backend debe:

1. Verificar que se haya proporcionado un token de autenticación.
2. Validar que corresponda a una sesión existente, vigente y no revocada.
3. Comprobar que el rol del usuario tenga permisos para registrar recolectores.
4. Verificar que se hayan enviado todos los campos obligatorios.
5. Validar que `crewId` tenga formato UUID.
6. Verificar que la cuadrilla correspondiente exista en la tabla `crew`.
7. Validar que `fullName` no esté vacío.
8. Validar `fullName` como texto no vacío; el SQL no define longitud máxima ni `NOT NULL` para `full_name`, por lo que cualquier límite debe acordarse con Base de Datos.
9. Crear el registro en `crew_member`, asociándolo con la cuadrilla correspondiente.
10. Definir el valor inicial de `is_active`; el SQL no declara un valor predeterminado.
11. `created_at` tiene `DEFAULT now()`; `updated_at` no tiene valor predeterminado en el SQL.

### 9. Reglas de negocio — Endpoint 14 (3)

- **RN-01. Acceso según rol:** Solamente los roles autorizados pueden registrar recolectores.
- **RN-02. Asociación a cuadrillas:** El contrato propone asociar el recolector a una cuadrilla existente. Aunque existe la FK `crew_member.crew_id → crew.id`, el SQL no declara `crew_id` como `NOT NULL`; confirmar la obligatoriedad con Base de Datos.
- **RN-03. Integridad de datos:** El nombre completo del recolector es obligatorio.
- **RN-04. Estado inicial:** El valor inicial de `is_active` queda pendiente de confirmación; el SQL no declara un valor predeterminado.
- **RN-05. Sin cuenta de usuario:** El registro de un recolector no debe crear un registro en `user_account`, `user_data` ni `profile`, ya que los recolectores no tienen acceso individual al sistema según el modelo definido.

### 10. Relación con la base de datos — Endpoint 14 (3)

Este endpoint involucra principalmente dos tablas:

- **`crew_member`:** Almacena el nuevo registro del integrante, incluyendo su identificador, cuadrilla, nombre completo, estado de actividad y fechas de creación y actualización.
- **`crew`:** Permite verificar que la cuadrilla seleccionada exista y se encuentre registrada en el sistema.

#### Relación principal: — Endpoint 14 (3)

```text
crew_member.crew_id → crew.id
```

### 11. Relación con las historias de usuario — Endpoint 14 (3)

#### HU4 — Gestionar personal operativo. — Endpoint 14 (3)

Este endpoint permite cumplir los siguientes criterios:

- Registrar nuevos recolectores.
- Asociar recolectores a una cuadrilla existente.
- Almacenar el nombre completo de cada recolector.
- Establecer el estado inicial de actividad del recolector.

#### HU5 — Gestionar cuadrillas y turnos

Permite incorporar recolectores a una cuadrilla existente para conformar el personal operativo.

---

## Endpoint 15 — Actualizar información del integrante del personal

### 1. Información general — Endpoint 15 (4)

- **Método:** PATCH
- **Ruta:** `/api/v1/personnel/{id}`
- **Autenticación:** Bearer Token (JWT).
- **Body:** Sí requiere.
- **Operación:** Modificar la información de un integrante registrado y permitir su activación o desactivación lógica.

### 2. ¿Para qué sirve? — Endpoint 15 (4)

Permite actualizar la información de un recolector previamente registrado en el sistema.

La modificación puede incluir el nombre completo, la cuadrilla a la que pertenece y su estado de actividad.

También permite desactivar o reactivar al recolector mediante el campo `isActive`.

La desactivación es lógica, es decir, el registro no se elimina físicamente de la base de datos. De esta manera se conserva la información histórica del personal y sus relaciones con las cuadrillas y las operaciones anteriores.

Un recolector inactivo no debe ser considerado para nuevas operaciones, de acuerdo con las reglas de disponibilidad y conformación de cuadrillas.

Este endpoint modifica exclusivamente registros de `crew_member`. Los datos de los conductores se actualizan mediante los endpoints específicos del módulo de conductores.

### 3. Autenticación y permisos — Endpoint 15 (4)

Requiere una sesión activa y un Bearer Token válido.

El sistema debe identificar al usuario autenticado y verificar que su rol tenga permisos para modificar la información del personal operativo.

La matriz de roles y permisos debe corresponder a lo establecido en HU1.

### 4. Encabezados HTTP — Endpoint 15 (4)

```http
Authorization: Bearer <access_token>
Content-Type: application/json
Accept: application/json
```

### 5. Parámetros de ruta — Endpoint 15

| Campo | Tipo          | Obligatorio | Descripción                                                |
| ----- | ------------- | ----------- | ---------------------------------------------------------- |
| `id`  | String (UUID) | Sí          | Identificador único del integrante que se desea modificar. |

### 6. Cuerpo de la solicitud

Todos los campos son opcionales individualmente, pero debe enviarse al menos uno.

```json
{
  "crewId": "uuid-nueva-cuadrilla",
  "fullName": "Juan Carlos Pérez",
  "isActive": true
}
```

| Campo      | Tipo          | Obligatorio | Descripción                                                                       |
| ---------- | ------------- | ----------- | --------------------------------------------------------------------------------- |
| `crewId`   | String (UUID) | No          | Identificador de la nueva cuadrilla a la que pertenecerá el recolector.           |
| `fullName` | String        | No          | Nombre completo actualizado del recolector.                                       |
| `isActive` | Boolean       | No          | Estado de actividad del recolector. Permite activarlo o desactivarlo lógicamente. |

### 7. Respuesta exitosa

**Código HTTP:** `200 OK`

Devuelve la información del integrante actualizado con la misma estructura de respuesta del endpoint 13 — Consultar integrante del personal.

```json
{
  "id": "uuid-integrante",
  "crewId": "uuid-nueva-cuadrilla",
  "crewName": "Cuadrilla Sur",
  "fullName": "Juan Carlos Pérez",
  "isActive": true,
  "createdAt": "2026-11-03T08:00:00Z",
  "updatedAt": "2026-11-04T09:00:00Z"
}
```

### 8. Respuestas de error

- **400 Bad Request:** El cuerpo está vacío, contiene campos desconocidos o presenta datos con formato inválido.
- **401 Unauthorized:** No se proporcionó un token válido, la sesión expiró o fue revocada.
- **403 Forbidden:** El usuario no tiene permisos para modificar el personal.
- **404 Not Found:** No existe el integrante o la cuadrilla referenciada.
- **409 Conflict:** El integrante no puede desactivarse porque tiene una asignación vigente, si esta restricción es aprobada.
- **500 Internal Server Error:** Ocurrió un error inesperado durante el proceso.

### 9. Validaciones del backend

Antes de actualizar la información, el backend debe:

1. Verificar que se haya proporcionado un token de autenticación.
2. Validar que corresponda a una sesión existente, vigente y no revocada.
3. Comprobar que el rol del usuario tenga permisos para modificar los recolectores.
4. Validar que el parámetro `id` tenga formato UUID.
5. Verificar que el recolector exista en la tabla `crew_member`.
6. Comprobar que se haya enviado al menos un campo en el cuerpo de la solicitud.
7. Rechazar los campos que no estén definidos para esta operación.
8. Validar que `crewId`, cuando se envíe, tenga formato UUID.
9. Verificar que la nueva cuadrilla exista en la tabla `crew`.
10. Validar que `fullName`, cuando se envíe, no esté vacío y cumpla las restricciones de almacenamiento de `full_name`.
11. Validar que `isActive` tenga un valor booleano válido cuando se proporcione.
12. Verificar las restricciones operativas definidas para cambiar de cuadrilla o desactivar al recolector.
13. Actualizar únicamente los campos enviados.
14. Actualizar `updated_at` con la fecha y hora de la modificación.
15. Registrar los valores anteriores de la modificación en `crew_member_log`, de acuerdo con el mecanismo de auditoría implementado.

### 10. Reglas de negocio

- **RN-01. Acceso según rol:** Solamente los roles autorizados pueden modificar la información de los recolectores.
- **RN-02. Integridad de datos:** La cuadrilla referenciada debe corresponder a un registro existente en `crew`.
- **RN-03. Desactivación lógica:** La desactivación del recolector debe realizarse mediante el campo `is_active`, sin eliminar físicamente el registro.
- **RN-04. Conservación histórica:** La información histórica del recolector debe conservarse para no afectar los registros de cuadrillas y operaciones anteriores.
- **RN-05. Estado de actividad:** Un recolector inactivo no debe incluirse en nuevas operaciones que requieran personal activo.
- **RN-06. Actualización parcial:** El sistema solamente debe modificar los campos enviados en la solicitud, conservando los valores de los campos que no se proporcionen.

### 11. Relación con la base de datos

Este endpoint involucra principalmente dos tablas:

- **`crew_member`:** Permite actualizar la información del recolector, incluyendo `crew_id`, `full_name`, `is_active` y `updated_at`.
- **`crew`:** Permite verificar que la nueva cuadrilla referenciada exista.

Para la trazabilidad de los cambios, la propuesta contempla `crew_member_log`, de acuerdo con el mecanismo de auditoría implementado.

#### Relación principal: — Endpoint 15 (4)

```text
crew_member.crew_id → crew.id
```

### 12. Relación con las historias de usuario

#### HU4 — Gestionar personal operativo. — Endpoint 15 (4)

Este endpoint permite:

- Modificar el nombre completo de los recolectores registrados.
- Actualizar la cuadrilla a la que pertenecen.
- Activar o desactivar recolectores sin eliminarlos físicamente.

#### HU5 — Gestionar cuadrillas y turnos. — Endpoint 15

Permite actualizar la asociación de un recolector con una cuadrilla existente, de acuerdo con las reglas de conformación de cuadrillas.

#### HU6 — Gestionar disponibilidad del personal

El estado de actividad del recolector debe considerarse al determinar si puede participar en una operación. Sin embargo, `isActive` no representa por sí solo la disponibilidad para un turno específico.

---
