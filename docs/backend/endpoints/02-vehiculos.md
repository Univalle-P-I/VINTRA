# Módulo de vehículos

## Información general

Este módulo contiene los endpoints destinados a consultar y administrar la información de los vehículos registrados en la flota de VINTRA.

Permite consultar el listado de vehículos, obtener el detalle de cada registro, actualizar sus características, cambiar su estado operativo y consultar los catálogos de tipos y estados disponibles.

### Endpoints incluidos

| N.º | Operación                           | Método | Ruta                           |
| --- | ----------------------------------- | ------ | ------------------------------ |
| 6   | Listar vehículos                    | GET    | `/api/v1/vehicles`             |
| 7   | Consultar vehículo                  | GET    | `/api/v1/vehicles/{id}`        |
| 8   | Actualizar información del vehículo | PATCH  | `/api/v1/vehicles/{id}`        |
| 9   | Cambiar estado del vehículo         | PATCH  | `/api/v1/vehicles/{id}/status` |
| 10  | Consultar tipos de vehículo         | GET    | `/api/v1/vehicle-types`        |
| 11  | Consultar estados de vehículo       | GET    | `/api/v1/vehicle-statuses`     |

> **Pendientes del contrato:** HU2 incluye registrar vehículos, pero este documento no contiene una operación de alta; el método, la ruta y el cuerpo quedan pendientes de definición. El DER v2 define `vehicle.vehicle_status` como ENUM, no como una tabla catálogo; los valores ENUM son marcadores de posición. Las menciones a JWT, sesión y permisos son propuestas, sujetas a #54, #70 y #71; el contrato de respuestas sigue pendiente de #66.

---

## Endpoint 6 — Listar vehículos

### 1. Información general

- **Método:** GET
- **Ruta:** `/api/v1/vehicles`
- **Autenticación:** Bearer Token (JWT).
- **Body:** No requiere.

### 2. ¿Para qué sirve?

Permite consultar los vehículos registrados en la flota para que el jefe de operaciones pueda conocer sus características, capacidad, identificación y estado actual.

El sistema debe mostrar un listado de vehículos y permitir aplicar filtros para facilitar la búsqueda y consulta de la información.

### 3. Autenticación y permisos

Requiere una sesión activa y un Bearer Token válido.

El sistema debe identificar al usuario autenticado y verificar que tenga permisos para consultar la información de la flota, de acuerdo con su rol.

La asignación exacta de permisos debe corresponder a la matriz de roles y permisos definida en la HU1.

### 4. Encabezados HTTP

```http
Authorization: Bearer <access_token>
Content-Type: application/json
Accept: application/json
```

### 5. Parámetros de consulta

No requiere un cuerpo de solicitud.

Los criterios de filtrado se envían mediante parámetros en la URL.

Ejemplo:

```http
GET /api/v1/vehicles?status=available&type=truck
```

`status` corresponde al campo ENUM `vehicle.vehicle_status`; `type` debe corresponder al campo `vehicle_type.code`. Los valores ENUM del SQL son marcadores de posición y deben confirmarse.

### 6. Respuesta exitosa

**Código HTTP:** `200 OK`

Devuelve el listado de vehículos registrados con su información principal.

La respuesta debe permitir identificar las características del vehículo, su tipo y su estado operativo.

### 7. Respuestas de error

- **401 Unauthorized:** No se proporcionó un token válido o la sesión no está activa.
- **403 Forbidden:** El usuario no tiene permisos para consultar la flota.
- **400 Bad Request:** Un parámetro de consulta tiene un formato o valor inválido.
- **500 Internal Server Error:** Ocurrió un error inesperado durante la consulta.

### 8. Validaciones del backend

Antes de devolver la información, el backend debe:

1. Verificar que el usuario esté autenticado.
2. Validar que la sesión asociada al token esté vigente y no haya sido revocada.
3. Comprobar que el rol del usuario tenga permiso para consultar los vehículos.
4. Consultar los vehículos registrados en la tabla `vehicle`.
5. Obtener la información relacionada con el tipo y estado del vehículo mediante sus respectivas relaciones.
6. Validar los parámetros de filtrado cuando sean proporcionados.
7. Devolver los resultados correspondientes a los criterios de búsqueda.

### 9. Reglas de negocio

