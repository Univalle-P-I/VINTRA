# API_PERFILES.md

## 1. Descripción general

El módulo **Perfiles** administra los roles asociados a las cuentas de usuario de VINTRA. Permite consultar los perfiles de una cuenta, crear nuevos perfiles y modificar su estado de actividad.

Cada perfil relaciona una cuenta de usuario con un rol determinado. Una misma cuenta puede tener varios perfiles, siempre que no repita el mismo rol.

**Responsabilidades principales:**

- Consultar los perfiles asociados a una cuenta.
- Crear perfiles y asignar roles.
- Activar o desactivar perfiles.
- Controlar el acceso a las operaciones mediante roles.
- Proporcionar contexto de auditoría para las operaciones de escritura.

## 2. Control de acceso

Todos los endpoints están protegidos mediante:

- `JwtAuthGuard`: verifica la autenticación mediante JWT.
- `RolesGuard`: comprueba que el usuario autenticado tenga el rol autorizado.
- `ApiBearerAuth('access-token')`: documenta la autenticación Bearer en Swagger.

### Matriz de permisos

| Operación | ADMIN | OPERATIONS_MANAGER | DRIVER |
|---|---|---|---|
| Consultar perfiles de una cuenta | Sí | Sí | No |
| Crear perfiles | Sí | No | No |
| Actualizar perfiles | Sí | No | No |

Los permisos están definidos mediante el decorador `@Roles()` en el controlador.

## 3. Endpoints

### 3.1. Consultar perfiles de una cuenta

**Método:** GET

**Ruta:** `/api/v1/users/:userId/profiles`

**Autorización:** ADMIN, OPERATIONS_MANAGER.

**Parámetros de ruta:**

| Parámetro | Tipo | Validación | Descripción |
|---|---|---|---|
| `userId` | UUID | `ParseUUIDPipe` | Identificador de la cuenta de usuario. |

**Headers:**

| Header | Valor |
|---|---|
| Authorization | Bearer JWT |

**Body:** No requiere.

**Funcionamiento:**

1. El controlador recibe el identificador de la cuenta.
2. `ParseUUIDPipe` valida que tenga formato UUID.
3. El servicio consulta los perfiles relacionados con esa cuenta.
4. Los resultados se ordenan por fecha de creación ascendente.
5. El servicio transforma las entidades en objetos `PerfilPublico`.

**Respuesta:** 200 OK.

Ejemplo:

```json
[
  {
    "id": "UUID-DEL-PERFIL",
    "userAccountId": "UUID-DE-LA-CUENTA",
    "role": "driver",
    "isActive": true,
    "createdAt": "2026-01-01T00:00:00.000Z"
  }
]
```

**Errores documentados:**

- `400 Bad Request`: identificador con formato UUID inválido.
- `401 Unauthorized`: JWT ausente, inválido o revocado.
- `403 Forbidden`: rol sin permisos.
- `404 Not Found`: no está documentado como respuesta del servicio actual; una cuenta sin perfiles devuelve un arreglo vacío.

### 3.2. Crear un perfil

**Método:** POST

**Ruta:** `/api/v1/profiles`

**Autorización:** ADMIN.

**Headers:**

| Header | Valor |
|---|---|
| Authorization | Bearer JWT |
| Content-Type | application/json |

**Body:**

```json
{
  "userAccountId": "UUID-DE-LA-CUENTA",
  "role": "operations_manager"
}
```

**DTO:** `CrearPerfilDto`.

| Campo | Tipo | Validación | Descripción |
|---|---|---|---|
| `userAccountId` | string | `@IsUUID()` | Identificador de la cuenta a la que se asociará el perfil. |
| `role` | RolUsuario | `@IsEnum(RolUsuario)` | Rol que se asignará. |

**Funcionamiento:**

1. El controlador recibe el DTO, el usuario autenticado y la IP de la solicitud.
2. El servicio verifica que la cuenta exista.
3. Si la cuenta no existe, genera `404 Not Found`.
4. Se inicia la operación mediante `ContextoAuditoriaService.ejecutar()`.
5. Se obtiene el repositorio de perfiles desde el administrador transaccional.
6. Se crea el perfil asociado a la cuenta con el rol solicitado y estado activo (`true`).
7. Se guarda el perfil y se devuelve su representación pública.

**Respuesta:** 201 Created.

Ejemplo:

```json
{
  "id": "UUID-DEL-PERFIL",
  "userAccountId": "UUID-DE-LA-CUENTA",
  "role": "operations_manager",
  "isActive": true,
  "createdAt": "2026-01-01T00:00:00.000Z"
}
```

**Errores:**

- `400 Bad Request`: datos de entrada inválidos.
- `401 Unauthorized`: JWT ausente, inválido o revocado.
- `403 Forbidden`: rol sin permisos.
- `404 Not Found`: la cuenta de usuario no existe.
- `409 Conflict`: la cuenta ya tiene un perfil con ese rol.

