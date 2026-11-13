# Mapeo TypeORM y referencia provisional de base de datos

> **Estado del diseño:** el PR #115 permanece abierto y pendiente de aprobación. Sus DER, diccionario y migraciones se utilizan aquí como referencia técnica provisional; no representan un esquema aprobado, desplegado ni definitivo.

## 1. Alcance y criterio de lectura

Este documento describe primero el mapeo declarado actualmente por las entidades TypeORM de `backend/src` y señala los aspectos del diseño propuesto en el PR #115 que requieren validación. Los nombres de tabla, columna, tipo, relación, nulabilidad, restricciones e índices descritos como implementados corresponden al código actual, no a una introspección de una base de datos.

Salvo que se indique `NULL`, las columnas de entidad son obligatorias. Los valores predeterminados y restricciones enumerados reflejan los decoradores TypeORM; cuando se cita una migración del PR, se identifica como propuesta provisional. Mantener `synchronize: false` y no aplicar esas migraciones hasta su aprobación.

La migración 030 propuesta en el PR #115 define `fn_set_updated_at()` y triggers para `user_account`, `user_data`, `vehicle`, `macroroute`, `microroute`, `btura_neighborhood`, `schedule`, `microroute_schedule`, `crew`, `crew_member`, `driver` y `assignment`. Las entidades declaran `updated_at` con default `now()`, pero no con `@UpdateDateColumn`; el refresco en cada actualización dependería de esos triggers una vez aprobados y desplegados.

## 2. Usuarios y autenticación

Este conjunto de tablas almacena la información de las cuentas, los datos personales, los perfiles de acceso y los mecanismos de autenticación y seguridad.

### 2.1. Tabla `user_account`

**Entidad:** `CuentaUsuario`

**Responsabilidad:** almacenar la información principal de la cuenta, las credenciales y los controles de seguridad.

| Columna SQL | Propiedad TypeScript | Tipo PostgreSQL |
|---|---|---|
| `id` | `id` | UUID, PK |
| `user_status` | `estado` | ENUM `user_status_enum` (`ACTIVE`, `INACTIVE`, `LOCKED`, `PENDING_VERIFICATION`) |
| `document_type` | `tipoDocumento` | ENUM `document_type_enum` (`CC`) |
| `document_id` | `numeroDocumento` | CHAR(20) |
| `pwd_hash` | `hashContrasena` | TEXT |
| `failed_attempts` | `intentosFallidos` | SMALLINT, default 0 |
| `locked_until` | `bloqueadoHasta` | TIMESTAMPTZ NULL |
| `last_login_at` | `ultimoInicioSesion` | TIMESTAMPTZ NULL |
| `password_changed_at` | `contrasenaActualizadaEn` | TIMESTAMPTZ NULL |
| `updated_at` | `actualizadoEn` | TIMESTAMPTZ, default `now()` |
| `created_at` | `creadoEn` | TIMESTAMPTZ, default `now()` |

**Restricciones declaradas:** PK `user_account_pkey`; UNIQUE `uq_user_account_document` sobre (`document_type`, `document_id`); CHECK `ck_user_account_failed_attempts` (`failed_attempts >= 0`).

Los valores de los enums se almacenan en mayúsculas. `EstadoUsuario` expone valores TypeScript en minúsculas y usa un transformer para mapearlos al enum `user_status_enum`; `TipoDocumento.CC` se almacena como `CC`.

### 2.2. Tabla `user_data`

**Entidad:** `DatosUsuario`

**Responsabilidad:** almacenar los datos personales y de contacto asociados a una cuenta.

| Columna SQL | Propiedad TypeScript | Tipo PostgreSQL |
|---|---|---|
| `id` | `id` | UUID, PK y FK |
| `first_name` | `nombres` | VARCHAR(80) |
| `last_name` | `apellidos` | VARCHAR(80) |
| `email` | `correo` | VARCHAR(254) |
| `phone` | `telefono` | VARCHAR(20) NULL |
| `email_verified_at` | `correoVerificadoEn` | TIMESTAMPTZ NULL |
| `updated_at` | `actualizadoEn` | TIMESTAMPTZ, default `now()` |
| `created_at` | `creadoEn` | TIMESTAMPTZ, default `now()` |

**Clave primaria:** `id`.

**Clave foránea:** `id` referencia `user_account.id`.

**Relación:** uno a uno (`OneToOne`). La entidad `DatosUsuario` declara `@JoinColumn` sobre `id`, porque utiliza el mismo identificador de la cuenta como clave primaria y foránea. La FK obliga a que cada fila `user_data` tenga una cuenta; la FK no obliga a que toda cuenta tenga una fila `user_data`.

