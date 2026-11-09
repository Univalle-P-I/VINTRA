# Módulo de Macrorrutas

> Las menciones a JWT, sesiones, roles y permisos son propuestas, no decisiones aprobadas; dependen de #54, #70 y #71. El formato común de respuestas sigue pendiente de #66.

## Endpoint 28. Listar macrorrutas

**Método y ruta:** `GET /api/v1/macroroutes`

### 1. ¿Para qué sirve?

Permite consultar las macrorrutas registradas en VINTRA, que representan los sectores geográficos amplios que serán atendidos durante la operación.

El listado permite identificar las macrorrutas existentes y conocer cuántas microrrutas están asociadas a cada una.

### 2. Autenticación

Este endpoint requiere autenticación mediante un Bearer Token JWT y una sesión activa.

El backend debe verificar que el usuario tenga permisos para consultar las rutas, de acuerdo con la matriz de roles y permisos definida en HU1.

### 3. Encabezados HTTP

- `Authorization: Bearer <access_token>`
- `Accept: application/json`

### 4. Parámetros de consulta

No requiere cuerpo de solicitud.

#### Campo: `search`

- Tipo: string.
- Obligatorio: No.
- Descripción: permite buscar macrorrutas por su nombre.

#### Campo: `isActive`

- Tipo: boolean.
- Obligatorio: No.
- Descripción: permite filtrar las macrorrutas según su estado. Por defecto devuelve únicamente las macrorrutas activas.

#### Campo: `includeGeometry`

- Tipo: boolean.
- Obligatorio: No.
- Descripción: indica si se debe incluir la geometría de la macrorruta en formato GeoJSON. Por defecto es `false`.

#### Campo: `page`

- Tipo: integer.
- Obligatorio: No.
- Descripción: número de página que se desea consultar. Por defecto es `1`.

#### Campo: `limit`

- Tipo: integer.
- Obligatorio: No.
- Descripción: cantidad de registros por página. Por defecto es `20` y permite un máximo de `100`.

#### Ejemplo de solicitud

`GET /api/v1/macroroutes?search=Norte&isActive=true&page=1&limit=20`

### 5. Respuesta exitosa

**Código HTTP:** `200 OK`

```json
{
  "data": [
    {
      "id": "uuid-macrorruta",
      "name": "Macrorruta Norte",
      "microroutesCount": 4,
      "isActive": true,
      "createdAt": "2026-11-04T08:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 1
  }
}
```

#### Descripción de los campos

- `id`: identificador único de la macrorruta.
- `name`: nombre de la macrorruta.
- `microroutesCount`: cantidad de microrrutas activas asociadas.
- `isActive`: estado de la macrorruta.
- `createdAt`: fecha de creación.
- `meta.page`: página consultada.
- `meta.limit`: cantidad máxima de registros por página.
- `meta.total`: cantidad total de registros que cumplen los filtros.

### 6. Respuestas de error

- **400 Bad Request:** Algún parámetro de consulta tiene un formato inválido.
- **401 Unauthorized:** No se proporcionó un token válido, la sesión expiró o fue revocada.
- **403 Forbidden:** El usuario no tiene permisos para consultar rutas.
- **500 Internal Server Error:** Ocurrió un error inesperado durante la consulta.

### 7. Validaciones

Antes de devolver la información, el backend debe:

1. Verificar que se haya enviado el token de autenticación.
2. Validar que corresponda a una sesión existente, no revocada y no expirada.
3. Comprobar que el rol del usuario tenga permiso para consultar rutas.
4. Validar que los parámetros de consulta tengan un formato válido.
5. Verificar que `page` y `limit` cumplan con los valores permitidos.
6. Comprobar que `limit` no supere el máximo establecido de 100 registros.
7. Consultar la tabla `macroroute`.
8. Contar las microrrutas activas asociadas a cada macrorruta.
9. Aplicar los filtros y la paginación solicitados.
10. Incluir la geometría únicamente cuando se solicite mediante `includeGeometry=true`.

### 8. Reglas de negocio

**RN 01. Acceso según rol:** solamente los usuarios autorizados pueden consultar las macrorrutas.

**RN 02. Consulta de macrorrutas:** el sistema debe permitir consultar las macrorrutas registradas, de acuerdo con HU7.

