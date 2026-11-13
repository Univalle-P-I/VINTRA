# API de Auditoría – VINTRA

## 1. Descripción general

El módulo de Auditoría permite consultar los registros históricos de las operaciones realizadas sobre los recursos principales del sistema VINTRA.

Su propósito es facilitar la trazabilidad de las acciones realizadas por los usuarios, permitiendo identificar:

- El registro sobre el que se realizó una operación.
- El usuario que ejecutó la acción.
- El tipo de acción realizada.
- La dirección IP desde la que se efectuó la solicitud.
- La fecha y hora del evento.

El módulo permite consultar los registros de auditoría mediante endpoints protegidos, con paginación y selección del recurso que se desea consultar.

**Importante:** La implementación del backend está desarrollada, pero la existencia definitiva de las tablas de auditoría y la generación automática de sus registros dependen del esquema y las migraciones que todavía están pendientes de aprobación.

## 2. Seguridad y control de acceso

Los endpoints del módulo están protegidos mediante autenticación JWT y autorización por roles.

| Mecanismo | Responsabilidad |
|---|---|
| `JwtAuthGuard` | Verifica la autenticación mediante JWT. |
| `RolesGuard` | Comprueba que el usuario tenga el rol requerido. |
| `@Roles(RolUsuario.ADMIN)` | Restringe el acceso al rol ADMIN. |

**Rol autorizado:** `ADMIN`.

Los usuarios sin autenticación válida no pueden acceder al endpoint. Los usuarios autenticados que no tengan el rol ADMIN tampoco están autorizados.

## 3. Inventario de endpoints

### 3.1 Consultar registros de auditoría

| Propiedad | Descripción |
|---|---|
| Método | GET |
| Ruta | `/api/v1/audit-logs/:resource` |
| Autenticación | JWT Bearer |
| Rol permitido | ADMIN |
| Respuesta esperada | 200 OK |
| Errores documentados | 400, 401, 403 |

**Descripción:**

Permite consultar los registros históricos de auditoría asociados a un recurso específico del sistema. La respuesta incluye los registros encontrados, el total de registros y los datos de paginación.

**Parámetro de ruta:**

| Parámetro | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `resource` | Enum | Sí | Identifica el recurso cuya auditoría se desea consultar. |

**Recursos permitidos:**

| Valor | Tabla asociada |
|---|---|
| `user-accounts` | `user_account_log` |
| `user-data` | `user_data_log` |
| `profiles` | `profile_log` |
| `drivers` | `driver_log` |
| `crews` | `crew_log` |
| `crew-members` | `crew_member_log` |
| `macroroutes` | `macroroute_log` |
| `microroutes` | `microroute_log` |
| `vehicles` | `vehicle_log` |
| `assignments` | `assignment_log` |

Los valores corresponden al enum `RecursoAuditoria`, definido en `auditoria.service.ts`.

**Parámetros de consulta:**

| Parámetro | Tipo | Obligatorio | Valor predeterminado | Validaciones |
|---|---|---|---|---|
| `page` | Number | No | 1 | Entero, mínimo 1. |
| `limit` | Number | No | 50 | Entero, mínimo 1 y máximo 100. |

**Ejemplo de solicitud:**

```http
GET /api/v1/audit-logs/vehicles?page=1&limit=10
Authorization: Bearer <access_token>
```

**Ejemplo de respuesta exitosa:**

```json
{
  "items": [
    {
      "id": "uuid-del-registro-de-auditoria",
      "entityId": "uuid-del-vehiculo",
      "actorId": "uuid-del-usuario",
      "action": "UPDATE",
      "requestIp": "192.0.2.10",
      "createdAt": "2026-11-12T14:30:00.000Z"
    }
  ],
  "total": 25,
  "page": 1,
  "limit": 10
}
```

La respuesta es ilustrativa y representa la estructura construida por el servicio. Los valores reales dependen de los registros existentes.

**Consideración:** La respuesta no incluye los campos `old_values` ni `new_values`. El servicio selecciona únicamente los campos `id`, `entity_id`, `actor_id`, `action`, `request_ip` y `created_at`.

## 4. DTO y validaciones

### ConsultarAuditoriaDto

Archivo: `src/auditoria/dto/consultar-auditoria.dto.ts`

Este DTO controla los parámetros de paginación recibidos mediante la URL.

