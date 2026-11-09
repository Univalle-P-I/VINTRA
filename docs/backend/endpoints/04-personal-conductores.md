# Módulo de personal – Conductores

**Archivo:** `docs/backend/endpoints/04-personal-conductores.md`

**Endpoints documentados:** 16 al 19.

> **Pendiente de decisión:** el DER relaciona `driver.user_data_id` con `user_data.id`, y `user_data.id` con `user_account.id`, pero el acceso de conductores al sistema y la autorización del rol `driver` dependen de #53, #54, #70 y #71. JWT no está aprobado. El rol del ENUM `user_role` aparece en minúsculas en el SQL y sus valores son provisionales.

---

# Endpoint 16. Registrar un conductor

## 1. Método y ruta

**Método:** `POST`

**Ruta:** `/api/v1/drivers`

## 2. ¿Para qué sirve?

Propone registrar un conductor, sus datos personales, su perfil y su relación laboral con una cuadrilla existente. La creación de una cuenta habilitada para iniciar sesión queda sujeta a las decisiones de seguridad indicadas arriba.

A diferencia de los recolectores, los conductores sí tienen acceso al sistema mediante una cuenta de usuario, por lo que deben contar con credenciales de autenticación.

El registro debe realizarse de manera conjunta para garantizar que la cuenta, los datos personales, el perfil y la vinculación laboral queden correctamente relacionados.

## 3. Autenticación

Este endpoint requiere autenticación mediante un token JWT válido.

El backend debe verificar que el usuario autenticado tenga permisos para registrar conductores.

El conductor que se está registrando no necesita tener una cuenta previa, ya que este endpoint se encarga de crearla.

## 4. Encabezados de la solicitud

```http
Authorization: Bearer <token>
Content-Type: application/json
Accept: application/json
```

## 5. Cuerpo de la solicitud

Ejemplo de solicitud JSON:

```json
{
    "documentType": "CC",
    "documentId": "1234567890",
    "firstName": "Carlos",
    "lastName": "Pérez",
    "email": "carlos@example.com",
    "phone": "3001234567",
    "password": "ContrasenaSegura123!",
    "crewId": "550e8400-e29b-41d4-a716-446655440000"
}
```

### Descripción de los campos

**Campo: documentType**

- Tipo: string.
- Obligatorio: sí.
- Descripción: tipo de documento de identidad del conductor.
- Valores permitidos: `CC`, `CE` y `PASSPORT`.
- Almacenamiento: `user_account.document_type`, ENUM `document_type`. Los valores del SQL (`CC`, `CE`, `TI`, `PASSPORT`) son marcadores de posición.

**Campo: documentId**

- Tipo: string.
- Obligatorio: sí.
- Descripción: número de documento de identidad del conductor.
- Almacenamiento: `user_account.document_id`.

**Campo: firstName**

- Tipo: string.
- Obligatorio: sí.
- Descripción: nombres del conductor.
- Almacenamiento: `user_data.first_name`.

**Campo: lastName**

- Tipo: string.
- Obligatorio: sí.
- Descripción: apellidos del conductor.
- Almacenamiento: `user_data.last_name`.

**Campo: email**

- Tipo: string.
- Obligatorio: sí.
- Descripción: correo electrónico asociado a la cuenta del conductor.
- Almacenamiento: `user_data.email`.

**Campo: phone**

- Tipo: string.
- Obligatorio: sí.
- Descripción: número de contacto del conductor.
- Almacenamiento: `user_data.phone`.

**Campo: password**

- Tipo: string.
- Obligatorio: por confirmar según el mecanismo de creación de credenciales aprobado.
- Descripción: contraseña inicial de la cuenta del conductor.
- Almacenamiento: el backend debe generar su hash y almacenarlo en `user_account.pwd_hash`. Nunca debe guardarse en texto plano.

**Campo: crewId**

- Tipo: UUID.
- Obligatorio: sí.
- Descripción: identificador de la cuadrilla a la que se vinculará el conductor.
- Relación: `driver.crew_id`.

## 6. Respuesta exitosa

**Código HTTP:** `201 Created`

