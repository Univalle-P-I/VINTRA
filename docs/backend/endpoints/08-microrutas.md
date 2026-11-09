# Módulo de Microrrutas

> Las menciones a JWT, sesiones, roles y permisos son propuestas, no decisiones aprobadas; dependen de #54, #70 y #71. El formato común de respuestas sigue pendiente de #66.

## Endpoint 31. Listar microrrutas

**Método y ruta:** `GET /api/v1/microroutes`

### 1. ¿Para qué sirve?

Permite consultar las microrrutas registradas en VINTRA, que representan los recorridos específicos que se realizan dentro de una macrorruta.

También permite filtrar las microrrutas según la macrorruta a la que pertenecen, buscar por nombre y consultar la cantidad de barrios asociados.

Esta consulta facilita la selección de una microrruta al momento de realizar la asignación de recursos, de acuerdo con HU10.

### 2. Autenticación

Este endpoint requiere autenticación mediante un Bearer Token JWT y una sesión activa.

El rol del usuario debe tener permisos para consultar rutas, de acuerdo con la matriz de roles y permisos definida en HU1.

### 3. Encabezados HTTP

- `Authorization: Bearer <access_token>`
- `Accept: application/json`

### 4. Parámetros de consulta

No requiere cuerpo de solicitud.

**Campo: `macrorouteId`**

- Tipo: string (UUID).
- Obligatorio: No.
- Descripción: permite filtrar las microrrutas pertenecientes a una macrorruta específica.

**Campo: `search`**

- Tipo: string.
- Obligatorio: No.
- Descripción: permite buscar microrrutas por su nombre.

**Campo: `isActive`**

- Tipo: boolean.
- Obligatorio: No.
- Descripción: permite filtrar las microrrutas según su estado. Por defecto devuelve únicamente las microrrutas activas.

**Campo: `includeGeometry`**

- Tipo: boolean.
- Obligatorio: No.
- Descripción: indica si se debe incluir la geometría de la microrruta en formato GeoJSON. Por defecto es `false`.

**Campo: `page`**

- Tipo: integer.
- Obligatorio: No.
- Descripción: número de página que se desea consultar. Por defecto es `1`.

**Campo: `limit`**

- Tipo: integer.
- Obligatorio: No.
- Descripción: cantidad de registros por página. Por defecto es `20` y permite un máximo de `100`.

**Ejemplo de solicitud:**

`GET /api/v1/microroutes?macrorouteId=uuid-macrorruta&isActive=true&page=1&limit=20`

### 5. Respuesta exitosa

**Código HTTP:** `200 OK`

```json
{
  "data": [
    {
      "id": "uuid-microrruta",
      "name": "Microrruta N-01",
      "macroroute": {
        "id": "uuid-macrorruta",
        "name": "Macrorruta Norte"
      },
      "neighborhoodsCount": 5,
      "isActive": true
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 1
  }
}
```

**Descripción de los campos:**

- `id`: identificador único de la microrruta.
- `name`: nombre de la microrruta.
- `macroroute`: información resumida de la macrorruta a la que pertenece.
- `macroroute.id`: identificador de la macrorruta.
- `macroroute.name`: nombre de la macrorruta.
- `neighborhoodsCount`: cantidad de barrios asociados a la microrruta.
- `isActive`: estado de la microrruta.
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
4. Validar que `macrorouteId` tenga formato UUID cuando se envíe.
5. Validar los parámetros de consulta y la paginación.
6. Comprobar que `limit` no supere el máximo establecido de 100 registros.
7. Consultar la tabla `microroute` mediante su relación con `macroroute`.
8. Contar los barrios asociados a cada microrruta.
9. Aplicar los filtros y la paginación solicitados.
10. Incluir la geometría únicamente cuando se solicite mediante `includeGeometry=true`.

### 8. Reglas de negocio

**RN 01. Acceso según rol:** solamente los usuarios autorizados pueden consultar las microrrutas.

