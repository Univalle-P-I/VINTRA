# API de vehículos — VINTRA

**Estado:** Borrador técnico
**Módulo:** Vehículos
**Base de rutas:** `/api/v1`
**Autenticación:** JWT Bearer
**Última revisión:** 12 de noviembre de 2026

---

## 1. Objetivo

Documentar los endpoints implementados en el módulo de vehículos de VINTRA, incluyendo sus rutas, métodos HTTP, permisos, parámetros, cuerpos de solicitud, validaciones y reglas de negocio.

Este documento describe el comportamiento observado en el código del backend. No representa todavía un contrato definitivo de la API, porque algunas decisiones dependen de la aprobación del modelo de base de datos y de las políticas de seguridad.

## 2. Alcance

El módulo permite:

- Consultar los tipos de vehículos activos.
- Crear tipos de vehículos.
- Actualizar tipos de vehículos.
- Consultar los vehículos activos.
- Consultar un vehículo por su identificador.
- Registrar vehículos.
- Actualizar vehículos.

Actualmente no se encuentra implementado un endpoint para eliminar vehículos o tipos de vehículos.

## 3. Autenticación y autorización

Los endpoints del controlador están protegidos mediante:

- `JwtAuthGuard`: verifica que la solicitud tenga un token JWT válido.
- `RolesGuard`: verifica que el usuario tenga uno de los roles permitidos para la operación.

Los roles utilizados en el código son:

| Rol | Descripción |
|---|---|
| `ADMIN` | Administrador |
| `OPERATIONS_MANAGER` | Responsable de operaciones |
| `DRIVER` | Conductor |

### Matriz de permisos

| Método | Endpoint | ADMIN | OPERATIONS_MANAGER | DRIVER |
|---|---|---:|---:|---:|
| GET | `/vehicle-types` | Sí | Sí | Sí |
| POST | `/vehicle-types` | Sí | Sí | No |
| PATCH | `/vehicle-types/:id` | Sí | Sí | No |
| GET | `/vehicles` | Sí | Sí | Sí |
| GET | `/vehicles/:id` | Sí | Sí | Sí |
| POST | `/vehicles` | Sí | Sí | No |
| PATCH | `/vehicles/:id` | Sí | Sí | No |

**Nota:** La política de roles continúa sujeta a la revisión y aprobación de las decisiones de seguridad del proyecto.

## 4. Endpoints de tipos de vehículos

### 4.1. Listar tipos de vehículos

**Método:** `GET`
**Ruta:** `/api/v1/vehicle-types`
**Autenticación:** JWT
**Roles:** `ADMIN`, `OPERATIONS_MANAGER`, `DRIVER`

**Descripción:** Consulta los tipos de vehículos que se encuentran activos.

**Parámetros:** No requiere parámetros.

**Respuesta esperada:** Lista de tipos de vehículos activos, ordenados alfabéticamente por nombre.

**Reglas de negocio:**
- Solo se incluyen tipos activos.
- Los resultados se ordenan por nombre ascendente.

**Posibles códigos HTTP:**
- `200 OK`: consulta realizada correctamente.
- `401 Unauthorized`: token ausente o inválido.
- `403 Forbidden`: rol no autorizado.

### 4.2. Crear tipo de vehículo

**Método:** `POST`
**Ruta:** `/api/v1/vehicle-types`
**Autenticación:** JWT
**Roles:** `ADMIN`, `OPERATIONS_MANAGER`

**Descripción:** Registra un nuevo tipo de vehículo.

**Cuerpo de la solicitud:**

```json
{
  "code": "VOLQUETA",
  "name": "Volqueta",
  "isActive": true
}
```

**Campos:**

| Campo | Tipo | Obligatorio | Validación |
|---|---|---:|---|
| `code` | string | Sí | Entre 1 y 30 caracteres; se eliminan espacios externos y se convierte a mayúsculas. |
| `name` | string | Sí | Entre 1 y 100 caracteres; se eliminan espacios externos. |
| `isActive` | boolean | No | Si no se envía, se establece en `true`. |