- **RN-01. Acceso según rol:** Solamente los usuarios autorizados podrán consultar la información de la flota.
- **RN-02. Integridad de datos:** La información consultada debe corresponder a vehículos registrados y relacionados correctamente con sus catálogos.
- **RN-03. Información de vehículos:** El listado debe permitir identificar las características principales de cada vehículo.
- **RN-04. Estado del vehículo:** El estado actual del vehículo debe estar disponible para su consulta.
- **RN-05. Filtrado de información:** Los filtros deben utilizar criterios definidos por el módulo de flota.
- **RN-06. Identificación de vehículos inhabilitados:** Los vehículos inhabilitados deben identificarse claramente como no disponibles, de acuerdo con la HU3.

### 10. Relación con la base de datos

Este endpoint involucra principalmente tres tablas:

- **`vehicle`:** Contiene la información general del vehículo, como placa, capacidad y referencias a los catálogos.
- **`vehicle_type`:** Permite obtener el tipo de vehículo asociado.
- **`vehicle.vehicle_status`:** Estado operativo almacenado directamente como ENUM, no como relación a una tabla.

### 11. Relación con las historias de usuario

#### HU2 — Gestionar vehículos — Endpoint 8

- Consultar los vehículos registrados.
- Identificar la capacidad y características principales.
- Aplicar filtros para facilitar la consulta de la flota.

#### HU3 — Gestionar estado de vehículos — Endpoint 11

- Mostrar el estado actual del vehículo.
- Identificar claramente los vehículos inhabilitados como no disponibles.

---

## Endpoint 7 — Consultar vehículo

### 1. Información general — Endpoint 7

- **Método:** GET
- **Ruta:** `/api/v1/vehicles/{id}`
- **Autenticación:** Bearer Token (JWT).
- **Body:** No requiere.

### 2. ¿Para qué sirve? — Endpoint 7

Permite consultar el detalle de un vehículo registrado en la flota, incluyendo su placa, tipo, estado actual y capacidades.

Se utiliza para mostrar la ficha del vehículo y para precargar la información en el formulario de edición.

### 3. Autenticación y permisos — Endpoint 7

Requiere una sesión activa y un Bearer Token válido.

El sistema debe identificar al usuario autenticado y verificar que su rol tenga permisos para consultar la información de la flota, de acuerdo con la matriz de roles y permisos.

### 4. Encabezados HTTP — Endpoint 7

```http
Authorization: Bearer <access_token>
Accept: application/json
```

### 5. Parámetros de ruta

No requiere cuerpo de solicitud.

El identificador del vehículo se envía directamente en la URL.

| Campo | Tipo          | Obligatorio | Descripción                                        |
| ----- | ------------- | ----------- | -------------------------------------------------- |
| `id`  | String (UUID) | Sí          | Identificador del vehículo que se desea consultar. |

### 6. Respuesta exitosa — Endpoint 7

**Código HTTP:** `200 OK`

Devuelve la información detallada del vehículo consultado.

```json
{
  "id": "uuid-vehiculo",
  "plate": "ABC123",
  "vehicleType": {
    "id": "uuid-tipo",
    "code": "COMPACTADOR",
    "name": "Compactador"
  },
  "vehicleStatus": "available",
  "capacityKg": 5000,
  "capacityYd3": 7,
  "isActive": true,
  "createdAt": "2026-11-02T10:00:00Z",
  "updatedAt": "2026-11-02T10:00:00Z"
}
```

### 7. Respuestas de error — Endpoint 7

- **400 Bad Request:** El identificador enviado no tiene un formato UUID válido.
- **401 Unauthorized:** Token ausente, inválido, expirado o sesión revocada.
- **403 Forbidden:** El usuario no tiene permisos para consultar la flota.
- **404 Not Found:** No existe un vehículo con el identificador enviado.
- **500 Internal Server Error:** Ocurrió un error inesperado durante la consulta.

### 8. Validaciones del backend — Endpoint 7

Antes de devolver la información, el backend debe:

1. Verificar que se haya enviado el token.
2. Validar que corresponda a una sesión existente, no revocada y no expirada.
3. Comprobar que el rol del usuario tenga permiso para consultar vehículos.
4. Validar que el parámetro `id` tenga formato UUID.
5. Buscar el vehículo en la tabla `vehicle`.
6. Obtener el tipo mediante `vehicle_type`; leer el estado operativo desde `vehicle.vehicle_status`.
7. Responder con `404 Not Found` si el vehículo no existe.

