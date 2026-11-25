# API de Cuadrillas e Integrantes

**Archivo:** `docs/backend/API_CUADRILLAS.md`
**Módulo:** `src/cuadrillas`
**Prefijo de rutas:** `/api/v1`
**Tecnología:** NestJS, TypeORM y PostgreSQL.

## 1. Descripción general

El módulo de Cuadrillas administra las cuadrillas operativas y sus integrantes dentro de VINTRA.

Permite consultar, registrar y actualizar cuadrillas, así como gestionar las personas que conforman estos equipos de trabajo.

El módulo administra dos recursos:

- **Cuadrillas (`crew`):** representan los equipos de trabajo.
- **Integrantes (`crew_member`):** representan las personas registradas como integrantes de una cuadrilla.

Un integrante puede estar asociado a una cuadrilla o permanecer sin asignación. Los registros de integrantes no requieren necesariamente una cuenta de usuario del sistema.

## 2. Seguridad y control de acceso

El controlador aplica los siguientes guards a todos sus endpoints:

- `JwtAuthGuard`: verifica la autenticación mediante JWT.
- `RolesGuard`: comprueba que el usuario tenga un rol autorizado.
- `@Roles(...)`: especifica los roles permitidos para cada operación.

El esquema de autenticación utiliza Bearer Token.

### 2.1. Roles utilizados

| Rol | Descripción |
| --- | --- |
| `ADMIN` | Administrador del sistema. |
| `OPERATIONS_MANAGER` | Responsable de la gestión operativa. |
| `DRIVER` | Conductor registrado en el sistema. |

### 2.2. Permisos por operación

| Operación | ADMIN | OPERATIONS_MANAGER | DRIVER |
| --- | ---: | ---: | ---: |
| Listar cuadrillas | Sí | Sí | Sí |
| Consultar cuadrilla | Sí | Sí | Sí |
| Crear cuadrilla | Sí | Sí | No |
| Actualizar cuadrilla | Sí | Sí | No |
| Listar integrantes | Sí | Sí | No |
| Crear integrante | Sí | Sí | No |
| Actualizar integrante | Sí | Sí | No |

Las solicitudes sin JWT válido pueden responder con `401 Unauthorized`. Las solicitudes de usuarios autenticados que no tengan permisos suficientes pueden responder con `403 Forbidden`.

## 3. Inventario de endpoints

### 3.1. Listar cuadrillas

- **Método:** GET
- **Ruta:** `/api/v1/crews`
- **Autenticación:** JWT.
- **Roles:** ADMIN, OPERATIONS_MANAGER, DRIVER.
- **Respuesta:** arreglo de cuadrillas registradas.

El servicio consulta las cuadrillas y las ordena alfabéticamente por nombre (`nombre ASC`).

No aplica un filtro por estado activo; por tanto, la consulta puede incluir cuadrillas activas e inactivas.

### 3.2. Consultar una cuadrilla

- **Método:** GET
- **Ruta:** `/api/v1/crews/:id`
- **Autenticación:** JWT.
- **Roles:** ADMIN, OPERATIONS_MANAGER, DRIVER.
- **Parámetro:** `id`, UUID de la cuadrilla.
- **Respuestas documentadas:** 200, 400 y 404.

El servicio busca la cuadrilla por su identificador.

Si no existe, lanza `NotFoundException` con el mensaje:

`La cuadrilla no existe.`

### 3.3. Crear una cuadrilla

- **Método:** POST
- **Ruta:** `/api/v1/crews`
- **Autenticación:** JWT.
- **Roles:** ADMIN, OPERATIONS_MANAGER.
- **Respuesta exitosa:** 201 Created.
- **Errores documentados:** 400 y 409.

**Cuerpo de la solicitud:**

```json
{
  "name": "Cuadrilla Norte"
}
```

El servicio transforma el campo `name` en la propiedad interna `nombre` y establece `activo: true`.

La operación se ejecuta mediante `ContextoAuditoriaService`.

### 3.4. Actualizar una cuadrilla

- **Método:** PATCH
- **Ruta:** `/api/v1/crews/:id`
- **Autenticación:** JWT.
- **Roles:** ADMIN, OPERATIONS_MANAGER.
- **Parámetro:** `id`, UUID de la cuadrilla.
- **Respuestas documentadas:** 200, 400 y 404.