```json
{
    "status": "success",
    "message": "Conductor registrado correctamente",
    "data": {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "documentType": "CC",
        "documentId": "1234567890",
        "firstName": "Carlos",
        "lastName": "Pérez",
        "email": "carlos@example.com",
        "phone": "3001234567",
        "role": "driver",
        "crew": {
            "id": "550e8400-e29b-41d4-a716-446655440000",
            "name": "Cuadrilla Norte"
        },
        "startedAt": "2026-11-05T13:00:00",
        "isActive": true
    }
}
```

La respuesta no debe incluir la contraseña ni su hash.

## 7. Respuestas de error

- **400 Bad Request:** el cuerpo está vacío, contiene campos desconocidos o presenta datos con formato inválido.
- **401 Unauthorized:** no se proporcionó un token válido, la sesión expiró o fue revocada.
- **403 Forbidden:** el usuario no tiene permisos para registrar conductores.
- **404 Not Found:** no existe la cuadrilla referenciada mediante `crewId`.
- **409 Conflict:** el tipo y número de documento ya pertenecen a otro usuario, o se presenta un conflicto con otro dato que tenga restricción de unicidad.
- **500 Internal Server Error:** ocurrió un error inesperado durante el proceso.

## 8. Validaciones

Antes de registrar la información, el backend debe:

1. Verificar que se haya enviado el token de autenticación.
2. Validar que corresponda a una sesión existente, no revocada y no expirada mediante la tabla `session`.
3. Comprobar que el rol del usuario tenga permisos para registrar conductores.
4. Validar los campos que el contrato aprobado defina como obligatorios; el SQL no declara restricciones `NOT NULL`.
5. Validar que `documentType` corresponda a un valor del ENUM `document_type`; la lista del SQL es provisional.
6. Verificar que el correo electrónico tenga un formato válido.
7. Comprobar que la cuadrilla indicada mediante `crewId` exista.
8. Verificar documento y correo duplicados solo si se aprueban las reglas de unicidad; el SQL no declara restricciones `UNIQUE` para esos campos.
9. Validar que la contraseña cumpla con las políticas de seguridad establecidas, cuando se proporcione directamente.
10. Ejecutar el registro dentro de una transacción para evitar registros incompletos si alguna operación falla.

## 9. Reglas de negocio

**RN 01. Acceso según rol:** solamente los usuarios autorizados pueden registrar conductores.

**RN 02. Registro de conductores:** el DER contempla las relaciones de `driver` con `user_data` y de `user_data` con `user_account`; la obligatoriedad de crear una cuenta utilizable y asignar el rol `driver` debe confirmarse conforme a #53, #54, #70 y #71.

**RN 03. Vinculación con cuadrilla:** todo conductor registrado mediante este endpoint debe quedar asociado a una cuadrilla existente.

**RN 04. Estado inicial de la cuenta:** debe definirse el valor inicial de `user_account.user_status`; el SQL no declara un valor predeterminado y los valores ENUM son provisionales.

**RN 05. Estado inicial de la vinculación:** debe definirse el valor inicial de `driver.is_active`; el SQL no declara un valor predeterminado.

**RN 06. Fecha de vinculación:** `driver.started_at` registra la fecha de inicio de la relación; el SQL no declara un valor predeterminado.

**RN 07. Seguridad de credenciales:** las contraseñas deben almacenarse mediante un mecanismo de hash en `pwd_hash`, nunca en texto plano.

**RN 08. Integridad del registro:** la creación de la cuenta, los datos personales, el perfil y la vinculación laboral deben realizarse dentro de una misma transacción.

## 10. Relación con la base de datos

Este endpoint involucra principalmente cinco tablas:

- **user_account:** almacena la información de autenticación del conductor, como el documento, el correo y el hash de la contraseña.
- **user_data:** contiene sus datos personales y de contacto.
- **profile:** registra el rol asignado a la cuenta.
- **driver:** establece la relación laboral entre el conductor y la cuadrilla.
- **crew:** permite verificar la existencia de la cuadrilla seleccionada.

Relaciones principales:

```text
user_data.id → user_account.id

profile.user_account_id → user_account.id

driver.user_data_id → user_data.id

driver.crew_id → crew.id
```

## 11. Relación con las historias de usuario

**HU4. Gestionar personal operativo**

Este endpoint se relaciona con el registro de conductores como personal operativo. La cuenta y el acceso individual del conductor siguen pendientes de decisión.