### 9. Reglas de negocio — Endpoint 7

- **RN-01. Acceso según rol:** Solamente los usuarios autorizados pueden consultar la información de la flota.
- **RN-02. Integridad de datos:** La información consultada debe corresponder a un vehículo registrado y sus relaciones con los catálogos deben ser válidas.
- **RN-03. Información del vehículo:** El detalle debe permitir identificar la placa, el tipo, la capacidad y las características principales del vehículo.
- **RN-04. Estado del vehículo:** El estado actual debe estar disponible para su consulta.
- **RN-05. Identificación de vehículos inhabilitados:** Un vehículo inhabilitado debe identificarse claramente como no disponible, de acuerdo con la HU3.

### 10. Relación con la base de datos — Endpoint 7

Este endpoint involucra principalmente tres tablas:

- **`vehicle`:** Contiene la información del vehículo, como placa, capacidades, estado de actividad y referencias a los catálogos.
- **`vehicle_type`:** Permite consultar el tipo de vehículo, incluyendo su identificador (`id`), código (`code`) y nombre (`name`).
- **`vehicle.vehicle_status`:** Almacena el valor ENUM del estado operativo; no tiene identificador, código, nombre ni tabla asociada.

#### Relaciones principales

```text
vehicle.vehicle_type_id → vehicle_type.id
```

### 11. Relación con las historias de usuario — Endpoint 7

- **HU2 — Gestionar vehículos.**
- **HU3 — Gestionar estado de vehículos.**

---

## Endpoint 8 — Actualizar información del vehículo

### 1. Información general — Endpoint 8 (3)

- **Método:** PATCH
- **Ruta:** `/api/v1/vehicles/{id}`
- **Autenticación:** Bearer Token (JWT).
- **Body:** Sí requiere.

### 2. ¿Para qué sirve? — Endpoint 8 (3)

Permite modificar los datos descriptivos de un vehículo ya registrado, como la placa, el tipo y sus capacidades.

Este endpoint no permite cambiar el estado operativo del vehículo. Para esa operación se utiliza el endpoint 9.

### 3. Autenticación y permisos — Endpoint 8 (3)

Requiere una sesión activa y un Bearer Token válido.

El sistema debe identificar al usuario autenticado y verificar que su rol tenga permisos para modificar la información de la flota.

La matriz de roles y permisos está pendiente de definición en la HU1.

### 4. Encabezados HTTP — Endpoint 8 (3)

```http
Authorization: Bearer <access_token>
Content-Type: application/json
Accept: application/json
```

### 5. Parámetros de ruta y cuerpo de la solicitud

### Parámetro de ruta

| Campo | Tipo          | Obligatorio | Descripción                                              |
| ----- | ------------- | ----------- | -------------------------------------------------------- |
| `id`  | String (UUID) | Sí          | Identificador único del vehículo que se desea modificar. |

### Body JSON

Todos los campos son opcionales, pero debe enviarse al menos uno.

```json
{
  "plate": "ABC123",
  "vehicleTypeId": "uuid-tipo",
  "capacityKg": 5000,
  "capacityYd3": 7
}
```

| Campo           | Tipo          | Obligatorio | Descripción                                                                                                                                                 |
| --------------- | ------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `plate`         | String        | No          | Placa del vehículo. El SQL declara `CHAR(6)`, pero advierte que la longitud del PDF fuente no está especificada; confirmar esta longitud con Base de Datos. |
| `vehicleTypeId` | String (UUID) | No          | Tipo de vehículo. Debe existir en el catálogo `vehicle_type`.                                                                                               |
| `capacityKg`    | Number        | No          | Capacidad del vehículo en kilogramos.                                                                                                                       |
| `capacityYd3`   | Number        | No          | Capacidad del vehículo en yardas cúbicas.                                                                                                                   |

### 6. Respuesta exitosa — Endpoint 8 (3)

**Código HTTP:** `200 OK`

Devuelve el vehículo actualizado.

