# API_SEGUIMIENTO.md

## 1. Información general

**Módulo:** Seguimiento<br>
**Entidad principal:** `PosicionVehiculo`<br>
**Tabla asociada:** `vehicle_position`<br>
**Ruta base:** `/api/v1/vehicle-positions`<br>
**Autenticación:** JWT Bearer<br>
**Autorización:** Control de acceso basado en roles (RBAC).
**Estado de pruebas unitarias:** 10 aprobadas de 10 ejecutadas.

### Objetivo

El módulo Seguimiento permite registrar y consultar posiciones geográficas asociadas a las asignaciones de vehículos de VINTRA.

Ofrece dos modalidades de acceso:

- Administrativa: para usuarios con rol ADMIN y OPERATIONS_MANAGER.
- Propia del conductor: para usuarios con rol DRIVER, restringiendo las operaciones a sus propias asignaciones.

Las posiciones se representan mediante geometrías GeoJSON de tipo Point y se almacenan utilizando el tipo espacial geometry de PostgreSQL/PostGIS.

---

## 2. Autenticación y autorización

El controlador utiliza:

- `JwtAuthGuard`: verifica que la solicitud tenga un JWT válido.
- `RolesGuard`: verifica que el usuario tenga el rol requerido.
- `@Roles(...)`: establece los roles autorizados para cada endpoint.
- `@UsuarioAutenticado()`: obtiene la información del usuario autenticado.
- `@Ip()`: obtiene la dirección IP de la solicitud.

Todos los endpoints requieren autenticación.

### Matriz de permisos

| Operación | ADMIN | OPERATIONS_MANAGER | DRIVER |
|---|---|---|---|
| Consultar posiciones de cualquier asignación | Sí | Sí | No |
| Consultar posiciones de asignación propia | No | No | Sí |
| Registrar posición administrativamente | Sí | Sí | No |
| Registrar posición propia | No | No | Sí |

En las rutas destinadas al conductor, el servicio verifica que la asignación corresponda al usuario autenticado y que el conductor esté activo. Para registrar posiciones, además exige que la asignación esté en estado `IN_PROGRESS`.

---

## 3. Endpoints

### 3.1. Consultar posiciones de una asignación

**Método:** GET

**Ruta:**
`/api/v1/vehicle-positions/assignments/:assignmentId`

**Roles:** ADMIN, OPERATIONS_MANAGER.

**Parámetros de ruta:**

| Parámetro | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| assignmentId | UUID | Sí | Identificador de la asignación. |

**Parámetros de consulta:**

| Parámetro | Tipo | Predeterminado | Validación |
|---|---|---|---|
| page | Integer | 1 | Mínimo 1. |
| limit | Integer | 100 | Entre 1 y 100. |

**Funcionalidad:**

Consulta las posiciones registradas para una asignación específica.

Los resultados se ordenan por fecha de registro descendente, mostrando primero las posiciones más recientes.

**Respuesta exitosa:** HTTP 200.

**Estructura de respuesta:**

```json
{
  "items": [
    {
      "id": "uuid",
      "geometria": {
        "type": "Point",
        "coordinates": [-76.532, 3.451]
      },
      "registradoEn": "2026-11-12T10:00:00.000Z"
    }
  ],
  "total": 45,
  "page": 1,
  "limit": 100
}
```

Los valores son ilustrativos. La estructura exacta de cada elemento depende de la serialización de la entidad.

**Errores posibles:**

- 400: identificador UUID inválido o parámetros de consulta inválidos.
- 401: JWT ausente, inválido o revocado.
- 403: rol no autorizado.
- 404: asignación inexistente.

### 3.2. Consultar posiciones de una asignación propia

**Método:** GET

**Ruta:**
`/api/v1/vehicle-positions/me/assignments/:assignmentId`

**Rol:** DRIVER.

**Parámetros de ruta:**

| Parámetro | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| assignmentId | UUID | Sí | Identificador de una asignación propia. |

**Parámetros de consulta:**

| Parámetro | Tipo | Predeterminado | Validación |
|---|---|---|---|
| page | Integer | 1 | Mínimo 1. |
| limit | Integer | 100 | Entre 1 y 100. |

**Funcionalidad:**

Permite al conductor consultar las posiciones asociadas a una de sus asignaciones.

El controlador obtiene el identificador del usuario autenticado y lo envía al servicio mediante `actor.userId`.