También contribuye a identificar el tipo de personal registrado y consultar posteriormente su información dentro del sistema.

**HU1. Acceso según rol**

La relación entre el conductor, los datos de usuario y el perfil está representada en el DER; el acceso y permisos del conductor siguen pendientes de aprobación.

---

# Endpoint 17. Listar conductores

## 1. Método y ruta

**Método:** `GET`

**Ruta:** `/api/v1/drivers`

## 2. ¿Para qué sirve?

Permite consultar el listado de conductores registrados en el sistema, incluyendo sus datos personales, la cuadrilla a la que pertenecen y el estado de su vinculación laboral.

La consulta facilita la administración de los conductores y permite aplicar filtros para localizar registros específicos.

## 3. Autenticación

Este endpoint requiere autenticación mediante un token JWT válido.

El backend debe verificar que el usuario autenticado tenga permisos para consultar los conductores.

## 4. Encabezados de la solicitud

```http
Authorization: Bearer <token>
Accept: application/json
```

## 5. Parámetros de entrada

Este endpoint no requiere un cuerpo de solicitud. Puede recibir los siguientes parámetros opcionales mediante la URL.

**Parámetro: crewId**

- Tipo: UUID.
- Obligatorio: no.
- Descripción: filtra los conductores pertenecientes a una cuadrilla específica.

**Parámetro: isActive**

- Tipo: boolean.
- Obligatorio: no.
- Descripción: filtra por el estado de la vinculación laboral.

**Parámetro: search**

- Tipo: string.
- Obligatorio: no.
- Descripción: permite buscar por nombre, apellido, documento o correo electrónico.

**Parámetro: page**

- Tipo: integer.
- Obligatorio: no.
- Descripción: número de página que se desea consultar.

**Parámetro: limit**

- Tipo: integer.
- Obligatorio: no.
- Descripción: cantidad máxima de registros por página.

### Ejemplo de consulta

```http
GET /api/v1/drivers?crewId=550e8400-e29b-41d4-a716-446655440000&isActive=true&page=1&limit=10
```

## 6. Respuesta exitosa

**Código HTTP:** `200 OK`

```json
{
    "status": "success",
    "message": "Conductores consultados correctamente",
    "data": [
        {
            "id": "550e8400-e29b-41d4-a716-446655440001",
            "documentType": "CC",
            "documentId": "1234567890",
            "firstName": "Carlos",
            "lastName": "Pérez",
            "email": "carlos@example.com",
            "phone": "3001234567",
            "crew": {
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "name": "Cuadrilla Norte"
            },
            "startedAt": "2026-11-05T13:00:00",
            "endedAt": null,
            "isActive": true
        }
    ],
    "pagination": {
        "page": 1,
        "limit": 10,
        "total": 1,
        "totalPages": 1
    }
}
```

## 7. Respuestas de error

- **400 Bad Request:** uno o varios parámetros de consulta tienen un formato o valor inválido.
- **401 Unauthorized:** no se proporcionó un token válido, la sesión expiró o fue revocada.
- **403 Forbidden:** el usuario no tiene permisos para consultar conductores.
- **500 Internal Server Error:** ocurrió un error inesperado durante la consulta.

## 8. Validaciones

Antes de devolver la información, el backend debe:

1. Verificar que se haya enviado el token de autenticación.
2. Validar que corresponda a una sesión existente, no revocada y no expirada.
3. Comprobar que el rol del usuario tenga permiso para consultar conductores.
4. Validar los parámetros de consulta y la paginación.
5. Verificar que `crewId`, si se proporciona, corresponda a una cuadrilla existente.
6. Validar que `isActive` tenga un valor booleano válido.
7. Consultar la tabla `driver`.
8. Obtener los datos personales desde `user_data`.
9. Consultar la información de la cuenta en `user_account`.
10. Obtener la información de la cuadrilla asociada mediante `crew`.
11. Aplicar los filtros y la paginación solicitados.

## 9. Reglas de negocio

**RN 01. Acceso según rol:** solamente los usuarios autorizados pueden consultar conductores.

**RN 02. Consulta de conductores:** se deben poder consultar los conductores registrados en el sistema, según HU4.