```json
{
  "id": "uuid-vehiculo",
  "plate": "ABC123",
  "vehicleType": {
    "id": "uuid-tipo",
    "name": "Compactador"
  },
  "vehicleStatus": "available",
  "capacityKg": 5000,
  "capacityYd3": 7,
  "isActive": true,
  "createdAt": "2026-11-02T10:00:00Z",
  "updatedAt": "2026-11-03T09:00:00Z"
}
```

### 7. Respuestas de error — Endpoint 8 (3)

- **400 Bad Request:** Cuerpo vacío, campos desconocidos o datos con formato inválido.
- **401 Unauthorized:** Token ausente, inválido, expirado o sesión revocada.
- **403 Forbidden:** El usuario no tiene permisos para modificar la flota.
- **404 Not Found:** No existe un vehículo con el identificador enviado.
- **500 Internal Server Error:** Ocurrió un error inesperado durante el proceso.

### 8. Validaciones del backend — Endpoint 8 (3)

Antes de actualizar la información, el backend debe:

1. Validar que el usuario tenga una sesión activa y un token vigente.
2. Comprobar que el rol tenga permisos para modificar la flota.
3. Validar que el parámetro `id` tenga formato UUID.
4. Verificar que el vehículo exista en la tabla `vehicle`.
5. Comprobar que se haya enviado al menos un campo en el cuerpo de la solicitud.
6. Rechazar los campos que no estén definidos para esta operación.
7. Validar que `plate` cumpla con el formato y la longitud que confirme Base de Datos.
8. Comprobar que `vehicleTypeId` corresponda a un tipo existente y activo en `vehicle_type`.
9. Validar que `capacityKg` y `capacityYd3` sean numéricos cuando se proporcionen. Sus unidades, rangos y valores permitidos quedan pendientes de definición; el SQL no declara restricciones `CHECK` para estas columnas.
10. Registrar la operación en `vehicle_log`, que en el DER contiene `entity_id`, `actor_id`, `action`, `old`, `new`, `request_ip` y `created_at`.
11. Actualizar `updated_at` con la fecha y hora de la modificación.

### 9. Reglas de negocio — Endpoint 8 (3)

- **RN-01. Acceso según rol:** Solamente los roles autorizados pueden modificar la información de la flota.
- **RN-02. Integridad de datos:** El tipo de vehículo debe corresponder a un registro existente.
- **RN-03. Restricciones de modificación:** No se deben permitir cambios que incumplan las reglas definidas para la flota (HU2).
- **RN-04. Trazabilidad de modificaciones:** La modificación debe quedar asociada al usuario que la realizó.

### 10. Relación con la base de datos — Endpoint 8 (3)

Este endpoint involucra principalmente tres tablas:

- **`vehicle`:** Se actualizan los campos `plate`, `vehicle_type_id`, `vehicle_status`, `capacity_kg`, `capacity_yd3` e `updated_at`.
- **`vehicle_type`:** Se verifica que el tipo exista y esté activo.
- **`vehicle_log`:** El DER contempla esta tabla para registrar cambios del vehículo mediante `entity_id`, `actor_id`, `action`, `old` y `new`.

#### Relación principal

```text
vehicle.vehicle_type_id → vehicle_type.id
```

La relación del registro de auditoría con el usuario es `vehicle_log.actor_id → user_account.id`; el mecanismo de sesión/autenticación está pendiente de aprobación.

### 11. Relación con las historias de usuario — Endpoint 8 (3)

#### HU2 — Gestionar vehículos

---

## Endpoint 9 — Cambiar estado del vehículo

### 1. Información general — Endpoint 9 (4)

- **Método:** PATCH
- **Ruta:** `/api/v1/vehicles/{id}/status`
- **Autenticación:** Bearer Token (JWT).
- **Body:** Sí requiere.

### 2. ¿Para qué sirve? — Endpoint 9 (4)

Permite que el jefe de operaciones actualice el estado de un vehículo para identificar si está disponible, en operación o inhabilitado, por ejemplo, debido a una falla mecánica.

Un vehículo inhabilitado queda identificado como no disponible y no puede utilizarse en una nueva asignación.

### 3. Autenticación y permisos — Endpoint 9 (4)

Requiere una sesión activa y un Bearer Token válido.

El sistema debe identificar al usuario autenticado y verificar que su rol tenga permisos para modificar el estado operativo de los vehículos.