**Restricción declarada:** UNIQUE `uq_user_data_email` sobre `email`.

### 2.3. Tabla `profile`

**Entidad:** `Perfil`

**Responsabilidad:** asociar una cuenta de usuario con un rol y registrar el estado de su perfil.

| Columna SQL | Propiedad TypeScript | Tipo PostgreSQL |
|---|---|---|
| `id` | `id` | UUID, PK |
| `user_account_id` | `cuentaUsuario` | UUID (FK, obligatorio) |
| `user_role` | `rol` | ENUM `user_role` (`ADMIN`, `OP`, `DRIVER`) |
| `is_active` | `activo` | BOOLEAN, default TRUE |
| `created_at` | `creadoEn` | TIMESTAMPTZ, default `now()` |

**Clave primaria:** `id`.

**Clave foránea:** `user_account_id` referencia `user_account.id`.

**Relación:** muchos a uno (`ManyToOne`) desde `Perfil` hacia `CuentaUsuario`.

**Restricciones e índice declarados:** UNIQUE `uq_profile_account_role` sobre (`user_account_id`, `user_role`); índice `idx_profile_user_account_id`. El transformer de `RolUsuario.OPERATIONS_MANAGER` almacena `OP`.

### 2.4. Tabla `session`

**Entidad:** `Sesion`

**Responsabilidad:** almacenar información de las sesiones de usuario y controlar su vigencia y revocación.

| Columna SQL | Propiedad TypeScript | Tipo PostgreSQL |
|---|---|---|
| `id` | `id` | UUID, PK |
| `user_account_id` | `cuentaUsuario` | UUID (FK, obligatorio) |
| `token_hash` | `hashToken` | CHAR(64) |
| `request_ip` | `ipSolicitud` | INET |
| `revoked_at` | `revocadoEn` | TIMESTAMPTZ NULL |
| `last_used_at` | `ultimoUsoEn` | TIMESTAMPTZ NULL |
| `expires_at` | `expiraEn` | TIMESTAMPTZ |
| `created_at` | `creadoEn` | TIMESTAMPTZ, default `now()` |

**Clave primaria:** `id`.

**Clave foránea:** `user_account_id` referencia `user_account.id`.

**Relación:** muchos a uno (`ManyToOne`) desde `Sesion` hacia `CuentaUsuario`.

**Restricciones e índices declarados:** UNIQUE `uq_session_token_hash`; CHECK `ck_session_expires_at` (`expires_at > created_at`); índices `idx_session_user_account_id` y `idx_session_expires_at`.

### 2.5. Tabla `password_reset_token`

**Entidad:** `TokenRecuperacion`

**Responsabilidad:** almacenar la información de los tokens utilizados en el proceso de recuperación de contraseñas.

| Columna SQL | Propiedad TypeScript | Tipo PostgreSQL |
|---|---|---|
| `id` | `id` | UUID, PK |
| `user_account_id` | `cuentaUsuario` | UUID (FK, obligatorio) |
| `token_hash` | `hashToken` | CHAR(64) |
| `request_ip` | `ipSolicitud` | INET NULL |
| `used_at` | `utilizadoEn` | TIMESTAMPTZ NULL |
| `expires_at` | `expiraEn` | TIMESTAMPTZ |
| `created_at` | `creadoEn` | TIMESTAMPTZ, default `now()` |

**Clave primaria:** `id`.

**Clave foránea:** `user_account_id` referencia `user_account.id`.

**Relación:** muchos a uno (`ManyToOne`) desde `TokenRecuperacion` hacia `CuentaUsuario`.

**Restricciones e índices declarados:** UNIQUE `uq_password_reset_token_hash`; CHECK `ck_password_reset_token_expires_at` (`expires_at > created_at`); índices `idx_password_reset_token_user_account_id` y `idx_password_reset_token_expires_at`.

### 2.6. Tabla `email_validation_token`

**Entidad:** `TokenValidacionCorreo`

**Responsabilidad:** almacenar la información de los tokens utilizados para validar el correo electrónico de un usuario.

| Columna SQL | Propiedad TypeScript | Tipo PostgreSQL |
|---|---|---|
| `id` | `id` | UUID, PK |
| `user_data_id` | `datosUsuario` | UUID (FK, obligatorio) |
| `email` | `correo` | VARCHAR(254) |
| `token_hash` | `hashToken` | CHAR(64) |
| `request_ip` | `ipSolicitud` | INET NULL |
| `used_at` | `utilizadoEn` | TIMESTAMPTZ NULL |
| `expires_at` | `expiraEn` | TIMESTAMPTZ |
| `created_at` | `creadoEn` | TIMESTAMPTZ, default `now()` |

**Clave primaria:** `id`.