**RN 02. Consulta de microrrutas:** el sistema debe permitir consultar las microrrutas registradas, según HU8.

**RN 03. Filtrado por macrorruta:** el sistema debe permitir consultar las microrrutas pertenecientes a una macrorruta específica.

**RN 04. Filtrado por estado:** por defecto, solamente se devuelven las microrrutas activas.

**RN 05. Consulta de geometría:** la geometría únicamente se devuelve cuando se solicita explícitamente mediante `includeGeometry=true`.

**RN 06. Conteo de barrios:** el sistema debe mostrar la cantidad de barrios asociados a cada microrruta.

### 9. Relación con la base de datos

Este endpoint involucra principalmente tres tablas:

**Tabla: `microroute`**

Contiene las microrrutas y su geometría.

Campos utilizados:

- `id`
- `name`
- `macroroute_id`
- `geom`
- `is_active`
- `created_at`
- `updated_at`

**Tabla: `macroroute`**

Contiene la macrorruta a la que pertenece cada microrruta.

**Tabla: `microrute_neighborhood`**

Permite contar los barrios asociados a cada microrruta.

**Relaciones principales:**

- `microroute.macroroute_id → macroroute.id`
- `microrute_neighborhood.microroute_id → microroute.id`

### 10. Relación con las historias de usuario

**HU8. Crear microrrutas**

Este endpoint cumple el criterio de permitir consultar las microrrutas creadas.

También facilita la identificación de los recorridos disponibles para su posterior utilización en la planificación operativa.

---

## Endpoint 32. Crear microrruta

**Método y ruta:** `POST /api/v1/microroutes`

### 1. ¿Para qué sirve?

Permite que el jefe de operaciones registre una microrruta asociada a una macrorruta, definiendo un recorrido específico de atención.

Opcionalmente, se pueden indicar los horarios en los que opera la microrruta.

Los barrios que serán atendidos se asocian posteriormente mediante el endpoint correspondiente al módulo de Barrios.

### 2. Autenticación

Este endpoint requiere un Bearer Token JWT y una sesión activa.

Solamente podrán utilizarlo los roles autorizados para gestionar rutas.

### 3. Encabezados HTTP

- `Authorization: Bearer <access_token>`
- `Content-Type: application/json`
- `Accept: application/json`

### 4. Cuerpo de la solicitud

El endpoint recibe un objeto JSON con la información de la microrruta.

**Ejemplo:**

```json
{
  "macrorouteId": "uuid-macrorruta",
  "name": "Microrruta N-01",
  "geometry": {
    "type": "MultiLineString",
    "coordinates": [
      [
        [-74.080, 4.700],
        [-74.075, 4.703],
        [-74.070, 4.705]
      ]
    ]
  },
  "schedules": [
    {
      "scheduleId": "uuid-turno",
      "dayOfWeek": 1
    }
  ]
}
```

**Descripción de los campos:**

**Campo: `macrorouteId`**

- Tipo: string (UUID).
- Obligatorio: Sí.
- Descripción: identificador de la macrorruta a la que pertenece la microrruta. La macrorruta debe existir y estar activa.

**Campo: `name`**

- Tipo: string.
- El SQL no define longitud máxima para `name`; cualquier límite requiere confirmación de Base de Datos.
- Obligatorio: Sí.
- Descripción: nombre asignado a la microrruta.

**Campo: `geometry`**

- Tipo: objeto GeoJSON de tipo `MultiLineString`.
- Obligatorio: Pendiente de definir.
- Descripción: representa el trazado geográfico del recorrido mediante coordenadas de longitud y latitud. El SQL anota SRID 4326 como supuesto, pendiente de confirmación con Base de Datos.

La historia de usuario HU8 solicita registrar la información necesaria del recorrido, pero todavía no se ha definido si la geometría debe enviarse obligatoriamente al crear la microrruta.

**Campo: `schedules`**