**RN 03. Filtrado por estado:** por defecto, la consulta debe devolver únicamente las macrorrutas activas.

**RN 04. Consulta de geometría:** la geometría de las macrorrutas solamente debe incluirse cuando se solicite explícitamente mediante `includeGeometry=true`.

**RN 05. Conteo de microrrutas:** el sistema debe mostrar la cantidad de microrrutas activas asociadas a cada macrorruta.

### 9. Relación con la base de datos

Este endpoint involucra principalmente dos tablas:

#### Tabla: `macroroute`

Contiene los registros de las macrorrutas y su información geográfica.

Campos utilizados:

- `id`
- `name`
- `geom`
- `is_active`
- `created_at`
- `updated_at`

#### Tabla: `microroute`

Permite contar las microrrutas activas asociadas a cada macrorruta.

#### Relación principal

`microroute.macroroute_id → macroroute.id`

### 10. Relación con las historias de usuario

#### HU7. Gestionar macrorrutas

Este endpoint cumple el criterio que establece que el sistema debe permitir consultar las macrorrutas registradas.

---

## Endpoint 29. Crear macrorruta

**Método y ruta:** `POST /api/v1/macroroutes`

### 1. ¿Para qué sirve? — Endpoint 29

Permite que el jefe de operaciones registre una nueva macrorruta para organizar los sectores geográficos que serán atendidos durante la operación.

La macrorruta se crea inicialmente sin microrrutas. Estas se registran posteriormente mediante el endpoint de creación de microrrutas y quedan asociadas a la macrorruta correspondiente.

### 2. Autenticación — Endpoint 29

Este endpoint requiere un Bearer Token JWT y una sesión activa.

Solamente podrán utilizarlo los roles autorizados para gestionar rutas, de acuerdo con la matriz de roles y permisos de HU1.

### 3. Encabezados HTTP — Endpoint 29

- `Authorization: Bearer <access_token>`
- `Content-Type: application/json`
- `Accept: application/json`

### 4. Cuerpo de la solicitud

El endpoint recibe un objeto JSON con la información de la macrorruta.

#### Ejemplo

```json
{
  "name": "Macrorruta Norte",
  "geometry": {
    "type": "MultiPolygon",
    "coordinates": [
      [
        [
          [-74.08, 4.70],
          [-74.07, 4.70],
          [-74.07, 4.71],
          [-74.08, 4.71],
          [-74.08, 4.70]
        ]
      ]
    ]
  }
}
```

#### Descripción de los campos: — Endpoint 29

#### Campo: `name`

- Tipo: string.
- El SQL no define longitud máxima para `name`; cualquier límite requiere confirmación de Base de Datos.
- Obligatorio: Sí.
- Descripción: nombre asignado a la macrorruta.

#### Campo: `geometry`

- Tipo: objeto GeoJSON de tipo `MultiPolygon`.
- Obligatorio: Pendiente de definir.
- Descripción: representa el área geográfica cubierta por la macrorruta mediante coordenadas de longitud y latitud. El SQL anota SRID 4326 como supuesto, pendiente de confirmación con Base de Datos.

La historia de usuario HU7 establece que la macrorruta debe contar con la información requerida, pero todavía no se ha definido si la geometría debe enviarse obligatoriamente al momento de crearla.

### 5. Respuesta exitosa — Endpoint 29

**Código HTTP:** `201 Created`

```json
{
  "id": "uuid-macrorruta",
  "name": "Macrorruta Norte",
  "geometry": {
    "type": "MultiPolygon",
    "coordinates": [
      [
        [
          [-74.08, 4.70],
          [-74.07, 4.70],
          [-74.07, 4.71],
          [-74.08, 4.71],
          [-74.08, 4.70]
        ]
      ]
    ]
  },
  "microroutesCount": 0,
  "isActive": true,
  "createdAt": "2026-11-04T08:00:00Z"
}
```

#### Descripción de los campos: — Endpoint 29 (3)

- `id`: identificador único de la macrorruta.
- `name`: nombre asignado.
- `geometry`: geometría geográfica del área cubierta.
- `microroutesCount`: cantidad de microrrutas asociadas. Inicialmente es cero.
- `isActive`: estado de la macrorruta.
- `createdAt`: fecha de creación.

### 6. Respuestas de error — Endpoint 29

