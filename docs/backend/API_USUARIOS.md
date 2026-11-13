# API de Usuarios — VINTRA

## 1. Descripción general

El módulo **Usuarios** administra las cuentas de acceso y los datos personales de las personas registradas en VINTRA.

Se encarga de crear cuentas internas, consultar información de usuarios, permitir que cada usuario consulte y actualice sus propios datos y proporcionar consultas administrativas.

El módulo trabaja principalmente con dos entidades:

- `CuentaUsuario`: almacena la información de autenticación, identificación y estado de la cuenta.
- `DatosUsuario`: almacena los datos personales y de contacto.

También se relaciona con el módulo `Perfiles` para asignar y consultar los roles de cada usuario.

**Ruta base:**

`/api/v1/users`

**Controlador:** `UsuariosController`

**Servicio:** `UsuariosService`

**Módulo:** `UsuariosModule`

---

## 2. Responsabilidades del módulo

Las principales responsabilidades son:

1. Crear cuentas internas y asociarles sus datos personales.
2. Asignar un perfil y un rol al usuario durante su creación.
3. Consultar el listado de usuarios.
4. Consultar los datos del usuario autenticado.
5. Permitir la actualización de los datos personales del usuario autenticado.
6. Consultar usuarios específicos mediante su identificador UUID.
7. Proteger la información sensible, evitando exponer hashes de contraseñas.
8. Integrar las operaciones de creación y actualización con el contexto de auditoría.

---

## 3. Entidades y relaciones

### 3.1. CuentaUsuario

Representa la cuenta utilizada para acceder al sistema.

**Tabla:** `user_account`

| Atributo en código | Columna | Descripción |
|---|---|---|
| `id` | `id` | Identificador UUID de la cuenta. |
| `estado` | `status` | Estado de la cuenta. |
| `tipoDocumento` | `document_type` | Tipo de documento. |
| `numeroDocumento` | `document_id` | Número de documento. |
| `hashContrasena` | `pwd_hash` | Hash de la contraseña. |
| `intentosFallidos` | `failed_attempts` | Número de intentos fallidos. |
| `bloqueadoHasta` | `locked_until` | Fecha y hora hasta la que permanece bloqueada. |
| `ultimoInicioSesion` | `last_login_at` | Fecha y hora del último inicio de sesión. |
| `contrasenaActualizadaEn` | `password_changed_at` | Fecha de actualización de contraseña. |
| `actualizadoEn` | `updated_at` | Fecha de actualización del registro. |
| `creadoEn` | `created_at` | Fecha de creación del registro. |

**Estados definidos en el código:**

- `ACTIVO`: `active`.
- `INACTIVO`: `inactive`.
- `BLOQUEADO`: `locked`.
- `PENDIENTE_VERIFICACION`: `pending_verification`.

La entidad utiliza un transformador para convertir los valores del estado entre la representación utilizada en TypeScript y las etiquetas definidas para el enum de PostgreSQL.

**Tipos de documento definidos actualmente:**

- `CC`.

La entidad también declara restricciones de unicidad para la combinación de tipo y número de documento, y una validación para impedir que los intentos fallidos sean negativos.

### 3.2. DatosUsuario

Representa la información personal y de contacto del usuario.

**Tabla:** `user_data`

| Atributo en código | Columna | Descripción |
|---|---|---|
| `id` | `id` | Identificador UUID compartido con la cuenta. |
| `nombres` | `first_name` | Nombres del usuario. |
| `apellidos` | `last_name` | Apellidos del usuario. |
| `correo` | `email` | Correo electrónico. |
| `telefono` | `phone` | Teléfono de contacto, opcional. |
| `correoVerificadoEn` | `email_verified_at` | Fecha de verificación del correo. |
| `actualizadoEn` | `updated_at` | Fecha de actualización. |
| `creadoEn` | `created_at` | Fecha de creación. |

El correo electrónico tiene una restricción de unicidad declarada en la entidad.

### 3.3. Relación entre las entidades

`CuentaUsuario` y `DatosUsuario` mantienen una relación uno a uno (`OneToOne`).