- Tipo: array.
- Obligatorio: No.
- Descripción: contiene los horarios en los que opera la microrruta. Está pendiente definir si se envían en este endpoint o mediante un endpoint independiente.

**Campo: `schedules[].scheduleId`**

- Tipo: string (UUID).
- Obligatorio: Sí, dentro de cada elemento del arreglo.
- Descripción: identificador del turno perteneciente al catálogo `schedule`.

**Campo: `schedules[].dayOfWeek`**

- Tipo: integer.
- Obligatorio: Sí, dentro de cada elemento del arreglo.
- Descripción: día de la semana en el que opera la microrruta.

El documento propone utilizar `1` para lunes y `7` para domingo, siguiendo la convención ISO, pero esta convención está pendiente de confirmación.

### 5. Respuesta exitosa

**Código HTTP:** `201 Created`

El endpoint devuelve la microrruta creada con la misma estructura de respuesta del endpoint 33, correspondiente a la consulta detallada de una microrruta.

### 6. Respuestas de error

- **400 Bad Request:** Faltan campos obligatorios, la geometría no es un MultiLineString válido, el día de la semana está fuera de rango o existen horarios repetidos.
- **401 Unauthorized:** No se proporcionó un token válido, la sesión expiró o fue revocada.
- **403 Forbidden:** El usuario no tiene permisos para crear rutas.
- **404 Not Found:** La macrorruta o alguno de los horarios enviados no existen.
- **409 Conflict:** Ya existe una microrruta activa con el mismo nombre dentro de la macrorruta, si se aprueba esa restricción.
- **500 Internal Server Error:** Ocurrió un error inesperado durante el registro.

### 7. Validaciones

Antes de crear la microrruta, el backend debe:

1. Validar la sesión y comprobar que el rol tenga permiso para gestionar rutas.
2. Verificar que se hayan enviado los campos `macrorouteId` y `name`.
3. Comprobar que `macrorouteId` tenga formato UUID válido.
4. Comprobar que la macrorruta exista y esté activa.
5. Validar el nombre como texto no vacío; el SQL no define longitud máxima.
6. Validar que el nombre sea único dentro de la macrorruta, sujeto a confirmación.
7. Validar que la geometría, cuando se envíe, sea un GeoJSON de tipo `MultiLineString`.
8. Comprobar que las coordenadas geográficas sean válidas.
9. Validar que el trazado quede dentro del área de la macrorruta. El documento deja pendiente definir si esta validación será obligatoria o solamente una advertencia.
10. Comprobar que cada `scheduleId` enviado exista y esté activo.
11. Validar que `dayOfWeek` sea un entero; el rango y la codificación deben confirmarse, pues el SQL solo define `SMALLINT`.
12. Verificar que no se repita la misma combinación de horario y día.
13. Crear la microrruta y sus horarios en una misma transacción de base de datos, si se mantiene la inclusión de horarios en este endpoint.
14. Registrar la creación en `microroute_log`; confirmar que su estrategia de logging cubra la creación, dado que el DER solo enumera `old` y `new` sin definir el comportamiento de auditoría.

### 8. Reglas de negocio

**RN 01. Acceso según rol:** solamente los roles autorizados pueden crear microrrutas.

**RN 02. Integridad de datos:** la macrorruta y los horarios enviados deben corresponder a registros existentes.

**RN 03. Asociación obligatoria:** toda microrruta debe estar asociada a una macrorruta, según HU8.

**RN 04. Información del recorrido:** el sistema debe permitir registrar la información necesaria para definir el recorrido de la microrruta.

**RN 05. Asociación de barrios:** una microrruta debe poder contener los barrios que serán atendidos. Los barrios se asocian mediante el endpoint correspondiente al módulo de Barrios.

**RN 06. Integridad de horarios:** cuando se envíen horarios, estos deben corresponder a turnos existentes y no deben repetirse las combinaciones de turno y día.

### 9. Relación con la base de datos