**Clave foránea:** `user_data_id` referencia `user_data.id`.

**Relación:** muchos a uno (`ManyToOne`) desde `TokenValidacionCorreo` hacia `DatosUsuario`.

**Restricciones e índices declarados:** UNIQUE `uq_email_validation_token_hash`; CHECK `ck_email_validation_token_expires_at` (`expires_at > created_at`); índices `idx_email_validation_token_user_data_id` y `idx_email_validation_token_expires_at`.

### 2.7. Consideraciones del conjunto de tablas

- `user_account` y `user_data` mantienen una relación uno a uno; la fila `user_data` depende obligatoriamente de la cuenta, pero la entidad `user_account` no exige que exista una fila asociada.
- `profile` permite asociar perfiles y roles a una cuenta.
- Las sesiones y los tokens de recuperación se relacionan con las cuentas.
- Los tokens de validación de correo se relacionan con los datos personales.
- Los tokens se representan mediante hashes, no mediante valores originales.
- Solo `user_data.phone`, `user_data.email_verified_at` y los campos marcados `NULL` permiten valor nulo. Los timestamps con default `now()` siguen siendo obligatorios.
- El enum del rol usa el nombre PostgreSQL exacto `user_role`; los tipos `user_status_enum` y `document_type_enum` también se declaran con esos nombres exactos.
- Estos nombres y restricciones reflejan el código actual y la propuesta del PR #115; la aprobación del PR y la validación del equipo de base de datos siguen pendientes.
## 3. Personal y cuadrillas

Este conjunto de tablas representa las cuadrillas operativas, sus integrantes y los conductores vinculados al sistema.

### 3.1. Tabla `crew`

**Entidad:** `Cuadrilla`

**Responsabilidad:** representar los grupos de trabajo que participan en las operaciones de recolección.

| Columna SQL | Propiedad TypeScript | Tipo PostgreSQL |
|---|---|---|
| `id` | `id` | UUID, PK |
| `name` | `nombre` | VARCHAR(100) |
| `is_active` | `activo` | BOOLEAN, default TRUE |
| `updated_at` | `actualizadoEn` | TIMESTAMPTZ, default `now()` |
| `created_at` | `creadoEn` | TIMESTAMPTZ, default `now()` |

**Clave primaria:** `id`.

### 3.2. Tabla `crew_member`

**Entidad:** `IntegranteCuadrilla`

**Responsabilidad:** registrar a las personas que forman parte de una cuadrilla operativa.

| Columna SQL | Propiedad TypeScript | Tipo PostgreSQL |
|---|---|---|
| `id` | `id` | UUID, PK |
| `crew_id` | `cuadrilla` | UUID (FK, NULL) |
| `full_name` | `nombreCompleto` | VARCHAR(120) |
| `is_active` | `activo` | BOOLEAN, default TRUE |
| `updated_at` | `actualizadoEn` | TIMESTAMPTZ, default `now()` |
| `created_at` | `creadoEn` | TIMESTAMPTZ, default `now()` |

**Clave primaria:** `id`.

**Clave foránea:** `crew_id` referencia `crew.id`.

**Relación:** muchos a uno (`ManyToOne`) desde `IntegranteCuadrilla` hacia `Cuadrilla`.

**Índice declarado:** `idx_crew_member_crew_id`. La relación con `Cuadrilla` es opcional (`nullable: true`).

### 3.3. Tabla `driver`

**Entidad:** `Conductor`

**Responsabilidad:** registrar la vinculación de un conductor con sus datos personales y con una cuadrilla.

| Columna SQL | Propiedad TypeScript | Tipo PostgreSQL |
|---|---|---|
| `id` | `id` | UUID, PK |
| `user_data_id` | `datosUsuario` | UUID (FK, obligatorio) |
| `crew_id` | `cuadrilla` | UUID (FK, NULL) |
| `started_at` | `inicioVinculacion` | TIMESTAMPTZ, default `now()` |
| `ended_at` | `finVinculacion` | TIMESTAMPTZ NULL |
| `is_active` | `activo` | BOOLEAN, default TRUE |
| `updated_at` | `actualizadoEn` | TIMESTAMPTZ, default `now()` |
| `created_at` | `creadoEn` | TIMESTAMPTZ, default `now()` |

**Clave primaria:** `id`.

**Claves foráneas:**
- `user_data_id` referencia `user_data.id`.
- `crew_id` referencia `crew.id`.

**Relaciones:**
- Muchos a uno (`ManyToOne`) desde `Conductor` hacia `DatosUsuario`.
- Muchos a uno (`ManyToOne`) desde `Conductor` hacia `Cuadrilla`.