El servicio verifica:

1. Que la asignación exista.
2. Que la asignación corresponda al conductor autenticado.
3. Que el conductor esté activo.

**Respuesta exitosa:** HTTP 200.

**Estructura de respuesta:** Igual a la del endpoint administrativo.

**Errores posibles:**

- 400: UUID o parámetros inválidos.
- 401: JWT ausente, inválido o revocado.
- 403: rol no autorizado, asignación perteneciente a otro conductor o conductor inactivo.
- 404: asignación inexistente.

### 3.3. Registrar una posición de vehículo

**Método:** POST

**Ruta:**
`/api/v1/vehicle-positions`

**Roles:** ADMIN, OPERATIONS_MANAGER.

**Body:**

```json
{
  "assignmentId": "550e8400-e29b-41d4-a716-446655440000",
  "geometry": {
    "type": "Point",
    "coordinates": [-76.532, 3.451]
  },
  "recordedAt": "2026-11-12T10:00:00.000Z"
}
```

**Campos:**

| Campo | Tipo | Obligatorio | Validación |
|---|---|---|---|
| assignmentId | UUID | Sí | `@IsUUID()`. |
| geometry | Object | Sí | `@IsObject()` y `GeoJsonGeometryValidator` para Point. |
| recordedAt | Date | Sí | Conversión mediante `@Type(() => Date)` y validación `@IsDate()`. |

**Funcionalidad:**

Registra una posición geográfica asociada a una asignación.

El servicio:

1. Valida que la geometría sea un GeoJSON Point con coordenadas 2D.
2. Inicia la operación mediante `ContextoAuditoriaService.ejecutar()`.
3. Busca la asignación y carga la información del conductor.
4. Si la asignación no existe, genera un error 404.
5. Rechaza con HTTP 400 (`BadRequestException`) si la asignación no está en estado `IN_PROGRESS`, con el mensaje `Solo se pueden registrar posiciones de asignaciones en curso.`
6. Crea y guarda la posición relacionada con la asignación.

El controlador proporciona el identificador del usuario autenticado y la IP para el contexto de auditoría.

**Respuesta exitosa:** HTTP 201.

**Errores posibles:**

- 400: geometría o datos inválidos; la asignación no está en estado `IN_PROGRESS`.
- 401: JWT ausente, inválido o revocado.
- 403: rol no autorizado.
- 404: asignación inexistente.

### 3.4. Registrar una posición propia

**Método:** POST

**Ruta:**
`/api/v1/vehicle-positions/me`

**Rol:** DRIVER.

**Body:**

```json
{
  "assignmentId": "550e8400-e29b-41d4-a716-446655440000",
  "geometry": {
    "type": "Point",
    "coordinates": [-76.532, 3.451]
  },
  "recordedAt": "2026-11-12T10:00:00.000Z"
}
```

**Funcionalidad:**

Permite al conductor registrar una posición para una de sus propias asignaciones.

El controlador proporciona al servicio:

- Los datos de la posición.
- El identificador de cuenta del usuario autenticado (`actor.userId`).
- La IP de la solicitud.
- En esta ruta, también pasa `actor.userId` como identificador de usuario para comprobar la propiedad de la asignación. `DatosUsuario.id` comparte la clave primaria de `CuentaUsuario`.

El servicio verifica:

1. Que la geometría sea un GeoJSON Point con coordenadas 2D.
2. Que la asignación exista.
3. Que la asignación esté en estado `IN_PROGRESS`.
4. Que la asignación pertenezca al conductor autenticado.
5. Que el conductor esté activo.

Si la asignación no está en curso, se genera un error 400. Si pertenece a otro conductor o el conductor está inactivo, se genera un error 403.

**Respuesta exitosa:** HTTP 201.

**Errores posibles:**

- 400: geometría o datos inválidos; la asignación no está en estado `IN_PROGRESS`.
- 401: JWT ausente, inválido o revocado.
- 403: rol no autorizado, asignación ajena o conductor inactivo.
- 404: asignación inexistente.

---

## 4. DTO y validaciones

La aplicación instala un `ValidationPipe` global con `whitelist`, `forbidNonWhitelisted` y `transform` habilitados. Los campos ajenos al DTO se rechazan con HTTP 400 y los parámetros de consulta se convierten a sus tipos declarados.

### 4.1. ConsultarPosicionesDto

Archivo: `dto/consultar-posiciones.dto.ts`