**RN 03. Separación del personal:** este endpoint consulta únicamente los conductores registrados mediante `driver`. Los recolectores se gestionan por separado mediante `crew_member`.

**RN 04. Estado de vinculación:** el filtro `isActive` permite consultar conductores según el estado de su relación laboral con la cuadrilla.

**RN 05. Filtro por cuadrilla:** se debe permitir consultar los conductores asociados a una cuadrilla específica.

**RN 06. Resultados paginados:** el listado debe permitir controlar la cantidad de registros devueltos mediante los parámetros de paginación.

## 10. Relación con la base de datos

Este endpoint involucra principalmente cinco tablas:

- **driver:** contiene los registros de vinculación laboral de los conductores.
- **user_data:** proporciona los datos personales.
- **user_account:** permite consultar la información relacionada con la cuenta.
- **profile:** permite identificar el rol del usuario.
- **crew:** proporciona la información de la cuadrilla asociada.

Relaciones principales:

```text
driver.user_data_id → user_data.id

user_data.id → user_account.id

profile.user_account_id → user_account.id

driver.crew_id → crew.id
```

## 11. Relación con las historias de usuario

**HU4. Gestionar personal operativo**

Este endpoint cumple el criterio de permitir consultar y listar los conductores registrados, facilitando la identificación de sus datos personales y de la cuadrilla a la que pertenecen.

---

# Endpoint 18. Consultar el detalle del conductor

## 1. Método y ruta

**Método:** `GET`

**Ruta:** `/api/v1/drivers/{id}`

## 2. ¿Para qué sirve?

Permite consultar la información detallada de un conductor específico mediante su identificador.

Incluye sus datos personales, información de su cuenta, el rol asignado y los datos de la cuadrilla con la que mantiene su relación laboral.

## 3. Autenticación

Este endpoint requiere autenticación mediante un token JWT válido.

El backend debe comprobar que el usuario autenticado tenga permisos para consultar el detalle de los conductores.

## 4. Encabezados de la solicitud

```http
Authorization: Bearer <token>
Accept: application/json
```

## 5. Parámetros de entrada

**Parámetro de ruta: id**

- Tipo: identificador del registro del conductor.
- Obligatorio: sí.
- Descripción: identificador del conductor registrado en la tabla `driver`.

### Ejemplo de consulta

```http
GET /api/v1/drivers/550e8400-e29b-41d4-a716-446655440001
```

## 6. Respuesta exitosa

**Código HTTP:** `200 OK`

```json
{
    "status": "success",
    "message": "Conductor consultado correctamente",
    "data": {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "documentType": "CC",
        "documentId": "1234567890",
        "firstName": "Carlos",
        "lastName": "Pérez",
        "email": "carlos@example.com",
        "phone": "3001234567",
        "role": "driver",
        "crew": {
            "id": "550e8400-e29b-41d4-a716-446655440000",
            "name": "Cuadrilla Norte"
        },
        "startedAt": "2026-11-05T13:00:00",
        "endedAt": null,
        "isActive": true,
        "createdAt": "2026-11-05T13:00:00",
        "updatedAt": "2026-11-05T13:00:00"
    }
}
```

## 7. Respuestas de error

- **400 Bad Request:** el identificador recibido tiene un formato inválido.
- **401 Unauthorized:** no se proporcionó un token válido, la sesión expiró o fue revocada.
- **403 Forbidden:** el usuario no tiene permisos para consultar el detalle de los conductores.
- **404 Not Found:** no existe un conductor registrado con el identificador proporcionado.
- **500 Internal Server Error:** ocurrió un error inesperado durante la consulta.

## 8. Validaciones

Antes de devolver la información, el backend debe:

1. Verificar que se haya enviado el token de autenticación.
2. Validar que corresponda a una sesión existente, no revocada y no expirada.
3. Comprobar que el rol del usuario tenga permiso para consultar el detalle de los conductores.
4. Validar que el identificador recibido en la ruta sea válido.
5. Consultar el registro correspondiente en la tabla `driver`.
6. Obtener los datos personales del conductor desde `user_data`.
7. Consultar la información de la cuenta en `user_account`.
8. Verificar el perfil asociado en `profile`.
9. Obtener la información de la cuadrilla mediante `driver.crew_id`.
10. Evitar devolver información sensible, como contraseñas, hashes o tokens de autenticación.