**Índices y restricción declarados:** `idx_driver_user_data_id`, `idx_driver_crew_id` y CHECK `ck_driver_dates` (`ended_at IS NULL OR ended_at >= started_at`).

### 3.4. Consideraciones del conjunto de tablas

- Una cuadrilla representa un grupo operativo.
- Un integrante de cuadrilla se registra mediante `crew_member` y no requiere necesariamente una cuenta de acceso al sistema.
- Un conductor se relaciona con `user_data`, por lo que dispone de información personal asociada a una cuenta.
- La relación de `Conductor` con `DatosUsuario` es obligatoria; la relación con `Cuadrilla` y la relación de `IntegranteCuadrilla` con `Cuadrilla` son opcionales.
- Las reglas sobre asignación de integrantes, cambios de cuadrilla y periodos de vinculación deberán definirse en la lógica de negocio.

## 4. Gestión de vehículos

Este conjunto de tablas permite clasificar los vehículos utilizados en las operaciones y registrar sus características, capacidades y estado operativo.

### 4.1. Tabla `vehicle_type`

**Entidad:** `TipoVehiculo`

**Responsabilidad:** definir los tipos o categorías de vehículos disponibles en el sistema.

| Columna SQL | Propiedad TypeScript | Tipo PostgreSQL |
|---|---|---|
| `id` | `id` | UUID, PK |
| `code` | `codigo` | VARCHAR(30) |
| `name` | `nombre` | VARCHAR(100) |
| `is_active` | `activo` | BOOLEAN, default TRUE |
| `created_at` | `creadoEn` | TIMESTAMPTZ, default `now()` |

**Clave primaria:** `id`.

**Restricción declarada:** UNIQUE `uq_vehicle_type_code` sobre `code`.

### 4.2. Tabla `vehicle`

**Entidad:** `Vehiculo`

**Responsabilidad:** registrar los vehículos, su clasificación, placa, capacidades y estado operativo.

| Columna SQL | Propiedad TypeScript | Tipo PostgreSQL |
|---|---|---|
| `id` | `id` | UUID, PK |
| `vehicle_type_id` | `tipoVehiculo` | UUID (FK, obligatorio) |
| `vehicle_status` | `estado` | ENUM `vehicle_status` |
| `plate` | `placa` | CHAR(6) |
| `capacity_kg` | `capacidadKg` | NUMERIC |
| `capacity_yd3` | `capacidadYd3` | NUMERIC |
| `is_active` | `activo` | BOOLEAN, default TRUE |
| `updated_at` | `actualizadoEn` | TIMESTAMPTZ, default `now()` |
| `created_at` | `creadoEn` | TIMESTAMPTZ, default `now()` |

**Clave primaria:** `id`.

**Clave foránea:** `vehicle_type_id` referencia `vehicle_type.id`.

**Relación:** muchos a uno (`ManyToOne`) desde `Vehiculo` hacia `TipoVehiculo`.

### 4.3. ENUM `vehicle_status`

La entidad `Vehiculo` declara el ENUM `EstadoVehiculo`, asociado al tipo PostgreSQL `vehicle_status`.

| Valor TypeScript | Valor almacenado |
|---|---|
| `DISPONIBLE` | `AVAILABLE` |
| `EN_SERVICIO` | `IN_USE` |
| `MANTENIMIENTO` | `MAINTENANCE` |
| `FUERA_DE_SERVICIO` | `OUT_OF_SERVICE` |

El nombre PostgreSQL es `vehicle_status`. El transformer adapta los valores del enum TypeScript a los valores en mayúsculas almacenados por PostgreSQL.

### 4.4. Consideraciones del conjunto de tablas

- Cada vehículo requiere un tipo de vehículo; la relación está declarada como `ManyToOne` con `nullable: false`.
- Las capacidades se almacenan en PostgreSQL como `NUMERIC` y se representan como `string` en TypeScript para conservar la precisión decimal.
- La placa se representa mediante `CHAR(6)`.
- Se declaran UNIQUE `uq_vehicle_plate` y CHECK `ck_vehicle_capacity_kg` / `ck_vehicle_capacity_yd3`, que exigen capacidades mayores o iguales a cero. También se declara el índice `idx_vehicle_vehicle_type_id`.

## 5. Gestión de rutas y cobertura geográfica

Este conjunto de tablas representa la estructura geográfica de VINTRA mediante macrorutas, microrutas y barrios. Se utilizan tipos espaciales de PostGIS para almacenar las geometrías asociadas a cada elemento.

### 5.1. Tabla `macroroute`

**Entidad:** `Macroruta`

**Responsabilidad:** representar los trazados geográficos correspondientes a las macrorutas de operación.