Ambas entidades comparten el mismo identificador:

- La cuenta genera el UUID.
- Los datos personales reciben ese mismo UUID como identificador.
- La relación se establece mediante la columna `id`.

Además, durante la creación se registra un perfil asociado a la cuenta, que determina el rol del usuario.

**Flujo conceptual:**

CuentaUsuario → DatosUsuario → Perfil

La creación de estas tres estructuras se realiza mediante el mismo `EntityManager` proporcionado al servicio.

---

## 4. DTO y validaciones

Los DTO establecen las reglas que deben cumplir los datos recibidos por el backend.

### 4.1. CrearUsuarioInternoDto

Archivo: `dto/crear-usuario-interno.dto.ts`

Se utiliza para crear una cuenta interna.

| Campo | Tipo | Validaciones |
|---|---|---|
| `firstName` | string | Obligatorio, mínimo 2 y máximo 80 caracteres. Se eliminan espacios al inicio y al final. |
| `lastName` | string | Obligatorio, mínimo 2 y máximo 80 caracteres. Se eliminan espacios al inicio y al final. |
| `email` | string | Obligatorio, formato de correo válido, máximo 254 caracteres. Se convierte a minúsculas y se eliminan espacios externos. |
| `phone` | string | Opcional, máximo 20 caracteres. |
| `documentType` | enum | Obligatorio. Actualmente admite `CC`. |
| `documentId` | string | Obligatorio, máximo 20 caracteres. Se eliminan espacios externos. |
| `role` | enum | Obligatorio. Debe corresponder a un valor de `RolUsuario`. |
| `password` | string | Obligatorio, mínimo 12 y máximo 128 caracteres. |

**Observaciones:**

- La contraseña se procesa mediante Argon2id antes de almacenarse.
- El DTO se denomina `CrearUsuarioInternoDto` y también se utiliza desde otros servicios; no debe confundirse con un contrato exclusivo de comunicación HTTP.
- El controlador de usuarios restringe el endpoint de creación al rol `ADMIN`.

### 4.2. ActualizarDatosUsuarioDto

Archivo: `dto/actualizar-datos-usuario.dto.ts`

Permite actualizar los datos personales del usuario autenticado.

Todos sus campos son opcionales.

| Campo | Tipo | Validaciones |
|---|---|---|
| `firstName` | string | Mínimo 2 y máximo 80 caracteres. Se eliminan espacios externos. |
| `lastName` | string | Mínimo 2 y máximo 80 caracteres. Se eliminan espacios externos. |
| `email` | string | Formato de correo válido, máximo 254 caracteres. Se convierte a minúsculas y se eliminan espacios externos. |
| `phone` | string | Opcional, máximo 20 caracteres. |

**Restricciones:**

Este DTO no permite modificar directamente:

- Contraseña.
- Tipo o número de documento.
- Estado de la cuenta.
- Roles o perfiles.

No se observa una validación que exija al menos un campo en la solicitud. Por tanto, un objeto vacío puede superar las validaciones del DTO.

---

## 5. Seguridad y autenticación

El controlador aplica globalmente:

- `JwtAuthGuard`.
- `RolesGuard`.

Por tanto, todos los endpoints requieren autenticación mediante JWT.

La autenticación se envía mediante el encabezado:

`Authorization: Bearer <access_token>`

Los endpoints que reciben un cuerpo JSON utilizan también:

`Content-Type: application/json`

### 5.1. Control de acceso por roles

| Operación | ADMIN | OPERATIONS_MANAGER | DRIVER | Otro usuario autenticado |
|---|---|---|---|---|
| Crear usuario | Sí | No | No | No |
| Listar usuarios | Sí | Sí | No | No |
| Consultar `/me` | Sí | Sí | Sí | Sí |
| Actualizar `/me` | Sí | Sí | Sí | Sí |
| Consultar por ID | Sí | Sí | No | No |

Los endpoints `/me` no declaran un rol específico mediante `@Roles()`, por lo que están disponibles para cualquier usuario que supere la autenticación.