## 9. Reglas de negocio

**RN 01. Acceso según rol:** solamente los usuarios autorizados pueden consultar el detalle de los conductores.

**RN 02. Consulta individual:** se debe permitir consultar la información de un conductor específico mediante su identificador.

**RN 03. Información relacionada:** la respuesta debe incluir los datos personales del conductor, su información de vinculación laboral y la cuadrilla asociada.

**RN 04. Seguridad de la información:** no se deben exponer contraseñas, hashes ni tokens almacenados en las tablas de autenticación.

**RN 05. Identificación del conductor:** el identificador utilizado corresponde al registro del conductor en la tabla `driver`.

## 10. Relación con la base de datos

Este endpoint involucra principalmente cinco tablas:

- **driver:** permite identificar el registro del conductor y su vinculación laboral.
- **user_data:** contiene los datos personales y de contacto.
- **user_account:** almacena la información de la cuenta asociada.
- **profile:** permite consultar el rol asignado.
- **crew:** proporciona los datos de la cuadrilla a la que pertenece.

Relaciones principales:

```text
driver.user_data_id → user_data.id

user_data.id → user_account.id

profile.user_account_id → user_account.id

driver.crew_id → crew.id
```

## 11. Relación con las historias de usuario

**HU4. Gestionar personal operativo**

Este endpoint cumple el criterio de permitir consultar individualmente la información de un conductor registrado, incluyendo sus datos personales y su relación con una cuadrilla.

---

# Endpoint 19. Actualizar la información de un conductor

## 1. Método y ruta

**Método:** `PATCH`

**Ruta:** `/api/v1/drivers/{id}`

## 2. ¿Para qué sirve?

Permite actualizar parcialmente la información personal y los datos de contacto de un conductor registrado en el sistema, sin necesidad de enviar todos sus datos nuevamente.

La actualización contempla los datos almacenados en `user_data` y, cuando corresponda, el estado de su vinculación laboral en `driver`.

Este endpoint no contempla el cambio de cuadrilla, debido a que primero debe definirse el procedimiento para conservar el historial de las vinculaciones laborales.

## 3. Autenticación

Este endpoint requiere autenticación mediante un token JWT válido.

El backend debe verificar que el usuario autenticado tenga permisos para actualizar la información de los conductores.

## 4. Encabezados de la solicitud

```http
Authorization: Bearer <token>
Content-Type: application/json
Accept: application/json
```

## 5. Parámetros de entrada

**Parámetro de ruta: id**

- Tipo: identificador del registro del conductor.
- Obligatorio: sí.
- Descripción: identificador del conductor que se desea actualizar en la tabla `driver`.

### Cuerpo de la solicitud

Ejemplo JSON:

```json
{
    "firstName": "Carlos Andrés",
    "lastName": "Pérez Gómez",
    "email": "carlosandres@example.com",
    "phone": "3019876543",
    "isActive": true
}
```

### Descripción de los campos

**Campo: firstName**

- Tipo: string.
- Obligatorio: no.
- Descripción: actualiza los nombres del conductor.
- Almacenamiento: `user_data`.

**Campo: lastName**

- Tipo: string.
- Obligatorio: no.
- Descripción: actualiza los apellidos del conductor.
- Almacenamiento: `user_data`.

**Campo: email**

- Tipo: string.
- Obligatorio: no.
- Descripción: actualiza el correo electrónico asociado a la cuenta.
- Almacenamiento: ubicación correspondiente del correo en el modelo de datos, por confirmar en el DER.

**Campo: phone**

- Tipo: string.
- Obligatorio: no.
- Descripción: actualiza el número de contacto.
- Almacenamiento: `user_data`.

**Campo: isActive**

- Tipo: boolean.
- Obligatorio: no.
- Descripción: actualiza el estado de la vinculación laboral del conductor.
- Almacenamiento: `driver.is_active`.

Todos los campos del cuerpo son opcionales porque el método `PATCH` permite actualizar parcialmente la información.

## 6. Respuesta exitosa

**Código HTTP:** `200 OK`

