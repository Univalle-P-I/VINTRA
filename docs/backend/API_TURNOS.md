# API_TURNOS.md

**Proyecto:** VINTRA – Sistema de gestión de recolección de residuos sólidos
**Módulo:** Turnos y horarios
**Ubicación:** `backend/src/turnos/`
**Estado:** Implementación y pruebas unitarias del servicio verificadas.

---

## 1. Descripción general

El módulo de Turnos administra los horarios de operación y su asociación con las microrutas del sistema VINTRA.

Su responsabilidad se divide en dos recursos:

- **Horarios (`schedule`):** permite registrar, consultar, listar, actualizar y activar o desactivar horarios.
- **Asociaciones microruta-horario (`microroute_schedule`):** permite asignar un horario a una microruta para un día de la semana, consultar las asociaciones y modificar su día o estado.

El módulo facilita la organización de la programación operativa de las microrutas de recolección.

## 2. Seguridad y autorización

Todos los endpoints utilizan autenticación JWT y control de roles mediante:

- `JwtAuthGuard`
- `RolesGuard`
- `@Roles()`

El controlador utiliza el prefijo `api/v1`, por lo que todas las rutas se encuentran bajo `/api/v1`.

La documentación Swagger utiliza autenticación Bearer mediante `access-token`.

### 2.1. Matriz de permisos

| Operación | ADMIN | OPERATIONS_MANAGER | DRIVER |
|---|:---:|:---:|:---:|
| Consultar horarios | Sí | Sí | Sí |
| Crear horarios | Sí | Sí | No |
| Actualizar horarios | Sí | Sí | No |
| Consultar asociaciones | Sí | Sí | Sí |
| Crear asociaciones | Sí | Sí | No |
| Actualizar asociaciones | Sí | Sí | No |

Las operaciones de escritura reciben el identificador del usuario autenticado y la IP de la solicitud para establecer el contexto de auditoría.

## 3. Inventario de endpoints

### 3.1. Administración de horarios

| Método | Endpoint | Descripción | Roles |
|---|---|---|---|
| GET | `/api/v1/schedules` | Listar horarios con filtros y paginación. | ADMIN, OPERATIONS_MANAGER, DRIVER |
| GET | `/api/v1/schedules/:id` | Consultar un horario por UUID. | ADMIN, OPERATIONS_MANAGER, DRIVER |
| POST | `/api/v1/schedules` | Crear un horario. | ADMIN, OPERATIONS_MANAGER |
| PATCH | `/api/v1/schedules/:id` | Actualizar un horario. | ADMIN, OPERATIONS_MANAGER |

### 3.2. Asociación de horarios con microrutas

| Método | Endpoint | Descripción | Roles |
|---|---|---|---|
| GET | `/api/v1/microroute-schedules` | Listar asociaciones con filtros. | ADMIN, OPERATIONS_MANAGER, DRIVER |
| POST | `/api/v1/microroute-schedules` | Asociar un horario a una microruta. | ADMIN, OPERATIONS_MANAGER |
| PATCH | `/api/v1/microroute-schedules/:id` | Actualizar el día o estado de una asociación. | ADMIN, OPERATIONS_MANAGER |

No se identificaron endpoints DELETE en este controlador.

## 4. Parámetros de consulta y ruta

### 4.1. Listar horarios

**GET** `/api/v1/schedules`

| Parámetro | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `isActive` | Boolean | No | Filtra horarios activos o inactivos. |
| `page` | Number | No | Página solicitada, comenzando desde 0. |
| `size` | Number | No | Cantidad de registros por página. |

Valores predeterminados:

- `page`: 0.
- `size`: 20.

Ejemplo:

`GET /api/v1/schedules?isActive=true&page=0&size=10`

Respuesta:

```json
{
  "items": [],
  "total": 0,
  "page": 0,
  "size": 10
}
```

El servicio ordena los horarios por hora de inicio ascendente.

No se encontró un límite máximo para `size` en el DTO.

### 4.2. Consultar un horario

**GET** `/api/v1/schedules/:id`