**Importante:** consultar o actualizar el perfil propio no requiere enviar un identificador desde el cliente. El controlador obtiene el `userId` del usuario autenticado.

---

## 6. Endpoints

### 6.1. Crear una cuenta interna

**Método:** `POST`

**Ruta:** `/api/v1/users`

**Descripción:** crea una cuenta de usuario, registra sus datos personales y asigna un perfil con el rol indicado.

**Autenticación:** JWT obligatorio.

**Rol requerido:** `ADMIN`.

**Headers:**

| Header | Valor |
|---|---|
| `Authorization` | `Bearer <access_token>` |
| `Content-Type` | `application/json` |

**Body de ejemplo:**

```json
{
  "firstName": "Ana",
  "lastName": "Perez",
  "email": "ana@example.com",
  "phone": "3001234567",
  "documentType": "CC",
  "documentId": "1234567890",
  "role": "DRIVER",
  "password": "una-clave-segura"
}
```

El ejemplo ilustra los campos del DTO. El valor del rol debe coincidir con uno de los valores definidos en `RolUsuario`.

**Funcionamiento interno:**

1. El controlador recibe el DTO.
2. Obtiene el identificador del administrador autenticado.
3. Obtiene la IP de la solicitud.
4. Invoca `UsuariosService.crear()`.
5. El servicio inicia la operación mediante `ContextoAuditoriaService`.
6. Se crea la cuenta y se genera el hash Argon2id de la contraseña.
7. Se registran los datos personales con el mismo UUID de la cuenta.
8. Se crea el perfil con el rol indicado.
9. Se construye una respuesta pública sin información sensible.

**Respuestas:**

- `201 Created`: cuenta creada correctamente.
- `400 Bad Request`: datos de entrada inválidos.
- `401 Unauthorized`: JWT ausente, inválido o revocado.
- `403 Forbidden`: el rol no permite la operación.
- `409 Conflict`: correo o documento asociado a otra cuenta.

### 6.2. Listar usuarios

**Método:** `GET`

**Ruta:** `/api/v1/users`

**Descripción:** obtiene la colección de usuarios con sus datos públicos y roles activos.

**Autenticación:** JWT obligatorio.

**Roles requeridos:** `ADMIN`, `OPERATIONS_MANAGER`.

**Headers:**

`Authorization: Bearer <access_token>`

**Body:** no requiere.

**Funcionamiento interno:**

1. El servicio consulta los datos personales.
2. Incluye la relación con la cuenta.
3. Ordena los resultados por apellidos y nombres en orden ascendente.
4. Consulta los perfiles activos asociados a cada cuenta.
5. Construye la respuesta pública de cada usuario.

**Respuesta esperada:**

`200 OK`

Ejemplo de estructura:

```json
[
  {
    "id": "f0836911-5b63-490c-88a2-9176b9b2b4a1",
    "firstName": "Ana",
    "lastName": "Perez",
    "email": "ana@example.com",
    "phone": "3001234567",
    "status": "active",
    "roles": [
      "DRIVER"
    ]
  }
]
```

**Observación:** el método `listar()` no aplica un filtro por estado de cuenta. La consulta incluye los registros encontrados y obtiene sus perfiles activos.

### 6.3. Consultar el usuario autenticado

**Método:** `GET`

**Ruta:** `/api/v1/users/me`

**Descripción:** obtiene los datos públicos del usuario que inició sesión.

**Autenticación:** JWT obligatorio.

**Roles requeridos:** cualquier usuario autenticado.

**Headers:**

`Authorization: Bearer <access_token>`

**Body:** no requiere.

**Funcionamiento interno:**

1. El decorador `@UsuarioAutenticado()` obtiene la información del usuario autenticado.
2. El controlador toma su `userId`.
3. El servicio consulta el usuario correspondiente.
4. Se obtiene la información de la cuenta y sus perfiles activos.
5. Se devuelve la representación pública.

**Respuesta esperada:**

`200 OK`

Ejemplo:

```json
{
  "id": "f0836911-5b63-490c-88a2-9176b9b2b4a1",
  "firstName": "Ana",
  "lastName": "Perez",
  "email": "ana@example.com",
  "phone": null,
  "status": "active",
  "roles": [
    "DRIVER"
  ]
}
```