Define los parámetros de paginación.

| Propiedad | Decoradores | Regla |
|---|---|---|
| page | `@Type(() => Number)`, `@IsInt()`, `@Min(1)` | Entero mayor o igual a 1. |
| limit | `@Type(() => Number)`, `@IsInt()`, `@Min(1)`, `@Max(100)` | Entero entre 1 y 100. |

Valores predeterminados:

- page = 1.
- limit = 100.

### 4.2. CrearPosicionVehiculoDto

Archivo: `dto/crear-posicion-vehiculo.dto.ts`

| Propiedad | Decoradores | Regla |
|---|---|---|
| assignmentId | `@IsUUID()` | Identificador UUID válido. |
| geometry | `@IsObject()`, `@Validate(GeoJsonGeometryValidator, ['Point'])` | Objeto GeoJSON Point. |
| recordedAt | `@Type(() => Date)`, `@IsDate()` | Fecha válida. |

La geometría también se verifica en el servicio mediante `isGeoJsonGeometry(dto.geometry, 'Point')`, exigiendo coordenadas bidimensionales.

---

## 5. Lógica de negocio

### 5.1. Consulta de posiciones

El método `listar()`:

1. Invoca `findAssignment()` para verificar la existencia y los permisos sobre la asignación.
2. Consulta las posiciones asociadas a la asignación.
3. Ordena los resultados por `registradoEn` de forma descendente.
4. Aplica paginación mediante `skip` y `take`.
5. Devuelve `items`, `total`, `page` y `limit`.

### 5.2. Validación de asignación

El método privado `findAssignment()`:

- Busca la asignación por identificador.
- Carga la relación con el conductor y sus datos de usuario.
- Genera 404 si no existe.
- Si recibe `userDataId`, comprueba que coincida con el usuario asociado al conductor.
- Si el conductor está inactivo, genera 403.

### 5.3. Registro de posiciones

El método `crear()`:

1. Valida la geometría.
2. Ejecuta la operación mediante `ContextoAuditoriaService`.
3. Obtiene el repositorio transaccional de asignaciones.
4. Busca la asignación y sus relaciones con el conductor.
5. Rechaza con `NotFoundException` si no existe.
6. Rechaza con `BadRequestException` si el estado no es `IN_PROGRESS`.
7. Comprueba la propiedad de la asignación cuando se trata de un conductor.
8. Comprueba que el conductor esté activo cuando se trata de un conductor.
9. Crea y guarda la posición utilizando el repositorio transaccional.

---

## 6. Entidad PosicionVehiculo

Archivo: `entidades/posicion-vehiculo.entity.ts`

**Tabla:** `vehicle_position`.

| Propiedad | Columna | Tipo |
|---|---|---|
| id | id | UUID, clave primaria. |
| asignacion | assignment_id | Relación ManyToOne obligatoria con Asignacion. |
| geometria | geom | geometry(Point, 4326). |
| registradoEn | recorded_at | timestamptz. |
| creadoEn | created_at | timestamptz, default now(). |

### Relación

Cada posición pertenece a una asignación mediante una relación ManyToOne.

La relación utiliza:

- Columna: `assignment_id`.
- Clave foránea: `fk_vehicle_position_assignment`.
- Tabla relacionada: entidad `Asignacion`.

Una asignación puede tener múltiples posiciones.

### Información espacial

La columna `geom` utiliza:

- Tipo espacial: geometry.
- Tipo de elemento: Point.
- SRID: 4326 (WGS 84).

Esto permite representar ubicaciones geográficas mediante coordenadas GPS y realizar operaciones espaciales con PostGIS.

### Índices

| Índice | Propósito |
|---|---|
| `idx_vehicle_position_assignment_recorded` | Optimizar consultas por asignación y fecha de registro. |
| `idx_vehicle_position_geom` | Optimizar operaciones espaciales sobre la geometría. |

### Fechas

- `recorded_at`: fecha y hora asociada a la posición reportada.
- `created_at`: fecha y hora de creación del registro, con valor predeterminado `now()`.

---

## 7. Manejo de errores

| Código HTTP | Excepción | Situación |
|---|---|---|
| 400 | BadRequestException | Geometría inválida, parámetros incorrectos o asignación fuera de `IN_PROGRESS` al registrar una posición. |
| 401 | Unauthorized | JWT ausente, inválido o revocado. |
| 403 | ForbiddenException | Rol no autorizado, asignación ajena o conductor inactivo. |
| 404 | NotFoundException | Asignación inexistente. |