```json
{
    "status": "success",
    "message": "Información del conductor actualizada correctamente",
    "data": {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "firstName": "Carlos Andrés",
        "lastName": "Pérez Gómez",
        "email": "carlosandres@example.com",
        "phone": "3019876543",
        "crew": {
            "id": "550e8400-e29b-41d4-a716-446655440000",
            "name": "Cuadrilla Norte"
        },
        "isActive": true,
        "updatedAt": "2026-11-05T14:00:00"
    }
}
```

## 7. Respuestas de error

- **400 Bad Request:** uno o varios campos enviados tienen un formato inválido o no están permitidos.
- **401 Unauthorized:** no se proporcionó un token válido, la sesión expiró o fue revocada.
- **403 Forbidden:** el usuario no tiene permisos para actualizar conductores.
- **404 Not Found:** no existe un conductor con el identificador proporcionado.
- **409 Conflict:** el correo electrónico ya está asociado a otra cuenta, cuando exista una restricción de unicidad.
- **500 Internal Server Error:** ocurrió un error inesperado durante la actualización.

## 8. Validaciones

Antes de actualizar la información, el backend debe:

1. Verificar que se haya enviado el token de autenticación.
2. Validar que corresponda a una sesión existente, no revocada y no expirada.
3. Comprobar que el rol del usuario tenga permiso para actualizar conductores.
4. Validar que el identificador recibido en la ruta sea válido.
5. Verificar que el conductor exista en la tabla `driver`.
6. Validar que los campos enviados cumplan con los formatos y restricciones correspondientes.
7. Comprobar que el correo electrónico tenga un formato válido, si se proporciona.
8. Verificar que el correo no esté asociado a otra cuenta, si se establece esta restricción.
9. Actualizar los datos personales en `user_data`, cuando corresponda.
10. Actualizar el estado de la vinculación laboral en `driver`, si se envía `isActive`.
11. Registrar los cambios mediante el mecanismo de auditoría correspondiente, si está implementado.

## 9. Reglas de negocio

**RN 01. Acceso según rol:** solamente los usuarios autorizados pueden actualizar la información de los conductores.

**RN 02. Actualización parcial:** se deben actualizar únicamente los campos enviados en la solicitud, conservando los valores de los campos que no se modifiquen.

**RN 03. Separación de información:** los datos personales y de contacto se actualizan en `user_data`, mientras que el estado de la vinculación laboral se actualiza en `driver`.

**RN 04. Estado de vinculación:** el campo `isActive` permite activar o desactivar la relación laboral del conductor.

**RN 05. Conservación de la cuenta:** esta operación no propone modificar datos de cuenta ni perfil; el alcance de acceso del conductor sigue pendiente de aprobación.

**RN 06. Cambio de cuadrilla:** la modificación de la cuadrilla no se contempla en este endpoint hasta que se defina el procedimiento para conservar el historial de las vinculaciones laborales.

**RN 07. Seguridad de credenciales:** este endpoint no permite modificar contraseñas ni exponer información de autenticación.

## 10. Relación con la base de datos

Este endpoint involucra principalmente tres tablas:

- **driver:** permite consultar y actualizar el estado de la vinculación laboral.
- **user_data:** almacena los datos personales y de contacto que pueden modificarse.
- **user_account:** permite identificar la cuenta asociada al conductor.

Relaciones principales:

```text
driver.user_data_id → user_data.id

user_data.id → user_account.id
```

Para la trazabilidad de los cambios también se dispone de:

- **driver_log:** registra los cambios relacionados con la vinculación laboral.
- **user_data_log:** registra los cambios relacionados con los datos personales.

Estas tablas contemplan información como la acción realizada, los valores anteriores, el actor y la fecha del registro. Su generación debe estar implementada en el mecanismo de auditoría del sistema.

## 11. Relación con las historias de usuario

**HU4. Gestionar personal operativo**

Este endpoint cumple el criterio de permitir actualizar la información de los conductores registrados, incluyendo sus datos personales, de contacto y el estado de su vinculación laboral.

---


**Nota final:** los conductores y los recolectores pertenecen al personal operativo y tienen estructuras diferentes. Los conductores se relacionan en el DER con `user_data`; que esa relación otorgue acceso individual al sistema queda pendiente de las decisiones de seguridad. Los recolectores se administran mediante `crew_member` y el DER no les asigna una cuenta.