| Parámetro | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `id` | UUID | Sí | Identificador del horario. |

Se utiliza `ParseUUIDPipe` para validar el identificador.

### 4.3. Listar asociaciones

**GET** `/api/v1/microroute-schedules`

| Parámetro | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `isActive` | Boolean | No | Filtra asociaciones activas o inactivas. |
| `dayOfWeek` | Number | No | Filtra por día de la semana. |

El DTO acepta enteros entre -32768 y 32767 para `dayOfWeek`, aunque las operaciones de creación y actualización restringen el valor entre 1 y 7.

El servicio incluye las relaciones de microruta y horario, y ordena los resultados por día ascendente.

Este endpoint no implementa paginación.

### 4.4. Parámetros de identificador en actualización

- `PATCH /api/v1/schedules/:id`
- `PATCH /api/v1/microroute-schedules/:id`

Ambos utilizan `ParseUUIDPipe`.

## 5. DTO y validaciones

### 5.1. Crear horario – `CrearHorarioDto`

Archivo: `dto/crear-horario.dto.ts`

| Campo | Tipo | Obligatorio | Validaciones |
|---|---|---|---|
| `name` | String | No | Trim, mínimo 1 carácter y máximo 20. |
| `startTime` | String | Sí | Formato `HH:mm` o `HH:mm:ss`. |
| `endTime` | String | Sí | Formato `HH:mm` o `HH:mm:ss`. |

La expresión regular de las horas restringe:

- Horas: 00–23.
- Minutos: 00–59.
- Segundos: 00–59, cuando se incluyen.

El nombre se transforma mediante `trim()`. Si se omite o se envía como `null`, el servicio almacena `null`. Una cadena vacía o compuesta solo por espacios no supera la validación de longitud mínima.

### 5.2. Actualizar horario – `ActualizarHorarioDto`

Archivo: `dto/actualizar-horario.dto.ts`

Todos los campos son opcionales.

| Campo | Tipo | Validaciones |
|---|---|---|
| `name` | String | Trim y mínimo 1 carácter. |
| `startTime` | String | Formato `HH:mm` o `HH:mm:ss`. |
| `endTime` | String | Formato `HH:mm` o `HH:mm:ss`. |
| `isActive` | Boolean | Valor booleano. |

Permite modificar individualmente el nombre, las horas o el estado del horario.

El DTO no establece una validación que exija al menos un campo. Por ello, un objeto vacío puede superar sus validaciones.

### 5.3. Consultar horarios – `ConsultarTurnosDto`

Archivo: `dto/consultar-turnos.dto.ts`

| Campo | Tipo | Validaciones |
|---|---|---|
| `isActive` | Boolean | Transforma los textos `true` y `false` en booleanos. |
| `page` | Number | Entero mayor o igual a 0. |
| `size` | Number | Entero mayor o igual a 1. |

La conversión de `page` y `size` se realiza mediante `@Type(() => Number)`.

### 5.4. Crear asociación – `CrearMicrorutaHorarioDto`

Archivo: `dto/crear-microruta-horario.dto.ts`

| Campo | Tipo | Obligatorio | Validaciones |
|---|---|---|---|
| `microrouteId` | UUID | Sí | Identificador válido de microruta. |
| `scheduleId` | UUID | Sí | Identificador válido de horario. |
| `dayOfWeek` | Number | Sí | Entero entre 1 y 7. |

### 5.5. Actualizar asociación – `ActualizarMicrorutaHorarioDto`

Archivo: `dto/actualizar-microruta-horario.dto.ts`

| Campo | Tipo | Validaciones |
|---|---|---|
| `dayOfWeek` | Number | Opcional, entero entre 1 y 7. |
| `isActive` | Boolean | Opcional, booleano. |

No permite modificar la microruta ni el horario relacionado.

Tampoco exige que se envíe al menos un campo.

### 5.6. Consultar asociaciones – `ConsultarMicrorutaHorariosDto`

Archivo: `dto/consultar-microruta-horarios.dto.ts`

