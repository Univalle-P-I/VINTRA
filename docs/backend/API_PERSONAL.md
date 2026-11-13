# API_PERSONAL.md
# Documentación de API – Módulo Personal (Conductores)

## 1. Descripción general

El módulo `personal` gestiona los registros de conductores de VINTRA. Permite consultar el listado de conductores, consultar un conductor específico, consultar el perfil propio del conductor autenticado, registrar nuevos conductores y actualizar su información.

La gestión de conductores está relacionada con los módulos de usuarios, cuadrillas y autenticación.

Cuando se registra un conductor, el sistema también crea sus datos personales y su cuenta mediante `UsuariosService`, asignándole automáticamente el rol `DRIVER`.

**Ruta base:**

`/api/v1/personal/conductores`

**Archivos principales:**

- `src/personal/personal.controller.ts`
- `src/personal/personal.service.ts`
- `src/personal/personal.module.ts`
- `src/personal/dto/crear-conductor.dto.ts`
- `src/personal/dto/actualizar-conductor.dto.ts`
- `src/personal/entidades/conductor.entity.ts`
- `src/personal/personal.service.spec.ts`

## 2. Seguridad y control de acceso

El controlador aplica globalmente:

- `JwtAuthGuard`: valida el token JWT y la sesión del usuario.
- `RolesGuard`: verifica que el usuario tenga uno de los roles autorizados.

Todos los endpoints requieren autenticación mediante Bearer Token.

| Rol | Permisos |
|---|---|
| ADMIN | Listar, consultar, registrar y actualizar conductores. |
| OPERATIONS_MANAGER | Listar, consultar, registrar y actualizar conductores. |
| DRIVER | Consultar únicamente su propio perfil mediante `/me`. |

Los demás roles no tienen acceso a las operaciones de este controlador.

Las respuestas documentadas para errores de seguridad son:

- `401 Unauthorized`: JWT ausente, inválido o revocado.
- `403 Forbidden`: el rol del usuario no permite la operación.

## 3. Endpoints disponibles

| Método | Ruta | Roles | Descripción |
|---|---|---|---|
| GET | `/api/v1/personal/conductores` | ADMIN, OPERATIONS_MANAGER | Lista los conductores. |
| GET | `/api/v1/personal/conductores/me` | DRIVER | Consulta el perfil propio. |
| GET | `/api/v1/personal/conductores/:id` | ADMIN, OPERATIONS_MANAGER | Consulta un conductor por UUID. |
| POST | `/api/v1/personal/conductores` | ADMIN, OPERATIONS_MANAGER | Registra un conductor. |
| PATCH | `/api/v1/personal/conductores/:id` | ADMIN, OPERATIONS_MANAGER | Actualiza un conductor. |

No se encontró un endpoint DELETE en el controlador.

---

## 4. Detalle de los endpoints

### 4.1. Listar conductores

**Método:** GET

**Ruta:** `/api/v1/personal/conductores`

**Autenticación:** JWT obligatorio.

**Roles:** ADMIN, OPERATIONS_MANAGER.

**Propósito:**

Consultar los conductores registrados en VINTRA, incluyendo los datos personales y la información de su cuadrilla asociada.

**Parámetros:**

No recibe parámetros de ruta ni query parameters.

**Headers:**

`Authorization: Bearer <accessToken>`

**Body:**

No requiere.

**Respuesta:**

Devuelve un arreglo de objetos `ConductorPublico`.

Cada elemento contiene:

- `id`
- `userDataId`
- `crewId`
- `firstName`
- `lastName`
- `email`
- `phone`
- `startedAt`
- `endedAt`
- `isActive`

**Lógica interna:**

1. Consulta los registros de `Conductor`.
2. Carga las relaciones `datosUsuario` y `cuadrilla`.
3. Ordena por fecha de inicio de vinculación de forma descendente.
4. Transforma cada registro mediante `toPublic()`.

**Reglas de negocio observadas:**

- No se encontró un filtro que limite el listado a conductores activos.
- Los registros se ordenan desde la vinculación más reciente hasta la más antigua.
- La información personal se obtiene de la entidad `DatosUsuario`.

**Errores documentados:**

- 401: usuario no autenticado.
- 403: rol no autorizado.

### 4.2. Consultar perfil propio

**Método:** GET

**Ruta:** `/api/v1/personal/conductores/me`

**Autenticación:** JWT obligatorio.

**Roles:** DRIVER.

**Propósito:**

Permitir que un conductor consulte su propio perfil sin proporcionar el identificador de otro conductor.

**Parámetros:**

No recibe parámetros de ruta ni query parameters.