| Columna SQL | Propiedad TypeScript | Tipo PostgreSQL |
|---|---|---|
| `id` | `id` | UUID, PK |
| `code` | `codigo` | VARCHAR(30) |
| `name` | `nombre` | VARCHAR(120) |
| `geom` | `geometria` | GEOMETRY(MULTILINESTRING, 4326) |
| `updated_at` | `actualizadoEn` | TIMESTAMPTZ, default `now()` |
| `created_at` | `creadoEn` | TIMESTAMPTZ, default `now()` |

**Clave primaria:** `id`.

**Restricciones e índice declarados:** UNIQUE `uq_macroroute_code`; índice espacial `idx_macroroute_geom`.

### 5.2. Tabla `microroute`

**Entidad:** `Microruta`

**Responsabilidad:** representar los recorridos específicos asociados a una macroruta.

| Columna SQL | Propiedad TypeScript | Tipo PostgreSQL |
|---|---|---|
| `id` | `id` | UUID, PK |
| `macroroute_id` | `macroruta` | UUID (FK, obligatorio) |
| `code` | `codigo` | VARCHAR(30) |
| `name` | `nombre` | VARCHAR(120) |
| `geom` | `geometria` | GEOMETRY(MULTILINESTRING, 4326) |
| `updated_at` | `actualizadoEn` | TIMESTAMPTZ, default `now()` |
| `created_at` | `creadoEn` | TIMESTAMPTZ, default `now()` |

**Clave primaria:** `id`.

**Clave foránea:** `macroroute_id` referencia `macroroute.id`.

**Relación:** muchos a uno (`ManyToOne`) desde `Microruta` hacia `Macroruta`.

**Restricciones e índices declarados:** UNIQUE `uq_microroute_code`; índices `idx_microroute_macroroute_id` y espacial `idx_microroute_geom`.

### 5.3. Tabla `btura_neighborhood`

**Entidad:** `Barrio`

**Responsabilidad:** almacenar los barrios, su comuna y su delimitación geográfica.

| Columna SQL | Propiedad TypeScript | Tipo PostgreSQL |
|---|---|---|
| `id` | `id` | UUID, PK |
| `commune` | `comuna` | VARCHAR(80) NULL |
| `name` | `nombre` | VARCHAR(120) |
| `geom` | `geometria` | GEOMETRY(MULTIPOLYGON, 4326) |
| `updated_at` | `actualizadoEn` | TIMESTAMPTZ, default `now()` |
| `created_at` | `creadoEn` | TIMESTAMPTZ, default `now()` |

**Clave primaria:** `id`.

**Índices declarados:** único `idx_btura_neighborhood_name` sobre `name` y espacial `idx_btura_neighborhood_geom`.

### 5.4. Tabla `microroute_neighborhood`

**Entidad:** `MicrorutaBarrio`

**Responsabilidad:** establecer la asociación entre microrutas y barrios, conservando el orden de visita.

| Columna SQL | Propiedad TypeScript | Tipo PostgreSQL |
|---|---|---|
| `id` | `id` | UUID, PK |
| `neighborhood_id` | `barrio` | UUID (FK, obligatorio) |
| `microroute_id` | `microruta` | UUID (FK, obligatorio) |
| `order_visit` | `ordenVisita` | INT |

**Clave primaria:** `id`.

**Claves foráneas:**
- `neighborhood_id` referencia `btura_neighborhood.id`.
- `microroute_id` referencia `microroute.id`.

**Relaciones:**
- Muchos a uno (`ManyToOne`) desde `MicrorutaBarrio` hacia `Barrio`.
- Muchos a uno (`ManyToOne`) desde `MicrorutaBarrio` hacia `Microruta`.

**Restricciones e índices declarados:** UNIQUE `uq_microroute_neighborhood` sobre (`microroute_id`, `neighborhood_id`); UNIQUE `uq_microroute_neighborhood_order` sobre (`microroute_id`, `order_visit`); CHECK `ck_microroute_neighborhood_order_visit` (`order_visit > 0`); índices `idx_microroute_neighborhood_microroute_id` y `idx_microroute_neighborhood_neighborhood_id`.

### 5.5. Consideraciones geoespaciales

- Las entidades `Macroruta` y `Microruta` utilizan geometrías `MultiLineString`; `Barrio` utiliza `MultiPolygon`.
- Las geometrías utilizan SRID 4326, correspondiente al sistema de referencia WGS 84.
- Las propiedades `geometria` se declaran como `object` no nullable en TypeScript.
- Los DTO de rutas declaran validación GeoJSON para el tipo espacial esperado; la validación de límites geográficos específicos corresponde a reglas adicionales de negocio.
- La tabla `microroute_neighborhood` permite registrar el orden de visita de los barrios asociados a una microruta.
- Se conserva el nombre literal `btura_neighborhood` y el nombre `microroute_neighborhood` declarados en las entidades y en la migración correspondiente del PR #115. El PR sigue siendo provisional.