**Reglas de negocio:**
- El código debe ser único.
- Si no se proporciona `isActive`, el tipo se crea activo.
- La operación se ejecuta mediante el contexto de auditoría.

**Posibles códigos HTTP:**
- `201 Created`: tipo creado.
- `400 Bad Request`: datos inválidos.
- `401 Unauthorized`: token ausente o inválido.
- `403 Forbidden`: rol no autorizado.
- `409 Conflict`: ya existe un tipo con ese código.

### 4.3. Actualizar tipo de vehículo

**Método:** `PATCH`
**Ruta:** `/api/v1/vehicle-types/:id`
**Autenticación:** JWT
**Roles:** `ADMIN`, `OPERATIONS_MANAGER`

**Descripción:** Actualiza parcialmente un tipo de vehículo existente.

**Parámetro de ruta:**

| Parámetro | Tipo | Descripción |
|---|---|---|
| `id` | UUID | Identificador del tipo de vehículo. |

**Cuerpo de la solicitud:**

```json
{
  "name": "Volqueta de carga",
  "isActive": true
}
```

Todos los campos son opcionales, pero los que se envíen deben cumplir las validaciones definidas para la creación.

**Reglas de negocio:**
- El tipo debe existir.
- Solo se actualizan los campos enviados.
- El código debe continuar siendo único.
- La operación se ejecuta mediante el contexto de auditoría.

**Posibles códigos HTTP:**
- `200 OK`: actualización realizada.
- `400 Bad Request`: UUID o datos inválidos.
- `401 Unauthorized`: token ausente o inválido.
- `403 Forbidden`: rol no autorizado.
- `404 Not Found`: tipo de vehículo inexistente.
- `409 Conflict`: el código ya está registrado.

## 5. Endpoints de vehículos

### 5.1. Listar vehículos

**Método:** `GET`
**Ruta:** `/api/v1/vehicles`
**Autenticación:** JWT
**Roles:** `ADMIN`, `OPERATIONS_MANAGER`, `DRIVER`

**Descripción:** Consulta los vehículos activos registrados en el sistema, incluyendo la relación con su tipo de vehículo.

**Parámetros:** No requiere parámetros.

**Reglas de negocio:**
- Solo se consultan vehículos activos.
- Los resultados se ordenan por placa ascendente.
- Se incluye la información del tipo de vehículo asociado.

**Posibles códigos HTTP:**
- `200 OK`: consulta realizada correctamente.
- `401 Unauthorized`: token ausente o inválido.
- `403 Forbidden`: rol no autorizado.

### 5.2. Consultar vehículo por ID

**Método:** `GET`
**Ruta:** `/api/v1/vehicles/:id`
**Autenticación:** JWT
**Roles:** `ADMIN`, `OPERATIONS_MANAGER`, `DRIVER`

**Descripción:** Consulta un vehículo por su identificador UUID.

**Parámetro de ruta:**

| Parámetro | Tipo | Descripción |
|---|---|---|
| `id` | UUID | Identificador del vehículo. |

**Reglas de negocio:**
- El identificador debe tener formato UUID.
- Se incluye la información del tipo de vehículo asociado.
- Si el vehículo no existe, se genera un error `404 Not Found`.
- A diferencia del listado, esta consulta no filtra los vehículos inactivos.

**Posibles códigos HTTP:**
- `200 OK`: vehículo encontrado.
- `400 Bad Request`: UUID inválido.
- `401 Unauthorized`: token ausente o inválido.
- `403 Forbidden`: rol no autorizado.
- `404 Not Found`: vehículo inexistente.

### 5.3. Registrar vehículo

**Método:** `POST`
**Ruta:** `/api/v1/vehicles`
**Autenticación:** JWT
**Roles:** `ADMIN`, `OPERATIONS_MANAGER`

