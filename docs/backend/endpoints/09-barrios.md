# Módulo: Barrios

> Las menciones a JWT, sesiones, roles y permisos son propuestas, no decisiones aprobadas; dependen de #54, #70 y #71. El formato común de respuestas sigue pendiente de #66.

## Endpoint 34. Consultar barrios

### 1. Información general

- **Método:** GET
- **Ruta:** `/api/v1/neighborhoods`
- **Autenticación:** Bearer Token (JWT).
- **Body:** No requiere.

### 2. ¿Para qué sirve?

Permite consultar los barrios registrados en VINTRA. La información se utiliza para identificar los barrios que pueden asociarse a las microrrutas.

### 3. Parámetros de consulta

| Parámetro | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| name | String | No | Buscar barrios por nombre. |
| commune | String | No | Filtrar barrios por comuna. |
| page | Integer | No | Número de página. |
| limit | Integer | No | Cantidad de registros por página. |

### 4. Encabezados HTTP

```http
Authorization: Bearer <access_token>
Accept: application/json
```

### 5. Respuesta exitosa — 200 OK

```json
{
  "data": [
    {
      "id": "uuid-barrio-1",
      "name": "El Cristal",
      "commune": "Comuna 8"
    },
    {
      "id": "uuid-barrio-2",
      "name": "La Independencia",
      "commune": "Comuna 10"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 2
  }
}
```

### 6. Respuestas de error

- **401 Unauthorized:** No se proporcionó un token válido.
- **403 Forbidden:** El usuario no tiene permisos para consultar los barrios.
- **500 Internal Server Error:** Ocurrió un error inesperado.

### 7. Validaciones

Antes de realizar la consulta, el backend debe:

- Verificar que los filtros tengan un formato válido.
- Comprobar que `page` y `limit` sean valores positivos.
- Aplicar los filtros sobre los campos existentes en la tabla.

### 8. Reglas de negocio

**RN-01. Consulta de barrios registrados:** La consulta debe mostrar únicamente barrios registrados en VINTRA.

**RN-02. Filtrado de barrios:** Los filtros deben aplicarse sobre el nombre y la comuna.

**RN-03. Integridad de la información:** La consulta no debe modificar la información almacenada.

### 9. Relación con las historias de usuario

**HU9. Asociar barrios a una microrruta**

Este endpoint permite cumplir los siguientes criterios:

- Se deben poder consultar los barrios registrados.
- El sistema debe permitir consultar los barrios disponibles para asociarlos a una microrruta.

### 10. Relación con la base de datos

**Tabla involucrada:**

- **btura_neighborhood:** Contiene la información registrada de los barrios, como su identificador, nombre, comuna y ubicación geográfica.

**Campos utilizados:**

- `id`
- `name`
- `commune`
- `geom`
- `created_at`

No requiere relaciones adicionales para consultar el catálogo de barrios.

---

## Endpoint 35. Asociar barrio a microrruta

### 1. Información general

- **Método:** POST
- **Ruta:** `/api/v1/microroutes/{id}/neighborhoods`
- **Autenticación:** Bearer Token (JWT).
- **Body:** Sí requiere.

### 2. ¿Para qué sirve?

Permite asociar un barrio a una microrruta existente, registrando también el orden en el que debe visitarse dentro del recorrido.

### 3. Parámetros de ruta

| Parámetro | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| id | UUID | Sí | Identificador de la microrruta a la que se asociará el barrio. |

### 4. Encabezados HTTP

```http
Authorization: Bearer <access_token>
Content-Type: application/json
Accept: application/json
```

### 5. Cuerpo de la solicitud

```json
{
  "neighborhoodId": "uuid-del-barrio",
  "orderVisit": 1
}
```

**Descripción de los campos:**

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| neighborhoodId | UUID | Sí | Identificador del barrio que se asociará. |
| orderVisit | Integer | Sí | Orden de visita del barrio dentro de la microrruta. |

### 6. Respuesta exitosa — 201 Created

```json
{
  "id": "uuid-asociacion",
  "microrouteId": "uuid-microrruta",
  "neighborhoodId": "uuid-barrio",
  "orderVisit": 1
}
```

### 7. Respuestas de error

- **400 Bad Request:** Los datos enviados son inválidos o faltan campos obligatorios.
- **401 Unauthorized:** No se proporcionó un token válido.
- **404 Not Found:** La microrruta o el barrio no existen.
- **409 Conflict:** El barrio ya está asociado a la microrruta o existe un conflicto con el orden de visita, si esa regla se establece.
- **500 Internal Server Error:** Ocurrió un error inesperado.

### 8. Validaciones

Antes de realizar la asociación, el backend debe:

- Verificar que el identificador de la microrruta sea válido.
- Comprobar que la microrruta exista.
- Verificar que el barrio exista en `btura_neighborhood`.
- Comprobar que `orderVisit` sea un entero positivo.
- Verificar que no se esté registrando una asociación duplicada.
- Comprobar que la microrruta esté activa, si la regla de negocio exige que solo se puedan modificar microrrutas activas.

### 9. Reglas de negocio

**RN-01. Asociación de barrios:** Un barrio puede asociarse a una microrruta mediante la tabla de relación.

**RN-02. Orden de visita:** Cada asociación debe registrar su orden de visita.

**RN-03. Secuencia del recorrido:** El orden de visita permite establecer la secuencia de los barrios dentro del recorrido.

**RN-04. Integridad de las asociaciones:** No se deben registrar asociaciones duplicadas.

### 10. Relación con las historias de usuario

**HU9. Asociar barrios a una microrruta**

Este endpoint permite cumplir los siguientes criterios:

- Se deben poder asociar barrios registrados a una microrruta.
- El sistema debe mostrar los barrios asociados.
- La microrruta debe permitir consultar los sectores que atenderá.
- Se debe conservar el orden de visita de los barrios dentro del recorrido.

### 11. Relación con la base de datos

**Tablas involucradas:**

- **btura_neighborhood:** Contiene la información de los barrios registrados.
- **microroute:** Contiene la información de las microrrutas a las que se asociarán los barrios.
- **microrute_neighborhood:** Establece la relación entre las microrrutas y los barrios, almacenando también el orden de visita.

**Relaciones principales:**

```text
microrute_neighborhood.neighborhood_id
    → btura_neighborhood.id

microrute_neighborhood.microroute_id
    → microroute.id
```