**Regla de negocio:** una cuenta no puede tener dos perfiles con el mismo rol. Esta regla está respaldada por la restricción única `uq_profile_account_role` y el servicio transforma la violación PostgreSQL `23505` en `409 Conflict`.

### 3.3. Actualizar el estado de un perfil

**Método:** PATCH

**Ruta:** `/api/v1/profiles/:id`

**Autorización:** ADMIN.

**Parámetros de ruta:**

| Parámetro | Tipo | Validación | Descripción |
|---|---|---|---|
| `id` | UUID | `ParseUUIDPipe` | Identificador del perfil que se actualizará. |

**Headers:**

| Header | Valor |
|---|---|
| Authorization | Bearer JWT |
| Content-Type | application/json |

**Body:**

```json
{
  "isActive": false
}
```

**DTO:** `ActualizarPerfilDto`.

| Campo | Tipo | Validación | Descripción |
|---|---|---|---|
| `isActive` | boolean | `@IsBoolean()` | Nuevo estado de actividad del perfil. |

**Funcionamiento:**

1. El controlador recibe el identificador, el DTO, el usuario autenticado y la IP.
2. El servicio inicia la operación mediante `ContextoAuditoriaService.ejecutar()`.
3. Consulta el perfil por su identificador e incluye la relación con la cuenta de usuario.
4. Si no existe, genera `404 Not Found`.
5. Actualiza únicamente el atributo `activo`.
6. Guarda el perfil y devuelve su representación pública.

**Respuesta:** 200 OK.

Ejemplo:

```json
{
  "id": "UUID-DEL-PERFIL",
  "userAccountId": "UUID-DE-LA-CUENTA",
  "role": "driver",
  "isActive": false,
  "createdAt": "2026-01-01T00:00:00.000Z"
}
```

**Errores:**

- `400 Bad Request`: UUID o estado inválido.
- `401 Unauthorized`: JWT ausente, inválido o revocado.
- `403 Forbidden`: rol sin permisos.
- `404 Not Found`: el perfil no existe.

**Regla de negocio:** este endpoint permite activar o desactivar un perfil. No permite modificar el rol ni cambiar la cuenta asociada. Tampoco elimina físicamente el registro.

## 4. Estructura de los DTO

### CrearPerfilDto

- `userAccountId`: obligatorio, debe tener formato UUID.
- `role`: obligatorio, debe pertenecer al enum `RolUsuario`.

### ActualizarPerfilDto

- `isActive`: obligatorio, debe ser booleano.
- No contiene campos opcionales.

Las validaciones se implementan mediante `class-validator`.

## 5. Entidad Perfil

**Entidad:** `Perfil`.

**Tabla:** `profile`.

| Propiedad TypeScript | Columna BD | Tipo / característica |
|---|---|---|
| `id` | `id` | UUID, llave primaria `profile_pkey`. |
| `cuentaUsuario` | `user_account_id` | Relación obligatoria con `CuentaUsuario`. |
| `rol` | `user_role` | Enum `user_role`. |
| `activo` | `is_active` | Boolean, predeterminado `true`. |
| `creadoEn` | `created_at` | `timestamptz`, predeterminado `now()`. |

### 5.1. Relación con CuentaUsuario

La relación está implementada mediante:

- `@ManyToOne(() => CuentaUsuario, { nullable: false })`
- `@JoinColumn({ name: 'user_account_id', foreignKeyConstraintName: 'fk_profile_user_account' })`

Esto significa que cada perfil debe pertenecer a una cuenta de usuario y que una cuenta puede tener varios perfiles.

### 5.2. Índices y restricciones

| Nombre | Tipo | Propósito |
|---|---|---|
| `profile_pkey` | Primary Key | Identifica de forma única cada perfil. |
| `fk_profile_user_account` | Foreign Key | Relaciona el perfil con una cuenta existente. |
| `idx_profile_user_account_id` | Index | Facilita las consultas por cuenta. |
| `uq_profile_account_role` | Unique | Impide repetir un mismo rol para una cuenta. |

### 5.3. Enum RolUsuario y transformación

El backend define los siguientes roles:

| Enum en el backend | Valor almacenado en PostgreSQL |
|---|---|
| `RolUsuario.ADMIN` | `ADMIN` |
| `RolUsuario.OPERATIONS_MANAGER` | `OP` |
| `RolUsuario.DRIVER` | `DRIVER` |

La conversión se realiza mediante `rolTransformer`, que transforma los valores al guardar y al recuperar registros.

Por tanto, el backend utiliza nombres descriptivos y la base de datos utiliza los valores definidos en su enum.

## 6. Lógica del servicio

**Servicio:** `PerfilesService`.

### Métodos principales

| Método | Responsabilidad |
|---|---|
| `listarPorCuenta()` | Consulta los perfiles de una cuenta y los transforma en objetos públicos. |
| `crear()` | Verifica la existencia de la cuenta y crea un perfil activo dentro del contexto transaccional de auditoría. |
| `actualizar()` | Busca el perfil, modifica su estado y guarda los cambios dentro del contexto transaccional de auditoría. |
| `toPublic()` | Convierte la entidad `Perfil` en la estructura `PerfilPublico`. |