| Campo | Tipo | Validaciones |
|---|---|---|
| `isActive` | Boolean | Opcional, transforma `true` y `false`. |
| `dayOfWeek` | Number | Opcional, entero entre -32768 y 32767. |

**Observación:** el rango de consulta es más amplio que el rango permitido al crear o actualizar asociaciones. Se recomienda evaluar si conviene restringir también el filtro a los valores 1–7.

## 6. Lógica de negocio – `TurnosService`

Archivo: `turnos.service.ts`

### 6.1. Listar horarios

Método: `listar()`

- Aplica los filtros recibidos.
- Utiliza `findAndCount()` para recuperar registros y total.
- Ordena por `horaInicio` ascendente.
- Implementa paginación con `skip` y `take`.
- Utiliza página inicial 0 y tamaño predeterminado 20.

### 6.2. Obtener horario

Método: `obtener()`

Busca el horario por su identificador.

Si no existe, lanza `NotFoundException` con el mensaje `El horario no existe.`.

### 6.3. Crear horario

Método: `crear()`

- Valida que la hora final sea posterior a la inicial.
- Establece el nombre recibido o `null`.
- Guarda el horario con estado activo.
- Ejecuta la operación mediante `ContextoAuditoriaService`.

### 6.4. Actualizar horario

Método: `actualizar()`

- Busca el horario.
- Si no existe, devuelve 404.
- Combina los valores enviados con los existentes.
- Valida el rango horario resultante.
- Actualiza únicamente los campos enviados.
- Guarda mediante el contexto de auditoría.

### 6.5. Listar asociaciones

Método: `listarMicrorutaHorarios()`

- Utiliza `QueryBuilder`.
- Incluye las relaciones `microruta` y `horario`.
- Filtra por estado y día cuando se proporcionan.
- Ordena por `diaSemana` ascendente.
- Devuelve un arreglo sin paginación.

### 6.6. Crear asociación

Método: `crearMicrorutaHorario()`

Antes de guardar:

1. Busca la microruta indicada.
2. Comprueba que exista.
3. Busca el horario indicado y exige que esté activo.
4. Crea la asociación con el día recibido.
5. Establece el estado activo.

La operación se ejecuta dentro del contexto de auditoría.

Si PostgreSQL informa una violación de unicidad (`23505`), se transforma en `ConflictException` (409).

### 6.7. Actualizar asociación

Método: `actualizarMicrorutaHorario()`

- Busca la asociación.
- Si no existe, devuelve 404.
- Permite cambiar el día.
- Permite activar o desactivar la asociación.
- Guarda dentro del contexto de auditoría.
- Convierte las violaciones de unicidad en conflictos HTTP 409.

No permite reasignar la asociación a otra microruta u horario.

## 7. Reglas de negocio

### 7.1. Rango horario

El método privado `validarRangoHorario()` convierte las horas a segundos para compararlas.

La hora final debe ser estrictamente posterior a la hora inicial.

| Inicio | Fin | Resultado |
|---|---|---|
| 06:00 | 14:00 | Válido |
| 08:30 | 08:30 | Inválido |
| 15:00 | 10:00 | Inválido |

La validación se realiza en el servicio y también se declara una restricción `CHECK` en la entidad.

### 7.2. Estado de los horarios

Los horarios se crean activos.

Pueden desactivarse mediante `PATCH /api/v1/schedules/:id`.

El servicio exige que el horario esté activo al crear una asociación nueva.

No se encontró en el servicio una validación que impida desactivar un horario que ya tenga asociaciones existentes.

### 7.3. Días de la semana

Las asociaciones aceptan valores entre 1 y 7.

La entidad declara una restricción `CHECK` con ese rango.

La correspondencia de cada número con un día específico debe confirmarse con la convención funcional del proyecto.

### 7.4. Unicidad

La entidad declara una restricción única para la combinación:

- Microruta.
- Horario.
- Día de la semana.

La finalidad es impedir asociaciones duplicadas para esa combinación.

La violación de unicidad se transforma en HTTP 409.

### 7.5. Estado de la asociación

La asociación cuenta con un estado propio (`is_active`).

Desactivar una asociación no implica desactivar el horario ni la microruta.