**Descripción:** Registra un vehículo y lo relaciona con un tipo de vehículo existente.

**Cuerpo de la solicitud:**

```json
{
  "vehicleTypeId": "00000000-0000-4000-8000-000000000001",
  "vehicleStatus": "available",
  "plate": "ABC123",
  "capacityKg": "3500",
  "capacityYd3": "12.5",
  "isActive": true
}
```

**Campos:**

| Campo | Tipo | Obligatorio | Validación |
|---|---|---:|---|
| `vehicleTypeId` | UUID | Sí | Debe corresponder a un tipo de vehículo existente y activo. |
| `vehicleStatus` | enum | Sí | Debe ser un estado permitido. |
| `plate` | string | Sí | Exactamente 6 caracteres; se eliminan espacios externos y se convierte a mayúsculas. |
| `capacityKg` | string | Sí | Debe representar un número decimal no negativo. |
| `capacityYd3` | string | Sí | Debe representar un número decimal no negativo. |
| `isActive` | boolean | No | Si no se envía, se establece en `true`. |

**Estados permitidos:**

| Valor enviado por la API | Significado |
|---|---|
| `available` | Disponible |
| `in_service` | En servicio |
| `maintenance` | En mantenimiento |
| `out_of_service` | Fuera de servicio |

**Reglas de negocio:**
- El tipo de vehículo debe existir y estar activo.
- La placa debe ser única.
- El vehículo se crea activo por defecto.
- Las capacidades se reciben como cadenas numéricas.
- La operación se ejecuta mediante el contexto de auditoría.

**Posibles códigos HTTP:**
- `201 Created`: vehículo registrado.
- `400 Bad Request`: datos inválidos.
- `401 Unauthorized`: token ausente o inválido.
- `403 Forbidden`: rol no autorizado.
- `404 Not Found`: tipo de vehículo inexistente o inactivo.
- `409 Conflict`: ya existe un vehículo con esa placa.

### 5.4. Actualizar vehículo

**Método:** `PATCH`
**Ruta:** `/api/v1/vehicles/:id`
**Autenticación:** JWT
**Roles:** `ADMIN`, `OPERATIONS_MANAGER`

**Descripción:** Actualiza parcialmente la información de un vehículo existente.

**Parámetro de ruta:**

| Parámetro | Tipo | Descripción |
|---|---|---|
| `id` | UUID | Identificador del vehículo. |

**Cuerpo de la solicitud:**

```json
{
  "vehicleStatus": "maintenance",
  "capacityKg": "4000",
  "isActive": true
}
```

Todos los campos son opcionales. Si se envían, deben cumplir las mismas validaciones del registro.

**Reglas de negocio:**
- El vehículo debe existir.
- Solo se actualizan los campos enviados.
- Si se cambia el tipo de vehículo, el nuevo tipo debe existir y estar activo.
- La placa debe continuar siendo única.
- La operación se ejecuta mediante el contexto de auditoría.

**Posibles códigos HTTP:**
- `200 OK`: actualización realizada.
- `400 Bad Request`: UUID o datos inválidos.
- `401 Unauthorized`: token ausente o inválido.
- `403 Forbidden`: rol no autorizado.
- `404 Not Found`: vehículo o tipo de vehículo inexistente.
- `409 Conflict`: la placa ya está registrada.

## 6. Validaciones globales