- **400 Bad Request:** Faltan campos obligatorios, la geometría no es un MultiPolygon válido o contiene coordenadas fuera de rango.
- **401 Unauthorized:** No se proporcionó un token válido, la sesión expiró o fue revocada.
- **403 Forbidden:** El usuario no tiene permisos para crear rutas.
- **409 Conflict:** Ya existe una macrorruta activa con el mismo nombre, si se aprueba esa restricción.
- **500 Internal Server Error:** Ocurrió un error inesperado durante el registro.

### 7. Validaciones — Endpoint 29

Antes de crear la macrorruta, el backend debe:

1. Validar la sesión y comprobar que el rol tenga permiso para gestionar rutas.
2. Verificar que se haya enviado el nombre y que no esté vacío.
3. Validar el nombre conforme al límite que confirme Base de Datos; el SQL no define longitud máxima.
4. Validar que el nombre sea único entre las macrorrutas activas, sujeto a confirmación.
5. Validar que la geometría, cuando se envíe, sea un GeoJSON de tipo `MultiPolygon`.
6. Comprobar que las coordenadas geográficas sean válidas.
7. Verificar que la longitud esté entre -180 y 180 y la latitud entre -90 y 90.
8. Validar que la geometría sea topológicamente válida y no contenga autointersecciones.
9. Aplicar el SRID que confirme Base de Datos; el SQL indica 4326 como supuesto.
10. Definir el valor inicial de `is_active`; el SQL no establece un valor predeterminado.
11. Registrar la operación en `macroroute_log` si se confirma el mecanismo; el DER solo define `old_values` (sin columna `new`) y no especifica cómo registrar la creación.

### 8. Reglas de negocio — Endpoint 29

**RN 01. Acceso según rol:** solamente los roles autorizados pueden crear macrorrutas.

**RN 02. Registro de macrorrutas:** el sistema debe permitir crear una macrorruta, según HU7.

**RN 03. Información requerida:** cada macrorruta debe contar con la información necesaria para identificar y organizar el área geográfica que representa.

**RN 04. Relación con microrrutas:** una macrorruta debe poder relacionarse con sus microrrutas correspondientes.

**RN 05. Estado inicial:** el valor inicial de `is_active` queda pendiente de confirmación; el SQL no establece un valor predeterminado.

**RN 06. Integridad geográfica:** cuando se registre la geometría, esta debe cumplir con las condiciones de formato y coordenadas establecidas.

### 9. Relación con la base de datos — Endpoint 29

Este endpoint involucra principalmente dos tablas:

#### Tabla: `macroroute` — Endpoint 29

Permite almacenar la información de la macrorruta.

Campos involucrados:

- `id`
- `name`
- `geom`
- `is_active`
- `created_at`
- `updated_at`

#### Tabla: `macroroute_log`

El DER define `entity_id`, `actor_id`, `action`, `old_values`, `request_ip` y `created_at`; no incluye una columna `new`. La representación de la creación en este log requiere confirmación.

#### Relación principal: — Endpoint 29

`microroute.macroroute_id → macroroute.id`

Esta relación permite que posteriormente se asocien microrrutas a la macrorruta creada.

### 10. Relación con las historias de usuario — Endpoint 29

#### HU7. Gestionar macrorrutas — Endpoint 29

Este endpoint cumple los siguientes criterios:

- Se debe poder crear una macrorruta.
- Cada macrorruta debe contar con la información requerida.
- Una macrorruta debe poder relacionarse con sus microrrutas.

---

## Endpoint 30. Consultar macrorruta

**Método y ruta:** `GET /api/v1/macroroutes/{id}`

### 1. ¿Para qué sirve? — Endpoint 30 (3)

Permite consultar el detalle de una macrorruta específica, incluyendo su geometría y las microrrutas asociadas.

Esta información se utiliza para representar la macrorruta en el visor de mapas y consultar los recorridos que la componen.

### 2. Autenticación — Endpoint 30 (3)

Este endpoint requiere un Bearer Token JWT y una sesión activa.

El rol del usuario debe tener permisos para consultar rutas.

### 3. Encabezados HTTP — Endpoint 30 (3)

- `Authorization: Bearer <access_token>`
- `Accept: application/json`

### 4. Parámetros de ruta

#### Parámetro: `id`

