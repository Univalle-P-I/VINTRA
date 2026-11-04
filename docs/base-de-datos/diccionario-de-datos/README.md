# Índice

1. [user_role](#11-user_role)
2. [user_status](#12-user_status)
3. [document_type](#13-document_type)
4. [user_account](#14-user_account)
5. [user_data](#15-user_data)
6. [profile](#16-profile)
7. [session](#17-session)
8. [password_reset_token](#18-password_reset_token)
9. [audit_log](#19-audit_log)
10. [crew](#110-crew)
11. [crew_member](#111-crew_member)
12. [vehicule_status](#112-vehicule_status)
13. [vehicule_type](#113-vehicule_type)
14. [vehicule](#114-vehicule)
15. [assigment_status](#115-assignment_status)
16. [assignment](#116-assignment)
17. [vehicule_position](#117-vehicule_position)
18. [macrorute](#118-macroroute)
19. [microrute](#119-microroute)
20. [schedule](#120-schedule)
21. [microrute_schedule](#121-microroute_schedule)
22. [btura_neighborhood](#122-btura_neighborhood)
23. [microrute_neighborhood](#123-microroute_neighborhood)
24. [email_validation_token](#124-email_validation_token)

# 1. Diccionario de Datos:

## 1.1. user_role

| atributo | descripción | tipo | longitud | mandatorio | unico | clave | restricciones |
| --- | --- | --- | --- | --- | --- | --- | --- |
| id | Identificador único del rol. | UUID | N/A | SI | SI | PK | N/A |
| code | Identificador lógico estable del rol. | VARCHAR | 30 | SI | SI | N/A | N/A |
| name | Nombre legible para mostrar en pantalla. | VARCHAR | 100 | SI | NO | N/A | N/A |
| is_active | Indica si el registro está vigente (TRUE) o inactivo (FALSE). Por defecto TRUE. | BOOLEAN | N/A | SI | NO | N/A | Por defecto TRUE |
| created_at | Fecha y hora de creación del registro (UTC). Por defecto now(). | TIMESTAMPTZ | N/A | SI | NO | N/A | Por defecto now() |

## 1.2. user_status

| atributo | descripción | tipo | longitud | mandatorio | unico | clave | restricciones |
| --- | --- | --- | --- | --- | --- | --- | --- |
| id | Identificador único del estado. | UUID | N/A | SI | SI | PK | N/A |
| code | Identificador lógico estable del estado. | VARCHAR | 30 | SI | SI | N/A | N/A |
| name | Nombre legible para mostrar en pantalla. | VARCHAR | 100 | SI | NO | N/A | N/A |
| is_active | Indica si el registro está vigente (TRUE) o inactivo (FALSE). Por defecto TRUE. | BOOLEAN | N/A | SI | NO | N/A | Por defecto TRUE |
| created_at | Fecha y hora de creación del registro (UTC). Por defecto now(). | TIMESTAMPTZ | N/A | SI | NO | N/A | Por defecto now() |

## 1.3. document_type

| atributo | descripción | tipo | longitud | mandatorio | unico | clave | restricciones |
| --- | --- | --- | --- | --- | --- | --- | --- |
| id | Identificador único del tipo de documento. | UUID | N/A | SI | SI | PK | N/A |
| code | Identificador único estable para lógica del sistema. | VARCHAR | 30 | SI | SI | N/A | N/A |
| name | Nombre del tipo de documento (ej.: cédula de ciudadanía, cédula de extranjería, pasaporte). | VARCHAR | 50 | SI | SI | N/A | N/A |
| is_active | Indica si el registro está vigente (TRUE) o inactivo (FALSE). Por defecto TRUE. | BOOLEAN | N/A | SI | NO | N/A | Por defecto TRUE |
| created_at | Fecha y hora de creación del registro (UTC). Por defecto now(). | TIMESTAMPTZ | N/A | SI | NO | N/A | Por defecto now() |

## 1.4. user_account

| atributo | descripción | tipo | longitud | mandatorio | unico | clave | restricciones | índice |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| id | Identificador único de la cuenta de usuario. | UUID | N/A | SI | SI | PK | N/A | N/A |
| user_status_id | Estado administrativo de la cuenta. Determina si puede iniciar sesión. | UUID | N/A | SI | NO | FK | Referencia user_status(id) | idx_user_account_user_status_id (user_status_id) |
| document_type_id | Tipo de documento de identidad del titular de la cuenta. | UUID | N/A | SI | SI | FK | Compuesto único con document_id; referencia document_type(id) | idx_user_account_document_type_id (document_type_id) |
| document_id | Número de documento de identidad del titular. Dato personal sensible. No puede repetirse junto con document_type_id. | VARCHAR | 20 | SI | SI | FK | Compuesto único con document_type_id | N/A |
| pwd_hash | Hash de la contraseña (Argon2id; incluye sal y parámetros). | TEXT | N/A | SI | NO | N/A | N/A | N/A |
| failed_attempts | Intentos fallidos consecutivos de inicio de sesión. Se reinicia al autenticarse con éxito. Por defecto 0. | SMALLINT | N/A | SI | NO | N/A | Por defecto 0 | N/A |
| locked_until | Fecha hasta la cual la cuenta está bloqueada temporalmente por intentos fallidos. NULL si no está bloqueada. | TIMESTAMPTZ | N/A | NO | NO | N/A | NULL permitido | N/A |
| last_login_at | Fecha y hora del último inicio de sesión exitoso. NULL si nunca ha ingresado. | TIMESTAMPTZ | N/A | NO | NO | N/A | NULL permitido | N/A |
| password_changed_at | Fecha y hora del último cambio de contraseña. NULL si no se ha cambiado desde la creación. | TIMESTAMPTZ | N/A | NO | NO | N/A | NULL permitido | N/A |
| updated_at | Fecha y hora de la última modificación del registro (UTC). | TIMESTAMPTZ | N/A | SI | NO | N/A | N/A | N/A |
| created_at | Fecha y hora de creación del registro (UTC). Por defecto now(). | TIMESTAMPTZ | N/A | SI | NO | N/A | Por defecto now() | N/A |

## 1.5. user_data

| atributo | descripción | tipo | longitud | mandatorio | unico | clave | restricciones |
| --- | --- | --- | --- | --- | --- | --- | --- |
| id | Identificador único de los datos personales. Es el mismo id de user_account (relación 1 a 1). | UUID | N/A | SI | SI | PK | Referencia user_account(id) |
| first_name | Nombres de la persona. Dato personal. | VARCHAR | 80 | SI | NO | N/A | N/A |
| last_name | Apellidos de la persona. Dato personal. | VARCHAR | 80 | SI | NO | N/A | N/A |
| email | Correo electrónico de la persona. Dato personal. | VARCHAR | 254 | SI | SI | N/A | N/A |
| phone | Número de teléfono de contacto. Dato personal. | VARCHAR | 10 | NO | NO | N/A | NULL permitido |
| updated_at | Fecha y hora de la última modificación del registro (UTC). | TIMESTAMPTZ | N/A | SI | NO | N/A | N/A |
| created_at | Fecha y hora de creación del registro (UTC). Por defecto now(). | TIMESTAMPTZ | N/A | SI | NO | N/A | Por defecto now() |

## 1.6. profile

| atributo | descripción | tipo | longitud | mandatorio | unico | clave | restricciones | índice |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| id | Identificador único del perfil. | UUID | N/A | SI | SI | PK | N/A | N/A |
| user_role_id | Rol que se ejerce con este perfil (ej.: conductor). Una cuenta no puede repetir el mismo rol. | UUID | N/A | SI | SI | FK | Compuesto único con user_account_id; referencia user_role(id) | idx_profile_user_role_id (user_role_id) |
| user_account_id | Cuenta de usuario a la que pertenece el perfil. | UUID | N/A | SI | SI | FK | Compuesto único con user_role_id; referencia user_account(id) | idx_profile_user_account_id (user_account_id) |
| is_active | Indica si el perfil está vigente (TRUE) o inactivo (FALSE). Por defecto TRUE. | BOOLEAN | N/A | SI | NO | N/A | Por defecto TRUE | N/A |
| created_at | Fecha y hora de creación del registro (UTC). Por defecto now(). | TIMESTAMPTZ | N/A | SI | NO | N/A | Por defecto now() | N/A |

## 1.7. session

| atributo | descripción | tipo | longitud | mandatorio | unico | clave | restricciones | índice |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| id | Identificador único de la sesión. | UUID | N/A | SI | SI | PK | N/A | N/A |
| user_account_id | Cuenta de usuario dueña de la sesión. | UUID | N/A | SI | NO | FK | Referencia user_account(id) | idx_session_user_account_id (user_account_id) |
| token_hash | Hash SHA-256 (hexadecimal) del token de sesión. El token en claro nunca se almacena. | CHAR | 64 | SI | SI | N/A | N/A | N/A |
| request_ip | Dirección IP desde la que se abrió la sesión. | INET | N/A | NO | NO | N/A | NULL permitido | N/A |
| revoked_at | Fecha y hora en que la sesión fue revocada (cierre de sesión, cambio de contraseña, bloqueo). NULL si sigue vigente. | TIMESTAMPTZ | N/A | NO | NO | N/A | NULL permitido | N/A |
| last_used_at | Fecha y hora del último uso de la sesión. | TIMESTAMPTZ | N/A | NO | NO | N/A | NULL permitido | N/A |
| expires_at | Fecha y hora de vencimiento de la sesión. Pasada esta fecha deja de ser válida. | TIMESTAMPTZ | N/A | SI | NO | N/A | N/A | idx_session_expires_at (expires_at) |
| created_at | Fecha y hora de creación del registro (UTC). Por defecto now(). | TIMESTAMPTZ | N/A | SI | NO | N/A | Por defecto now() | N/A |

## 1.8. password_reset_token

| atributo | descripción | tipo | longitud | mandatorio | unico | clave | restricciones | índice |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| id | Identificador único de la solicitud de restablecimiento. | UUID | N/A | SI | SI | PK | N/A | N/A |
| user_account_id | Cuenta de usuario que solicitó el restablecimiento. | UUID | N/A | SI | NO | FK | Referencia user_account(id) | idx_password_reset_token_user_account_id (user_account_id) |
| token_hash | Hash SHA-256 (hexadecimal) del token enviado al usuario. El token en claro nunca se almacena. | CHAR | 64 | SI | SI | N/A | N/A | N/A |
| request_ip | Dirección IP desde la que se hizo la solicitud. | INET | N/A | NO | NO | N/A | NULL permitido | N/A |
| used_at | Fecha y hora en que se usó el token. NULL mientras no se haya usado (un solo uso). | TIMESTAMPTZ | N/A | NO | NO | N/A | NULL permitido | N/A |
| expires_at | Fecha y hora de vencimiento del token (vida corta). | TIMESTAMPTZ | N/A | SI | NO | N/A | N/A | idx_password_reset_token_expires_at (expires_at) |
| created_at | Fecha y hora de creación del registro (UTC). Por defecto now(). | TIMESTAMPTZ | N/A | SI | NO | N/A | Por defecto now() | N/A |

## 1.9. audit_log

| atributo | descripción | tipo | longitud | mandatorio | unico | clave | restricciones | índice |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| id | Identificador único del evento de auditoría. | UUID | N/A | SI | SI | PK | N/A | N/A |
| actor | Quién realizó la acción: identificador de la cuenta de usuario o indicador de proceso automático del sistema. Se guarda como texto. | TEXT | N/A | SI | NO | N/A | Referencia polimórfica no formal | N/A |
| action | Acción registrada: CREATE, UPDATE o DELETE. | ENUM | N/A | SI | NO | N/A | Valores permitidos: CREATE, UPDATE, DELETE | N/A |
| entity | Nombre de la tabla afectada (ej.: vehicle, assignment, microroute). | VARCHAR | 50 | SI | NO | N/A | N/A | idx_audit_log_entity (entity, entity_id) |
| entity_id | Identificador del registro afectado dentro de entity. Referencia polimórfica. | UUID | N/A | SI | NO | N/A | Referencia polimórfica no formal | N/A |
| old_values | Valores anteriores al cambio en formato JSON. NULL en CREATE. Nunca debe contener contraseñas ni hashes. | JSONB | N/A | NO | NO | N/A | NULL permitido; no debe contener contraseñas ni hashes | N/A |
| new_values | Valores posteriores al cambio en formato JSON. NULL en DELETE. Nunca debe contener contraseñas ni hashes. | JSONB | N/A | NO | NO | N/A | NULL permitido; no debe contener contraseñas ni hashes | N/A |
| request_ip | Dirección IP desde la que se originó la acción. | INET | N/A | NO | NO | N/A | NULL permitido | N/A |
| created_at | Fecha y hora de creación del registro (UTC). Por defecto now(). | TIMESTAMPTZ | N/A | SI | NO | N/A | Por defecto now() | idx_audit_log_created_at (created_at) |

## 1.10. crew

| atributo | descripción | tipo | longitud | mandatorio | unico | clave | restricciones | índice |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| id | Identificador único de la cuadrilla. | UUID | N/A | SI | SI | PK | N/A | N/A |
| user_data_id | Conductor que representa y encabeza la cuadrilla. Que la persona tenga el rol de conductor se valida en la aplicación. | UUID | N/A | SI | SI | FK | Referencia user_data(id) | idx_crew_user_data_id (user_data_id) |
| name | Nombre de la cuadrilla. | VARCHAR | 100 | SI | NO | N/A | N/A | N/A |
| is_active | Indica si la cuadrilla está vigente (TRUE) o inactiva (FALSE). Por defecto TRUE. | BOOLEAN | N/A | SI | NO | N/A | Por defecto TRUE | N/A |
| updated_at | Fecha y hora de la última modificación del registro (UTC). | TIMESTAMPTZ | N/A | SI | NO | N/A | N/A | N/A |
| created_at | Fecha y hora de creación del registro (UTC). Por defecto now(). | TIMESTAMPTZ | N/A | SI | NO | N/A | Por defecto now() | N/A |

## 1.11. crew_member

| atributo | descripción | tipo | longitud | mandatorio | unico | clave | restricciones | índice |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| id | Identificador único del integrante. | UUID | N/A | SI | SI | PK | N/A | N/A |
| crew_id | Cuadrilla a la que pertenece el integrante. | UUID | N/A | SI | NO | FK | Referencia crew(id) | idx_crew_member_crew_id (crew_id) |
| full_name | Nombre completo del integrante. Dato personal. | VARCHAR | 120 | SI | NO | N/A | N/A | N/A |
| is_active | Indica si el integrante está vigente (TRUE) o inactivo (FALSE). Por defecto TRUE. | BOOLEAN | N/A | SI | NO | N/A | Por defecto TRUE | N/A |
| created_at | Fecha y hora de creación del registro (UTC). Por defecto now(). | TIMESTAMPTZ | N/A | SI | NO | N/A | Por defecto now() | N/A |

## 1.12. vehicle_status

| atributo | descripción | tipo | longitud | mandatorio | unico | clave | restricciones |
| --- | --- | --- | --- | --- | --- | --- | --- |
| id | Identificador único del estado. | UUID | N/A | SI | SI | PK | N/A |
| code | Código estable del estado (ej.: AVAILABLE, MAINTENANCE) que la aplicación usa en su lógica. | VARCHAR | 30 | SI | SI | N/A | N/A |
| name | Nombre legible para mostrar en pantalla. | VARCHAR | 100 | SI | NO | N/A | N/A |
| is_active | Indica si el registro está vigente (TRUE) o inactivo (FALSE). Por defecto TRUE. | BOOLEAN | N/A | SI | NO | N/A | Por defecto TRUE |
| created_at | Fecha y hora de creación del registro (UTC). Por defecto now(). | TIMESTAMPTZ | N/A | SI | NO | N/A | Por defecto now() |

## 1.13. vehicle_type

| atributo | descripción | tipo | longitud | mandatorio | unico | clave | restricciones |
| --- | --- | --- | --- | --- | --- | --- | --- |
| id | Identificador único del tipo de vehículo. | UUID | N/A | SI | SI | PK | N/A |
| code | Código estable del tipo de vehículo que la aplicación usa en su lógica. | VARCHAR | 30 | SI | SI | N/A | N/A |
| name | Nombre legible para mostrar en pantalla. | VARCHAR | 100 | SI | NO | N/A | N/A |
| is_active | Indica si el registro está vigente (TRUE) o inactivo (FALSE). Por defecto TRUE. | BOOLEAN | N/A | SI | NO | N/A | Por defecto TRUE |
| created_at | Fecha y hora de creación del registro (UTC). Por defecto now(). | TIMESTAMPTZ | N/A | SI | NO | N/A | Por defecto now() |

## 1.14. vehicle

| atributo | descripción | tipo | longitud | mandatorio | unico | clave | restricciones | índice |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| id | Identificador único del vehículo. | UUID | N/A | SI | SI | PK | N/A | N/A |
| vehicle_status_id | Estado actual del vehículo. | UUID | N/A | SI | NO | FK | Referencia vehicle_status(id) | idx_vehicle_vehicle_status_id (vehicle_status_id) |
| vehicle_type_id | Tipo de vehículo. | UUID | N/A | SI | NO | FK | Referencia vehicle_type(id) | idx_vehicle_vehicle_type_id (vehicle_type_id) |
| plate | Placa del vehículo. No puede repetirse. | CHAR | 6 | SI | SI | N/A | N/A | N/A |
| capacity_kg | Capacidad de carga en kilogramos. | NUMERIC | N/A | SI | NO | N/A | N/A | N/A |
| capacity_yd3 | Capacidad volumétrica en yardas cúbicas. | NUMERIC | N/A | SI | NO | N/A | N/A | N/A |
| is_active | Indica si el vehículo está vigente (TRUE) o inactivo (FALSE). Por defecto TRUE. | BOOLEAN | N/A | SI | NO | N/A | Por defecto TRUE | N/A |
| updated_at | Fecha y hora de la última modificación del registro (UTC). | TIMESTAMPTZ | N/A | SI | NO | N/A | N/A | N/A |
| created_at | Fecha y hora de creación del registro (UTC). Por defecto now(). | TIMESTAMPTZ | N/A | SI | NO | N/A | Por defecto now() | N/A |

## 1.15. assignment_status

| atributo | descripción | tipo | longitud | mandatorio | unico | clave | restricciones |
| --- | --- | --- | --- | --- | --- | --- | --- |
| id | Identificador único del estado. | UUID | N/A | SI | SI | PK | N/A |
| code | Código estable del estado (ej.: SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED) que la aplicación y el proceso automático usan en su lógica. | VARCHAR | 30 | SI | SI | N/A | N/A |
| name | Nombre legible para mostrar en pantalla. | VARCHAR | 100 | SI | NO | N/A | N/A |
| is_active | Indica si el registro está vigente (TRUE) o inactivo (FALSE). Por defecto TRUE. | BOOLEAN | N/A | SI | NO | N/A | Por defecto TRUE |
| created_at | Fecha y hora de creación del registro (UTC). Por defecto now(). | TIMESTAMPTZ | N/A | SI | NO | N/A | Por defecto now() |

## 1.16. assignment

| atributo | descripción | tipo | longitud | mandatorio | unico | clave | restricciones | índice |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| id | Identificador único de la asignación. | UUID | N/A | SI | SI | PK | N/A | N/A |
| crew_id | Cuadrilla que ejecuta la microruta. | UUID | N/A | SI | NO | FK | Referencia crew(id) | idx_assignment_crew_id (crew_id) |
| microroute_id | Microruta que se ejecuta. Junto con scheduled_date no puede repetirse (una ejecución por día). | UUID | N/A | SI | SI | FK | Compuesto único con scheduled_date; referencia microroute(id) | idx_assignment_microroute_id (microroute_id) |
| vehicle_id | Vehículo utilizado en la ejecución. | UUID | N/A | SI | NO | FK | Referencia vehicle(id) | idx_assignment_vehicle_id (vehicle_id) |
| assignment_status_id | Estado actual de la asignación. | UUID | N/A | SI | NO | FK | Referencia assignment_status(id) | idx_assignment_assignment_status_id (assignment_status_id) |
| scheduled_date | Fecha programada de ejecución de la microruta. Junto con microroute_id no puede repetirse. | DATE | N/A | SI | SI | N/A | Compuesto único con microroute_id | idx_assignment_scheduled_date (scheduled_date) |
| started_at | Fecha y hora reales de inicio del recorrido. NULL mientras no haya iniciado. | TIMESTAMPTZ | N/A | NO | NO | N/A | NULL permitido | N/A |
| ended_at | Fecha y hora reales de fin del recorrido. NULL mientras no haya terminado. | TIMESTAMPTZ | N/A | NO | NO | N/A | NULL permitido | N/A |
| updated_at | Fecha y hora de la última modificación del registro (UTC). | TIMESTAMPTZ | N/A | SI | NO | N/A | N/A | N/A |
| created_at | Fecha y hora de creación del registro (UTC). Por defecto now(). | TIMESTAMPTZ | N/A | SI | NO | N/A | Por defecto now() | N/A |

## 1.17. vehicle_position

| atributo | descripción | tipo | longitud | mandatorio | unico | clave | restricciones | índice |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| id | Identificador único del reporte de posición. | UUID | N/A | SI | SI | PK | N/A | N/A |
| assignment_id | Asignación en curso a la que pertenece la posición. Solo se aceptan posiciones de asignaciones en curso (regla de la aplicación). | UUID | N/A | SI | NO | FK | Referencia assignment(id) | idx_vehicle_position_assignment_id (assignment_id) |
| geom | Ubicación geográfica del vehículo (PostGIS, geometría de tipo punto). | POINT | N/A | SI | NO | N/A | N/A | GIST idx_vehicle_position_geom (geom) |
| recorded_at | Fecha y hora en que el dispositivo registró la posición (distinta de created_at, que es la del servidor). | TIMESTAMPTZ | N/A | SI | NO | N/A | N/A | idx_vehicle_position_recorded_at (recorded_at) |
| created_at | Fecha y hora de creación del registro (UTC). Por defecto now(). | TIMESTAMPTZ | N/A | SI | NO | N/A | Por defecto now() | N/A |

## 1.18. macroroute

| atributo | descripción | tipo | longitud | mandatorio | unico | clave | restricciones | índice |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| id | Identificador único de la macroruta. | UUID | N/A | SI | SI | PK | N/A | N/A |
| name | Nombre de la macroruta. | VARCHAR | 100 | SI | NO | N/A | N/A | N/A |
| geom | Área geográfica que cubre la macroruta (PostGIS, multipolígono). | MULTIPOLYGON | N/A | SI | NO | N/A | N/A | GIST idx_macroroute_geom (geom) |
| is_active | Indica si la macroruta está vigente (TRUE) o inactiva (FALSE). Por defecto TRUE. | BOOLEAN | N/A | SI | NO | N/A | Por defecto TRUE | N/A |
| updated_at | Fecha y hora de la última modificación del registro (UTC). | TIMESTAMPTZ | N/A | SI | NO | N/A | N/A | N/A |
| created_at | Fecha y hora de creación del registro (UTC). Por defecto now(). | TIMESTAMPTZ | N/A | SI | NO | N/A | Por defecto now() | N/A |

## 1.19. microroute

| atributo | descripción | tipo | longitud | mandatorio | unico | clave | restricciones | índice |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| id | Identificador único de la microruta. | UUID | N/A | SI | SI | PK | N/A | N/A |
| macroroute_id | Macroruta a la que pertenece la microruta. | UUID | N/A | SI | NO | FK | Referencia macroroute(id) | idx_microroute_macroroute_id (macroroute_id) |
| name | Nombre de la microruta. | VARCHAR | 100 | SI | NO | N/A | N/A | N/A |
| geom | Trazado geográfico de la microruta (PostGIS, multilínea). | MULTILINESTRING | N/A | SI | NO | N/A | N/A | GIST idx_microroute_geom (geom) |
| is_active | Indica si la microruta está vigente (TRUE) o inactiva (FALSE). Por defecto TRUE. | BOOLEAN | N/A | SI | NO | N/A | Por defecto TRUE | N/A |
| updated_at | Fecha y hora de la última modificación del registro (UTC). | TIMESTAMPTZ | N/A | SI | NO | N/A | N/A | N/A |
| created_at | Fecha y hora de creación del registro (UTC). Por defecto now(). | TIMESTAMPTZ | N/A | SI | NO | N/A | Por defecto now() | N/A |

## 1.20. schedule

| atributo | descripción | tipo | longitud | mandatorio | unico | clave | restricciones |
| --- | --- | --- | --- | --- | --- | --- | --- |
| id | Identificador único del horario. | UUID | N/A | SI | SI | PK | N/A |
| name | Nombre del horario (ej.: turno de la mañana). | VARCHAR | 100 | SI | NO | N/A | N/A |
| start_time | Hora de inicio del horario. | TIME | N/A | SI | NO | N/A | N/A |
| end_time | Hora de fin del horario. | TIME | N/A | SI | NO | N/A | N/A |
| is_active | Indica si el horario está vigente (TRUE) o inactivo (FALSE). Por defecto TRUE. | BOOLEAN | N/A | SI | NO | N/A | Por defecto TRUE |
| updated_at | Fecha y hora de la última modificación del registro (UTC). | TIMESTAMPTZ | N/A | SI | NO | N/A | N/A |
| created_at | Fecha y hora de creación del registro (UTC). Por defecto now(). | TIMESTAMPTZ | N/A | SI | NO | N/A | Por defecto now() |

## 1.21. microroute_schedule

| atributo | descripción | tipo | longitud | mandatorio | unico | clave | restricciones | índice |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| id | Identificador único del registro. | UUID | N/A | SI | SI | PK | N/A | N/A |
| microroute_id | Microruta a la que se asigna el horario. | UUID | N/A | SI | SI | FK | Compuesto único con schedule_id y day_of_week; referencia microroute(id) | idx_microroute_schedule_microroute_id (microroute_id) |
| schedule_id | Horario aplicado a la microruta. | UUID | N/A | SI | SI | FK | Compuesto único con microroute_id y day_of_week; referencia schedule(id) | idx_microroute_schedule_schedule_id (schedule_id) |
| day_of_week | Día de la semana de 1 a 7 (ISO: 1 = lunes, 7 = domingo). La combinación con microroute_id y schedule_id no puede repetirse. | SMALLINT | N/A | SI | SI (compuesto) | N/A | Compuesto único con microroute_id y schedule_id; rango 1–7 | N/A |
| is_active | Indica si el horario de la microruta está vigente (TRUE) o inactivo (FALSE). Por defecto TRUE. | BOOLEAN | N/A | SI | NO | N/A | Por defecto TRUE | N/A |
| updated_at | Fecha y hora de la última modificación del registro (UTC). | TIMESTAMPTZ | N/A | SI | NO | N/A | N/A | N/A |
| created_at | Fecha y hora de creación del registro (UTC). Por defecto now(). | TIMESTAMPTZ | N/A | SI | NO | N/A | Por defecto now() | N/A |

## 1.22. btura_neighborhood

| atributo | descripción | tipo | longitud | mandatorio | unico | clave | restricciones | índice |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| id | Identificador único del barrio. | UUID | N/A | SI | SI | PK | N/A | N/A |
| commune | Comuna a la que pertenece el barrio. | VARCHAR | 100 | SI | NO | N/A | N/A | N/A |
| name | Nombre del barrio. | VARCHAR | 150 | SI | NO | N/A | N/A | N/A |
| geom | Límite geográfico del barrio (PostGIS, multipolígono). | MULTIPOLYGON | N/A | SI | NO | N/A | N/A | GIST idx_btura_neighborhood_geom (geom) |
| created_at | Fecha y hora de creación del registro (UTC). Por defecto now(). | TIMESTAMPTZ | N/A | SI | NO | N/A | Por defecto now() | N/A |

## 1.23. microroute_neighborhood

| atributo | descripción | tipo | longitud | mandatorio | unico | clave | restricciones | índice |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| id | Identificador único del registro. | UUID | N/A | SI | SI | PK | N/A | N/A |
| neighborhood_id | Barrio atendido por la microruta. | UUID | N/A | SI | SI | FK | Compuesto único con microroute_id y order_visit; referencia btura_neighborhood(id) | idx_microroute_neighborhood_neighborhood_id (neighborhood_id) |
| microroute_id | Microruta que atiende el barrio. | UUID | N/A | SI | SI | FK | Compuesto único con neighborhood_id y order_visit; referencia microroute(id) | idx_microroute_neighborhood_microroute_id (microroute_id) |
| order_visit | Orden en que la microruta visita el barrio. No puede repetirse dentro de la misma microruta. | INT | N/A | SI | SI (compuesto) | N/A | Compuesto único con neighborhood_id y microroute_id | N/A |

## 1.24. email_validation_token

| atributo | descripción | tipo | longitud | mandatorio | unico | clave | restricciones | índice |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| id | Identificador único de la solicitud de restablecimiento. | UUID | N/A | SI | SI | PK | N/A | N/A |
| user_account_id | Cuenta de usuario que solicitó el restablecimiento. | UUID | N/A | SI | NO | FK  | Referencia user_account(id) | idx_email_validation_token_user_account_id (user_account_id) |
| email | Correo Email que se esta verificando | VARCHAR | 254 | SI | NO | N/A | N/A | N/A |
| token_hash | Hash SHA-256 (hexadecimal) del token enviado al usuario. El token en claro nunca se almacena. | CHAR | 64 | SI | SI | N/A | N/A | N/A |
| request_ip | Dirección IP desde la que se hizo la solicitud. | INET | N/A | NO | NO | N/A | NULL permitido | N/A |
| used_at | Fecha y hora en que se usó el token. NULL mientras no se haya usado (un solo uso). | TIMESTAMPTZ | N/A | NO | NO | N/A | NULL permitido | N/A |
| expires_at | Fecha y hora de vencimiento del token (vida corta). | TIMESTAMPTZ | N/A | SI | NO | N/A | N/A | idx_email_validation_token_expires_at (expires_at) |
| created_at | Fecha y hora de creación del registro (UTC). Por defecto now(). | TIMESTAMPTZ | N/A | SI | NO | N/A | Por defecto now() | N/A |