**Cuerpo de la solicitud:**

```json
{
  "name": "Cuadrilla Centro",
  "isActive": true
}
```

Los campos son opcionales. Se puede actualizar únicamente el nombre, únicamente el estado o ambos.

El servicio conserva los valores de las propiedades que no se envían.

Si la cuadrilla no existe, devuelve un error 404.

### 3.5. Listar integrantes

- **Método:** GET
- **Ruta:** `/api/v1/crew-members`
- **Autenticación:** JWT.
- **Roles:** ADMIN, OPERATIONS_MANAGER.
- **Respuesta:** arreglo de integrantes registrados.

El servicio consulta los integrantes incluyendo la relación con su cuadrilla:

```typescript
relations: { cuadrilla: true }
```

Los resultados se ordenan alfabéticamente por `nombreCompleto`.

La consulta no aplica un filtro por estado activo.

### 3.6. Crear un integrante

- **Método:** POST
- **Ruta:** `/api/v1/crew-members`
- **Autenticación:** JWT.
- **Roles:** ADMIN, OPERATIONS_MANAGER.
- **Respuesta exitosa:** 201 Created.
- **Errores documentados:** 400 y 404.

**Cuerpo de la solicitud:**

```json
{
  "crewId": "a3b1c8d2-1234-4567-8901-abcdef123456",
  "fullName": "Carlos Andrés Rodríguez"
}
```

El UUID es ilustrativo y debe reemplazarse por el identificador real de una cuadrilla.

Antes de crear el integrante, el servicio verifica que la cuadrilla exista y esté activa.

Si no existe o está inactiva, devuelve `NotFoundException` con el mensaje:

`La cuadrilla no existe o está inactiva.`

El servicio transforma `fullName` en `nombreCompleto` y establece `activo: true`.

### 3.7. Actualizar un integrante

- **Método:** PATCH
- **Ruta:** `/api/v1/crew-members/:id`
- **Autenticación:** JWT.
- **Roles:** ADMIN, OPERATIONS_MANAGER.
- **Parámetro:** `id`, UUID del integrante.
- **Respuestas documentadas:** 200, 400 y 404.

**Cuerpo de la solicitud:**

```json
{
  "crewId": "a3b1c8d2-1234-4567-8901-abcdef123456",
  "fullName": "Carlos Andrés Rodríguez",
  "isActive": true
}
```

Todos los campos son opcionales.

El campo `crewId` admite tres comportamientos:

- Si se omite, conserva la asignación actual.
- Si contiene un UUID, cambia la asignación a una cuadrilla activa.
- Si contiene `null`, deja al integrante sin cuadrilla asignada.

Si el nuevo identificador corresponde a una cuadrilla inexistente o inactiva, devuelve un error 404.

Si el integrante no existe, devuelve `NotFoundException` con el mensaje:

`El integrante no existe.`

## 4. Parámetros de ruta

| Parámetro | Tipo | Descripción | Validación |
| --- | --- | --- | --- |
| `id` en `/crews/:id` | UUID | Identificador de cuadrilla. | `ParseUUIDPipe`. |
| `id` en `/crew-members/:id` | UUID | Identificador de integrante. | `ParseUUIDPipe`. |

## 5. DTOs y validaciones

Los DTOs definen la estructura y las reglas de validación de los datos recibidos por los endpoints.

### 5.1. CrearCuadrillaDto

Archivo: `dto/crear-cuadrilla.dto.ts`

| Campo | Tipo | Validaciones |
| --- | --- | --- |
| `name` | String | `@Transform`, `@IsString`, `@IsNotEmpty`, `@MinLength(1)`. |

El valor se recorta con `trim()` antes de validarse. Es obligatorio y debe contener al menos un carácter.

### 5.2. ActualizarCuadrillaDto

Archivo: `dto/actualizar-cuadrilla.dto.ts`

| Campo | Tipo | Validaciones |
| --- | --- | --- |
| `name` | String | `@IsOptional`, `@Transform`, `@IsString`, `@MinLength(1)`. |
| `isActive` | Boolean | `@IsOptional`, `@IsBoolean`. |

Los dos campos son opcionales. Si se proporciona `name`, se eliminan los espacios al inicio y al final.