## 6. Programación de turnos y horarios

Este conjunto de tablas permite definir horarios operativos y asociarlos con las microrutas según el día de la semana.

### 6.1. Tabla `schedule`

**Entidad:** `Horario`

**Responsabilidad:** almacenar las franjas horarias disponibles para la programación de las operaciones.

| Columna SQL | Propiedad TypeScript | Tipo PostgreSQL |
|---|---|---|
| `id` | `id` | UUID, PK |
| `name` | `nombre` | VARCHAR(20) NULL |
| `start_time` | `horaInicio` | TIME |
| `end_time` | `horaFin` | TIME |
| `is_active` | `activo` | BOOLEAN, default TRUE |
| `updated_at` | `actualizadoEn` | TIMESTAMPTZ, default `now()` |
| `created_at` | `creadoEn` | TIMESTAMPTZ, default `now()` |

**Clave primaria:** `id`.

**Restricción declarada:** CHECK `ck_schedule_time_range` (`end_time > start_time`).

### 6.2. Tabla `microroute_schedule`

**Entidad:** `MicrorutaHorario`

**Responsabilidad:** asociar una microruta con un horario y un día de la semana.

| Columna SQL | Propiedad TypeScript | Tipo PostgreSQL |
|---|---|---|
| `id` | `id` | UUID, PK |
| `microroute_id` | `microruta` | UUID (FK, obligatorio) |
| `schedule_id` | `horario` | UUID (FK, obligatorio) |
| `day_of_week` | `diaSemana` | SMALLINT |
| `is_active` | `activo` | BOOLEAN, default TRUE |
| `updated_at` | `actualizadoEn` | TIMESTAMPTZ, default `now()` |
| `created_at` | `creadoEn` | TIMESTAMPTZ, default `now()` |

**Clave primaria:** `id`.

**Claves foráneas:**
- `microroute_id` referencia `microroute.id`.
- `schedule_id` referencia `schedule.id`.

**Relaciones:**
- Muchos a uno (`ManyToOne`) desde `MicrorutaHorario` hacia `Microruta`.
- Muchos a uno (`ManyToOne`) desde `MicrorutaHorario` hacia `Horario`.

**Restricciones e índices declarados:** UNIQUE `uq_microroute_schedule` sobre (`microroute_id`, `schedule_id`, `day_of_week`); CHECK `ck_microroute_schedule_day_of_week` (`day_of_week BETWEEN 1 AND 7`); índices `idx_microroute_schedule_microroute_id` y `idx_microroute_schedule_schedule_id`.

### 6.3. Consideraciones del conjunto de tablas

- `schedule` almacena las franjas horarias, mientras que `microroute_schedule` establece su asociación con una microruta y un día de la semana.
- El campo `day_of_week` se representa como `SMALLINT` en PostgreSQL y `number` en TypeScript.
- La convención numérica para representar los días de la semana está pendiente de definición por parte del equipo.
- Debe establecerse la regla de negocio para evitar programaciones duplicadas o incompatibles.
- Las validaciones de horas de inicio y finalización, así como la coherencia de los días, deberán definirse en los DTO y servicios.

## 7. Gestión de asignaciones operativas

### 7.1. Tabla `assignment`

**Entidad:** `Asignacion`

**Responsabilidad:** representar las operaciones programadas mediante la asociación de un conductor, una microruta con su horario y un vehículo.

| Columna SQL | Propiedad TypeScript | Tipo PostgreSQL |
|---|---|---|
| `id` | `id` | UUID, PK |
| `driver_id` | `conductor` | UUID (FK, obligatorio) |
| `microroute_schedule_id` | `microrutaHorario` | UUID (FK, obligatorio) |
| `vehicle_id` | `vehiculo` | UUID (FK, obligatorio) |
| `assignment_status` | `estado` | ENUM `assignment_status` |
| `scheduled_start_at` | `inicioProgramado` | TIMESTAMPTZ |
| `scheduled_end_at` | `finProgramado` | TIMESTAMPTZ |
| `started_at` | `iniciadoEn` | TIMESTAMPTZ NULL |
| `ended_at` | `finalizadoEn` | TIMESTAMPTZ NULL |
| `is_active` | `activo` | BOOLEAN, default TRUE |
| `updated_at` | `actualizadoEn` | TIMESTAMPTZ, default `now()` |
| `created_at` | `creadoEn` | TIMESTAMPTZ, default `now()` |

**Clave primaria:** `id`.