El proyecto configura un `ValidationPipe` global en `main.ts` con las siguientes opciones:

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }),
);
```

Esto implica:

- `whitelist`: conserva las propiedades que tienen validaciones declaradas en los DTO.
- `forbidNonWhitelisted`: rechaza propiedades adicionales no permitidas.
- `transform`: permite transformar los datos recibidos según la configuración de los DTO.

Por ejemplo, si el cliente envía una propiedad `color` que no está declarada en el DTO de creación de vehículos, la solicitud será rechazada.

## 7. Modelo de datos relacionado

El módulo utiliza dos entidades principales:

### 7.1. Tipo de vehículo (`vehicle_type`)

| Campo | Columna | Descripción |
|---|---|---|
| `id` | `id` | Identificador UUID. |
| `codigo` | `code` | Código único del tipo. |
| `nombre` | `name` | Nombre del tipo. |
| `activo` | `is_active` | Indica si está activo. |
| `creadoEn` | `created_at` | Fecha de creación. |

### 7.2. Vehículo (`vehicle`)

| Campo | Columna | Descripción |
|---|---|---|
| `id` | `id` | Identificador UUID. |
| `tipoVehiculo` | `vehicle_type_id` | Relación con el tipo de vehículo. |
| `estado` | `vehicle_status` | Estado operativo. |
| `placa` | `plate` | Placa del vehículo. |
| `capacidadKg` | `capacity_kg` | Capacidad en kilogramos. |
| `capacidadYd3` | `capacity_yd3` | Capacidad en yardas cúbicas. |
| `activo` | `is_active` | Indica si está activo. |
| `actualizadoEn` | `updated_at` | Fecha de actualización. |
| `creadoEn` | `created_at` | Fecha de creación. |

**Relación:** Un tipo de vehículo puede estar asociado a varios vehículos. Cada vehículo tiene un único tipo de vehículo.

## 8. Auditoría

Las operaciones de creación y actualización utilizan `ContextoAuditoriaService`.

El controlador proporciona al servicio:

- El identificador del usuario autenticado.
- La dirección IP de la solicitud.
- Los datos necesarios para ejecutar la operación dentro del contexto de auditoría.

La estructura exacta del registro de auditoría debe documentarse después de revisar el servicio y el mecanismo de persistencia correspondiente.

## 9. Manejo de errores

El módulo utiliza excepciones de NestJS para comunicar errores:

| Código HTTP | Excepción | Situación |
|---|---|---|
| 400 | `BadRequestException` | Datos o parámetros inválidos. |
| 401 | `UnauthorizedException` | Usuario no autenticado. |
| 403 | `ForbiddenException` | Usuario sin permisos. |
| 404 | `NotFoundException` | Recurso inexistente. |
| 409 | `ConflictException` | Conflicto por registro duplicado. |

No se define aquí un formato JSON personalizado de errores porque todavía debe verificarse el formato efectivo de las respuestas del backend.

## 10. Aspectos pendientes de verificación

Los siguientes puntos deben revisarse antes de considerar definitiva esta documentación:

1. Confirmar la aprobación del modelo de base de datos y de las migraciones correspondientes.
2. Confirmar la matriz definitiva de roles y permisos.
3. Verificar el JSON real de las respuestas mediante pruebas de los endpoints.
4. Documentar el formato definitivo de los registros de auditoría.
5. Revisar el comportamiento de los campos opcionales cuando se recibe `null`.
6. Confirmar cómo se actualiza automáticamente el campo `updated_at`.
7. Definir si las capacidades deben tener límites adicionales, además de aceptar valores numéricos no negativos.

**Importante:** Las migraciones del proyecto todavía están pendientes de aprobación. Las entidades y restricciones descritas representan el estado del código revisado, no una confirmación de que el esquema ya esté desplegado en una base de datos.

## 11. Archivos de referencia

La implementación documentada se encuentra principalmente en:

- `src/vehiculos/vehiculos.controller.ts`
- `src/vehiculos/vehiculos.service.ts`
- `src/vehiculos/dto/crear-tipo-vehiculo.dto.ts`
- `src/vehiculos/dto/actualizar-tipo-vehiculo.dto.ts`
- `src/vehiculos/dto/crear-vehiculo.dto.ts`
- `src/vehiculos/dto/actualizar-vehiculo.dto.ts`
- `src/vehiculos/entities/tipo-vehiculo.entity.ts`
- `src/vehiculos/entities/vehiculo.entity.ts`
- `src/main.ts`