**Respuestas adicionales:**

- `401 Unauthorized`: JWT ausente, inválido o revocado.
- `404 Not Found`: usuario inexistente o sin cuenta asociada.

### 6.4. Actualizar los datos del usuario autenticado

**Método:** `PATCH`

**Ruta:** `/api/v1/users/me`

**Descripción:** actualiza los datos personales del usuario que inició sesión.

**Autenticación:** JWT obligatorio.

**Roles requeridos:** cualquier usuario autenticado.

**Headers:**

| Header | Valor |
|---|---|
| `Authorization` | `Bearer <access_token>` |
| `Content-Type` | `application/json` |

**Body de ejemplo:**

```json
{
  "firstName": "Ana Maria",
  "phone": "3007654321"
}
```

Se pueden enviar uno o varios de los campos admitidos por `ActualizarDatosUsuarioDto`.

**Funcionamiento interno:**

1. El controlador obtiene el usuario autenticado.
2. Utiliza su `userId` como identificador del usuario que será actualizado.
3. Pasa el mismo identificador como actor de auditoría.
4. El servicio ejecuta la operación mediante `ContextoAuditoriaService`.
5. Consulta los datos personales y la cuenta asociada.
6. Actualiza únicamente los campos proporcionados.
7. Conserva los valores de los campos omitidos.
8. Guarda los cambios y consulta los perfiles activos.
9. Devuelve la información pública actualizada.

**Respuestas documentadas:**

- `200 OK`: datos actualizados correctamente.
- `400 Bad Request`: datos inválidos.
- `401 Unauthorized`: JWT ausente, inválido o revocado.
- `403 Forbidden`: acceso no permitido.
- `409 Conflict`: conflicto de unicidad documentado en el endpoint.

**Observación técnica:** el servicio `actualizarPropio()` no implementa actualmente el mismo manejo explícito del código PostgreSQL `23505` que utiliza `crear()`. Por ello, debe verificarse el tratamiento efectivo de una colisión de correo antes de considerar garantizada la respuesta HTTP `409`.

### 6.5. Consultar un usuario por ID

**Método:** `GET`

**Ruta:** `/api/v1/users/:id`

**Descripción:** obtiene los datos públicos de un usuario específico mediante su identificador UUID.

**Autenticación:** JWT obligatorio.

**Roles requeridos:** `ADMIN`, `OPERATIONS_MANAGER`.

**Parámetro de ruta:**

| Parámetro | Tipo | Validación |
|---|---|---|
| `id` | UUID | Se valida mediante `ParseUUIDPipe`. |

**Ejemplo:**

`GET /api/v1/users/f0836911-5b63-490c-88a2-9176b9b2b4a1`

**Headers:**

`Authorization: Bearer <access_token>`

**Body:** no requiere.

**Funcionamiento interno:**

1. El controlador recibe el identificador.
2. `ParseUUIDPipe` valida el formato UUID.
3. El servicio consulta los datos personales y la cuenta relacionada.
4. Si el usuario no existe o no tiene cuenta asociada, lanza `NotFoundException`.
5. Si existe, consulta los perfiles activos y devuelve los datos públicos.

**Respuestas:**

- `200 OK`: usuario encontrado.
- `400 Bad Request`: identificador UUID inválido.
- `401 Unauthorized`: JWT ausente, inválido o revocado.
- `403 Forbidden`: rol no autorizado.
- `404 Not Found`: usuario inexistente o sin cuenta asociada.

---

## 7. Estructura de respuesta pública

El servicio utiliza la interfaz `UsuarioPublico` para construir las respuestas.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | string | Identificador UUID. |
| `firstName` | string | Nombres. |
| `lastName` | string | Apellidos. |
| `email` | string | Correo electrónico. |
| `phone` | string o null | Teléfono. |
| `status` | EstadoUsuario | Estado de la cuenta. |
| `roles` | string[] | Roles activos asociados al usuario. |

**Información que no se expone:**