**Claves foráneas:**
- `driver_id` referencia `driver.id`.
- `microroute_schedule_id` referencia `microroute_schedule.id`.
- `vehicle_id` referencia `vehicle.id`.

**Relaciones:**
- Muchos a uno (`ManyToOne`) desde `Asignacion` hacia `Conductor`.
- Muchos a uno (`ManyToOne`) desde `Asignacion` hacia `MicrorutaHorario`.
- Muchos a uno (`ManyToOne`) desde `Asignacion` hacia `Vehiculo`.

### 7.2. ENUM `assignment_status`

La entidad declara el ENUM `EstadoAsignacion`, asociado al tipo PostgreSQL `assignment_status`.

| Valor TypeScript | Valor almacenado |
|---|---|
| `PROGRAMADA` | `SCHEDULED` |
| `EN_PROGRESO` | `IN_PROGRESS` |
| `COMPLETADA` | `COMPLETED` |
| `CANCELADA` | `CANCELLED` |

El nombre PostgreSQL es `assignment_status`. El transformer adapta los valores del enum TypeScript a los valores en mayúsculas almacenados por PostgreSQL.

### 7.3. Consideraciones del conjunto de asignaciones

- Una asignación relaciona un conductor, una programación de microruta y un vehículo.
- Los horarios programados se almacenan en `scheduled_start_at` y `scheduled_end_at`.
- Los tiempos reales de ejecución se registran mediante `started_at` y `ended_at`.
- El estado de la asignación se representa mediante el ENUM `assignment_status`.
- Las tres relaciones (`Conductor`, `MicrorutaHorario` y `Vehiculo`) son obligatorias (`nullable: false`).
- Se declaran UNIQUE `uq_assignment_schedule_start` sobre (`microroute_schedule_id`, `scheduled_start_at`) y CHECK `ck_assignment_scheduled_range` y `ck_assignment_actual_range`. También se declaran los índices `idx_assignment_driver_id`, `idx_assignment_microroute_schedule_id`, `idx_assignment_vehicle_id` e `idx_assignment_scheduled_start_at`.
- Las reglas para evitar cruces de horarios, dobles asignaciones, uso de vehículos inactivos y transiciones inválidas de estado deben implementarse en la lógica de negocio.
- La entidad representa la estructura de persistencia; no garantiza por sí sola la disponibilidad de los recursos ni la validez operativa de una asignación.

## 8. Seguimiento geográfico de vehículos

### 8.1. Tabla `vehicle_position`

**Entidad:** `PosicionVehiculo`

**Responsabilidad:** almacenar registros de ubicación geográfica asociados a asignaciones operativas de VINTRA.

| Columna SQL | Propiedad TypeScript | Tipo PostgreSQL |
|---|---|---|
| `id` | `id` | UUID, PK |
| `assignment_id` | `asignacion` | UUID (FK, obligatorio) |
| `geom` | `geometria` | GEOMETRY(Point, 4326) |
| `recorded_at` | `registradoEn` | TIMESTAMPTZ |
| `created_at` | `creadoEn` | TIMESTAMPTZ, default `now()` |

**Clave primaria:** `id`.

**Clave foránea:**
- `assignment_id` referencia `assignment.id`.

**Relación:**
- Muchos a uno (`ManyToOne`) desde `PosicionVehiculo` hacia `Asignacion`.

La relación está declarada como obligatoria (`nullable: false`).

### 8.2. Información geográfica

La columna `geom` utiliza el tipo espacial `geometry` de PostGIS, con las siguientes características:

- Tipo de geometría: `Point`.
- Sistema de referencia espacial: SRID 4326 (WGS 84).
- Representación en TypeScript: `object`, no nullable.

El tipo `Point` permite almacenar una ubicación geográfica puntual. El SRID 4326 identifica el sistema de coordenadas utilizado para representar ubicaciones mediante longitud y latitud.

El DTO y el servicio validan que la entrada sea un GeoJSON Point con coordenadas 2D antes de persistir el registro.

### 8.3. Consideraciones del seguimiento

- Cada registro representa una posición asociada a una asignación.
- `recorded_at` representa el momento en que se registró la ubicación.
- `created_at` representa el momento de creación del registro en la base de datos.
- La entidad no implementa por sí sola la captura automática de coordenadas ni la reconstrucción de recorridos.
- TypeORM declara los índices `idx_vehicle_position_assignment_recorded` y `idx_vehicle_position_geom` (espacial). La migración 019 del PR #115 propone los mismos índices.
- La asignación es obligatoria y la entidad no define una política de retención ni una frecuencia de registro.
- Debe evaluarse el volumen de registros esperado para definir estrategias de consulta y almacenamiento eficientes.