| Campo | Decoradores | Comportamiento |
|---|---|---|
| `page` | `@Type(() => Number)`, `@IsInt()`, `@Min(1)` | Convierte a número y exige un entero mayor o igual a 1. |
| `limit` | `@Type(() => Number)`, `@IsInt()`, `@Min(1)`, `@Max(100)` | Convierte a número y exige un entero entre 1 y 100. |

Los valores predeterminados son:

- `page = 1`
- `limit = 50`

Ejemplos:

| Valor recibido | Resultado |
|---|---|
| `page=1` | Válido |
| `page=2` | Válido |
| `page=0` | Inválido |
| `page=-1` | Inválido |
| `page=1.5` | Inválido |
| `limit=50` | Válido |
| `limit=100` | Válido |
| `limit=150` | Inválido |
| `limit=0` | Inválido |

La transformación de los parámetros se realiza mediante `class-transformer`, mientras que las reglas de validación se implementan con `class-validator`.

## 5. Lógica del servicio

Archivo: `src/auditoria/auditoria.service.ts`

La clase `AuditoriaService` utiliza `DataSource` de TypeORM para ejecutar consultas SQL directamente sobre las tablas de auditoría.

### 5.1 Selección de la tabla

El servicio utiliza un mapa de recursos permitidos:

```typescript
const tablasPorRecurso: Record<RecursoAuditoria, string> = {
  [RecursoAuditoria.CUENTAS]: 'user_account_log',
  [RecursoAuditoria.DATOS_USUARIO]: 'user_data_log',
  [RecursoAuditoria.PERFILES]: 'profile_log',
  [RecursoAuditoria.CONDUCTORES]: 'driver_log',
  [RecursoAuditoria.CUADRILLAS]: 'crew_log',
  [RecursoAuditoria.INTEGRANTES]: 'crew_member_log',
  [RecursoAuditoria.MACRORUTAS]: 'macroroute_log',
  [RecursoAuditoria.MICRORUTAS]: 'microroute_log',
  [RecursoAuditoria.VEHICULOS]: 'vehicle_log',
  [RecursoAuditoria.ASIGNACIONES]: 'assignment_log',
};
```

Este mecanismo limita los nombres de las tablas que pueden utilizarse en las consultas.

Si el recurso no está permitido, el servicio genera una excepción `BadRequestException`, correspondiente al código HTTP 400.

### 5.2 Cálculo de paginación

El servicio calcula el desplazamiento mediante:

```typescript
const offset = (page - 1) * limit;
```

Por ejemplo, para la página 2 y un límite de 10 registros:

```text
offset = (2 - 1) * 10
offset = 10
```

Esto permite recuperar los registros correspondientes a la página solicitada.

### 5.3 Consulta de registros

La consulta obtiene los registros de la tabla correspondiente, ordenados desde el más reciente:

```sql
SELECT id, entity_id, actor_id, action, request_ip, created_at
FROM vehicle_log
ORDER BY created_at DESC
LIMIT $1 OFFSET $2;
```

Los parámetros `LIMIT` y `OFFSET` se envían mediante parámetros SQL, evitando concatenar sus valores directamente en la consulta.

### 5.4 Conteo de registros

Se ejecuta una segunda consulta para obtener el total de registros:

```sql
SELECT COUNT(*)::text AS total
FROM vehicle_log;
```

El resultado se convierte a número y se incorpora a la respuesta paginada.

### 5.5 Transformación de resultados

El servicio adapta los nombres de las columnas de la base de datos al formato utilizado en la respuesta de la API.

| Columna en PostgreSQL | Campo en la API |
|---|---|
| `id` | `id` |
| `entity_id` | `entityId` |
| `actor_id` | `actorId` |
| `action` | `action` |
| `request_ip` | `requestIp` |
| `created_at` | `createdAt` |

El servicio no devuelve snapshots de valores anteriores o posteriores a la operación.

## 6. Contexto de auditoría y trazabilidad

El módulo de Auditoría se complementa con `ContextoAuditoriaService`, ubicado en:

`src/comun/contexto-auditoria.service.ts`

Este servicio se utiliza en las operaciones de escritura de otros módulos, como Vehículos.

Su función es:

1. Iniciar una transacción de base de datos.
2. Establecer el identificador del usuario que ejecuta la operación.
3. Establecer la dirección IP de la solicitud.
4. Ejecutar la operación utilizando el `EntityManager` de la transacción.