### 5.3. CrearIntegranteCuadrillaDto

Archivo: `dto/crear-integrante-cuadrilla.dto.ts`

| Campo | Tipo | Validaciones |
| --- | --- | --- |
| `crewId` | String | `@IsUUID`. |
| `fullName` | String | `@Transform`, `@IsString`, `@MinLength(1)`. |

Los dos campos son obligatorios.

El UUID debe tener formato válido y el nombre debe contener al menos un carácter después de eliminar los espacios exteriores.

### 5.4. ActualizarIntegranteCuadrillaDto

Archivo: `dto/actualizar-integrante-cuadrilla.dto.ts`

| Campo | Tipo | Validaciones |
| --- | --- | --- |
| `crewId` | UUID o null | `@IsOptional`, `@IsUUID`. |
| `fullName` | String | `@IsOptional`, `@Transform`, `@IsString`, `@MinLength(1)`. |
| `isActive` | Boolean | `@IsOptional`, `@IsBoolean`. |

Todos los campos son opcionales.

`crewId` puede enviarse como `null` para desvincular al integrante de su cuadrilla. `@IsOptional()` permite omitir las validaciones cuando el valor es `null`.

### 5.5. Consideraciones sobre las validaciones

- Los DTO no establecen longitudes máximas para `name` ni `fullName`, aunque las entidades definen límites de 100 y 120 caracteres, respectivamente.
- Los campos `isActive` requieren valores booleanos. Los DTO no incluyen transformaciones explícitas de cadenas como `"true"` o `"false"` a booleanos.
- La aceptación de valores recibidos como cadenas depende de la configuración global de validación y transformación de NestJS, que debe verificarse en `src/main.ts`.
- `@IsOptional()` omite las validaciones cuando el valor es `undefined` o `null`. En el caso de `crewId`, el servicio contempla expresamente `null` para desasignar al integrante.

## 6. Lógica del servicio

Archivo: `cuadrillas.service.ts`

El servicio concentra las operaciones de acceso a datos y las reglas de negocio.

### 6.1. Repositorios inyectados

Se utilizan dos repositorios:

- `Repository<Cuadrilla>` para administrar cuadrillas.
- `Repository<IntegranteCuadrilla>` para administrar integrantes.

También se inyecta `ContextoAuditoriaService` para ejecutar las operaciones de escritura dentro del contexto transaccional de auditoría.

### 6.2. Operaciones de consulta

`listar()` consulta todas las cuadrillas y las ordena por nombre.

`obtener(id)` busca una cuadrilla por UUID y genera un error 404 cuando no existe.

`listarIntegrantes()` consulta los integrantes incluyendo la relación con su cuadrilla y los ordena por nombre completo.

### 6.3. Operaciones de escritura

`crear()` registra una cuadrilla activa.

`actualizar()` busca la cuadrilla y modifica únicamente los campos recibidos.

`crearIntegrante()` comprueba que la cuadrilla exista y esté activa antes de registrar el integrante.

`actualizarIntegrante()` permite cambiar el nombre, el estado y la cuadrilla asociada. También permite establecer la relación como nula.

Las cuatro operaciones de escritura utilizan `ContextoAuditoriaService.ejecutar(actorId, ip, callback)`.

## 7. Modelo de datos y relaciones

### 7.1. Entidad Cuadrilla

Archivo: `entidades/cuadrilla.entity.ts`

Tabla asociada: `crew`.

| Propiedad TypeScript | Columna | Tipo |
| --- | --- | --- |
| `id` | `id` | UUID |
| `nombre` | `name` | VARCHAR(100) |
| `activo` | `is_active` | BOOLEAN |
| `actualizadoEn` | `updated_at` | TIMESTAMPTZ |
| `creadoEn` | `created_at` | TIMESTAMPTZ |

La clave primaria utiliza UUID y se identifica mediante la restricción `crew_pkey`.

Los campos de fecha utilizan `now()` como valor predeterminado.

### Diferencia pendiente: eliminación en cascada

La migración `015_create_crew_member.sql`, incluida en la PR#115,
define la clave foránea `fk_crew_member_crew` con la regla
`ON DELETE CASCADE`.

Sin embargo, la relación `ManyToOne` de la entidad
`IntegranteCuadrilla` no declara explícitamente la opción
`onDelete: 'CASCADE'`.