---

## 8. Auditoría y transacciones

Los endpoints de creación reciben el identificador del usuario autenticado y la IP de la solicitud.

El servicio utiliza:

`ContextoAuditoriaService.ejecutar(actorId, ip, operation)`

La operación utiliza el `EntityManager` proporcionado para consultar la asignación y guardar la posición mediante repositorios transaccionales.

El contexto de auditoría establece información de contexto para la transacción. Su utilización no significa que este servicio inserte directamente registros de auditoría.

La persistencia de los registros de auditoría depende de los mecanismos correspondientes de la base de datos y de su configuración aprobada.

---

## 9. Módulo NestJS

Archivo: `seguimiento.module.ts`

**Imports:**

- `TypeOrmModule.forFeature([PosicionVehiculo, Asignacion])`
- `AutenticacionModule`

**Controllers:**

- `SeguimientoController`

**Providers:**

- `SeguimientoService`

**Exports:**

- `SeguimientoService`
- `TypeOrmModule`

El módulo registra los repositorios requeridos por el servicio, incorpora las dependencias de autenticación y expone el controlador de seguimiento.

---

## 10. Reglas de negocio y observaciones

1. Toda posición debe estar asociada a una asignación existente en estado `IN_PROGRESS`.
2. La geometría debe ser un GeoJSON Point con coordenadas 2D.
3. El conductor solamente puede consultar las posiciones de sus propias asignaciones.
4. El conductor solamente puede registrar posiciones para sus propias asignaciones.
5. Las operaciones propias del conductor requieren que este se encuentre activo.
6. Las posiciones se consultan ordenadas desde la más reciente hasta la más antigua.
7. La consulta admite paginación con un límite máximo de 100 registros.
8. Las operaciones de registro utilizan el contexto transaccional de auditoría.

### Aspectos no implementados o no comprobados en el código revisado

- No se observa una validación de límites geográficos específicos de Buenaventura.
- No se observa una restricción sobre fechas futuras o antigüedad de las posiciones.
- No se observa un control de frecuencia de envío de posiciones.
- No se observa un endpoint para eliminar posiciones.

Estas observaciones describen el código inspeccionado y no implican que otras capas del sistema carezcan de controles adicionales.

---

## 11. Pruebas unitarias

**Archivo:** `src/seguimiento/seguimiento.service.spec.ts`

**Framework:** Jest.

**Comando ejecutado:**

```bash
npm test -- --runInBand src/seguimiento/seguimiento.service.spec.ts
```

### Resultado obtenido

| Indicador | Resultado |
|---|---:|
| Suites ejecutadas | 1 |
| Suites aprobadas | 1 |
| Pruebas ejecutadas | 10 |
| Pruebas aprobadas | 10 |
| Pruebas fallidas | 0 |
| Tiempo | 3.017 segundos |

**Estado:** Todas las pruebas unitarias ejecutadas fueron aprobadas.

### Escenarios cubiertos

**Consulta (`listar`):**

- Consulta correcta con paginación y orden descendente.
- Asignación inexistente.
- Intento de consultar asignación de otro conductor.
- Intento de consulta por conductor inactivo.

**Creación (`crear`):**

- Geometría inválida.
- Registro correcto dentro del contexto transaccional.
- Asignación inexistente.
- Rechazo cuando la asignación no está en estado `IN_PROGRESS`.
- Intento de registrar en asignación ajena.
- Intento de registro por conductor inactivo.

### Alcance de las pruebas

Las pruebas utilizan repositorios y contexto de auditoría simulados mediante mocks.

Por tanto, verifican la lógica del servicio, pero no demuestran por sí solas:

- La integración real con PostgreSQL/PostGIS.
- La ejecución de transacciones reales.
- La ejecución de triggers o mecanismos de auditoría de la base de datos.
- La autenticación y autorización HTTP real del controlador.

---

## 12. Consideraciones sobre la base de datos

Las entidades y sus restricciones representan la estructura esperada por el backend.

Las migraciones de VINTRA continúan pendientes de aprobación y no deben considerarse desplegadas ni definitivas.

La configuración `synchronize: false` debe mantenerse.

No se debe ejecutar ni aplicar ninguna migración pendiente sobre una base de datos compartida o de producción sin la aprobación correspondiente.