**Headers:**

`Authorization: Bearer <accessToken>`

**Body:**

No requiere.

**Lógica interna:**

1. El decorador `@UsuarioAutenticado()` obtiene el usuario autenticado.
2. El controlador extrae `user.userId`.
3. Envía ese identificador a `personalService.obtenerPropio()`.
4. El servicio busca el conductor relacionado con `DatosUsuario.id`.
5. Si existe, devuelve la información pública del conductor.

**Reglas de negocio:**

- El usuario no puede indicar libremente qué conductor consultar.
- La búsqueda se realiza a partir de la identidad autenticada.
- Si el usuario no tiene un registro asociado como conductor, se genera un error 404.

**Errores documentados:**

- 401: usuario no autenticado.
- 403: rol no autorizado.
- 404: no existe un registro de conductor asociado al usuario.

### 4.3. Consultar un conductor por ID

**Método:** GET

**Ruta:** `/api/v1/personal/conductores/:id`

**Autenticación:** JWT obligatorio.

**Roles:** ADMIN, OPERATIONS_MANAGER.

**Parámetro de ruta:**

| Parámetro | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `id` | UUID | Sí | Identificador del conductor. |

**Headers:**

`Authorization: Bearer <accessToken>`

**Body:**

No requiere.

**Lógica interna:**

1. `ParseUUIDPipe` valida que el parámetro tenga formato UUID.
2. El servicio busca el conductor por su identificador.
3. Carga las relaciones `datosUsuario` y `cuadrilla`.
4. Transforma el resultado mediante `toPublic()`.

**Errores documentados:**

- 400: identificador con formato inválido.
- 401: usuario no autenticado.
- 403: rol no autorizado.
- 404: conductor inexistente.

### 4.4. Registrar un conductor

**Método:** POST

**Ruta:** `/api/v1/personal/conductores`

**Autenticación:** JWT obligatorio.

**Roles:** ADMIN, OPERATIONS_MANAGER.

**Propósito:**

Registrar un conductor creando sus datos personales, su cuenta de acceso y su vinculación como conductor.

**Headers:**

`Authorization: Bearer <accessToken>`

`Content-Type: application/json`

**Body:**

| Campo | Tipo | Obligatorio | Validación |
|---|---|---|---|
| `documentType` | Enum | Sí | Debe pertenecer a `TipoDocumento`. |
| `documentId` | String | Sí | No vacío, máximo 20 caracteres. |
| `firstName` | String | Sí | Entre 2 y 80 caracteres; elimina espacios externos. |
| `lastName` | String | Sí | Entre 2 y 80 caracteres; elimina espacios externos. |
| `email` | String | Sí | Correo válido, máximo 254 caracteres; elimina espacios externos y convierte a minúsculas. |
| `phone` | String | No | Máximo 20 caracteres. |
| `password` | String | Sí | Entre 12 y 128 caracteres. |
| `crewId` | UUID o null | No | UUID válido cuando se proporciona; admite null. |

**Lógica interna:**

1. Construye un `CrearUsuarioInternoDto` con los datos recibidos.
2. Asigna automáticamente el rol `DRIVER`.
3. Ejecuta la operación mediante `ContextoAuditoriaService`.
4. Si se proporciona `crewId`, consulta la cuadrilla y verifica que esté activa.
5. Si la cuadrilla no existe o está inactiva, genera un error 404.
6. Invoca `UsuariosService.crearEntidades()` para crear las entidades del usuario.
7. Crea el registro de `Conductor` asociado a los datos personales y a la cuadrilla.
8. Establece `activo = true` y `finVinculacion = null`.
9. Devuelve la representación pública del conductor.

**Reglas de negocio:**

- El rol se establece como `DRIVER`; no lo selecciona el cliente.
- La cuadrilla es opcional.
- Si no se proporciona `crewId`, el conductor se crea sin cuadrilla.
- Si se proporciona una cuadrilla, debe existir y estar activa.
- La operación se ejecuta dentro del contexto de auditoría utilizando el usuario actor y la IP de la solicitud.
- No se observan reglas de complejidad de contraseña dentro de este DTO; las reglas adicionales, si existen, deben verificarse en el módulo de usuarios.

**Respuesta documentada:**

Código HTTP: 201 Created.

Devuelve los datos públicos del conductor creado.

**Errores documentados:**

- 400: información de entrada inválida.
- 401: usuario no autenticado.
- 403: rol no autorizado.
- 404: cuadrilla inexistente o inactiva.
- 409: correo o documento asociado a otro usuario.

### 4.5. Actualizar un conductor

**Método:** PATCH