## 8. Entidades y relaciones

### 8.1. Entidad `Horario`

Archivo: `entidades/horario.entity.ts`

Tabla: `schedule`

| Propiedad | Columna | Tipo |
|---|---|---|
| `id` | `id` | UUID |
| `nombre` | `name` | VARCHAR(20), nullable |
| `horaInicio` | `start_time` | TIME |
| `horaFin` | `end_time` | TIME |
| `activo` | `is_active` | BOOLEAN |
| `actualizadoEn` | `updated_at` | TIMESTAMPTZ |
| `creadoEn` | `created_at` | TIMESTAMPTZ |

Restricción declarada:

`ck_schedule_time_range`: `end_time > start_time`.

### 8.2. Entidad `MicrorutaHorario`

Archivo: `entidades/microruta-horario.entity.ts`

Tabla: `microroute_schedule`

| Propiedad | Columna | Tipo |
|---|---|---|
| `id` | `id` | UUID |
| `microruta` | `microroute_id` | Relación ManyToOne |
| `horario` | `schedule_id` | Relación ManyToOne |
| `diaSemana` | `day_of_week` | SMALLINT |
| `activo` | `is_active` | BOOLEAN |
| `actualizadoEn` | `updated_at` | TIMESTAMPTZ |
| `creadoEn` | `created_at` | TIMESTAMPTZ |

Ambas relaciones son obligatorias (`nullable: false`).

Restricciones e índices declarados:

- `fk_microroute_schedule_microroute`.
- `fk_microroute_schedule_schedule`.
- `uq_microroute_schedule`.
- `ck_microroute_schedule_day_of_week`.
- `idx_microroute_schedule_microroute_id`.
- `idx_microroute_schedule_schedule_id`.

La entidad establece que una asociación pertenece a una microruta y a un horario.

### 8.3. Relaciones conceptuales

- Una microruta puede tener varias asociaciones de horarios.
- Un horario puede estar asociado a distintas microrutas.
- Cada asociación representa la combinación de microruta, horario y día.

## 9. Auditoría

Las operaciones de escritura utilizan `ContextoAuditoriaService.ejecutar(actorId, ip, callback)`.

El controlador obtiene:

- `actor.userId` mediante `@UsuarioAutenticado()`.
- La dirección IP mediante `@Ip()`.

El servicio ejecuta las operaciones utilizando el administrador transaccional recibido.

Este mecanismo proporciona el contexto de auditoría para las operaciones. No debe interpretarse como evidencia de que el servicio inserta directamente registros de auditoría.

La generación efectiva de registros depende de los mecanismos de auditoría y de la configuración de base de datos correspondientes.

## 10. Manejo de errores

| Código HTTP | Significado | Situaciones identificadas |
|---|---|---|
| 200 | OK | Consultas y actualizaciones exitosas. |
| 201 | Created | Creación de horario o asociación. |
| 400 | Bad Request | UUID inválido, DTO inválido o rango horario incorrecto. |
| 401 | Unauthorized | JWT ausente o inválido. |
| 403 | Forbidden | Rol sin permisos. |
| 404 | Not Found | Horario, microruta o asociación inexistente; horario inactivo al intentar asociarlo. |
| 409 | Conflict | Asociación duplicada para la misma microruta, horario y día. |

## 11. Pruebas unitarias

**Archivo:** `src/turnos/turnos.service.spec.ts`

Se identificó una suite de pruebas unitarias para `TurnosService`, implementada con Jest.

Las pruebas utilizan repositorios simulados (*mocks*) y un contexto de auditoría simulado. Por tanto, verifican la lógica del servicio sin requerir conexión a PostgreSQL.

### 11.1. Resultado de ejecución

Comando ejecutado desde la carpeta `backend`:

```powershell
npm test -- --runInBand src/turnos/turnos.service.spec.ts
```

**Resultado reportado por Jest:**

| Indicador | Resultado |
|---|---:|
| Suites aprobadas | 1 |
| Suites fallidas | 0 |
| Pruebas aprobadas | 18 |
| Pruebas fallidas | 0 |
| Snapshots | 0 |
| Tiempo de ejecución | 3.103 s |