Este endpoint involucra principalmente cuatro tablas:

**Tabla: `microroute`**

Permite crear el registro de la microrruta.

Campos involucrados:

- `id`
- `name`
- `macroroute_id`
- `geom`
- `is_active`
- `created_at`
- `updated_at`

**Tabla: `macroroute`**

Permite verificar la macrorruta a la que se asociará la nueva microrruta.

**Tabla: `microroute_schedule`**

Permite crear las relaciones entre la microrruta y sus horarios.

Campos involucrados:

- `microroute_id`
- `schedule_id`
- `day_of_week`

**Tabla: `microroute_log`**

El DER define `entity_id`, `actor_id`, `action`, `old`, `new`, `request_ip` y `created_at`. Su uso para auditar la creación queda sujeto a la estrategia de auditoría que se acuerde.

**Relaciones principales:**

- `microroute.macroroute_id → macroroute.id`
- `microroute_schedule.microroute_id → microroute.id`
- `microroute_schedule.schedule_id → schedule.id`

El SQL no declara restricciones `UNIQUE` ni `CHECK` para esta combinación o para `day_of_week`; cualquier garantía de unicidad o rango debe acordarse con Base de Datos.

### 10. Relación con las historias de usuario

**HU8. Crear microrrutas**

Este endpoint cumple los siguientes criterios:

- Una microrruta debe estar asociada a una macrorruta.
- Se debe poder registrar la información necesaria del recorrido.

**HU9. Asociar barrios a una microrruta**

La creación permite establecer la microrruta a la que posteriormente se asociarán los barrios que atenderá.

---

## Endpoint 33. Consultar microrruta

**Método y ruta:** `GET /api/v1/microroutes/{id}`

### 1. ¿Para qué sirve?

Permite consultar el detalle de una microrruta específica, incluyendo:

- La macrorruta a la que pertenece.
- El trazado geográfico del recorrido.
- Los barrios que atiende, organizados por orden de visita.
- Los horarios en los que opera.

Esta información se utiliza para mostrar la microrruta en el visor de mapas y verificar los sectores que atenderá durante la operación.

### 2. Autenticación

Este endpoint requiere un Bearer Token JWT y una sesión activa.

El rol del usuario debe tener permisos para consultar rutas.

### 3. Encabezados HTTP

- `Authorization: Bearer <access_token>`
- `Accept: application/json`

### 4. Parámetros de ruta

**Parámetro: `id`**

- Tipo: string (UUID).
- Obligatorio: Sí.
- Descripción: identificador único de la microrruta que se desea consultar.

**Ejemplo de solicitud:**

`GET /api/v1/microroutes/uuid-microrruta`

No requiere cuerpo de solicitud.

### 5. Respuesta exitosa

**Código HTTP:** `200 OK`

```json
{
  "id": "uuid-microrruta",
  "name": "Microrruta N-01",
  "macroroute": {
    "id": "uuid-macrorruta",
    "name": "Macrorruta Norte"
  },
  "geometry": {
    "type": "MultiLineString",
    "coordinates": [
      [
        [-74.080, 4.700],
        [-74.075, 4.703],
        [-74.070, 4.705]
      ]
    ]
  },
  "neighborhoods": [
    {
      "id": "uuid-barrio",
      "name": "Barrio Ejemplo",
      "commune": "Comuna 1",
      "orderVisit": 1
    }
  ],
  "schedules": [
    {
      "id": "uuid-microroute-schedule",
      "dayOfWeek": 1,
      "schedule": {
        "id": "uuid-turno",
        "name": "Turno mañana",
        "startTime": "06:00",
        "endTime": "14:00"
      },
      "isActive": true
    }
  ],
  "isActive": true,
  "createdAt": "2026-11-04T08:00:00Z",
  "updatedAt": "2026-11-04T08:00:00Z"
}
```

**Descripción de los campos:**