### 6.1. Manejo de errores

| Situación | Excepción | HTTP |
|---|---|---|
| Cuenta inexistente al crear | `NotFoundException` | 404 |
| Perfil inexistente al actualizar | `NotFoundException` | 404 |
| Perfil duplicado para una cuenta y rol | `ConflictException` | 409 |

### 6.2. Contexto de auditoría

Las operaciones de escritura utilizan `ContextoAuditoriaService.ejecutar()`.

El controlador entrega:

- Identificador del usuario autenticado (`actor.userId`).
- IP de la solicitud (`@Ip()`).

El servicio ejecuta la escritura mediante el administrador transaccional y obtiene el repositorio correspondiente desde `manager.getRepository(Perfil)`.

Esto proporciona el contexto de auditoría para la operación. La generación efectiva de registros de auditoría depende de los mecanismos de base de datos configurados.

## 7. Estructura del módulo NestJS

**Archivo:** `perfiles.module.ts`.

| Componente | Función |
|---|---|
| `TypeOrmModule.forFeature([Perfil, CuentaUsuario])` | Registra los repositorios necesarios. |
| `AutenticacionModule` | Proporciona las dependencias de autenticación. |
| `PerfilesController` | Expone los endpoints del módulo. |
| `PerfilesService` | Implementa la lógica de negocio. |
| `exports: [PerfilesService, TypeOrmModule]` | Permite reutilizar el servicio y el módulo de TypeORM desde otros módulos. |

## 8. Pruebas unitarias

**Archivo:** `src/perfiles/perfiles.service.spec.ts`.

Se ejecutó el siguiente comando:

```powershell
npm test -- --runInBand src/perfiles/perfiles.service.spec.ts
```

### Resultado

| Indicador | Resultado |
|---|---:|
| Suites aprobadas | 1 |
| Suites fallidas | 0 |
| Pruebas aprobadas | 6 |
| Pruebas fallidas | 0 |
| Snapshots | 0 |
| Tiempo | 2.994 segundos |

**Estado:** PASS.

### 8.1. Escenarios cubiertos

| Operación | Escenario probado |
|---|---|
| `listarPorCuenta` | Devuelve perfiles públicos ordenados por fecha de creación. |
| `crear` | Verifica la cuenta y crea un perfil activo dentro del contexto transaccional. |
| `crear` | Rechaza la creación cuando la cuenta no existe. |
| `crear` | Convierte una violación de unicidad PostgreSQL en `ConflictException`. |
| `actualizar` | Actualiza el estado y devuelve la estructura pública. |
| `actualizar` | Rechaza la actualización cuando el perfil no existe. |

### 8.2. Aspectos no cubiertos por estas pruebas

- Validaciones de los DTO.
- Permisos y comportamiento HTTP del controlador.
- Funcionamiento real del transformador de roles contra PostgreSQL.
- Integración real de las transacciones y mecanismos de auditoría con la base de datos.
- Activación de un perfil mediante `isActive: true`.

Las pruebas utilizan repositorios y contexto de auditoría simulados; por tanto, no sustituyen las pruebas de integración con la base de datos.

## 9. Reglas de negocio identificadas

1. Una cuenta de usuario debe existir antes de crearle un perfil.
2. Cada perfil debe estar asociado a una cuenta.
3. Una cuenta puede tener varios perfiles, pero no puede repetir el mismo rol.
4. Los perfiles nuevos se crean activos por defecto.
5. Solamente ADMIN puede crear y actualizar perfiles.
6. ADMIN y OPERATIONS_MANAGER pueden consultar perfiles.
7. La actualización permite modificar únicamente el estado de actividad.
8. La desactivación no elimina el registro de la base de datos.

## 10. Consideraciones y pendientes

- La entidad declara restricciones, índices y relaciones que forman parte del diseño previsto.
- Las migraciones del PR #115 siguen pendientes de aprobación; por ello, no debe asumirse que estas estructuras y restricciones ya están desplegadas en la base de datos compartida.
- La configuración mantiene `synchronize: false`; no se debe activar para intentar reflejar automáticamente la entidad.
- No se debe ejecutar ni aplicar ninguna migración pendiente sin aprobación del equipo.
- La advertencia experimental de Node.js observada durante la ejecución de Jest no impidió que las seis pruebas finalizaran correctamente.

## 11. Conclusión

El módulo Perfiles centraliza la asignación y administración de roles de las cuentas de usuario de VINTRA. Implementa autenticación y autorización mediante guards, validación de entradas con DTO, persistencia mediante TypeORM y contexto transaccional de auditoría para las operaciones de escritura.

La ejecución de las pruebas unitarias confirmó el funcionamiento de los seis escenarios implementados en `PerfilesService`.

**Estado de pruebas: 6 de 6 aprobadas.**