Las variables de contexto configuradas son:

```sql
app.current_user_id
app.request_ip
```

Se utiliza `set_config` con el tercer argumento en `true`, por lo que los valores quedan asociados a la transacción actual.

**Importante:** `ContextoAuditoriaService` prepara el contexto de ejecución, pero no inserta por sí mismo los registros de auditoría. Para generar los registros se requiere un mecanismo adicional en PostgreSQL, como funciones y triggers, cuya implementación definitiva debe verificarse con las migraciones aprobadas.

## 7. Manejo de errores

| Código HTTP | Situación |
|---|---|
| 400 Bad Request | Recurso no permitido o parámetros de paginación inválidos. |
| 401 Unauthorized | JWT ausente, inválido o revocado. |
| 403 Forbidden | Usuario autenticado sin el rol ADMIN. |

El servicio utiliza `BadRequestException` cuando el recurso recibido no está incluido en el mapa de tablas permitidas.

El controlador utiliza `ParseEnumPipe` para validar el parámetro `resource` antes de invocar el servicio.

## 8. Reglas de negocio y consideraciones técnicas

1. Solo los usuarios con rol ADMIN pueden consultar los registros de auditoría.
2. Los recursos consultables están limitados a los valores definidos en `RecursoAuditoria`.
3. La consulta utiliza paginación para controlar la cantidad de registros devueltos.
4. El límite máximo por página es de 100 registros.
5. Los registros se ordenan por fecha de creación descendente.
6. La respuesta no expone los snapshots `old_values` y `new_values`.
7. Los nombres de las tablas proceden de una lista fija de recursos permitidos.
8. La generación de registros de auditoría depende de mecanismos adicionales de persistencia en PostgreSQL.

## 9. Pruebas unitarias

Archivo: `src/auditoria/auditoria.service.spec.ts`

El servicio cuenta con cuatro pruebas unitarias que verifican los siguientes comportamientos:

| Prueba | Comportamiento comprobado |
|---|---|
| Consulta de recurso permitido | Comprueba la consulta de la tabla correspondiente y la exclusión de snapshots. |
| Lista permitida de tablas | Verifica la correspondencia de los diez recursos con sus tablas. |
| Paginación y resultados vacíos | Comprueba el cálculo del offset y la respuesta cuando no existen registros. |
| Recurso no permitido | Comprueba que se genere un error 400 sin consultar la base de datos. |

Según el informe de ejecución de pruebas del proyecto, las cuatro pruebas de Auditoría finalizaron correctamente.

Estas pruebas son unitarias y utilizan un `DataSource` simulado. No comprueban la existencia real de las tablas ni la generación de registros mediante triggers en PostgreSQL.

## 10. Archivos relacionados

| Archivo | Responsabilidad |
|---|---|
| `src/auditoria/auditoria.module.ts` | Declaración del módulo de Auditoría. |
| `src/auditoria/auditoria.controller.ts` | Definición de rutas y control de acceso. |
| `src/auditoria/auditoria.service.ts` | Consultas y transformación de registros. |
| `src/auditoria/dto/consultar-auditoria.dto.ts` | Validación de parámetros de paginación. |
| `src/auditoria/auditoria.service.spec.ts` | Pruebas unitarias del servicio. |
| `src/comun/contexto-auditoria.service.ts` | Configuración del contexto de auditoría en transacciones. |
| `src/comun/comun.module.ts` | Registro y exportación del servicio de contexto. |

## 11. Pendientes y aspectos por confirmar

Debido a que las migraciones de VINTRA todavía están pendientes de aprobación, deben verificarse los siguientes puntos antes de considerar integrada la funcionalidad completa:

- Existencia definitiva de las diez tablas de auditoría.
- Estructura y tipos de datos de sus columnas.
- Implementación y funcionamiento de funciones y triggers de auditoría.
- Correspondencia entre los nombres de las variables de contexto y las funciones de PostgreSQL.
- Generación efectiva de registros para las operaciones de los módulos correspondientes.
- Pruebas de integración con una base de datos de desarrollo que utilice el esquema aprobado.

También se puede considerar como mejora futura incorporar un criterio secundario de ordenamiento para estabilizar la paginación cuando varios registros tengan la misma fecha de creación.

---

**Estado de la documentación:** describe la implementación revisada del backend y diferencia los mecanismos existentes de los elementos de persistencia pendientes de aprobación.