- `id`: identificador único de la microrruta.
- `name`: nombre de la microrruta.
- `macroroute`: información de la macrorruta a la que pertenece.
- `geometry`: trazado geográfico del recorrido en formato GeoJSON.
- `neighborhoods`: barrios asociados a la microrruta.
- `neighborhoods[].id`: identificador del barrio.
- `neighborhoods[].name`: nombre del barrio.
- `neighborhoods[].commune`: comuna a la que pertenece.
- `neighborhoods[].orderVisit`: posición del barrio dentro del recorrido.
- `schedules`: horarios asociados a la microrruta.
- `schedules[].id`: identificador de la relación entre microrruta y horario.
- `schedules[].dayOfWeek`: día de la semana en el que opera.
- `schedules[].schedule`: información del turno asociado.
- `schedules[].isActive`: estado de la asociación del horario.
- `isActive`: estado de la microrruta.
- `createdAt`: fecha de creación.
- `updatedAt`: fecha de última actualización.

### 6. Respuestas de error

- **400 Bad Request:** El identificador no tiene un formato UUID válido.
- **401 Unauthorized:** No se proporcionó un token válido, la sesión expiró o fue revocada.
- **403 Forbidden:** El usuario no tiene permisos para consultar rutas.
- **404 Not Found:** No existe una microrruta con el identificador enviado.
- **500 Internal Server Error:** Ocurrió un error inesperado durante la consulta.

### 7. Validaciones

Antes de devolver la información, el backend debe:

1. Validar la sesión y comprobar que el rol tenga permiso para consultar rutas.
2. Validar que el parámetro `id` tenga formato UUID.
3. Buscar la microrruta en la tabla `microroute`, incluyendo su macrorruta asociada.
4. Responder con código 404 si la microrruta no existe.
5. Obtener los barrios asociados mediante `microrute_neighborhood`.
6. Ordenar los barrios según el campo `order_visit`.
7. Obtener los horarios activos asociados a la microrruta.
8. Consultar la información de los turnos mediante la tabla `schedule`.
9. Devolver la geometría en formato GeoJSON.

### 8. Reglas de negocio

**RN 01. Acceso según rol:** solamente los usuarios autorizados pueden consultar rutas.

**RN 02. Consulta del recorrido:** el sistema debe permitir consultar los sectores que atenderá una microrruta, según HU9.

**RN 03. Orden de visita:** los barrios asociados deben mostrarse respetando el orden de visita establecido para el recorrido.

**RN 04. Información de horarios:** la consulta debe permitir identificar los horarios y días de operación asociados a la microrruta.

**RN 05. Estado de la microrruta:** una microrruta inactiva puede consultarse, pero el sistema debe indicar que se encuentra inactiva.

### 9. Relación con la base de datos

Este endpoint involucra principalmente cinco tablas:

**Tabla: `microroute`**

Contiene los datos generales y el trazado geográfico de la microrruta.

**Tabla: `macroroute`**

Contiene la macrorruta a la que pertenece.

**Tabla: `microrute_neighborhood`**

Contiene los barrios asociados a la microrruta y su orden de visita.

**Tabla: `btura_neighborhood`**

Contiene la información de cada barrio, como su identificador, nombre y comuna.

**Tabla: `microroute_schedule`**

Contiene las relaciones entre las microrrutas y los horarios de operación.

**Tabla: `schedule`**

Contiene la información general de los turnos asociados.

**Relaciones principales:**

- `microroute.macroroute_id → macroroute.id`
- `microrute_neighborhood.microroute_id → microroute.id`
- `microrute_neighborhood.neighborhood_id → btura_neighborhood.id`
- `microroute_schedule.microroute_id → microroute.id`
- `microroute_schedule.schedule_id → schedule.id`

### 10. Relación con las historias de usuario

**HU8. Crear microrrutas**

Permite consultar la información de la microrruta creada.

**HU9. Asociar barrios a una microrruta**

Permite consultar los barrios asociados a la microrruta y el orden en el que deben atenderse.

---