Por tanto, existe una diferencia entre la regla definida en la
migración propuesta y la configuración de la relación en TypeORM.

**Estado:** pendiente de revisión y alineación por parte del equipo
responsable del módulo y del modelo de datos.

Esta observación corresponde al diseño provisional de la PR#115.
No implica que la migración esté aprobada ni que la restricción
esté aplicada en una base de datos definitiva.

### 7.2. Entidad IntegranteCuadrilla

Archivo: `entidades/integrante-cuadrilla.entity.ts`

Tabla asociada: `crew_member`.

| Propiedad TypeScript | Columna | Tipo |
| --- | --- | --- |
| `id` | `id` | UUID |
| `cuadrilla` | `crew_id` | Relación UUID, nullable |
| `nombreCompleto` | `full_name` | VARCHAR(120) |
| `activo` | `is_active` | BOOLEAN |
| `actualizadoEn` | `updated_at` | TIMESTAMPTZ |
| `creadoEn` | `created_at` | TIMESTAMPTZ |

La clave primaria utiliza la restricción `crew_member_pkey`.

La relación con la cuadrilla se establece mediante:

```typescript
@ManyToOne(() => Cuadrilla, { nullable: true })
@JoinColumn({
  name: 'crew_id',
  foreignKeyConstraintName: 'fk_crew_member_crew',
})
cuadrilla: Cuadrilla | null;
```

Esto representa una relación muchos a uno: varios integrantes pueden pertenecer a una misma cuadrilla y un integrante puede no tener una cuadrilla asignada.

La entidad también declara el índice `idx_crew_member_crew_id` sobre la relación.

## 8. Reglas de negocio identificadas

1. Una cuadrilla se registra inicialmente como activa.
2. Un integrante se registra inicialmente como activo.
3. No se puede crear un integrante asociado a una cuadrilla inexistente o inactiva.
4. No se puede reasignar un integrante a una cuadrilla inexistente o inactiva.
5. Un integrante puede quedar sin cuadrilla asignada.
6. Las actualizaciones conservan los campos que no se envían.
7. Las consultas de listado no filtran por estado activo.
8. El módulo no establece una relación directa entre el integrante y una cuenta de usuario.

### Comportamiento de activación y asignación

- Las cuadrillas se crean con `is_active = true`.
- Los integrantes se crean con `is_active = true`.
- Las cuadrillas pueden desactivarse y reactivarse mediante
  `PATCH /api/v1/crews/:id`, enviando el campo `isActive`.
- Los integrantes también pueden activarse y desactivarse mediante
  `PATCH /api/v1/crew-members/:id`.
- El servicio no comprueba si una cuadrilla tiene integrantes asociados
  antes de desactivarla.
- Para crear un integrante o asignarlo a otra cuadrilla, la cuadrilla
  de destino debe existir y estar activa.
- Un integrante puede quedar sin cuadrilla enviando
  `crewId: null` durante su actualización.
- Los endpoints de listado de cuadrillas e integrantes no filtran
  automáticamente los registros inactivos.

## 9. Auditoría y trazabilidad

Las operaciones de escritura reciben el identificador del usuario autenticado y la IP de la solicitud.

El controlador obtiene estos datos mediante:

- `@UsuarioAutenticado()`: proporciona el usuario autenticado.
- `@Ip()`: proporciona la IP de la solicitud.

El servicio transmite ambos datos a `ContextoAuditoriaService`.

Este contexto permite que las operaciones se ejecuten dentro de una transacción con información de auditoría disponible.

La utilización de este servicio no significa que el propio `CuadrillasService` inserte directamente registros de auditoría. El registro efectivo depende de los mecanismos de auditoría configurados en la base de datos, sujetos a la aprobación de las migraciones correspondientes.

## 10. Manejo de errores

| Código HTTP | Situación |
| --- | --- |
| 400 | UUID inválido, cuerpo de solicitud incorrecto o error de validación. |
| 401 | JWT ausente, inválido o revocado. |
| 403 | Rol sin autorización para la operación. |
| 404 | Cuadrilla o integrante inexistente, o cuadrilla inactiva cuando se requiere una activa. |
| 409 | Conflicto documentado para la creación de cuadrillas; debe verificarse la condición concreta que lo genera. |