- Hash de contraseña.
- Número de documento.
- Intentos fallidos de autenticación.
- Fecha de bloqueo.
- Datos internos de autenticación.

Esta separación evita devolver información sensible en las respuestas públicas del módulo.

---

## 8. Reglas de negocio

1. La creación de cuentas internas está restringida al rol `ADMIN`.
2. Cada cuenta debe tener sus datos personales asociados.
3. La cuenta y los datos personales comparten el mismo identificador UUID.
4. Durante la creación se asigna un perfil con el rol indicado en el DTO.
5. Las contraseñas se almacenan mediante hashes Argon2id; no se guardan como texto plano.
6. El correo electrónico se normaliza a minúsculas y se eliminan los espacios externos al recibirlo mediante los DTO.
7. El número y tipo de documento están sujetos a una restricción de unicidad declarada en la entidad.
8. El usuario autenticado solo puede consultar y actualizar sus propios datos mediante los endpoints `/me`.
9. Las consultas administrativas por listado o identificador están restringidas a `ADMIN` y `OPERATIONS_MANAGER`.
10. Las respuestas públicas no incluyen hashes de contraseña ni números de documento.
11. Los perfiles devueltos por el servicio corresponden a registros con `activo: true`.
12. Las operaciones de creación y actualización propia se ejecutan a través del contexto de auditoría.

---

## 9. Auditoría y transacciones

El servicio utiliza `ContextoAuditoriaService` para ejecutar operaciones con información del actor y de la IP de origen.

En la creación:

- Se recibe el identificador del administrador que realiza la operación.
- Se recibe la IP de la solicitud.
- Se obtiene el `EntityManager` proporcionado por el contexto.
- Se crean la cuenta, los datos personales y el perfil mediante los repositorios obtenidos de ese administrador.

En la actualización propia:

- El usuario autenticado se registra como actor.
- Se utiliza su identificador para localizar los datos que se modificarán.
- Se utiliza el administrador de la operación para guardar los cambios.

El método `crearEntidades()` también permite reutilizar la creación de cuenta, datos y perfil desde otros servicios que proporcionen su propio `EntityManager`. Esto permite integrar la operación dentro de un flujo transaccional más amplio.

---

## 10. Manejo de errores

| Código HTTP | Significado | Situación |
|---|---|---|
| `400` | Bad Request | DTO inválido o UUID incorrecto. |
| `401` | Unauthorized | JWT ausente, inválido o revocado. |
| `403` | Forbidden | El rol no permite la operación. |
| `404` | Not Found | Usuario inexistente o sin cuenta asociada. |
| `409` | Conflict | Conflicto de unicidad durante la creación; también está documentado en actualización, pendiente de verificar su manejo efectivo. |

En `crear()`, el servicio identifica el código PostgreSQL `23505` y lo transforma en `ConflictException`.

El mensaje definido informa que el correo o documento ya está asociado a otro usuario.

---

## 11. Pruebas unitarias

**Archivo:** `usuarios.service.spec.ts`

Se ejecutaron las pruebas unitarias del servicio mediante:

```powershell
npm test -- --runInBand src/usuarios
```

**Resultado:**

| Indicador | Resultado |
|---|---:|
| Suites aprobadas | 1 |
| Suites fallidas | 0 |
| Pruebas aprobadas | 9 |
| Pruebas fallidas | 0 |
| Snapshots | 0 |
| Tiempo de ejecución | 2.272 segundos |

### Casos comprobados

1. Creación de cuenta, datos personales y perfil.
2. Generación y verificación del hash de contraseña.
3. Exclusión del hash en la respuesta pública.
4. Listado de usuarios y consulta de perfiles activos.
5. Consulta de un usuario por identificador.
6. Manejo de usuarios inexistentes.
7. Manejo de usuarios sin cuenta asociada.
8. Delegación de la consulta del usuario autenticado.
9. Actualización de los campos enviados y conservación de los omitidos.
10. Registro de las operaciones mediante el contexto de auditoría.
11. Conversión de una violación de unicidad PostgreSQL `23505` en `ConflictException`.