**Estado:** todas las pruebas de la suite finalizaron satisfactoriamente.

### 11.2. Cobertura funcional identificada

| Grupo de pruebas | Casos verificados |
|---|---|
| `listar` | Filtrado por estado, paginación y valores predeterminados. |
| `obtener` | Consulta por ID y manejo de horario inexistente. |
| `crear` | Creación de horario activo, nombre nulo y rechazo de rangos inválidos. |
| `actualizar` | Actualización parcial, horario inexistente y validación del rango resultante. |
| `listarMicrorutaHorarios` | Carga de relaciones, filtros y ordenamiento. |
| `crearMicrorutaHorario` | Creación de asociación, microruta inexistente, horario inexistente o inactivo y conflicto de unicidad. |
| `actualizarMicrorutaHorario` | Actualización parcial, asociación inexistente y conflicto de unicidad. |

### 11.3. Alcance y limitaciones

El resultado demuestra que los 18 casos reportados por Jest pasaron en la ejecución indicada.

Sin embargo, estas son pruebas unitarias, no pruebas de integración con PostgreSQL.

En particular:

- Las consultas a los repositorios se simulan.
- El contexto de auditoría se simula.
- La violación `23505` se representa mediante un error simulado.
- No se verifica que las restricciones de la base de datos estén desplegadas o funcionando.
- No se valida la integración real entre el controlador, los guards, los DTO y PostgreSQL.

Queda como posible ampliación incorporar pruebas específicas de controladores y DTO, así como pruebas de integración cuando el esquema de base de datos correspondiente esté aprobado y disponible.

## 12. Archivos relacionados

| Archivo | Responsabilidad |
|---|---|
| `turnos.controller.ts` | Define los endpoints y permisos. |
| `turnos.service.ts` | Implementa la lógica de negocio. |
| `turnos.module.ts` | Registra e integra los componentes del módulo. |
| `dto/crear-horario.dto.ts` | Valida la creación de horarios. |
| `dto/actualizar-horario.dto.ts` | Valida la actualización de horarios. |
| `dto/consultar-turnos.dto.ts` | Valida filtros y paginación. |
| `dto/crear-microruta-horario.dto.ts` | Valida la creación de asociaciones. |
| `dto/actualizar-microruta-horario.dto.ts` | Valida la actualización de asociaciones. |
| `dto/consultar-microruta-horarios.dto.ts` | Valida filtros de asociaciones. |
| `entidades/horario.entity.ts` | Representa la tabla `schedule`. |
| `entidades/microruta-horario.entity.ts` | Representa la tabla `microroute_schedule`. |
| `turnos.service.spec.ts` | Contiene las pruebas unitarias del servicio. |

## 13. Observaciones y pendientes

1. Las migraciones relacionadas con el esquema de VINTRA continúan pendientes de aprobación. Las entidades describen el mapeo previsto, pero no demuestran que las restricciones e índices estén desplegados.
2. La configuración del proyecto mantiene `synchronize: false`; no debe modificarse para resolver pruebas.
3. Las entidades declaran `updated_at` con valor predeterminado, pero no utilizan `@UpdateDateColumn()`. Por ello, no se debe asumir que se actualiza automáticamente en cada modificación.
4. El DTO de consulta de asociaciones acepta un rango de días más amplio que los DTO de creación y actualización.
5. Los DTO de actualización permiten recibir objetos vacíos.
6. No se identificaron endpoints para eliminar horarios o asociaciones.
7. No se confirmó en el código inspeccionado qué número representa cada día de la semana.
8. La ejecución satisfactoria de las pruebas unitarias no sustituye las pruebas de integración con la base de datos.

---

**Conclusión:** El módulo Turnos cuenta con endpoints para administrar horarios y asociarlos a microrutas. Su lógica de servicio dispone de una suite de pruebas unitarias cuya última ejecución reportada fue satisfactoria: 1 suite y 18 pruebas aprobadas. La validación de integración con la base de datos queda pendiente.