**Ruta:** `/api/v1/personal/conductores/:id`

**Autenticación:** JWT obligatorio.

**Roles:** ADMIN, OPERATIONS_MANAGER.

**Parámetro de ruta:**

| Parámetro | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `id` | UUID | Sí | Identificador del conductor. |

**Headers:**

`Authorization: Bearer <accessToken>`

`Content-Type: application/json`

**Body:**

Todos los campos son opcionales.

| Campo | Tipo | Validación |
|---|---|---|
| `firstName` | String | Entre 2 y 80 caracteres; elimina espacios externos. |
| `lastName` | String | Entre 2 y 80 caracteres; elimina espacios externos. |
| `email` | String | Correo válido, máximo 254 caracteres; elimina espacios externos y convierte a minúsculas. |
| `phone` | String o null | Máximo 20 caracteres; admite null. |
| `crewId` | UUID o null | UUID válido cuando se proporciona; admite null. |
| `isActive` | Boolean | Debe ser true o false. |

**Lógica interna:**

1. Valida el UUID del conductor.
2. Busca el conductor y carga sus relaciones.
3. Si no existe, devuelve 404.
4. Actualiza los datos personales cuando se proporcionan campos correspondientes.
5. Si se envía `crewId = null`, elimina la asociación con la cuadrilla.
6. Si se proporciona un UUID de cuadrilla, comprueba que exista y esté activa.
7. Actualiza el estado cuando se proporciona `isActive`.
8. Guarda los cambios de `DatosUsuario`.
9. Guarda los cambios de `Conductor`.
10. Devuelve la representación pública actualizada.

**Reglas de negocio:**

- La actualización es parcial.
- Los campos omitidos conservan sus valores.
- Una cuadrilla nueva debe existir y estar activa.
- Se puede desvincular un conductor de su cuadrilla enviando `crewId = null`.
- Se puede activar o desactivar mediante `isActive`.
- La operación se ejecuta dentro del contexto de auditoría.
- El servicio no modifica automáticamente `finVinculacion` cuando cambia `isActive`.
- El DTO permite que se envíe un objeto vacío; no se observa una validación que exija al menos un campo modificable.

**Errores documentados:**

- 400: UUID o información de entrada inválida.
- 401: usuario no autenticado.
- 403: rol no autorizado.
- 404: conductor o cuadrilla inexistente/inactiva.
- 409: correo o documento asociado a otro usuario.

---

## 5. Transformación de la respuesta

El servicio utiliza la interfaz `ConductorPublico` y el método privado `toPublic()` para evitar devolver directamente las entidades de TypeORM.

La respuesta combina información de:

- `Conductor`: identificador, cuadrilla, fechas de vinculación y estado.
- `DatosUsuario`: identificador de datos personales, nombres, apellidos, correo y teléfono.

La estructura pública es:

| Campo | Origen |
|---|---|
| `id` | Conductor |
| `userDataId` | DatosUsuario |
| `crewId` | Cuadrilla relacionada |
| `firstName` | DatosUsuario |
| `lastName` | DatosUsuario |
| `email` | DatosUsuario |
| `phone` | DatosUsuario |
| `startedAt` | Conductor |
| `endedAt` | Conductor |
| `isActive` | Conductor |

Si no existe una cuadrilla asociada, `crewId` se devuelve como `null`.

## 6. Entidad y relación con la base de datos

**Entidad:** `Conductor`

**Tabla:** `driver`

| Propiedad | Columna | Tipo / comportamiento |
|---|---|---|
| `id` | `id` | UUID, clave primaria. |
| `datosUsuario` | `user_data_id` | Relación ManyToOne obligatoria. |
| `cuadrilla` | `crew_id` | Relación ManyToOne opcional. |
| `inicioVinculacion` | `started_at` | timestamptz, valor predeterminado now(). |
| `finVinculacion` | `ended_at` | timestamptz, admite NULL. |
| `activo` | `is_active` | boolean, valor predeterminado true. |
| `actualizadoEn` | `updated_at` | timestamptz, valor predeterminado now(). |
| `creadoEn` | `created_at` | timestamptz, valor predeterminado now(). |

**Relaciones:**

- `DatosUsuario`: relación obligatoria mediante `user_data_id`.
- `Cuadrilla`: relación opcional mediante `crew_id`.

**Índices y restricciones declaradas en la entidad:**

- `idx_driver_user_data_id`: índice sobre la relación con datos personales.
- `idx_driver_crew_id`: índice sobre la relación con cuadrilla.
- `fk_driver_user_data`: clave foránea hacia datos personales.
- `fk_driver_crew`: clave foránea hacia cuadrilla.
- `driver_pkey`: clave primaria.
- `ck_driver_dates`: establece que `ended_at` sea NULL o no sea anterior a `started_at`.