La matriz de roles y permisos debe corresponder a lo establecido en la HU1.

### 4. Encabezados HTTP — Endpoint 9 (4)

```http
Authorization: Bearer <access_token>
Content-Type: application/json
Accept: application/json
```

### 5. Parámetros de ruta y cuerpo de la solicitud — Endpoint 9

### Parámetro de ruta — Endpoint 9

| Campo | Tipo          | Obligatorio | Descripción                                               |
| ----- | ------------- | ----------- | --------------------------------------------------------- |
| `id`  | String (UUID) | Sí          | Identificador del vehículo al que se le cambia el estado. |

### Body JSON — Endpoint 9

```json
{
  "vehicleStatus": "maintenance"
}
```

| Campo           | Tipo          | Obligatorio | Descripción                                                                                                                                                                                           |
| --------------- | ------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `vehicleStatus` | String (ENUM) | Sí          | Nuevo valor para `vehicle.vehicle_status`. Los valores del SQL (`available`, `in_service`, `maintenance`) son marcadores de posición; confirmar su correspondencia con los estados operativos de HU3. |

### 6. Respuesta exitosa — Endpoint 9 (4)

**Código HTTP:** `200 OK`

```json
{
  "id": "uuid-vehiculo",
  "plate": "ABC123",
  "vehicleStatus": "maintenance",
  "updatedAt": "2026-11-03T08:15:00Z"
}
```

### 7. Respuestas de error — Endpoint 9 (4)

- **400 Bad Request:** Falta `vehicleStatus` o el valor no corresponde al ENUM confirmado.
- **401 Unauthorized:** Token ausente, inválido, expirado o sesión revocada.
- **403 Forbidden:** El usuario no tiene permisos para cambiar el estado de vehículos.
- **404 Not Found:** No existe el vehículo.
- **409 Conflict:** La transición de estado no está permitida, por ejemplo, inhabilitar un vehículo con una asignación en curso, si se aprueba esa restricción.
- **500 Internal Server Error:** Ocurrió un error inesperado durante el proceso.

### 8. Validaciones del backend — Endpoint 9 (4)

Antes de actualizar el estado, el backend debe:

1. Validar que el usuario tenga una sesión activa y un Bearer Token vigente.
2. Comprobar que el rol tenga permisos para modificar el estado de los vehículos.
3. Validar que el parámetro `id` tenga formato UUID.
4. Verificar que el vehículo exista y se encuentre activo.
5. Validar que `vehicleStatus` corresponda a un valor permitido del ENUM confirmado.
6. Validar que la transición entre estados esté permitida, de acuerdo con las reglas operativas definidas.
7. Definir el comportamiento cuando el nuevo estado sea igual al estado actual.
8. Antes de inhabilitar el vehículo, verificar que no tenga una asignación en curso, es decir, un registro en `assignment` con `started_at` diferente de `NULL` y `ended_at` igual a `NULL`.
9. Actualizar `vehicle.vehicle_status` y `updated_at`.
10. Registrar la operación en `vehicle_log`, de acuerdo con su estructura. La inclusión de un motivo no está definida por el SQL.

### 9. Reglas de negocio — Endpoint 9 (4)

- **RN-01. Acceso según rol:** Solamente los roles autorizados pueden cambiar el estado de un vehículo.
- **RN-02. Disponibilidad operativa:** Un vehículo inhabilitado debe quedar identificado como no disponible (HU3).
- **RN-03. Restricción de asignación:** Un vehículo inhabilitado no debe poder utilizarse en una nueva asignación (HU3 y HU10).
- **RN-04. Integridad operativa:** Antes de inhabilitar un vehículo, se debe verificar que no tenga una asignación en curso.
- **RN-05. Auditoría:** El DER contempla `vehicle_log` para registrar cambios de vehículo; el registro del cambio de estado queda sujeto a la estrategia de auditoría acordada.

La validación de disponibilidad también debe aplicarse al crear una asignación.

### 10. Relación con la base de datos — Endpoint 9 (4)

Este endpoint involucra principalmente tres tablas:

- **`vehicle`:** Se actualizan los campos `vehicle_status` y `updated_at`.
- **`assignment`:** Permite verificar si el vehículo tiene una asignación en curso, mediante los campos `started_at` y `ended_at`.
- **`vehicle_log`:** El DER contempla esta tabla para registrar cambios del vehículo mediante `entity_id`, `actor_id`, `action`, `old` y `new`.

#### Relaciones principales: — Endpoint 9

```text
assignment.vehicle_id → vehicle.id
```

`vehicle.vehicle_status` es un ENUM; el DER no define una tabla `vehicle_status`. Sus valores son marcadores de posición y no incluyen explícitamente los estados descritos en HU3 (`in_service` y `maintenance` no deben asumirse equivalentes a “en operación” e “inhabilitado” sin confirmación).

### 11. Relación con las historias de usuario — Endpoint 9 (4)

- **HU3 — Gestionar estado de vehículos.**
- **HU10 — Asignar recursos a una microrruta.**

---

## Endpoint 10 — Consultar tipos de vehículo

### 1. Información general — Endpoint 10 (5)

- **Método:** GET
- **Ruta:** `/api/v1/vehicle-types`
- **Autenticación:** Bearer Token (JWT).
- **Body:** No requiere.

### 2. ¿Para qué sirve? — Endpoint 10 (5)

Permite consultar los tipos de vehículos registrados en el catálogo de la flota.

Esta información se utiliza para llenar el selector de tipos de vehículo en el formulario de registro y edición, así como para facilitar el filtrado del listado de vehículos.

El filtro predeterminado por tipos activos es una propuesta de la API; el SQL no establece un valor predeterminado para `vehicle_type.is_active`.

### 3. Autenticación y permisos — Endpoint 10 (5)

Requiere una sesión activa y un Bearer Token válido.

El rol del usuario debe tener permiso para acceder al módulo de flota.

### 4. Encabezados HTTP — Endpoint 10 (5)

```http
Authorization: Bearer <access_token>
Accept: application/json
```

### 5. Parámetros de consulta — Endpoint 10

No requiere cuerpo de solicitud.

Los criterios de filtrado se envían mediante parámetros en la URL.

| Campo      | Tipo    | Obligatorio | Descripción                                                                                                       |
| ---------- | ------- | ----------- | ----------------------------------------------------------------------------------------------------------------- |
| `isActive` | Boolean | No          | Filtra por el campo `vehicle_type.is_active`. El filtro predeterminado, si se adopta, queda pendiente de acuerdo. |

### 6. Respuesta exitosa — Endpoint 10 (5)

**Código HTTP:** `200 OK`

```json
[
  {
    "id": "uuid-tipo-1",
    "code": "COMPACTOR",
    "name": "Compactador",
    "isActive": true
  },
  {
    "id": "uuid-tipo-2",
    "code": "DUMP_TRUCK",
    "name": "Volqueta",
    "isActive": true
  }
]
```

### 7. Respuestas de error — Endpoint 10 (5)

- **401 Unauthorized:** Token ausente, inválido, expirado o sesión revocada.
- **403 Forbidden:** El usuario no tiene permisos para acceder al módulo de flota.
- **500 Internal Server Error:** Ocurrió un error inesperado durante la consulta.

### 8. Validaciones del backend — Endpoint 10 (5)

Antes de devolver la información, el backend debe:

1. Verificar que el usuario tenga una sesión activa y un Bearer Token válido.
2. Comprobar que el rol del usuario tenga permisos para consultar los catálogos de la flota.
3. Validar que el parámetro `isActive`, cuando sea proporcionado, tenga un valor booleano válido.
4. Aplicar el filtro correspondiente según el valor recibido.
5. Consultar los registros correspondientes en la tabla `vehicle_type`.
6. Devolver los campos `id`, `code`, `name` e `isActive` de cada tipo de vehículo.

### 9. Reglas de negocio — Endpoint 10 (5)

- **RN-01. Acceso según rol:** Solamente los usuarios autorizados pueden consultar los catálogos del módulo de flota.
- **RN-02. Consulta de registros activos:** La selección predeterminada de tipos activos queda pendiente de definición.

Los tipos de vehículos deben corresponder a registros existentes en el catálogo.

Los tipos inactivos no deben estar disponibles para nuevas selecciones en los formularios de registro y edición.

### 10. Relación con la base de datos — Endpoint 10 (5)