- Tipo: string (UUID).
- Obligatorio: Sí.
- Descripción: identificador único de la macrorruta que se desea consultar.

#### Ejemplo de solicitud: — Endpoint 30

`GET /api/v1/macroroutes/uuid-macrorruta`

No requiere cuerpo de solicitud.

### 5. Respuesta exitosa — Endpoint 30 (3)

**Código HTTP:** `200 OK`

```json
{
  "id": "uuid-macrorruta",
  "name": "Macrorruta Norte",
  "geometry": {
    "type": "MultiPolygon",
    "coordinates": [
      [
        [
          [-74.08, 4.70],
          [-74.07, 4.70],
          [-74.07, 4.71],
          [-74.08, 4.71],
          [-74.08, 4.70]
        ]
      ]
    ]
  },
  "microroutes": [
    {
      "id": "uuid-microrruta",
      "name": "Microrruta N-01",
      "isActive": true
    }
  ],
  "isActive": true,
  "createdAt": "2026-11-04T08:00:00Z",
  "updatedAt": "2026-11-04T08:00:00Z"
}
```

#### Descripción de los campos: — Endpoint 30 (4)

- `id`: identificador único de la macrorruta.
- `name`: nombre de la macrorruta.
- `geometry`: geometría geográfica en formato GeoJSON.
- `microroutes`: listado de microrrutas asociadas.
- `microroutes[].id`: identificador de la microrruta.
- `microroutes[].name`: nombre de la microrruta.
- `microroutes[].isActive`: estado de la microrruta.
- `isActive`: estado de la macrorruta.
- `createdAt`: fecha de creación.
- `updatedAt`: fecha de última actualización.

**Consideración:** el arreglo `microroutes` devuelve únicamente un resumen de cada microrruta: identificador, nombre y estado. El detalle completo de cada una se consulta mediante el endpoint 33.

### 6. Respuestas de error — Endpoint 30 (3)

- **400 Bad Request:** El identificador no tiene un formato UUID válido.
- **401 Unauthorized:** No se proporcionó un token válido, la sesión expiró o fue revocada.
- **403 Forbidden:** El usuario no tiene permisos para consultar rutas.
- **404 Not Found:** No existe una macrorruta con el identificador enviado.
- **500 Internal Server Error:** Ocurrió un error inesperado durante la consulta.

### 7. Validaciones — Endpoint 30 (3)

Antes de devolver la información, el backend debe:

1. Validar la sesión y comprobar que el rol tenga permiso para consultar rutas.
2. Validar que el parámetro `id` tenga formato UUID.
3. Buscar la macrorruta en la tabla `macroroute`.
4. Responder con código 404 si la macrorruta no existe.
5. Obtener las microrrutas asociadas.
6. Convertir o devolver la geometría en formato GeoJSON.
7. Incluir el estado actual de la macrorruta y de las microrrutas asociadas.

### 8. Reglas de negocio — Endpoint 30 (3)

**RN 01. Acceso según rol:** solamente los usuarios autorizados pueden consultar rutas.

**RN 02. Consulta individual:** el sistema debe permitir consultar una macrorruta mediante su identificador.

**RN 03. Relación con microrrutas:** una macrorruta debe permitir consultar las microrrutas que tiene asociadas, según HU7.

**RN 04. Estado de la macrorruta:** una macrorruta inactiva puede consultarse, pero el sistema debe indicar que se encuentra inactiva.

**RN 05. Información geográfica:** el detalle debe incluir la geometría de la macrorruta en formato GeoJSON.

### 9. Relación con la base de datos — Endpoint 30 (3)

Este endpoint involucra principalmente dos tablas:

#### Tabla: `macroroute` — Endpoint 30 (3)

Contiene los datos generales y la geometría de la macrorruta.

#### Tabla: `microroute` — Endpoint 30

Permite consultar las microrrutas asociadas a la macrorruta.

#### Relación principal: — Endpoint 30 (3)

`microroute.macroroute_id → macroroute.id`

### 10. Relación con las historias de usuario — Endpoint 30 (3)

#### HU7. Gestionar macrorrutas — Endpoint 30 (3)

Este endpoint cumple los siguientes criterios:

- Se deben poder consultar las macrorrutas registradas.
- Una macrorruta debe poder relacionarse con sus microrrutas.

---