## 9. Auditoría y trazabilidad

### 9.1. Propósito del módulo

El módulo de auditoría permite conservar registros de las acciones realizadas sobre las principales entidades del sistema VINTRA.

Su finalidad es facilitar la trazabilidad de las modificaciones, identificar al usuario responsable de una operación y conservar información sobre los valores anteriores y nuevos de los registros cuando corresponda.

Las entidades de auditoría se encuentran separadas de las entidades operativas para mantener una responsabilidad específica dentro de la arquitectura.

### 9.2. Tablas y entidades

| Tabla SQL | Entidad TypeScript | Entidad auditada |
|---|---|---|
| `assignment_log` | `AsignacionLog` | `Asignacion` |
| `driver_log` | `ConductorLog` | `Conductor` |
| `crew_log` | `CuadrillaLog` | `Cuadrilla` |
| `user_account_log` | `CuentaUsuarioLog` | `CuentaUsuario` |
| `user_data_log` | `DatosUsuarioLog` | `DatosUsuario` |
| `crew_member_log` | `IntegranteCuadrillaLog` | `IntegranteCuadrilla` |
| `macroroute_log` | `MacrorutaLog` | `Macroruta` |
| `microroute_log` | `MicrorutaLog` | `Microruta` |
| `profile_log` | `PerfilLog` | `Perfil` |
| `vehicle_log` | `VehiculoLog` | `Vehiculo` |

### 9.3. Estructura general

Las entidades de auditoría comparten una estructura común:

| Columna SQL | Propiedad TypeScript | Tipo PostgreSQL |
|---|---|---|
| `id` | `id` | UUID, PK |
| `entity_id` | Relación con la entidad auditada | UUID (FK, obligatorio) |
| `actor_id` | `actor` | UUID (FK, NULL) |
| `action` | `accion` | ENUM `audit_action` (`CREATE`, `UPDATE`, `DELETE`) |
| `old` | `valoresAnteriores` | JSONB NULL |
| `new` | `valoresNuevos` | JSONB NULL |
| `request_ip` | `ipSolicitud` | INET NULL |
| `created_at` | `fechaCreacion` | TIMESTAMPTZ, default `now()` |

`entity_id` es una FK obligatoria hacia la entidad auditada correspondiente a cada tabla de log.

`actor_id` es una FK opcional hacia `CuentaUsuario`.

En las entidades TypeORM, la relación con la entidad auditada está declarada `ManyToOne` obligatoria (`nullable: false`); la relación `actor` está declarada `ManyToOne` opcional (`nullable: true`). Los campos `old`, `new` y `request_ip` permiten `NULL`.

### 9.4. ENUM `audit_action`

Las entidades utilizan el enum compartido `AccionAuditoria`, asociado al tipo PostgreSQL `audit_action`.

| Valor TypeScript | Valor almacenado |
|---|---|
| `CREAR` | `CREATE` |
| `ACTUALIZAR` | `UPDATE` |
| `ELIMINAR` | `DELETE` |

Estos son los valores declarados actualmente por TypeORM y por las migraciones propuestas en el PR #115.

### 9.5. Índices propuestos para las tablas de auditoría

Las migraciones propuestas en el PR #115 declaran índices sobre `entity_id`, `actor_id` y `created_at` en las tablas de auditoría. Las diez entidades TypeORM actuales no declaran esos índices mediante `@Index`. La creación efectiva de esos índices depende de la aprobación y aplicación de las migraciones; no debe inferirse a partir de `synchronize`.

### 9.6. Consideraciones de implementación

- Los registros de auditoría deben generarse desde la lógica interna del backend.
- No se deben exponer operaciones para modificar arbitrariamente los registros de auditoría.
- No deben almacenarse contraseñas, tokens en texto plano ni otros secretos dentro de los valores auditados.
- Debe definirse el tratamiento de los registros auditados cuando la entidad original sea eliminada.
- Debe verificarse la política de conservación de los registros de auditoría.
- La generación de auditoría debe coordinarse con las transacciones de las operaciones que se registran, para evitar inconsistencias.
- `AuditoriaService` implementa consultas paginadas de los registros; `ContextoAuditoriaService` establece el usuario y la IP en el contexto de la transacción.
- El código de los servicios revisados no inserta directamente las filas de auditoría. Su generación depende de los mecanismos de base de datos propuestos y aún pendientes de aprobación; debe validarse con el equipo de base de datos.

### 9.7. Estado del mapeo

Las diez entidades de auditoría y el servicio de consulta se encuentran implementados en el backend.

La generación de eventos, las políticas de conservación y las reglas de eliminación quedan pendientes de validación respecto de las migraciones aprobadas y del comportamiento real de la base de datos.