Los errores 400, 404 y 409 aparecen según la documentación Swagger declarada en cada endpoint. No se deben interpretar como confirmación de que todos los casos posibles han sido probados.

## 11. Pruebas unitarias

**Archivo:** `src/cuadrillas/cuadrillas.service.spec.ts`

Durante la revisión se identificó un archivo de pruebas unitarias para `CuadrillasService`, con 13 casos distribuidos entre las siguientes operaciones:

| Método | Casos | Verificaciones |
| --- | ---: | --- |
| `listar` | 1 | Ordenamiento de cuadrillas por nombre. |
| `obtener` | 2 | Consulta por identificador y manejo de registros inexistentes. |
| `crear` | 1 | Creación de cuadrillas activas y ejecución dentro del contexto de auditoría. |
| `actualizar` | 2 | Actualización parcial y manejo de cuadrillas inexistentes. |
| `listarIntegrantes` | 1 | Consulta de integrantes con su relación de cuadrilla y ordenamiento por nombre. |
| `crearIntegrante` | 2 | Creación en cuadrillas activas y rechazo de cuadrillas inexistentes o inactivas. |
| `actualizarIntegrante` | 4 | Actualización parcial, desasignación, reasignación y manejo de registros inexistentes o cuadrillas inactivas. |

**Total identificado:** 13 casos de prueba.

### Alcance y limitaciones

- Las pruebas utilizan repositorios simulados; no demuestran integración con una instancia real de PostgreSQL.
- No  hay pruebas específicas de eliminación física ni de la regla `ON DELETE CASCADE`.
- No se verifica la persistencia efectiva de los registros de auditoría.
- No hay archivos de pruebas específicos para `CuadrillasController` ni para los DTO.
-

## 12. Estructura de archivos

src/
└── cuadrillas/
    ├── dto/
    │   ├── actualizar-cuadrilla.dto.ts
    │   ├── actualizar-integrante-cuadrilla.dto.ts
    │   ├── crear-cuadrilla.dto.ts
    │   └── crear-integrante-cuadrilla.dto.ts
    ├── entidades/
    │   ├── cuadrilla.entity.ts
    │   └── integrante-cuadrilla.entity.ts
    ├── cuadrillas.controller.ts
    ├── cuadrillas.module.ts
    ├── cuadrillas.service.ts
    └── cuadrillas.service.spec.ts

```text

## 13. Configuración del módulo

Archivo: `cuadrillas.module.ts`.

El módulo registra las entidades mediante:

```typescript
TypeOrmModule.forFeature([
  Cuadrilla,
  IntegranteCuadrilla,
])
```

También importa `AutenticacionModule`, registra `CuadrillasController` como controlador y `CuadrillasService` como proveedor.

Finalmente, exporta `CuadrillasService` y `TypeOrmModule` para permitir su utilización desde otros módulos.

## 14. Consideraciones y pendientes

- Las entidades representan el modelo definido actualmente en el código.
- Las migraciones del proyecto continúan pendientes de aprobación; por tanto, no se debe afirmar que el esquema correspondiente ya está desplegado.
- No se ejecutaron migraciones ni se realizaron cambios en la base de datos durante esta revisión.
- Se identificó un archivo de pruebas unitarias para `CuadrillasService`, con 13 casos.
- No se identificaron pruebas específicas para `CuadrillasController` ni para los DTO.
- Las pruebas existentes utilizan repositorios simulados y no demuestran la integración con PostgreSQL.
- Se recomienda verificar mediante pruebas de integración el comportamiento de las relaciones, la eliminación en cascada y la auditoría cuando exista un esquema aprobado y una base de pruebas autorizada.
- Está pendiente revisar la diferencia entre `ON DELETE CASCADE` de la migración propuesta y la configuración de la relación en TypeORM.

---

**Estado de la documentación:** análisis del controlador, servicio, DTOs, entidades, módulo y pruebas unitarias completado. Se identificaron 13 casos de prueba para `CuadrillasService`. Alineación del esquema de base de datos sujeta a la aprobación de las migraciones.

**Estado de la documentación:** análisis del controlador, servicio, DTOs, entidades y módulo completado. Pruebas unitarias propias no encontradas. Esquema de base de datos sujeto a aprobación de migraciones.
