# API de Rutas – VINTRA

**Módulo:** Rutas
**Base URL:** `/api/v1`
**Última revisión:** 13 de noviembre de 2026
**Estado:** Documentación basada en la implementación actual del backend. Las migraciones relacionadas continúan pendientes de aprobación.

---

## 1. Objetivo

Documentar los endpoints del módulo Rutas de VINTRA, encargado de administrar los barrios, las macrorutas, las microrutas y las asociaciones entre microrutas y barrios.

Este módulo permite consultar y administrar la información geográfica y operativa necesaria para organizar los recorridos de recolección de residuos.

## 2. Alcance

El módulo comprende cuatro recursos:

| Recurso | Descripción |
|---|---|
| Barrios (`neighborhoods`) | Administración de barrios, comunas y geometrías territoriales. |
| Macrorutas (`macroroutes`) | Administración de recorridos generales de recolección. |
| Microrutas (`microroutes`) | Administración de recorridos específicos asociados a una macroruta. |
| Asociaciones microruta-barrio (`microroute-neighborhoods`) | Relaciona barrios con microrutas y establece el orden de visita. |

El controlador expone 15 endpoints:

- 4 endpoints para barrios.
- 4 endpoints para macrorutas.
- 4 endpoints para microrutas.
- 3 endpoints para asociaciones microruta-barrio.

No se implementan operaciones DELETE en el controlador revisado.

## 3. Autenticación y autorización

### 3.1. Autenticación

El controlador utiliza:

- `JwtAuthGuard`
- `RolesGuard`
- `@ApiBearerAuth('access-token')`

Los endpoints requieren un token JWT válido, enviado mediante el encabezado:

```http
Authorization: Bearer <token>
```

Para las solicitudes que envían información en formato JSON:

```http
Content-Type: application/json
```

### 3.2. Roles

Los roles utilizados en el módulo son:

| Rol | Código |
|---|---|
| Administrador | `ADMIN` |
| Responsable de operaciones | `OPERATIONS_MANAGER` |
| Conductor | `DRIVER` |

### 3.3. Matriz de permisos

| Recurso / operación | ADMIN | OPERATIONS_MANAGER | DRIVER |
|---|:---:|:---:|:---:|
| Listar barrios | Sí | Sí | Sí |
| Consultar barrio por ID | Sí | Sí | Sí |
| Crear barrio | Sí | Sí | No |
| Actualizar barrio | Sí | Sí | No |
| Listar macrorutas | Sí | Sí | Sí |
| Consultar macroruta por ID | Sí | Sí | Sí |
| Crear macroruta | Sí | Sí | No |
| Actualizar macroruta | Sí | Sí | No |
| Listar microrutas | Sí | Sí | Sí |
| Consultar microruta por ID | Sí | Sí | Sí |
| Crear microruta | Sí | Sí | No |
| Actualizar microruta | Sí | Sí | No |
| Listar asociaciones microruta-barrio | Sí | Sí | Sí |
| Crear asociación | Sí | Sí | No |
| Actualizar asociación | Sí | Sí | No |

La autorización se define mediante `@Roles()` en el controlador y se aplica con los guards globales del propio controlador.

---

## 4. Endpoints

### 4.1. Barrios

#### 4.1.1. Listar barrios

**Método:** GET
**Ruta:** `/api/v1/neighborhoods`

**Autenticación:** JWT requerido.
**Roles:** ADMIN, OPERATIONS_MANAGER, DRIVER.

**Descripción:** Obtiene un listado paginado de barrios. Permite filtrar por nombre y comuna.

**Parámetros de consulta:**

| Parámetro | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `name` | string | No | Busca coincidencias parciales en el nombre. |
| `commune` | string | No | Busca coincidencias parciales en la comuna. |
| `page` | number | No | Número de página. Predeterminado: 1. |
| `limit` | number | No | Cantidad de registros por página. Predeterminado: 20. |

Los filtros de texto se procesan con `ILike`, por lo que la búsqueda no distingue entre mayúsculas y minúsculas.

**Ejemplo:**

```http
GET /api/v1/neighborhoods?name=Centro&commune=Comuna%201&page=1&limit=10
```

**Respuesta esperada:**

```json
{
  "items": [
    {
      "id": "uuid",
      "comuna": "Comuna 1",
      "nombre": "Centro",
      "geometria": {
        "type": "MultiPolygon",
        "coordinates": []
      },
      "actualizadoEn": "2026-11-13T10:00:00.000Z",
      "creadoEn": "2026-11-13T10:00:00.000Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10
}
```

El ejemplo representa la estructura de salida de la consulta; los valores son ilustrativos.

**Reglas de negocio:**

1. Si no se envían filtros, se consultan todos los barrios.
2. La búsqueda por nombre y comuna utiliza coincidencias parciales.
3. Los resultados se ordenan por nombre ascendente.
4. La paginación predeterminada utiliza página 1 y límite 20.
5. El servicio utiliza `findAndCount()` para obtener registros y cantidad total.

**Respuestas HTTP:**

