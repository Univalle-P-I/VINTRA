# Diccionario de Datos

Documentación de las 29 tablas.

## Índice

1. [user_account](#user_account)
2. [user_data](#user_data)
3. [profile](#profile)
4. [session](#session)
5. [password_reset_token](#password_reset_token)
6. [email_validation_token](#email_validation_token)
7. [vehicle_type](#vehicle_type)
8. [vehicle](#vehicle)
9. [macroroute](#macroroute)
10. [microroute](#microroute)
11. [btura_neighborhood](#btura_neighborhood)
12. [schedule](#schedule)
13. [microroute_schedule](#microroute_schedule)
14. [microroute_neighborhood](#microroute_neighborhood)
15. [crew](#crew)
16. [crew_member](#crew_member)
17. [driver](#driver)
18. [assignment](#assignment)
19. [vehicle_position](#vehicle_position)
20. [user_account_log](#user_account_log)
21. [user_data_log](#user_data_log)
22. [profile_log](#profile_log)
23. [crew_log](#crew_log)
24. [crew_member_log](#crew_member_log)
25. [macroroute_log](#macroroute_log)
26. [microroute_log](#microroute_log)
27. [driver_log](#driver_log)
28. [vehicle_log](#vehicle_log)
29. [assignment_log](#assignment_log)

## Reglas de auditoría

- Un `INSERT` se registra como `CREATE`.
- `UPDATE` se registra como `UPDATE`.
- Un `UPDATE` que cambia `is_active` a `FALSE` se registra como `DELETE` (borrado lógico)
- Un `DELETE` real se registra como `DELETE`.
- `old` contiene el registro anterior en `UPDATE` y `DELETE`.
- `new` contiene el registro nuevo en hechos en un `INSERT` ó `UPDATE`; cuando es `DELETE` real, toma valor de  `NULL`.
- El borrado operativo es lógico (`is_active = FALSE`); no se debe ejecutar `DELETE` físico sobre entidades con historial de auditoría.
- `user_account.pwd_hash` y `user_account.document_id` son excluidos de `old` y `new` (no se registran hashes de contraseñas ni números de documento como valores en `old` ó `new`)

## user_account

cuenta de acceso del usuario (credenciales y estado; contiene datos sensibles)

| Atributo | Descripción | Tipo | Longitud | Mandatorio | Único | Clave | Restricciones | Índice |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| id | Identificador único de la cuenta de usuario. | UUID | N/A | SI | SI | PK | DEFAULT gen_random_uuid() | user_account_pkey (id) |
| user_status | Estado administrativo de la cuenta. Determina si puede iniciar sesión. | ENUM | N/A | SI | NO | N/A | ENUM: ACTIVE, INACTIVE, LOCKED, PENDING_VERIFICATION | — |
| document_type | Tipo de documento de identidad del titular de la cuenta. | ENUM | N/A | SI | SI | N/A | ENUM: CC; UNIQUE (document_type, document_id) via uq_user_account_document | uq_user_account_document (document_type, document_id) |
| document_id | Número de documento de identidad del titular. Dato personal sensible. No puede repetirse junto con document_type. | CHAR | 20 | SI | SI | N/A | UNIQUE (document_type, document_id) via uq_user_account_document | uq_user_account_document (document_type, document_id) |
| pwd_hash | Hash de la contraseña (Argon2id; incluye sal y parámetros). | TEXT | N/A | SI | NO | N/A | — | — |
| failed_attempts | Intentos fallidos consecutivos de inicio de sesión. Se reinicia al autenticarse con éxito. Por defecto 0. | SMALLINT | N/A | SI | NO | N/A | DEFAULT 0; CHECK (failed_attempts >= 0) | — |
| locked_until | Fecha hasta la cual la cuenta está bloqueada temporalmente por intentos fallidos. NULL si no está bloqueada. | TIMESTAMPTZ | N/A | NO | NO | N/A | NULL permitido | — |
| last_login_at | Fecha y hora del último inicio de sesión exitoso. NULL si nunca ha ingresado. | TIMESTAMPTZ | N/A | NO | NO | N/A | NULL permitido | — |
| password_changed_at | Fecha y hora del último cambio de contraseña. NULL si no se ha cambiado desde la creación. | TIMESTAMPTZ | N/A | NO | NO | N/A | NULL permitido | — |
| updated_at | Fecha y hora de la última modificación del registro (UTC). | TIMESTAMPTZ | N/A | SI | NO | N/A | DEFAULT now() | — |
| created_at | Fecha y hora de creación del registro (UTC). Por defecto now(). | TIMESTAMPTZ | N/A | SI | NO | N/A | DEFAULT now() | — |

- (No tiene llaves foráneas)

## user_data

datos personales de la cuenta (relación 1 a 1 con user_account)

| Atributo | Descripción | Tipo | Longitud | Mandatorio | Único | Clave | Restricciones | Índice |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| id | Identificador único de los datos personales. Es el mismo id de user_account (relación 1 a 1). | UUID | N/A | SI | SI | PK, FK | PK; FK user_account(id) | user_data_pkey (id) |
| first_name | Nombres de la persona. Dato personal. | VARCHAR | 80 | SI | NO | N/A | — | — |
| last_name | Apellidos de la persona. Dato personal. | VARCHAR | 80 | SI | NO | N/A | — | — |
| email | Correo electrónico de la persona. Dato personal. | VARCHAR | 254 | SI | SI | N/A | UNIQUE (email) via uq_user_data_email | uq_user_data_email (email) |
| phone | Número de teléfono de contacto. Dato personal. | VARCHAR | 20 | NO | NO | N/A | NULL permitido | — |
| email_verified_at | Fecha y hora de verificación del correo electrónico. NULL si aún no se ha verificado. | TIMESTAMPTZ | N/A | NO | NO | N/A | NULL permitido | — |
| updated_at | Fecha y hora de la última modificación del registro (UTC). | TIMESTAMPTZ | N/A | SI | NO | N/A | DEFAULT now() | — |
| created_at | Fecha y hora de creación del registro (UTC). Por defecto now(). | TIMESTAMPTZ | N/A | SI | NO | N/A | DEFAULT now() | — |

- id referencia user_account(id): relación 1 a 1; cada cuenta tiene exactamente un registro de datos personales y viceversa.

## profile

perfil; rol que ejerce una cuenta (una cuenta puede tener varios perfiles)

| Atributo | Descripción | Tipo | Longitud | Mandatorio | Único | Clave | Restricciones | Índice |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| id | Identificador único del perfil. | UUID | N/A | SI | SI | PK | DEFAULT gen_random_uuid() | profile_pkey (id) |
| user_account_id | Cuenta de usuario a la que pertenece el perfil. | UUID | N/A | SI | SI | FK | FK user_account(id); UNIQUE (user_account_id, user_role) via uq_profile_account_role | idx_profile_user_account_id (user_account_id); uq_profile_account_role (user_account_id, user_role) |
| user_role | Rol que se ejerce con este perfil (ADMIN, OP o DRIVER). Una cuenta no puede repetir el mismo rol. | ENUM | N/A | SI | SI | N/A | ENUM: ADMIN, OP, DRIVER; UNIQUE (user_account_id, user_role) via uq_profile_account_role | uq_profile_account_role (user_account_id, user_role) |
| is_active | Indica si el perfil está vigente (TRUE) o inactivo (FALSE). Por defecto TRUE. | BOOLEAN | N/A | SI | NO | N/A | DEFAULT TRUE | — |
| created_at | Fecha y hora de creación del registro (UTC). Por defecto now(). | TIMESTAMPTZ | N/A | SI | NO | N/A | DEFAULT now() | — |

- user_account_id referencia user_account(id): una cuenta puede tener muchos perfiles; cada perfil pertenece a una sola cuenta.

## session

sesiones abiertas por las cuentas de usuario

| Atributo | Descripción | Tipo | Longitud | Mandatorio | Único | Clave | Restricciones | Índice |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| id | Identificador único de la sesión. | UUID | N/A | SI | SI | PK | DEFAULT gen_random_uuid() | session_pkey (id) |
| user_account_id | Cuenta de usuario dueña de la sesión. | UUID | N/A | SI | NO | FK | FK user_account(id) | idx_session_user_account_id (user_account_id) |
| token_hash | Hash SHA-256 (hexadecimal) del token de sesión. El token en claro nunca se almacena. | CHAR | 64 | SI | SI | N/A | UNIQUE (token_hash) via uq_session_token_hash | uq_session_token_hash (token_hash) |
| request_ip | Dirección IP desde la que se abrió la sesión. | INET | N/A | SI | NO | N/A | — | — |
| revoked_at | Fecha y hora en que la sesión fue revocada (cierre de sesión, cambio de contraseña, bloqueo). NULL si sigue vigente. | TIMESTAMPTZ | N/A | NO | NO | N/A | NULL permitido | — |
| last_used_at | Fecha y hora del último uso de la sesión. | TIMESTAMPTZ | N/A | NO | NO | N/A | NULL permitido | — |
| expires_at | Fecha y hora de vencimiento de la sesión. Pasada esta fecha deja de ser válida. | TIMESTAMPTZ | N/A | SI | NO | N/A | CHECK (expires_at > created_at) | idx_session_expires_at (expires_at) |
| created_at | Fecha y hora de creación del registro (UTC). Por defecto now(). | TIMESTAMPTZ | N/A | SI | NO | N/A | DEFAULT now() | — |

- user_account_id referencia user_account(id): una cuenta puede abrir muchas sesiones; cada sesión pertenece a una sola cuenta.

## password_reset_token

tokens de un solo uso para restablecer la contraseña

| Atributo | Descripción | Tipo | Longitud | Mandatorio | Único | Clave | Restricciones | Índice |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| id | Identificador único de la solicitud de restablecimiento. | UUID | N/A | SI | SI | PK | DEFAULT gen_random_uuid() | password_reset_token_pkey (id) |
| user_account_id | Cuenta de usuario que solicitó el restablecimiento. | UUID | N/A | SI | NO | FK | FK user_account(id) | idx_password_reset_token_user_account_id (user_account_id) |
| token_hash | Hash SHA-256 (hexadecimal) del token enviado al usuario. El token en claro nunca se almacena. | CHAR | 64 | SI | SI | N/A | UNIQUE (token_hash) via uq_password_reset_token_hash | uq_password_reset_token_hash (token_hash) |
| request_ip | Dirección IP desde la que se hizo la solicitud. | INET | N/A | NO | NO | N/A | NULL permitido | — |
| used_at | Fecha y hora en que se usó el token. NULL mientras no se haya usado (un solo uso). | TIMESTAMPTZ | N/A | NO | NO | N/A | NULL permitido | — |
| expires_at | Fecha y hora de vencimiento del token (vida corta). | TIMESTAMPTZ | N/A | SI | NO | N/A | CHECK (expires_at > created_at) | idx_password_reset_token_expires_at (expires_at) |
| created_at | Fecha y hora de creación del registro (UTC). Por defecto now(). | TIMESTAMPTZ | N/A | SI | NO | N/A | DEFAULT now() | — |

- user_account_id referencia user_account(id): una cuenta puede tener muchas solicitudes; cada token pertenece a una sola cuenta.

## email_validation_token

tokens de un solo uso para validar el correo electrónico

| Atributo | Descripción | Tipo | Longitud | Mandatorio | Único | Clave | Restricciones | Índice |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| id | Identificador único de la solicitud de validación de correo. | UUID | N/A | SI | SI | PK | DEFAULT gen_random_uuid() | email_validation_token_pkey (id) |
| user_data_id | Datos personales de la persona que solicitó la validación del correo. | UUID | N/A | SI | NO | FK | FK user_data(id) | idx_email_validation_token_user_data_id (user_data_id) |
| email | Correo electrónico que se está verificando. | VARCHAR | 254 | SI | NO | N/A | — | — |
| token_hash | Hash SHA-256 (hexadecimal) del token enviado al usuario. El token en claro nunca se almacena. | CHAR | 64 | SI | SI | N/A | UNIQUE (token_hash) via uq_email_validation_token_hash | uq_email_validation_token_hash (token_hash) |
| request_ip | Dirección IP desde la que se hizo la solicitud. | INET | N/A | NO | NO | N/A | NULL permitido | — |
| used_at | Fecha y hora en que se usó el token. NULL mientras no se haya usado (un solo uso). | TIMESTAMPTZ | N/A | NO | NO | N/A | NULL permitido | — |
| expires_at | Fecha y hora de vencimiento del token (vida corta). | TIMESTAMPTZ | N/A | SI | NO | N/A | CHECK (expires_at > created_at) | idx_email_validation_token_expires_at (expires_at) |
| created_at | Fecha y hora de creación del registro (UTC). Por defecto now(). | TIMESTAMPTZ | N/A | SI | NO | N/A | DEFAULT now() | — |

- user_data_id referencia user_data(id): unos datos personales pueden tener muchas solicitudes de validación; cada token pertenece a un solo registro de datos personales.

## vehicle_type

catálogo de tipos de vehículo

| Atributo | Descripción | Tipo | Longitud | Mandatorio | Único | Clave | Restricciones | Índice |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| id | Identificador único del tipo de vehículo. | UUID | N/A | SI | SI | PK | DEFAULT gen_random_uuid() | vehicle_type_pkey (id) |
| code | Código estable del tipo de vehículo que la aplicación usa en su lógica. | VARCHAR | 30 | SI | SI | N/A | UNIQUE (code) via uq_vehicle_type_code | uq_vehicle_type_code (code) |
| name | Nombre legible para mostrar en pantalla. | VARCHAR | 100 | SI | NO | N/A | — | — |
| is_active | Indica si el registro está vigente (TRUE) o inactivo (FALSE). Por defecto TRUE. | BOOLEAN | N/A | SI | NO | N/A | DEFAULT TRUE | — |
| created_at | Fecha y hora de creación del registro (UTC). Por defecto now(). | TIMESTAMPTZ | N/A | SI | NO | N/A | DEFAULT now() | — |

- (No tiene llaves foráneas)

## vehicle

vehículos de la flota

| Atributo | Descripción | Tipo | Longitud | Mandatorio | Único | Clave | Restricciones | Índice |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| id | Identificador único del vehículo. | UUID | N/A | SI | SI | PK | DEFAULT gen_random_uuid() | vehicle_pkey (id) |
| vehicle_type_id | Tipo de vehículo. | UUID | N/A | SI | NO | FK | FK vehicle_type(id) | idx_vehicle_vehicle_type_id (vehicle_type_id) |
| vehicle_status | Estado actual del vehículo. | ENUM | N/A | SI | NO | N/A | ENUM: AVAILABLE, IN_USE, MAINTENANCE, OUT_OF_SERVICE | — |
| plate | Placa del vehículo. No puede repetirse. | CHAR | 6 | SI | SI | N/A | UNIQUE (plate) via uq_vehicle_plate | uq_vehicle_plate (plate) |
| capacity_kg | Capacidad de carga en kilogramos. | NUMERIC | N/A | SI | NO | N/A | CHECK (capacity_kg >= 0) | — |
| capacity_yd3 | Capacidad volumétrica en yardas cúbicas. | NUMERIC | N/A | SI | NO | N/A | CHECK (capacity_yd3 >= 0) | — |
| is_active | Indica si el vehículo está vigente (TRUE) o inactivo (FALSE). Por defecto TRUE. | BOOLEAN | N/A | SI | NO | N/A | DEFAULT TRUE | — |
| updated_at | Fecha y hora de la última modificación del registro (UTC). | TIMESTAMPTZ | N/A | SI | NO | N/A | DEFAULT now() | — |
| created_at | Fecha y hora de creación del registro (UTC). Por defecto now(). | TIMESTAMPTZ | N/A | SI | NO | N/A | DEFAULT now() | — |

- vehicle_type_id referencia vehicle_type(id): un tipo puede estar en muchos vehículos; cada vehículo tiene un solo tipo.

## macroroute

macrorruta; zona o área general que agrupa microrrutas

| Atributo | Descripción | Tipo | Longitud | Mandatorio | Único | Clave | Restricciones | Índice |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| id | Identificador único de la macrorruta. | UUID | N/A | SI | SI | PK | DEFAULT gen_random_uuid() | macroroute_pkey (id) |
| code | Código estable de la macrorruta. | VARCHAR | 30 | SI | SI | N/A | UNIQUE (code) via uq_macroroute_code | uq_macroroute_code (code) |
| name | Nombre de la macrorruta. | VARCHAR | 120 | SI | NO | N/A | — | — |
| geom | Trazado geográfico de la macrorruta (PostGIS, multilínea). | MULTILINESTRING | N/A | SI | NO | N/A | NO DOCUMENTADO | idx_macroroute_geom GIST (geom) |
| updated_at | Fecha y hora de la última modificación del registro (UTC). | TIMESTAMPTZ | N/A | SI | NO | N/A | DEFAULT now() | — |
| created_at | Fecha y hora de creación del registro (UTC). Por defecto now(). | TIMESTAMPTZ | N/A | SI | NO | N/A | DEFAULT now() | — |

- (No tiene llaves foráneas)

## microroute

microrruta; trayecto especifico de recolección dentro de una macrorruta

| Atributo | Descripción | Tipo | Longitud | Mandatorio | Único | Clave | Restricciones | Índice |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| id | Identificador único de la microrruta. | UUID | N/A | SI | SI | PK | DEFAULT gen_random_uuid() | microroute_pkey (id) |
| macroroute_id | Macrorruta a la que pertenece la microrruta. | UUID | N/A | SI | NO | FK | FK macroroute(id) | idx_microroute_macroroute_id (macroroute_id) |
| code | Código estable de la microrruta. | VARCHAR | 30 | SI | SI | N/A | UNIQUE (code) via uq_microroute_code | uq_microroute_code (code) |
| name | Nombre de la microrruta. | VARCHAR | 120 | SI | NO | N/A | — | — |
| geom | Trazado geográfico de la microrruta (PostGIS, multilínea). | MULTILINESTRING | N/A | SI | NO | N/A | NO DOCUMENTADO | idx_microroute_geom GIST (geom) |
| updated_at | Fecha y hora de la última modificación del registro (UTC). | TIMESTAMPTZ | N/A | SI | NO | N/A | DEFAULT now() | — |
| created_at | Fecha y hora de creación del registro (UTC). Por defecto now(). | TIMESTAMPTZ | N/A | SI | NO | N/A | DEFAULT now() | — |

- macroroute_id referencia macroroute(id): una macrorruta tiene muchas microrrutas; cada microrruta pertenece a una sola macrorruta.

## btura_neighborhood

barrios de Buenaventura

| Atributo | Descripción | Tipo | Longitud | Mandatorio | Único | Clave | Restricciones | Índice |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| id | Identificador único del barrio. | UUID | N/A | SI | SI | PK | DEFAULT gen_random_uuid() | btura_neighborhood_pkey (id) |
| commune | Comuna a la que pertenece el barrio. | VARCHAR | 80 | NO | NO | N/A | — | — |
| name | Nombre del barrio. | VARCHAR | 120 | SI | SI | N/A | — | idx_btura_neighborhood_name (name) |
| geom | Límite geográfico del barrio (PostGIS, multipolígono). | MULTIPOLYGON | N/A | SI | NO | N/A | NO DOCUMENTADO | idx_btura_neighborhood_geom GIST (geom) |
| updated_at | Fecha y hora de la última modificación del registro (UTC). | TIMESTAMPTZ | N/A | SI | NO | N/A | DEFAULT now() | — |
| created_at | Fecha y hora de creación del registro (UTC). Por defecto now(). | TIMESTAMPTZ | N/A | SI | NO | N/A | DEFAULT now() | — |

- (No tiene llaves foráneas)

## schedule

horario (franja horaria)

| Atributo | Descripción | Tipo | Longitud | Mandatorio | Único | Clave | Restricciones | Índice |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| id | Identificador único del horario. | UUID | N/A | SI | SI | PK | DEFAULT gen_random_uuid() | schedule_pkey (id) |
| name | nombre de la franja horaria (diurna, noctura) | VARCHAR | 20 | NO | NO | N/A | — | — |
| start_time | Hora de inicio del horario. | TIME | N/A | SI | NO | N/A | — | — |
| end_time | Hora de fin del horario. | TIME | N/A | SI | NO | N/A | CHECK (end_time > start_time) | — |
| is_active | Indica si el horario está vigente (TRUE) o inactivo (FALSE). Por defecto TRUE. | BOOLEAN | N/A | SI | NO | N/A | DEFAULT TRUE | — |
| updated_at | Fecha y hora de la última modificación del registro (UTC). | TIMESTAMPTZ | N/A | SI | NO | N/A | DEFAULT now() | — |
| created_at | Fecha y hora de creación del registro (UTC). Por defecto now(). | TIMESTAMPTZ | N/A | SI | NO | N/A | DEFAULT now() | — |

- (No tiene llaves foráneas)

## microroute_schedule

plantilla semanal; qué horario y qué día corre cada microruta

| Atributo | Descripción | Tipo | Longitud | Mandatorio | Único | Clave | Restricciones | Índice |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| id | Identificador único del registro. | UUID | N/A | SI | SI | PK | DEFAULT gen_random_uuid() | microroute_schedule_pkey (id) |
| microroute_id | Microrruta a la que se asigna el horario. | UUID | N/A | SI | SI | FK | FK microroute(id); UNIQUE (microroute_id, schedule_id, day_of_week) via uq_microroute_schedule | idx_microroute_schedule_microroute_id (microroute_id); uq_microroute_schedule (microroute_id, schedule_id, day_of_week) |
| schedule_id | Horario aplicado a la microrruta. | UUID | N/A | SI | SI | FK | FK schedule(id); UNIQUE (microroute_id, schedule_id, day_of_week) via uq_microroute_schedule | idx_microroute_schedule_schedule_id (schedule_id); uq_microroute_schedule (microroute_id, schedule_id, day_of_week) |
| day_of_week | Día de la semana de 1 a 7 (ISO: 1 = lunes, 7 = domingo). La combinación con microroute_id y schedule_id no puede repetirse. | SMALLINT | N/A | SI | SI | N/A | UNIQUE (microroute_id, schedule_id, day_of_week) via uq_microroute_schedule; CHECK (day_of_week BETWEEN 1 AND 7) | uq_microroute_schedule (microroute_id, schedule_id, day_of_week) |
| is_active | Indica si el horario de la microrruta está vigente (TRUE) o inactivo (FALSE). Por defecto TRUE. | BOOLEAN | N/A | SI | NO | N/A | DEFAULT TRUE | — |
| updated_at | Fecha y hora de la última modificación del registro (UTC). | TIMESTAMPTZ | N/A | SI | NO | N/A | DEFAULT now() | — |
| created_at | Fecha y hora de creación del registro (UTC). Por defecto now(). | TIMESTAMPTZ | N/A | SI | NO | N/A | DEFAULT now() | — |

- microroute_id referencia microroute(id): una microrruta tiene muchos horarios semanales; cada registro corresponde a una sola microrruta.
- schedule_id referencia schedule(id): un horario puede aplicarse a muchas microrrutas y días; cada registro usa un solo horario.

## microroute_neighborhood

barrios que atiende cada microrruta y su orden de visita

| Atributo | Descripción | Tipo | Longitud | Mandatorio | Único | Clave | Restricciones | Índice |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| id | Identificador único del registro. | UUID | N/A | SI | SI | PK | DEFAULT gen_random_uuid() | microroute_neighborhood_pkey (id) |
| microroute_id | Microrruta que atiende el barrio. | UUID | N/A | SI | SI | FK | FK microroute(id); UNIQUE (microroute_id, neighborhood_id) via uq_microroute_neighborhood; UNIQUE (microroute_id, order_visit) via uq_microroute_neighborhood_order | idx_microroute_neighborhood_microroute_id (microroute_id); uq_microroute_neighborhood (microroute_id, neighborhood_id); uq_microroute_neighborhood_order (microroute_id, order_visit) |
| neighborhood_id | Barrio atendido por la microrruta. | UUID | N/A | SI | SI | FK | FK btura_neighborhood(id); UNIQUE (microroute_id, neighborhood_id) via uq_microroute_neighborhood | idx_microroute_neighborhood_neighborhood_id (neighborhood_id); uq_microroute_neighborhood (microroute_id, neighborhood_id) |
| order_visit | Orden en que la microrruta visita el barrio. No puede repetirse dentro de la misma microrruta. | INTEGER | N/A | SI | SI | N/A | UNIQUE (microroute_id, order_visit) via uq_microroute_neighborhood_order; CHECK (order_visit > 0) | uq_microroute_neighborhood_order (microroute_id, order_visit) |

- microroute_id referencia microroute(id): una microrruta pasa por muchos barrios; cada registro corresponde a una sola microrruta.
- neighborhood_id referencia btura_neighborhood(id): un barrio puede ser atendido por muchas microrrutas; cada registro corresponde a un solo barrio.

## crew

cuadrilla de recolección

| Atributo | Descripción | Tipo | Longitud | Mandatorio | Único | Clave | Restricciones | Índice |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| id | Identificador único de la cuadrilla. | UUID | N/A | SI | SI | PK | DEFAULT gen_random_uuid() | crew_pkey (id) |
| name | Nombre de la cuadrilla. | VARCHAR | 100 | SI | NO | N/A | — | — |
| is_active | Indica si la cuadrilla está vigente (TRUE) o inactiva (FALSE). Por defecto TRUE. | BOOLEAN | N/A | SI | NO | N/A | DEFAULT TRUE | — |
| updated_at | Fecha y hora de la última modificación del registro (UTC). | TIMESTAMPTZ | N/A | SI | NO | N/A | DEFAULT now() | — |
| created_at | Fecha y hora de creación del registro (UTC). Por defecto now(). | TIMESTAMPTZ | N/A | SI | NO | N/A | DEFAULT now() | — |

- (No tiene llaves foráneas)

## crew_member

integrantes de la cuadrilla

| Atributo | Descripción | Tipo | Longitud | Mandatorio | Único | Clave | Restricciones | Índice |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| id | Identificador único del integrante. | UUID | N/A | SI | SI | PK | DEFAULT gen_random_uuid() | crew_member_pkey (id) |
| crew_id | Cuadrilla a la que pertenece el integrante. | UUID | N/A | NO | NO | FK | FK crew(id) | idx_crew_member_crew_id (crew_id) |
| full_name | Nombre completo del integrante. Dato personal. | VARCHAR | 120 | SI | NO | N/A | — | — |
| is_active | Indica si el integrante está vigente (TRUE) o inactivo (FALSE). Por defecto TRUE. | BOOLEAN | N/A | SI | NO | N/A | DEFAULT TRUE | — |
| updated_at | Fecha y hora de la última modificación del registro (UTC). | TIMESTAMPTZ | N/A | SI | NO | N/A | DEFAULT now() | — |
| created_at | Fecha y hora de creación del registro (UTC). Por defecto now(). | TIMESTAMPTZ | N/A | SI | NO | N/A | DEFAULT now() | — |

- crew_id referencia crew(id): una cuadrilla tiene muchos integrantes; cada integrante pertenece a una sola cuadrilla.

## driver

conductor asignado a una cuadrilla

| Atributo | Descripción | Tipo | Longitud | Mandatorio | Único | Clave | Restricciones | Índice |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| id | Identificador único del conductor. | UUID | N/A | SI | SI | PK | DEFAULT gen_random_uuid() | driver_pkey (id) |
| user_data_id | Datos personales del conductor. | UUID | N/A | SI | NO | FK | FK user_data(id) | idx_driver_user_data_id (user_data_id) |
| crew_id | Cuadrilla a la que está asignado el conductor. | UUID | N/A | NO | NO | FK | FK crew(id) | idx_driver_crew_id (crew_id) |
| started_at | Fecha y hora desde la que el conductor está asignado a la cuadrilla. Por defecto now(). | TIMESTAMPTZ | N/A | SI | NO | N/A | DEFAULT now() | — |
| ended_at | Fecha y hora en que terminó la asignación a la cuadrilla. NULL si sigue vigente. | TIMESTAMPTZ | N/A | NO | NO | N/A | CHECK (ended_at IS NULL OR ended_at >= started_at) | — |
| is_active | Indica si la asignación del conductor está vigente (TRUE) o inactiva (FALSE). Por defecto TRUE. | BOOLEAN | N/A | SI | NO | N/A | DEFAULT TRUE | — |
| updated_at | Fecha y hora de la última modificación del registro (UTC). | TIMESTAMPTZ | N/A | SI | NO | N/A | DEFAULT now() | — |
| created_at | Fecha y hora de creación del registro (UTC). Por defecto now(). | TIMESTAMPTZ | N/A | SI | NO | N/A | DEFAULT now() | — |

- user_data_id referencia user_data(id): unos datos personales pueden corresponder a varios registros de conductor; cada registro de conductor pertenece a unos datos personales.
- crew_id referencia crew(id): una cuadrilla puede tener varios conductores; cada registro de conductor pertenece a una sola cuadrilla.

## assignment

ejecución concreta de una programación de microrruta con conductor y vehículo

| Atributo | Descripción | Tipo | Longitud | Mandatorio | Único | Clave | Restricciones | Índice |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| id | Identificador único de la asignación. | UUID | N/A | SI | SI | PK | DEFAULT gen_random_uuid() | assignment_pkey (id) |
| driver_id | Conductor que realiza la asignación. | UUID | N/A | SI | NO | FK | FK driver(id) | idx_assignment_driver_id (driver_id) |
| microroute_schedule_id | Programación de microrruta que se ejecuta. | UUID | N/A | SI | SI | FK | FK microroute_schedule(id); UNIQUE (microroute_schedule_id, scheduled_start_at) via uq_assignment_schedule_start | idx_assignment_microroute_schedule_id (microroute_schedule_id); uq_assignment_schedule_start (microroute_schedule_id, scheduled_start_at) |
| vehicle_id | Vehículo utilizado en la ejecución. | UUID | N/A | SI | NO | FK | FK vehicle(id) | idx_assignment_vehicle_id (vehicle_id) |
| assignment_status | Estado actual de la asignación. | ENUM | N/A | SI | NO | N/A | ENUM: SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED | — |
| scheduled_start_at | Fecha y hora programadas de inicio de la asignación. | TIMESTAMPTZ | N/A | SI | SI | N/A | UNIQUE (microroute_schedule_id, scheduled_start_at) via uq_assignment_schedule_start | idx_assignment_scheduled_start_at (scheduled_start_at); uq_assignment_schedule_start (microroute_schedule_id, scheduled_start_at) |
| scheduled_end_at | Fecha y hora programadas de fin de la asignación. | TIMESTAMPTZ | N/A | SI | NO | N/A | CHECK (scheduled_end_at >= scheduled_start_at) | — |
| started_at | Fecha y hora reales de inicio del recorrido. NULL mientras no haya iniciado. | TIMESTAMPTZ | N/A | NO | NO | N/A | NULL permitido | — |
| ended_at | Fecha y hora reales de fin del recorrido. NULL mientras no haya terminado. | TIMESTAMPTZ | N/A | NO | NO | N/A | CHECK (ended_at IS NULL OR (started_at IS NOT NULL AND ended_at >= started_at)) | — |
| is_active | Indica si la asignación está vigente (TRUE) o inactiva (FALSE). Por defecto TRUE. | BOOLEAN | N/A | SI | NO | N/A | DEFAULT TRUE | — |
| updated_at | Fecha y hora de la última modificación del registro (UTC). | TIMESTAMPTZ | N/A | SI | NO | N/A | DEFAULT now() | — |
| created_at | Fecha y hora de creación del registro (UTC). Por defecto now(). | TIMESTAMPTZ | N/A | SI | NO | N/A | DEFAULT now() | — |

- driver_id referencia driver(id): un conductor puede tener muchas asignaciones; cada asignación tiene un solo conductor.
- microroute_schedule_id referencia microroute_schedule(id): una programación de microrruta puede tener muchas asignaciones; cada asignación corresponde a una sola programación.
- vehicle_id referencia vehicle(id): un vehículo puede tener muchas asignaciones; cada asignación usa un solo vehículo.

## vehicle_position

posiciones GPS reportadas por el vehículo durante una asignación

| Atributo | Descripción | Tipo | Longitud | Mandatorio | Único | Clave | Restricciones | Índice |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| id | Identificador único del reporte de posición. | UUID | N/A | SI | SI | PK | DEFAULT gen_random_uuid() | vehicle_position_pkey (id) |
| assignment_id | Asignación a la que pertenece la posición. Solo se aceptan posiciones de asignaciones en curso (regla de la aplicación). | UUID | N/A | SI | NO | FK | FK assignment(id) | idx_vehicle_position_assignment_recorded (assignment_id, recorded_at) |
| geom | Ubicación geográfica del vehículo (PostGIS, geometría de tipo punto). | POINT | N/A | SI | NO | N/A | NO DOCUMENTADO | idx_vehicle_position_geom GIST (geom) |
| recorded_at | Fecha y hora en que el dispositivo registró la posición (distinta de created_at, que es la del servidor). | TIMESTAMPTZ | N/A | SI | NO | N/A | — | idx_vehicle_position_assignment_recorded (assignment_id, recorded_at) |
| created_at | Fecha y hora de creación del registro (UTC). Por defecto now(). | TIMESTAMPTZ | N/A | SI | NO | N/A | DEFAULT now() | — |

- assignment_id referencia assignment(id): una asignación tiene muchas posiciones; cada posición pertenece a una sola asignación.

## user_account_log

auditoría de cambios en user_account

| Atributo | Descripción | Tipo | Longitud | Mandatorio | Único | Clave | Restricciones | Índice |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| id | Identificador único del evento de auditoría sobre una cuenta de usuario. | UUID | N/A | SI | SI | PK | DEFAULT gen_random_uuid() | user_account_log_pkey (id) |
| entity_id | Identificador del registro de una cuenta de usuario afectado. | UUID | N/A | SI | NO | FK | FK user_account(id) | idx_user_account_log_entity_id (entity_id) |
| actor_id | Quién realizó la acción: identificador de la cuenta de usuario o indicador de proceso automático. se guarda como UUID, si actor fue usuario. Vacio: si fue proceso automático. | UUID | N/A | NO | NO | FK | FK user_account(id) | idx_user_account_log_actor_id(actor_id) |
| action | Acción registrada: CREATE, UPDATE o DELETE. | ENUM | N/A | SI | NO | N/A | ENUM: CREATE, UPDATE, DELETE | — |
| old | Valores anteriores al cambio en formato JSON. NULL en CREATE. No debe contener contraseñas, hashes ni document_id. | JSONB | N/A | NO | NO | N/A | NULL permitido | — |
| new | Valores actuales al cambio en formato JSON. NULL en DELETE físico; en DELETE lógico conserva el registro con is_active = FALSE. No debe contener contraseñas, hashes ni document_id. | JSONB | N/A | NO | NO | N/A | NULL permitido | — |
| request_ip | Dirección IP desde la que se originó la acción. | INET | N/A | NO | NO | N/A | NULL permitido | — |
| created_at | Fecha y hora de creación del registro (UTC). Por defecto now(). | TIMESTAMPTZ | N/A | SI | NO | N/A | DEFAULT now() | idx_user_account_log_created_at (created_at) |

- entity_id referencia user_account(id): una entidad puede tener muchos registros de auditoría; cada registro pertenece a una sola entidad.
- actor_id referencia user_account(id): un actor puede tener muchos registros de auditoría; cada registro pertenece a un solo actor.

## user_data_log

auditoría de cambios en user_data

| Atributo | Descripción | Tipo | Longitud | Mandatorio | Único | Clave | Restricciones | Índice |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| id | Identificador único del evento de auditoría sobre un registro de datos personales. | UUID | N/A | SI | SI | PK | DEFAULT gen_random_uuid() | user_data_log_pkey (id) |
| entity_id | Identificador del registro de un registro de datos personales afectado. | UUID | N/A | SI | NO | FK | FK user_data(id) | idx_user_data_log_entity_id (entity_id) |
| actor_id | Quién realizó la acción: identificador de la cuenta de usuario o indicador de proceso automático. se guarda como UUID, si actor fue usuario. Vacio: si fue proceso automático. | UUID | N/A | NO | NO | FK | FK user_account(id) | idx_user_data_log_actor_id(actor_id) |
| action | Acción registrada: CREATE, UPDATE o DELETE. | ENUM | N/A | SI | NO | N/A | ENUM: CREATE, UPDATE, DELETE | — |
| old | Valores anteriores al cambio en formato JSON. NULL en CREATE. No debe contener contraseñas ni hashes. | JSONB | N/A | NO | NO | N/A | NULL permitido | — |
| new | Valores actuales al cambio en formato JSON. NULL en DELETE físico; en DELETE lógico conserva el registro con is_active = FALSE. No debe contener contraseñas ni hashes. | JSONB | N/A | NO | NO | N/A | NULL permitido | — |
| request_ip | Dirección IP desde la que se originó la acción. | INET | N/A | NO | NO | N/A | NULL permitido | — |
| created_at | Fecha y hora de creación del registro (UTC). Por defecto now(). | TIMESTAMPTZ | N/A | SI | NO | N/A | DEFAULT now() | idx_user_data_log_created_at (created_at) |

- entity_id referencia user_data(id): una entidad puede tener muchos registros de auditoría; cada registro pertenece a una sola entidad.
- actor_id referencia user_account(id): un actor puede tener muchos registros de auditoría; cada registro pertenece a un solo actor.

## profile_log

auditoría de cambios en profile

| Atributo | Descripción | Tipo | Longitud | Mandatorio | Único | Clave | Restricciones | Índice |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| id | Identificador único del evento de auditoría sobre un perfil. | UUID | N/A | SI | SI | PK | DEFAULT gen_random_uuid() | profile_log_pkey (id) |
| entity_id | Identificador del registro de un perfil afectado. | UUID | N/A | SI | NO | FK | FK profile(id) | idx_profile_log_entity_id (entity_id) |
| actor_id | Quién realizó la acción: identificador de la cuenta de usuario o indicador de proceso automático. se guarda como UUID, si actor fue usuario. Vacio: si fue proceso automático. | UUID | N/A | NO | NO | FK | FK user_account(id) | idx_profile_log_actor_id(actor_id) |
| action | Acción registrada: CREATE, UPDATE o DELETE. | ENUM | N/A | SI | NO | N/A | ENUM: CREATE, UPDATE, DELETE | — |
| old | Valores anteriores al cambio en formato JSON. NULL en CREATE. No debe contener contraseñas ni hashes. | JSONB | N/A | NO | NO | N/A | NULL permitido | — |
| new | Valores actuales al cambio en formato JSON. NULL en DELETE físico; en DELETE lógico conserva el registro con is_active = FALSE. No debe contener contraseñas ni hashes. | JSONB | N/A | NO | NO | N/A | NULL permitido | — |
| request_ip | Dirección IP desde la que se originó la acción. | INET | N/A | NO | NO | N/A | NULL permitido | — |
| created_at | Fecha y hora de creación del registro (UTC). Por defecto now(). | TIMESTAMPTZ | N/A | SI | NO | N/A | DEFAULT now() | idx_profile_log_created_at (created_at) |

- entity_id referencia profile(id): una entidad puede tener muchos registros de auditoría; cada registro pertenece a una sola entidad.
- actor_id referencia user_account(id): un actor puede tener muchos registros de auditoría; cada registro pertenece a un solo actor.

## crew_log

auditoría de cambios en crew

| Atributo | Descripción | Tipo | Longitud | Mandatorio | Único | Clave | Restricciones | Índice |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| id | Identificador único del evento de auditoría sobre una cuadrilla. | UUID | N/A | SI | SI | PK | DEFAULT gen_random_uuid() | crew_log_pkey (id) |
| entity_id | Identificador del registro de una cuadrilla afectado. | UUID | N/A | SI | NO | FK | FK crew(id) | idx_crew_log_entity_id (entity_id) |
| actor_id | Quién realizó la acción: identificador de la cuenta de usuario o indicador de proceso automático. se guarda como UUID, si actor fue usuario. Vacio: si fue proceso automático. | UUID | N/A | NO | NO | FK | FK user_account(id) | idx_crew_log_actor_id(actor_id) |
| action | Acción registrada: CREATE, UPDATE o DELETE. | ENUM | N/A | SI | NO | N/A | ENUM: CREATE, UPDATE, DELETE | — |
| old | Valores anteriores al cambio en formato JSON. NULL en CREATE. No debe contener contraseñas ni hashes. | JSONB | N/A | NO | NO | N/A | NULL permitido | — |
| new | Valores actuales al cambio en formato JSON. NULL en DELETE físico; en DELETE lógico conserva el registro con is_active = FALSE. No debe contener contraseñas ni hashes. | JSONB | N/A | NO | NO | N/A | NULL permitido | — |
| request_ip | Dirección IP desde la que se originó la acción. | INET | N/A | NO | NO | N/A | NULL permitido | — |
| created_at | Fecha y hora de creación del registro (UTC). Por defecto now(). | TIMESTAMPTZ | N/A | SI | NO | N/A | DEFAULT now() | idx_crew_log_created_at (created_at) |

- entity_id referencia crew(id): una entidad puede tener muchos registros de auditoría; cada registro pertenece a una sola entidad.
- actor_id referencia user_account(id): un actor puede tener muchos registros de auditoría; cada registro pertenece a un solo actor.

## crew_member_log

auditoría de cambios en crew_member

| Atributo | Descripción | Tipo | Longitud | Mandatorio | Único | Clave | Restricciones | Índice |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| id | Identificador único del evento de auditoría sobre un integrante de cuadrilla. | UUID | N/A | SI | SI | PK | DEFAULT gen_random_uuid() | crew_member_log_pkey (id) |
| entity_id | Identificador del registro de un integrante de cuadrilla afectado. | UUID | N/A | SI | NO | FK | FK crew_member(id) | idx_crew_member_log_entity_id (entity_id) |
| actor_id | Quién realizó la acción: identificador de la cuenta de usuario o indicador de proceso automático. se guarda como UUID, si actor fue usuario. Vacio: si fue proceso automático. | UUID | N/A | NO | NO | FK | FK user_account(id) | idx_crew_member_log_actor_id(actor_id) |
| action | Acción registrada: CREATE, UPDATE o DELETE. | ENUM | N/A | SI | NO | N/A | ENUM: CREATE, UPDATE, DELETE | — |
| old | Valores anteriores al cambio en formato JSON. NULL en CREATE. No debe contener contraseñas ni hashes. | JSONB | N/A | NO | NO | N/A | NULL permitido | — |
| new | Valores actuales al cambio en formato JSON. NULL en DELETE físico; en DELETE lógico conserva el registro con is_active = FALSE. No debe contener contraseñas ni hashes. | JSONB | N/A | NO | NO | N/A | NULL permitido | — |
| request_ip | Dirección IP desde la que se originó la acción. | INET | N/A | NO | NO | N/A | NULL permitido | — |
| created_at | Fecha y hora de creación del registro (UTC). Por defecto now(). | TIMESTAMPTZ | N/A | SI | NO | N/A | DEFAULT now() | idx_crew_member_log_created_at (created_at) |

- entity_id referencia crew_member(id): una entidad puede tener muchos registros de auditoría; cada registro pertenece a una sola entidad.
- actor_id referencia user_account(id): un actor puede tener muchos registros de auditoría; cada registro pertenece a un solo actor.

## driver_log

auditoría de cambios en driver

| Atributo | Descripción | Tipo | Longitud | Mandatorio | Único | Clave | Restricciones | Índice |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| id | Identificador único del evento de auditoría sobre un conductor. | UUID | N/A | SI | SI | PK | DEFAULT gen_random_uuid() | driver_log_pkey (id) |
| entity_id | Identificador del registro de un conductor afectado. | UUID | N/A | SI | NO | FK | FK driver(id) | idx_driver_log_entity_id (entity_id) |
| actor_id | Quién realizó la acción: identificador de la cuenta de usuario o indicador de proceso automático. se guarda como UUID, si actor fue usuario. Vacio: si fue proceso automático. | UUID | N/A | NO | NO | FK | FK user_account(id) | idx_driver_log_actor_id(actor_id) |
| action | Acción registrada: CREATE, UPDATE o DELETE. | ENUM | N/A | SI | NO | N/A | ENUM: CREATE, UPDATE, DELETE | — |
| old | Valores anteriores al cambio en formato JSON. NULL en CREATE. No debe contener contraseñas ni hashes. | JSONB | N/A | NO | NO | N/A | NULL permitido | — |
| new | Valores actuales al cambio en formato JSON. NULL en DELETE físico; en DELETE lógico conserva el registro con is_active = FALSE. No debe contener contraseñas ni hashes. | JSONB | N/A | NO | NO | N/A | NULL permitido | — |
| request_ip | Dirección IP desde la que se originó la acción. | INET | N/A | NO | NO | N/A | NULL permitido | — |
| created_at | Fecha y hora de creación del registro (UTC). Por defecto now(). | TIMESTAMPTZ | N/A | SI | NO | N/A | DEFAULT now() | idx_driver_log_created_at (created_at) |

- entity_id referencia driver(id): una entidad puede tener muchos registros de auditoría; cada registro pertenece a una sola entidad.
- actor_id referencia user_account(id): un actor puede tener muchos registros de auditoría; cada registro pertenece a un solo actor.

## macroroute_log

auditoría de cambios en macroroute

| Atributo | Descripción | Tipo | Longitud | Mandatorio | Único | Clave | Restricciones | Índice |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| id | Identificador único del evento de auditoría sobre una macrorruta. | UUID | N/A | SI | SI | PK | DEFAULT gen_random_uuid() | macroroute_log_pkey (id) |
| entity_id | Identificador del registro de una macrorruta afectado. | UUID | N/A | SI | NO | FK | FK macroroute(id) | idx_macroroute_log_entity_id (entity_id) |
| actor_id | Quién realizó la acción: identificador de la cuenta de usuario o indicador de proceso automático. se guarda como UUID, si actor fue usuario. Vacio: si fue proceso automático. | UUID | N/A | NO | NO | FK | FK user_account(id) | idx_macroroute_log_actor_id(actor_id) |
| action | Acción registrada: CREATE, UPDATE o DELETE. | ENUM | N/A | SI | NO | N/A | ENUM: CREATE, UPDATE, DELETE | — |
| old | Valores anteriores al cambio en formato JSON. NULL en CREATE. No debe contener contraseñas ni hashes. | JSONB | N/A | NO | NO | N/A | NULL permitido | — |
| new | Valores actuales al cambio en formato JSON. NULL en DELETE físico; en DELETE lógico conserva el registro con is_active = FALSE. No debe contener contraseñas ni hashes. | JSONB | N/A | NO | NO | N/A | NULL permitido | — |
| request_ip | Dirección IP desde la que se originó la acción. | INET | N/A | NO | NO | N/A | NULL permitido | — |
| created_at | Fecha y hora de creación del registro (UTC). Por defecto now(). | TIMESTAMPTZ | N/A | SI | NO | N/A | DEFAULT now() | idx_macroroute_log_created_at (created_at) |

- entity_id referencia macroroute(id): una entidad puede tener muchos registros de auditoría; cada registro pertenece a una sola entidad.
- actor_id referencia user_account(id): un actor puede tener muchos registros de auditoría; cada registro pertenece a un solo actor.

## microroute_log

auditoría de cambios en microroute

| Atributo | Descripción | Tipo | Longitud | Mandatorio | Único | Clave | Restricciones | Índice |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| id | Identificador único del evento de auditoría sobre una microrruta. | UUID | N/A | SI | SI | PK | DEFAULT gen_random_uuid() | microroute_log_pkey (id) |
| entity_id | Identificador del registro de una microrruta afectado. | UUID | N/A | SI | NO | FK | FK microroute(id) | idx_microroute_log_entity_id (entity_id) |
| actor_id | Quién realizó la acción: identificador de la cuenta de usuario o indicador de proceso automático. se guarda como UUID, si actor fue usuario. Vacio: si fue proceso automático. | UUID | N/A | NO | NO | FK | FK user_account(id) | idx_microroute_log_actor_id(actor_id) |
| action | Acción registrada: CREATE, UPDATE o DELETE. | ENUM | N/A | SI | NO | N/A | ENUM: CREATE, UPDATE, DELETE | — |
| old | Valores anteriores al cambio en formato JSON. NULL en CREATE. No debe contener contraseñas ni hashes. | JSONB | N/A | NO | NO | N/A | NULL permitido | — |
| new | Valores actuales al cambio en formato JSON. NULL en DELETE físico; en DELETE lógico conserva el registro con is_active = FALSE. No debe contener contraseñas ni hashes. | JSONB | N/A | NO | NO | N/A | NULL permitido | — |
| request_ip | Dirección IP desde la que se originó la acción. | INET | N/A | NO | NO | N/A | NULL permitido | — |
| created_at | Fecha y hora de creación del registro (UTC). Por defecto now(). | TIMESTAMPTZ | N/A | SI | NO | N/A | DEFAULT now() | idx_microroute_log_created_at (created_at) |

- entity_id referencia microroute(id): una entidad puede tener muchos registros de auditoría; cada registro pertenece a una sola entidad.
- actor_id referencia user_account(id): un actor puede tener muchos registros de auditoría; cada registro pertenece a un solo actor.

## assignment_log

auditoría de cambios en assignment

| Atributo | Descripción | Tipo | Longitud | Mandatorio | Único | Clave | Restricciones | Índice |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| id | Identificador único del evento de auditoría sobre una asignación. | UUID | N/A | SI | SI | PK | DEFAULT gen_random_uuid() | assignment_log_pkey (id) |
| entity_id | Identificador del registro de una asignación afectado. | UUID | N/A | SI | NO | FK | FK assignment(id) | idx_assignment_log_entity_id (entity_id) |
| actor_id | Quién realizó la acción: identificador de la cuenta de usuario o indicador de proceso automático. se guarda como UUID, si actor fue usuario. Vacio: si fue proceso automático. | UUID | N/A | NO | NO | FK | FK user_account(id) | idx_assignment_log_actor_id(actor_id) |
| action | Acción registrada: CREATE, UPDATE o DELETE. | ENUM | N/A | SI | NO | N/A | ENUM: CREATE, UPDATE, DELETE | — |
| old | Valores anteriores al cambio en formato JSON. NULL en CREATE. No debe contener contraseñas ni hashes. | JSONB | N/A | NO | NO | N/A | NULL permitido | — |
| new | Valores actuales al cambio en formato JSON. NULL en DELETE físico; en DELETE lógico conserva el registro con is_active = FALSE. No debe contener contraseñas ni hashes. | JSONB | N/A | NO | NO | N/A | NULL permitido | — |
| request_ip | Dirección IP desde la que se originó la acción. | INET | N/A | NO | NO | N/A | NULL permitido | — |
| created_at | Fecha y hora de creación del registro (UTC). Por defecto now(). | TIMESTAMPTZ | N/A | SI | NO | N/A | DEFAULT now() | idx_assignment_log_created_at (created_at) |

- entity_id referencia assignment(id): una entidad puede tener muchos registros de auditoría; cada registro pertenece a una sola entidad.
- actor_id referencia user_account(id): un actor puede tener muchos registros de auditoría; cada registro pertenece a un solo actor.

## vehicle_log

auditoría de cambios en vehicle

| Atributo | Descripción | Tipo | Longitud | Mandatorio | Único | Clave | Restricciones | Índice |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| id | Identificador único del evento de auditoría sobre un vehículo. | UUID | N/A | SI | SI | PK | DEFAULT gen_random_uuid() | vehicle_log_pkey (id) |
| entity_id | Identificador del registro de un vehículo afectado. | UUID | N/A | SI | NO | FK | FK vehicle(id) | idx_vehicle_log_entity_id (entity_id) |
| actor_id | Quién realizó la acción: identificador de la cuenta de usuario o indicador de proceso automático. se guarda como UUID, si actor fue usuario. Vacio: si fue proceso automático. | UUID | N/A | NO | NO | FK | FK user_account(id) | idx_vehicle_log_actor_id(actor_id) |
| action | Acción registrada: CREATE, UPDATE o DELETE. | ENUM | N/A | SI | NO | N/A | ENUM: CREATE, UPDATE, DELETE | — |
| old | Valores anteriores al cambio en formato JSON. NULL en CREATE. No debe contener contraseñas ni hashes. | JSONB | N/A | NO | NO | N/A | NULL permitido | — |
| new | Valores actuales al cambio en formato JSON. NULL en DELETE físico; en DELETE lógico conserva el registro con is_active = FALSE. No debe contener contraseñas ni hashes. | JSONB | N/A | NO | NO | N/A | NULL permitido | — |
| request_ip | Dirección IP desde la que se originó la acción. | INET | N/A | NO | NO | N/A | NULL permitido | — |
| created_at | Fecha y hora de creación del registro (UTC). Por defecto now(). | TIMESTAMPTZ | N/A | SI | NO | N/A | DEFAULT now() | idx_vehicle_log_created_at (created_at) |

- entity_id referencia vehicle(id): una entidad puede tener muchos registros de auditoría; cada registro pertenece a una sola entidad.
- actor_id referencia user_account(id): un actor puede tener muchos registros de auditoría; cada registro pertenece a un solo actor.