Este endpoint utiliza la siguiente tabla:

- **`vehicle_type`:** Contiene el catálogo de tipos de vehículos.

La consulta se realiza directamente sobre esta tabla, aplicando el filtro correspondiente al campo `is_active`.

### 11. Relación con las historias de usuario — Endpoint 10 (5)

#### HU2 — Gestionar vehículos. — Endpoint 10

Este endpoint permite consultar los tipos de vehículos disponibles para:

- Llenar el selector de tipos en el formulario de registro.
- Llenar el selector de tipos en el formulario de edición.
- Facilitar el filtrado de los vehículos registrados en la flota.

---

## Endpoint 11 — Consultar estados de vehículo

### 1. Información general — Endpoint 11 (6)

- **Método:** GET
- **Ruta:** `/api/v1/vehicle-statuses`
- **Autenticación:** Bearer Token (JWT).
- **Body:** No requiere.

### 2. ¿Para qué sirve? — Endpoint 11 (6)

Permite consultar los valores de estado operativo considerados para los vehículos. El DER v2 define `vehicle.vehicle_status` como ENUM, no como una tabla catálogo; la ruta se conserva como propuesta y su necesidad/formato queda pendiente de confirmar.

Esta información se utiliza para llenar el selector de estados en el formulario de cambio de estado y para facilitar el filtrado del listado de la flota.

El SQL no define estados activos por separado para el ENUM.

### 3. Autenticación y permisos — Endpoint 11 (6)

Requiere una sesión activa y un Bearer Token válido.

El rol del usuario debe tener permiso para acceder al módulo de flota.

### 4. Encabezados HTTP — Endpoint 11 (6)

```http
Authorization: Bearer <access_token>
Accept: application/json
```

### 5. Parámetros de consulta — Endpoint 11 (3)

No requiere cuerpo ni parámetros de consulta.

### 6. Respuesta exitosa — Endpoint 11 (6)

**Código HTTP:** `200 OK`

```json
[
  "available",
  "in_service",
  "maintenance"
]
```

Los valores del ENUM están marcados como marcadores de posición en el SQL. Debe confirmarse su correspondencia con los estados de HU3 antes de usar este ejemplo como catálogo definitivo.

### 7. Respuestas de error — Endpoint 11 (6)

- **401 Unauthorized:** Token ausente, inválido, expirado o sesión revocada.
- **403 Forbidden:** El usuario no tiene permisos para acceder al módulo de flota.
- **500 Internal Server Error:** Ocurrió un error inesperado durante la consulta.

### 8. Validaciones del backend — Endpoint 11 (6)

Antes de devolver la información, el backend debe:

1. Verificar que el usuario tenga una sesión activa y un Bearer Token válido.
2. Comprobar que el rol tenga permisos para consultar los catálogos de la flota.
3. Obtener los valores permitidos por el ENUM `vehicle_status`, sujeto a la confirmación de sus valores definitivos.

### 9. Reglas de negocio — Endpoint 11 (6)

- **RN-01. Acceso según rol:** Solamente los usuarios autorizados pueden consultar los catálogos del módulo de flota.
- **RN-02. Estados operativos:** El DER incluye `available`, `in_service` y `maintenance` como valores de marcador de posición. HU3 menciona disponible, en operación e inhabilitado; la correspondencia debe confirmarse.

Los estados deben permitir identificar si un vehículo se encuentra:

- Disponible.
- En operación.
- Inhabilitado.

Un estado inactivo no debe estar disponible para nuevas selecciones en el formulario de cambio de estado.

Los estados deben permitir identificar correctamente la disponibilidad operativa de los vehículos, de acuerdo con la HU3.

### 10. Relación con la base de datos — Endpoint 11 (6)

El estado operativo se almacena en `vehicle.vehicle_status`, un ENUM sin identificador, nombre ni indicador de actividad propio. El SQL no define una tabla `vehicle_status`.

### 11. Relación con las historias de usuario — Endpoint 11 (6)

#### HU3 — Gestionar estado de vehículos

Este endpoint permite consultar los estados operativos disponibles para:

- Llenar el selector de estados en el formulario de cambio de estado.
- Identificar los estados disponibles para los vehículos.
- Facilitar el filtrado de la flota según el estado operativo.

---