**Observación técnica:**

`updated_at` utiliza `default: now()`, pero no está declarado mediante `@UpdateDateColumn()`. La entidad, por sí sola, no garantiza que TypeORM actualice automáticamente esta columna en cada modificación.

**Estado del esquema:**

La entidad representa el modelo esperado por el backend. Las migraciones relacionadas continúan pendientes de aprobación; por tanto, estas declaraciones no deben interpretarse como confirmación de que las restricciones ya están desplegadas en la base de datos compartida.

## 7. Auditoría

Las operaciones de creación y actualización reciben:

- `actorId`: identificador del usuario que realiza la operación.
- `requestIp`: dirección IP de la solicitud.

Ambas operaciones utilizan `ContextoAuditoriaService.ejecutar()` para ejecutar su lógica dentro del contexto de auditoría.

Las consultas no invocan directamente este contexto en el servicio de personal.

La implementación concreta del registro de auditoría corresponde al módulo de auditoría.

## 8. Manejo de errores

| Situación | Excepción / código |
|---|---|
| Conductor inexistente | NotFoundException / 404 |
| Cuadrilla inexistente o inactiva | NotFoundException / 404 |
| Violación de unicidad PostgreSQL `23505` | ConflictException / 409 |
| UUID inválido | Error de validación de ParseUUIDPipe / 400 |
| DTO inválido | Error de validación / 400 |
| JWT inválido, ausente o revocado | UnauthorizedException / 401 |
| Rol no autorizado | ForbiddenException / 403 |

El método `throwIfUniqueViolation()` identifica el código PostgreSQL `23505` y lo convierte en un conflicto HTTP.

El mensaje implementado indica que el correo o documento ya está asociado a otro usuario.

## 9. Pruebas unitarias

**Archivo:** `src/personal/personal.service.spec.ts`

**Ejecución:**

`npm test -- --runInBand src/personal`

**Resultado observado:**

- Suites aprobadas: 1 de 1.
- Pruebas aprobadas: 14 de 14.
- Pruebas fallidas: 0.
- Tiempo: 2.032 segundos.

**Cobertura funcional observada:**

| Funcionalidad | Pruebas |
|---|---:|
| Listar conductores | 1 |
| Consultar conductor por ID | 2 |
| Consultar perfil propio | 2 |
| Crear conductor | 4 |
| Actualizar conductor | 5 |
| **Total** | **14** |

Las pruebas verifican consultas, transformación de respuestas, creación con y sin cuadrilla, validación de cuadrillas activas, actualización parcial, desvinculación de cuadrillas y manejo de violaciones de unicidad.

**Limitaciones:**

Las pruebas son unitarias y utilizan repositorios, servicios y contexto de auditoría simulados. No demuestran por sí solas:

- La integración real con PostgreSQL.
- La ejecución efectiva de transacciones en la base de datos.
- La creación real de registros de auditoría.
- La aplicación de las migraciones.
- La protección real de los endpoints mediante JWT y roles.
- El comportamiento automático de `updated_at`.

No se identificó un archivo de pruebas específico del controlador dentro de los archivos revisados.

## 10. Observaciones y aspectos pendientes

1. No existe un endpoint DELETE para conductores en el controlador revisado.
2. El listado no filtra explícitamente los conductores inactivos.
3. La desactivación no establece automáticamente `ended_at`.
4. El DTO de actualización admite un objeto vacío.
5. La entidad no declara `updated_at` como `@UpdateDateColumn()`.
6. Las pruebas unitarias no sustituyen las pruebas de integración con PostgreSQL.
7. Debe verificarse la coherencia de las restricciones de unicidad y relaciones cuando las migraciones sean aprobadas.
8. No se encontraron en este módulo operaciones para modificar el tipo o número de documento ni la contraseña del conductor.

## 11. Conclusión

El módulo `personal` implementa la gestión de conductores mediante cinco endpoints protegidos por JWT y control de roles.

Su operación de creación integra la gestión de usuarios, la asignación del rol `DRIVER`, la vinculación opcional a una cuadrilla y el contexto de auditoría.

La actualización permite modificar parcialmente los datos personales, la cuadrilla y el estado del conductor.

El módulo cuenta con 14 pruebas unitarias aprobadas. Sin embargo, la integración con la base de datos y el despliegue de las restricciones del esquema deben verificarse por separado, teniendo en cuenta que las migraciones siguen pendientes de aprobación.