| Código | Descripción |
|---|---|
| 200 | Consulta realizada correctamente. |
| 400 | Parámetros de consulta inválidos. |
| 401 | No autenticado. |
| 403 | Sin permisos para consultar. |

#### 4.1.2. Consultar barrio por ID

**Método:** GET
**Ruta:** `/api/v1/neighborhoods/:id`

**Autenticación:** JWT requerido.
**Roles:** ADMIN, OPERATIONS_MANAGER, DRIVER.

**Descripción:** Obtiene la información de un barrio mediante su identificador UUID.

**Parámetros de ruta:**

| Parámetro | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `id` | UUID | Sí | Identificador del barrio. |

**Ejemplo:**

```http
GET /api/v1/neighborhoods/550e8400-e29b-41d4-a716-446655440000
```

**Respuesta esperada:**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "comuna": "Comuna 1",
  "nombre": "Centro",
  "geometria": {
    "type": "MultiPolygon",
    "coordinates": []
  },
  "actualizadoEn": "2026-11-13T10:00:00.000Z",
  "creadoEn": "2026-11-13T10:00:00.000Z"
}
```

**Reglas de negocio:**

1. Busca el barrio mediante su ID.
2. Si no existe, genera `NotFoundException`.
3. El identificador se valida mediante `ParseUUIDPipe`.

**Respuestas HTTP:**

| Código | Descripción |
|---|---|
| 200 | Barrio encontrado. |
| 400 | Identificador UUID inválido. |
| 401 | No autenticado. |
| 403 | Sin permisos. |
| 404 | El barrio no existe. |

#### 4.1.3. Crear barrio

**Método:** POST
**Ruta:** `/api/v1/neighborhoods`

**Autenticación:** JWT requerido.
**Roles:** ADMIN, OPERATIONS_MANAGER.

**Descripción:** Registra un barrio con su nombre, comuna opcional y geometría territorial.

**DTO:** `CrearBarrioDto`.

**Body:**

```json
{
  "commune": "Comuna 1",
  "name": "Centro",
  "geometry": {
    "type": "MultiPolygon",
    "coordinates": []
  }
}
```

**Campos:**

| Campo | Tipo | Obligatorio | Validaciones |
|---|---|---|---|
| `commune` | string o null | No | Texto de 1 a 80 caracteres cuando se envía como cadena. |
| `name` | string | Sí | Texto de 1 a 120 caracteres. |
| `geometry` | object | Sí | GeoJSON de tipo `MultiPolygon`. |

**Reglas de negocio:**

1. El DTO elimina espacios externos de los campos de texto.
2. La comuna puede omitirse o enviarse como `null`.
3. La geometría se valida mediante `GeoJsonGeometryValidator`.
4. El servicio obtiene el repositorio transaccional de `Barrio`.
5. El campo `commune` se almacena en `comuna`, `name` en `nombre` y `geometry` en `geometria`.
6. Una violación de unicidad de PostgreSQL (`23505`) se transforma en `ConflictException`.
7. La operación se ejecuta mediante `ContextoAuditoriaService`.

**Respuestas HTTP:**

| Código | Descripción |
|---|---|
| 201 | Barrio creado. |
| 400 | Datos o geometría inválidos. |
| 401 | No autenticado. |
| 403 | Sin permisos. |
| 409 | Ya existe un barrio con ese nombre. |

#### 4.1.4. Actualizar barrio

**Método:** PATCH
**Ruta:** `/api/v1/neighborhoods/:id`

**Autenticación:** JWT requerido.
**Roles:** ADMIN, OPERATIONS_MANAGER.

**Descripción:** Actualiza uno o varios campos de un barrio existente.

**DTO:** `ActualizarBarrioDto`.

El DTO utiliza `PartialType(CrearBarrioDto)`, por lo que todos los campos de creación pasan a ser opcionales.

**Body de ejemplo:**

```json
{
  "name": "Centro actualizado"
}
```

**Campos:**

| Campo | Tipo | Obligatorio | Validaciones |
|---|---|---|---|
| `commune` | string o null | No | Texto de 1 a 80 caracteres cuando se envía como cadena; también admite `null`. |
| `name` | string | No | Texto de 1 a 120 caracteres. |
| `geometry` | object | No | GeoJSON `MultiPolygon`. |

**Reglas de negocio:**

1. Busca el barrio dentro de la transacción.
2. Si no existe, genera `NotFoundException`.
3. Solo modifica los campos cuyo valor sea diferente de `undefined`.
4. Permite actualizar la comuna, el nombre y la geometría de manera independiente.
5. Si la base de datos genera una violación de unicidad (`23505`), devuelve conflicto HTTP 409.
6. La operación utiliza el contexto transaccional de auditoría.

**Respuestas HTTP:**

| Código | Descripción |
|---|---|
| 200 | Barrio actualizado. |
| 400 | Identificador o datos inválidos. |
| 401 | No autenticado. |
| 403 | Sin permisos. |
| 404 | El barrio no existe. |
| 409 | Ya existe un barrio con ese nombre. |

---

### 4.2. Macrorutas

#### 4.2.1. Listar macrorutas

**Método:** GET
**Ruta:** `/api/v1/macroroutes`

**Autenticación:** JWT requerido.
**Roles:** ADMIN, OPERATIONS_MANAGER, DRIVER.

**Descripción:** Obtiene todas las macrorutas registradas.

**Parámetros:** No recibe parámetros de consulta.

**Reglas de negocio:**

1. Consulta los registros mediante el repositorio de `Macroruta`.
2. Ordena los resultados por código ascendente.
3. No aplica paginación.
4. No se observa un filtro de registros activos en la entidad revisada.

**Respuesta esperada:**

```json
[
  {
    "id": "uuid",
    "codigo": "MR-001",
    "nombre": "Macroruta Centro",
    "geometria": {
      "type": "MultiLineString",
      "coordinates": []
    },
    "actualizadoEn": "2026-11-13T10:00:00.000Z",
    "creadoEn": "2026-11-13T10:00:00.000Z"
  }
]
```

**Respuestas HTTP:**

| Código | Descripción |
|---|---|
| 200 | Consulta realizada correctamente. |
| 401 | No autenticado. |
| 403 | Sin permisos. |

#### 4.2.2. Consultar macroruta por ID

**Método:** GET
**Ruta:** `/api/v1/macroroutes/:id`

**Autenticación:** JWT requerido.
**Roles:** ADMIN, OPERATIONS_MANAGER, DRIVER.

**Descripción:** Obtiene una macroruta mediante su identificador UUID.

**Parámetros de ruta:**

| Parámetro | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `id` | UUID | Sí | Identificador de la macroruta. |

**Reglas de negocio:**

1. Busca la macroruta por ID.
2. Si no existe, genera `NotFoundException`.
3. El identificador se valida mediante `ParseUUIDPipe`.

**Respuestas HTTP:**

| Código | Descripción |
|---|---|
| 200 | Macroruta encontrada. |
| 400 | UUID inválido. |
| 401 | No autenticado. |
| 403 | Sin permisos. |
| 404 | La macroruta no existe. |

#### 4.2.3. Crear macroruta

**Método:** POST
**Ruta:** `/api/v1/macroroutes`

**Autenticación:** JWT requerido.
**Roles:** ADMIN, OPERATIONS_MANAGER.

**Descripción:** Registra una macroruta con código, nombre y geometría.

**DTO:** `CrearMacrorutaDto`.

**Body:**

```json
{
  "code": "MR-001",
  "name": "Macroruta Centro",
  "geometry": {
    "type": "MultiLineString",
    "coordinates": []
  }
}
```

**Campos:**

| Campo | Tipo | Obligatorio | Validaciones |
|---|---|---|---|
| `code` | string | Sí | De 1 a 30 caracteres. |
| `name` | string | Sí | No vacío, máximo 120 caracteres. |
| `geometry` | object | Sí | GeoJSON `MultiLineString`. |

**Reglas de negocio:**

1. Los campos de texto eliminan espacios externos.
2. La geometría se valida mediante `GeoJsonGeometryValidator`.
3. El servicio crea el registro mediante el repositorio transaccional.
4. Una violación de unicidad de PostgreSQL (`23505`) se transforma en conflicto HTTP 409.
5. La entidad establece un código único para cada macroruta.
6. La operación utiliza `ContextoAuditoriaService`.

**Respuestas HTTP:**

| Código | Descripción |
|---|---|
| 201 | Macroruta creada. |
| 400 | Datos o geometría inválidos. |
| 401 | No autenticado. |
| 403 | Sin permisos. |
| 409 | Ya existe una macroruta con ese código. |

#### 4.2.4. Actualizar macroruta

**Método:** PATCH
**Ruta:** `/api/v1/macroroutes/:id`

**Autenticación:** JWT requerido.
**Roles:** ADMIN, OPERATIONS_MANAGER.

**Descripción:** Actualiza parcialmente una macroruta existente.

**DTO:** `ActualizarMacrorutaDto`.

**Body de ejemplo:**

```json
{
  "name": "Macroruta Centro actualizada"
}
```

**Campos:**

| Campo | Tipo | Obligatorio | Validaciones |
|---|---|---|---|
| `code` | string | No | De 1 a 30 caracteres. |
| `name` | string | No | No vacío, máximo 120 caracteres. |
| `geometry` | object | No | GeoJSON `MultiLineString`. |

**Reglas de negocio:**

1. Busca la macroruta dentro de la transacción.
2. Si no existe, genera `NotFoundException`.
3. Modifica únicamente los campos enviados.
4. Si el código genera una violación de unicidad (`23505`), devuelve `409 Conflict`.
5. Utiliza el contexto transaccional de auditoría.

**Respuestas HTTP:**

| Código | Descripción |
|---|---|
| 200 | Macroruta actualizada. |
| 400 | Identificador o datos inválidos. |
| 401 | No autenticado. |
| 403 | Sin permisos. |
| 404 | La macroruta no existe. |
| 409 | Ya existe una macroruta con ese código. |

---

### 4.3. Microrutas

#### 4.3.1. Listar microrutas

**Método:** GET
**Ruta:** `/api/v1/microroutes`

**Autenticación:** JWT requerido.
**Roles:** ADMIN, OPERATIONS_MANAGER, DRIVER.

**Descripción:** Obtiene microrutas con posibilidad de filtrar por macroruta, buscar por código o nombre y controlar la inclusión de la geometría.

**DTO:** `ConsultarMicrorutasDto`.

**Parámetros de consulta:**

| Parámetro | Tipo | Obligatorio | Validaciones |
|---|---|---|---|
| `macrorouteId` | UUID | No | Identificador de macroruta. |
| `search` | string | No | Búsqueda en nombre o código. |
| `includeGeometry` | boolean | No | Admite `true` o `false`. |
| `page` | number | No | Entero, mínimo 1. |
| `limit` | number | No | Entero entre 1 y 100. |

**Ejemplo:**

```http
GET /api/v1/microroutes?macrorouteId=550e8400-e29b-41d4-a716-446655440000&search=Centro&includeGeometry=false&page=1&limit=20
```

**Reglas de negocio:**

1. La consulta utiliza QueryBuilder.
2. Incluye la relación con la macroruta mediante `leftJoinAndSelect`.
3. Ordena los resultados por código ascendente.
4. Si se envía `macrorouteId`, filtra por el identificador de la macroruta.
5. Si se envía `search`, busca coincidencias en nombre o código mediante `ILIKE`.
6. Si `includeGeometry` es `false`, selecciona explícitamente los campos básicos de la microruta y los datos de identificación de su macroruta asociada. Se omite la geometría de ambas entidades en esa consulta.
7. La paginación predeterminada utiliza página 1 y límite 20.
8. El servicio devuelve `items`, `total`, `page` y `limit`.

**Respuesta esperada:**

```json
{
  "items": [
    {
      "id": "uuid",
      "codigo": "MR-001-MI-01",
      "nombre": "Microruta Centro",
      "macroruta": {
        "id": "uuid",
        "codigo": "MR-001",
        "nombre": "Macroruta Centro"
      }
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 20
}
```

La estructura ilustrada corresponde a una consulta con `includeGeometry=false`; los valores son de ejemplo.

**Respuestas HTTP:**

| Código | Descripción |
|---|---|
| 200 | Consulta realizada correctamente. |
| 400 | Parámetros inválidos. |
| 401 | No autenticado. |
| 403 | Sin permisos. |

#### 4.3.2. Consultar microruta por ID

**Método:** GET
**Ruta:** `/api/v1/microroutes/:id`

**Autenticación:** JWT requerido.
**Roles:** ADMIN, OPERATIONS_MANAGER, DRIVER.

**Descripción:** Obtiene una microruta por su identificador UUID e incluye la relación con su macroruta.

**Parámetros de ruta:**

| Parámetro | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `id` | UUID | Sí | Identificador de la microruta. |

**Reglas de negocio:**

1. Busca la microruta mediante su ID.
2. Carga la relación `macroruta`.
3. Si no existe, genera `NotFoundException`.
4. El ID se valida mediante `ParseUUIDPipe`.

**Respuestas HTTP:**

| Código | Descripción |
|---|---|
| 200 | Microruta encontrada. |
| 400 | UUID inválido. |
| 401 | No autenticado. |
| 403 | Sin permisos. |
| 404 | La microruta no existe. |

#### 4.3.3. Crear microruta

**Método:** POST
**Ruta:** `/api/v1/microroutes`

**Autenticación:** JWT requerido.
**Roles:** ADMIN, OPERATIONS_MANAGER.

**Descripción:** Crea una microruta y la relaciona con una macroruta existente.

**DTO:** `CrearMicrorutaDto`.

**Body:**

```json
{
  "macrorouteId": "550e8400-e29b-41d4-a716-446655440000",
  "code": "MR-001-MI-01",
  "name": "Microruta Centro",
  "geometry": {
    "type": "MultiLineString",
    "coordinates": []
  }
}
```

**Campos:**

| Campo | Tipo | Obligatorio | Validaciones |
|---|---|---|---|
| `macrorouteId` | UUID | Sí | Formato UUID. |
| `code` | string | Sí | De 1 a 30 caracteres. |
| `name` | string | Sí | No vacío, máximo 120 caracteres. |
| `geometry` | object | Sí | GeoJSON `MultiLineString`. |

**Reglas de negocio:**

1. El servicio busca la macroruta indicada.
2. Si no existe, devuelve `404 Not Found`.
3. Si existe, crea la microruta asociada.
4. Una violación de unicidad (`23505`) se transforma en `409 Conflict`.
5. La operación utiliza el contexto transaccional de auditoría.

**Respuestas HTTP:**

| Código | Descripción |
|---|---|
| 201 | Microruta creada. |
| 400 | Datos o geometría inválidos. |
| 401 | No autenticado. |
| 403 | Sin permisos. |
| 404 | La macroruta no existe. |
| 409 | Ya existe una microruta con ese código. |

#### 4.3.4. Actualizar microruta

**Método:** PATCH
**Ruta:** `/api/v1/microroutes/:id`

**Autenticación:** JWT requerido.
**Roles:** ADMIN, OPERATIONS_MANAGER.

**Descripción:** Actualiza los datos de una microruta, incluyendo la posibilidad de cambiar su macroruta asociada.

**DTO:** `ActualizarMicrorutaDto`.

**Body de ejemplo:**

```json
{
  "macrorouteId": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Microruta Centro actualizada"
}
```

**Campos:**

| Campo | Tipo | Obligatorio | Validaciones |
|---|---|---|---|
| `macrorouteId` | UUID | No | Formato UUID. |
| `code` | string | No | De 1 a 30 caracteres. |
| `name` | string | No | No vacío, máximo 120 caracteres. |
| `geometry` | object | No | GeoJSON `MultiLineString`. |

**Reglas de negocio:**

1. Busca la microruta que se desea modificar.
2. Si no existe, devuelve `404 Not Found`.
3. Si se envía `macrorouteId`, busca la nueva macroruta.
4. Si la macroruta no existe, devuelve `404 Not Found`.
5. Actualiza únicamente los campos enviados.
6. Si se presenta una violación de unicidad (`23505`), devuelve `409 Conflict`.
7. La operación se ejecuta mediante el contexto transaccional de auditoría.

**Respuestas HTTP:**

| Código | Descripción |
|---|---|
| 200 | Microruta actualizada. |
| 400 | Identificador o datos inválidos. |
| 401 | No autenticado. |
| 403 | Sin permisos. |
| 404 | Microruta o macroruta inexistente. |
| 409 | Ya existe una microruta con ese código. |

---

### 4.4. Asociaciones entre microrutas y barrios

#### 4.4.1. Listar asociaciones microruta-barrio

**Método:** GET
**Ruta:** `/api/v1/microroute-neighborhoods`

**Autenticación:** JWT requerido.
**Roles:** ADMIN, OPERATIONS_MANAGER, DRIVER.

**Descripción:** Obtiene las asociaciones entre microrutas y barrios. Puede filtrar por una microruta específica.

**Parámetro de consulta:**

| Parámetro | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `microrouteId` | UUID | No | Filtra las asociaciones por identificador de microruta. |

**Ejemplo:**

```http
GET /api/v1/microroute-neighborhoods?microrouteId=550e8400-e29b-41d4-a716-446655440000
```

**Reglas de negocio:**

1. Si se envía `microrouteId`, filtra las asociaciones correspondientes a esa microruta.
2. Si no se envía, consulta todas las asociaciones.
3. Incluye las relaciones con microruta y barrio.
4. Ordena los resultados por `ordenVisita` ascendente.
5. No implementa paginación.

**Respuestas HTTP:**

| Código | Descripción |
|---|---|
| 200 | Consulta realizada correctamente. |
| 400 | UUID inválido. |
| 401 | No autenticado. |
| 403 | Sin permisos. |

#### 4.4.2. Crear asociación microruta-barrio

**Método:** POST
**Ruta:** `/api/v1/microroute-neighborhoods`

**Autenticación:** JWT requerido.
**Roles:** ADMIN, OPERATIONS_MANAGER.

**Descripción:** Asocia un barrio a una microruta y establece su orden de visita.

**DTO:** `CrearMicrorutaBarrioDto`.

**Body:**

```json
{
  "microrouteId": "550e8400-e29b-41d4-a716-446655440000",
  "neighborhoodId": "650e8400-e29b-41d4-a716-446655440000",
  "orderVisit": 1
}
```

**Campos:**

| Campo | Tipo | Obligatorio | Validaciones |
|---|---|---|---|
| `microrouteId` | UUID | Sí | Formato UUID. |
| `neighborhoodId` | UUID | Sí | Formato UUID. |
| `orderVisit` | number | Sí | Entero, mínimo 1. |

**Reglas de negocio:**

1. Verifica que la microruta exista.
2. Si no existe, devuelve `404 Not Found`.
3. Verifica que el barrio exista.
4. Si no existe, devuelve `404 Not Found`.
5. Crea la asociación con el orden de visita recibido.
6. Si se presenta una violación de unicidad (`23505`), devuelve `409 Conflict`.
7. El conflicto puede corresponder a un barrio ya asociado a esa microruta o a un orden de visita ya utilizado.
8. La operación utiliza el contexto transaccional de auditoría.

**Respuestas HTTP:**

| Código | Descripción |
|---|---|
| 201 | Asociación creada. |
| 400 | UUID u orden de visita inválidos. |
| 401 | No autenticado. |
| 403 | Sin permisos. |
| 404 | La microruta o el barrio no existen. |
| 409 | La microruta ya tiene ese barrio o número de orden. |

#### 4.4.3. Actualizar asociación microruta-barrio

**Método:** PATCH
**Ruta:** `/api/v1/microroute-neighborhoods/:id`

**Autenticación:** JWT requerido.
**Roles:** ADMIN, OPERATIONS_MANAGER.

**Descripción:** Modifica una asociación existente. Permite cambiar la microruta, el barrio o el orden de visita.

**DTO:** `ActualizarMicrorutaBarrioDto`.

**Body de ejemplo:**

```json
{
  "orderVisit": 3
}
```

**Campos:**

| Campo | Tipo | Obligatorio | Validaciones |
|---|---|---|---|
| `microrouteId` | UUID | No | Formato UUID. |
| `neighborhoodId` | UUID | No | Formato UUID. |
| `orderVisit` | number | No | Entero, mínimo 1. |

**Reglas de negocio:**

1. Busca la asociación mediante su ID.
2. Si no existe, devuelve `404 Not Found`.
3. Si se envía `microrouteId`, verifica que la microruta exista.
4. Si se envía `neighborhoodId`, verifica que el barrio exista.
5. Actualiza el orden de visita si se proporciona `orderVisit`.
6. Si se presenta una violación de unicidad (`23505`), devuelve `409 Conflict`.
7. La operación se ejecuta dentro del contexto transaccional de auditoría.

**Respuestas HTTP:**

| Código | Descripción |
|---|---|
| 200 | Asociación actualizada. |
| 400 | Identificador u orden inválidos. |
| 401 | No autenticado. |
| 403 | Sin permisos. |
| 404 | Asociación, microruta o barrio inexistente. |
| 409 | La microruta ya tiene ese barrio o número de orden. |

---

## 5. Validaciones globales

Las validaciones de entrada se implementan mediante DTO y decoradores de `class-validator` y `class-transformer`.

### 5.1. Validaciones de identificadores

Los identificadores de las entidades se manejan mediante UUID.

- `@IsUUID()` valida los identificadores enviados en los DTO.
- `ParseUUIDPipe` valida los identificadores recibidos en parámetros de ruta.
- `ParseUUIDPipe({ optional: true })` permite omitir el filtro opcional `microrouteId`.

### 5.2. Validaciones de texto

Los campos de texto utilizan transformaciones y validaciones según el DTO:

- `@Transform()` elimina espacios externos cuando el valor es una cadena.
- `@IsString()` exige que el valor sea texto.
- `@MinLength()` establece longitud mínima.
- `@MaxLength()` establece longitud máxima.
- `@IsNotEmpty()` impide valores vacíos.

### 5.3. Validaciones geográficas

La geometría se valida mediante `GeoJsonGeometryValidator`.

| Recurso | Tipo GeoJSON | SRID |
|---|---|---|
| Barrio | `MultiPolygon` | 4326 |
| Macroruta | `MultiLineString` | 4326 |
| Microruta | `MultiLineString` | 4326 |

### 5.4. Validaciones numéricas

La paginación y el orden de visita utilizan validaciones numéricas:

- `@Type(() => Number)` transforma valores recibidos como texto.
- `@IsInt()` exige números enteros.
- `@Min(1)` exige valores iguales o superiores a uno.
- `@Max(100)` limita el tamaño de página de microrutas a 100.

### 5.5. Consideraciones sobre los DTO

- `ActualizarBarrioDto`, `ActualizarMacrorutaDto` y `ActualizarMicrorutaBarrioDto` utilizan `PartialType()`.
- `ActualizarMicrorutaDto` declara explícitamente sus propiedades opcionales.
- Los DTO de actualización permiten omitir campos.
- No todos los DTO de consulta tienen los mismos límites de paginación.
- `ConsultarBarriosDto` no establece un máximo para `limit`.
- `ConsultarMicrorutasDto` establece un máximo de 100 para `limit`.

### 5.6. Validación global de solicitudes

La aplicación configura un `ValidationPipe` global en `src/main.ts` con las siguientes opciones:

| Opción | Comportamiento |
|---|---|
| `whitelist: true` | Excluye las propiedades que no cuentan con decoradores de validación en el DTO. |
| `forbidNonWhitelisted: true` | Rechaza las solicitudes que contienen propiedades no permitidas, en lugar de ignorarlas silenciosamente. |
| `transform: true` | Transforma los datos recibidos a las instancias de los DTO y aplica las transformaciones declaradas. |

Por tanto, las validaciones y transformaciones declaradas en los DTO se aplican globalmente a las solicitudes que pasan por este mecanismo.

Esto complementa las validaciones de identificadores realizadas mediante `ParseUUIDPipe`.

---

## 6. Modelo de datos relacionado

Las entidades del módulo se encuentran en:

`src/rutas/entidades/`

### 6.1. Tabla `btura_neighborhood`

Entidad: `Barrio`.

| Campo | Tipo | Restricciones |
|---|---|---|
| `id` | UUID | Clave primaria `btura_neighborhood_pkey`. |
| `commune` | VARCHAR(80) | Nullable. |
| `name` | VARCHAR(120) | Obligatorio. |
| `geom` | Geometry(MultiPolygon, 4326) | Geometría espacial. |
| `updated_at` | TIMESTAMPTZ | Predeterminado `now()`. |
| `created_at` | TIMESTAMPTZ | Predeterminado `now()`. |

Índices:

- `idx_btura_neighborhood_name`: índice único sobre el nombre.
- `idx_btura_neighborhood_geom`: índice espacial.

### 6.2. Tabla `macroroute`

Entidad: `Macroruta`.

| Campo | Tipo | Restricciones |
|---|---|---|
| `id` | UUID | Clave primaria `macroroute_pkey`. |
| `code` | VARCHAR(30) | Obligatorio. |
| `name` | VARCHAR(120) | Obligatorio. |
| `geom` | Geometry(MultiLineString, 4326) | Geometría espacial. |
| `updated_at` | TIMESTAMPTZ | Predeterminado `now()`. |
| `created_at` | TIMESTAMPTZ | Predeterminado `now()`. |

Restricciones e índices:

- `uq_macroroute_code`: código único.
- `idx_macroroute_geom`: índice espacial.

### 6.3. Tabla `microroute`

Entidad: `Microruta`.

| Campo | Tipo | Restricciones |
|---|---|---|
| `id` | UUID | Clave primaria `microroute_pkey`. |
| `macroroute_id` | UUID | FK obligatoria hacia `macroroute`. |
| `code` | VARCHAR(30) | Obligatorio. |
| `name` | VARCHAR(120) | Obligatorio. |
| `geom` | Geometry(MultiLineString, 4326) | Geometría espacial. |
| `updated_at` | TIMESTAMPTZ | Predeterminado `now()`. |
| `created_at` | TIMESTAMPTZ | Predeterminado `now()`. |

Relación:

- Una macroruta puede tener varias microrutas.
- Cada microruta pertenece a una sola macroruta.

Restricciones e índices:

- `fk_microroute_macroroute`: clave foránea hacia macroroute.
- `idx_microroute_macroroute_id`: índice de relación.
- `uq_microroute_code`: código único.
- `idx_microroute_geom`: índice espacial.

La unicidad del código de microruta está definida sobre el campo `codigo`, no sobre una combinación de código y macroruta.

### 6.4. Tabla `microroute_neighborhood`

Entidad: `MicrorutaBarrio`.

| Campo | Tipo | Restricciones |
|---|---|---|
| `id` | UUID | Clave primaria `microroute_neighborhood_pkey`. |
| `neighborhood_id` | UUID | FK obligatoria hacia `btura_neighborhood`. |
| `microroute_id` | UUID | FK obligatoria hacia `microroute`. |
| `order_visit` | INTEGER | Orden de visita, mayor que cero. |

Relaciones:

- Una microruta puede asociarse con varios barrios.
- Un barrio puede estar asociado con varias microrutas.
- La tabla intermedia almacena el orden de visita de cada barrio dentro de una microruta.

Restricciones e índices:

- `fk_microroute_neighborhood_neighborhood`: FK hacia barrio.
- `fk_microroute_neighborhood_microroute`: FK hacia microruta.
- `idx_microroute_neighborhood_microroute_id`: índice de microruta.
- `idx_microroute_neighborhood_neighborhood_id`: índice de barrio.
- `uq_microroute_neighborhood`: evita duplicar el mismo barrio en una microruta.
- `uq_microroute_neighborhood_order`: evita repetir el orden dentro de una microruta.
- `ck_microroute_neighborhood_order_visit`: exige `order_visit > 0`.

---

## 7. Auditoría

Las operaciones de escritura del módulo utilizan `ContextoAuditoriaService`.

Las operaciones que emplean este mecanismo son:

- Crear barrio.
- Actualizar barrio.
- Crear macroruta.
- Actualizar macroruta.
- Crear microruta.
- Actualizar microruta.
- Crear asociación microruta-barrio.
- Actualizar asociación microruta-barrio.

El controlador obtiene el usuario autenticado y la IP de la solicitud y los transmite al servicio.

El servicio ejecuta las escrituras mediante:

```typescript
this.contextoAuditoria.ejecutar(actorId, ip, async (manager) => {
  // Operación transaccional
});
```

Dentro de la operación se utiliza el administrador transaccional para obtener los repositorios correspondientes.

**Importante:** `RutasService` establece el contexto de auditoría, pero no realiza directamente inserciones en una tabla de auditoría. El registro efectivo de los cambios depende de la implementación de `ContextoAuditoriaService` y de los mecanismos de auditoría definidos en la base de datos.

La existencia y ejecución efectiva de triggers debe verificarse cuando las migraciones correspondientes sean aprobadas y aplicadas.

---

## 8. Manejo de errores

El módulo utiliza excepciones de NestJS y transforma determinados errores de PostgreSQL.

| Excepción / condición | Código HTTP | Descripción |
|---|---|---|
| `UnauthorizedException` del guard | 401 | Token ausente o inválido. |
| `ForbiddenException` del guard | 403 | El usuario no tiene el rol requerido. |
| `BadRequestException` de validación o pipes | 400 | Datos, UUID o parámetros inválidos. |
| `NotFoundException` | 404 | El recurso o una relación requerida no existe. |
| `ConflictException` | 409 | Conflicto de unicidad. |

### 8.1. Conflictos de unicidad

El método privado `throwIfUniqueViolation()` identifica errores cuyo código PostgreSQL es `23505`.

Cuando encuentra este código, genera `ConflictException` con un mensaje específico para el recurso.

Los conflictos contemplados son:

- Barrio con nombre duplicado.
- Macroruta con código duplicado.
- Microruta con código duplicado.
- Asociación con barrio repetido en la misma microruta.
- Asociación con orden de visita repetido en la misma microruta.

Otros errores de base de datos no se convierten automáticamente en conflictos: se vuelven a lanzar.

---

## 9. Pruebas unitarias

**Archivo:** `src/rutas/rutas.service.spec.ts`

**Comando ejecutado:**

```powershell
npm test -- --runInBand src/rutas/rutas.service.spec.ts
```

**Resultado reportado:**

| Indicador | Resultado |
|---|---:|
| Suites aprobadas | 1 |
| Suites fallidas | 0 |
| Pruebas aprobadas | 24 |
| Pruebas fallidas | 0 |
| Tiempo reportado | 3.033 segundos |

Las pruebas cubren operaciones de barrios, macrorutas, microrutas y asociaciones, incluyendo consultas, filtros, paginación, actualizaciones parciales, recursos inexistentes, conflictos de unicidad y uso del contexto de auditoría.

### 9.1. Alcance de las pruebas

Las pruebas son unitarias y utilizan repositorios y contexto de auditoría simulados.

Por tanto, no demuestran por sí solas:

- Que las restricciones estén instaladas en PostgreSQL.
- Que PostGIS acepte y almacene correctamente todas las geometrías.
- Que las claves foráneas y los índices existan en la base real.
- Que los triggers de auditoría funcionen.
- Que el comportamiento de las transacciones sea correcto en una integración real.

Estas verificaciones deben realizarse en una etapa posterior, cuando el esquema y las migraciones estén aprobados.

---

## 10. Aspectos pendientes de verificación

1. **Migraciones:** las migraciones relacionadas con el esquema continúan pendientes de aprobación. Las entidades representan la referencia actual del modelo, pero no confirman que el esquema esté desplegado.

2. **PostGIS:** comprobar en una base de datos de pruebas aprobada el almacenamiento y recuperación de geometrías `MultiPolygon` y `MultiLineString` con SRID 4326.

3. **Actualización de fechas:** las entidades `Barrio`, `Macroruta` y `Microruta` declaran `updated_at` con valor predeterminado `now()`, pero no utilizan `@UpdateDateColumn()`. Debe verificarse qué mecanismo actualiza ese campo durante las modificaciones. La entidad `MicrorutaBarrio` no declara columnas de fechas.

4. **Paginación de barrios:** `ConsultarBarriosDto` no establece un máximo para `limit`. Evaluar si se requiere un límite superior.

5. **Paginación de microrutas:** verificar si se desea mantener el máximo actual de 100 registros.

6. **Actualizaciones vacías:** los DTO de actualización permiten que sus propiedades sean opcionales. Debe decidirse si se aceptan cuerpos vacíos o si se exige al menos un campo.

7. **Valores null:** verificar el comportamiento esperado cuando se envían valores `null` en campos opcionales, especialmente `commune`.

8. **Geometrías:** comprobar que el validador GeoJSON cubra los requisitos geométricos y las coordenadas válidas esperadas por el proyecto.

9. **Códigos de microrutas:** confirmar con el equipo si la unicidad global de `code` es la regla funcional deseada o si debería depender de la macroruta.

10. **Auditoría:** verificar los triggers y las tablas de auditoría después de la aprobación de las migraciones.

11. **Autorización:** complementar las pruebas del servicio con pruebas del controlador o de integración para comprobar los permisos por rol.

---

## 11. Archivos de referencia

### Controlador y servicio

- `src/rutas/rutas.controller.ts`
- `src/rutas/rutas.service.ts`
- `src/rutas/rutas.module.ts`

### DTO

- `src/rutas/dto/crear-barrio.dto.ts`
- `src/rutas/dto/actualizar-barrio.dto.ts`
- `src/rutas/dto/consultar-barrios.dto.ts`
- `src/rutas/dto/crear-macroruta.dto.ts`
- `src/rutas/dto/actualizar-macroruta.dto.ts`
- `src/rutas/dto/crear-microruta.dto.ts`
- `src/rutas/dto/actualizar-microruta.dto.ts`
- `src/rutas/dto/consultar-microrutas.dto.ts`
- `src/rutas/dto/crear-microruta-barrio.dto.ts`
- `src/rutas/dto/actualizar-microruta-barrio.dto.ts`

### Entidades

- `src/rutas/entidades/barrio.entity.ts`
- `src/rutas/entidades/macroruta.entity.ts`
- `src/rutas/entidades/microruta.entity.ts`
- `src/rutas/entidades/microruta-barrio.entity.ts`

### Auditoría y validación geográfica

- `src/comun/contexto-auditoria.service.ts`
- `src/comun/geojson.validator.ts`

### Pruebas

- `src/rutas/rutas.service.spec.ts`

---

**Fin de la documentación del módulo Rutas.**