Los casos están distribuidos en nueve pruebas unitarias; algunos verifican más de un comportamiento.

**Alcance de las pruebas:** utilizan dependencias simuladas (*mocks*) para repositorios, administrador de transacciones y contexto de auditoría. Por tanto, validan la lógica del servicio, pero no constituyen una prueba de integración con PostgreSQL ni demuestran que las restricciones estén aplicadas en una base de datos real.

La ejecución mostró una advertencia experimental de Node.js relacionada con VM Modules, pero no afectó el resultado de las pruebas.

---

## 12. Observaciones técnicas y pendientes

Durante la revisión del código se identificaron los siguientes puntos que conviene tener presentes:

1. **Estados en el listado:** `listar()` no filtra las cuentas por estado. Puede devolver usuarios cuyas cuentas estén inactivas, bloqueadas o pendientes de verificación, siempre que sus registros existan y tengan los datos relacionados.

2. **Conflicto al actualizar el correo:** `actualizarPropio()` no contiene un manejo explícito equivalente al de `crear()` para convertir una violación de unicidad `23505` en `ConflictException`.

3. **Actualización sin campos:** el DTO permite que todos sus atributos sean opcionales. No se exige expresamente que llegue al menos un campo para actualizar.

4. **Tipos de documento:** la entidad `CuentaUsuario` declara actualmente únicamente el tipo `CC`.

5. **Campos de actualización:** las columnas `updated_at` están declaradas con un valor predeterminado `now()`, pero en las entidades revisadas no se utiliza `@UpdateDateColumn`. Por tanto, no debe asumirse que TypeORM las actualiza automáticamente en cada modificación.

6. **Pruebas de integración:** todavía se requiere validar el comportamiento del módulo contra una base de datos de prueba cuando exista un entorno preparado y autorizado para ello.

7. **Esquema de base de datos:** las entidades y restricciones descritas corresponden a la implementación revisada en el código. Su aplicación efectiva depende de la aprobación y ejecución de las migraciones correspondientes.

---

## 13. Consideraciones sobre la base de datos

La documentación de las entidades refleja la estructura declarada en el código fuente.

Las migraciones del proyecto continúan pendientes de aprobación. En consecuencia:

- Las entidades sirven como referencia para el desarrollo del backend.
- Las restricciones declaradas no deben considerarse automáticamente verificadas en una base de datos compartida.
- No se debe ejecutar una migración pendiente sobre una base de datos compartida o de producción sin la aprobación correspondiente.
- La estructura definitiva debe contrastarse con el DER y las migraciones aprobadas.

---

## 14. Archivos del módulo

La estructura revisada del módulo es:

```text
src/
└── usuarios/
    ├── dto/
    │   ├── actualizar-datos-usuario.dto.ts
    │   └── crear-usuario-interno.dto.ts
    ├── entidades/
    │   ├── cuenta-usuario.entity.ts
    │   └── datos-usuario.entity.ts
    ├── usuarios.controller.ts
    ├── usuarios.module.ts
    ├── usuarios.service.spec.ts
    └── usuarios.service.ts
```

### Dependencias principales

- `@nestjs/common`
- `@nestjs/typeorm`
- `typeorm`
- `argon2`
- Módulo de autenticación.
- Módulo de perfiles.
- Contexto de auditoría.

---

## 15. Conclusión

El módulo `usuarios` centraliza la administración de las cuentas y los datos personales de los usuarios de VINTRA.

Su implementación separa las responsabilidades de almacenamiento, validación, lógica de negocio y exposición de endpoints. Integra autenticación mediante JWT, autorización por roles, generación segura de hashes de contraseña y operaciones vinculadas al contexto de auditoría.

La revisión del servicio y sus pruebas unitarias permitió comprobar los comportamientos principales de creación, consulta y actualización. Se obtuvieron **9 pruebas aprobadas de 9 ejecutadas**.

Quedan como aspectos de seguimiento la verificación del manejo de conflictos durante la actualización, las pruebas de integración con PostgreSQL y la confirmación del esquema definitivo una vez sean aprobadas las migraciones.
