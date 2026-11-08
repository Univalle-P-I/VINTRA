# Orden de ejecución

Las migraciones se ejecutan en orden numérico ascendente. El orden respeta las dependencias entre tablas: primero las entidades base, después las entidades que las referencian y al final las tablas transaccionales y de auditoría. A continuación, se presenta la propuesta de orden de ejución de las migraciones y datos semillas:

Ultima modificación: 5/11/2026

## Migraciones

| # | Migración | Dependencia |
| --- | --- | --- |
| 000 | `000_create_extensions.sql` | PostgreSQL 16 |
| 001 | `001_create_user_account.sql` | — |
| 002 | `002_create_user_data.sql` | `user_account` |
| 003 | `003_create_profile.sql` | `user_account` |
| 004 | `004_create_session.sql` | `user_account` |
| 005 | `005_create_password_reset_token.sql` | `user_account` |
| 006 | `006_create_email_validation_token.sql` | `user_data` |
| 007 | `007_create_vehicle_type.sql` | — |
| 008 | `008_create_vehicle.sql` | `vehicle_type` |
| 009 | `009_create_macroroute.sql` | PostGIS 3.6 |
| 010 | `010_create_microroute.sql` | `macroroute` |
| 011 | `011_create_btura_neighborhood.sql` | PostGIS 3.6 |
| 012 | `012_create_schedule.sql` | — |
| 013 | `013_create_microroute_schedule.sql` | `microroute`, `schedule` |
| 014 | `014_create_microroute_neighborhood.sql` | `microroute`, `btura_neighborhood` |
| 015 | `015_create_crew.sql` | — |
| 016 | `016_create_crew_member.sql` | `crew` |
| 017 | `017_create_driver.sql` | `user_data`, `crew` |
| 018 | `018_create_assignment.sql` | `driver`, `microroute_schedule`, `vehicle` |
| 019 | `019_create_vehicle_position.sql` | `assignment`, PostGIS 3.6 |
| 020 | `020_create_user_account_log.sql` | `user_account`, `user_account` ([RELACIÓN DOBLE](../../docs/base-de-datos/diccionario-de-datos/README.md)) |
| 021 | `021_create_user_data_log.sql` | `user_data`, `user_account` |
| 022 | `022_create_profile_log.sql` | `profile`, `user_account` |
| 023 | `023_create_crew_log.sql` | `crew`, `user_account` |
| 024 | `024_create_crew_member_log.sql` | `crew_member`, `user_account` |
| 025 | `025_create_driver_log.sql` | `driver`, `user_account` |
| 026 | `026_create_macroroute_log.sql` | `macroroute`, `user_account` |
| 027 | `027_create_microroute_log.sql` | `microroute`, `user_account` |
| 028 | `028_create_assignment_log.sql` | `assignment`, `user_account` |
| 029 | `029_create_vehicle_log.sql` | `vehicle`, `user_account` |

## Datos Semillas

Los seeders (`docs/base-de-datos/migraciones/seeders/`) insertan datos mínimos de ejemplo para las tablas base y usan `ON CONFLICT DO NOTHING` para poder ejecutarse más de una vez sin duplicar registros.

| # | Inserción | Dependencia |
| --- | --- | --- |
| 001 | `001_insert_user_account.sql` | — |
| 002 | `002_insert_user_data.sql` | `user_account` |
| 003 | `003_insert_profile.sql` | `user_account` |
| 007 | `007_insert_vehicle_type.sql` | — |
| 015 | `015_insert_crew.sql` | — |
| 016 | `016_insert_crew_member.sql` | `crew` |
| 017 | `017_insert_driver.sql` | `user_data`, `crew` |


## Triggers

Los triggers de auditoría se ejecutan después de las migraciones `001` a `029`. La función compartida `fn_audit_log()` inserta el registro en la tabla `*_log` correspondiente.

| # | Trigger | Tabla auditada | Tabla log | Evento |
| --- | --- | --- | --- | --- |
| 000 | `000_function_audit_log.sql` | — | — | Función compartida `fn_audit_log()` |
| 001 | `001_trigger_user_account.sql` | `user_account` | `user_account_log` | `AFTER INSERT OR UPDATE OR DELETE` |
| 002 | `002_trigger_user_data.sql` | `user_data` | `user_data_log` | `AFTER INSERT OR UPDATE OR DELETE` |
| 003 | `003_trigger_profile.sql` | `profile` | `profile_log` | `AFTER INSERT OR UPDATE OR DELETE` |
| 008 | `008_trigger_vehicle.sql` | `vehicle` | `vehicle_log` | `AFTER INSERT OR UPDATE OR DELETE` |
| 009 | `009_trigger_macroroute.sql` | `macroroute` | `macroroute_log` | `AFTER INSERT OR UPDATE OR DELETE` |
| 010 | `010_trigger_microroute.sql` | `microroute` | `microroute_log` | `AFTER INSERT OR UPDATE OR DELETE` |
| 015 | `015_trigger_crew.sql` | `crew` | `crew_log` | `AFTER INSERT OR UPDATE OR DELETE` |
| 016 | `016_trigger_crew_member.sql` | `crew_member` | `crew_member_log` | `AFTER INSERT OR UPDATE OR DELETE` |
| 017 | `017_trigger_driver.sql` | `driver` | `driver_log` | `AFTER INSERT OR UPDATE OR DELETE` |
| 018 | `018_trigger_assignment.sql` | `assignment` | `assignment_log` | `AFTER INSERT OR UPDATE OR DELETE` |

Comportamiento:

- `INSERT` se registra como `CREATE`; `UPDATE` como `UPDATE`; `DELETE` como `DELETE`.
- `old` contiene el registro anterior en `UPDATE` y `DELETE`.
- `new` contiene el registro nuevo en `INSERT` y `UPDATE`.
- `user_account.pwd_hash` se excluye de `old` y `new`.
- `actor_id` se toma de `app.current_user_id` y `request_ip` de `app.request_ip`; si no están definidos, se registran como `NULL`.
- El ENUM `audit_action` admite `CREATE`, `UPDATE` y `DELETE` (se define en la [primera tabla de auditoría](../migrations/020_create_user_account_log.sql)).


## Ejecución usando `psql`

Utilice los siguientes comandos con la herramienta `psql`. **RECUERDE**: debe reemplazar el contenido señalado entre diplés por la ruta real de los archivos.

```bash
for file in <CAMBIE POR SU RUTA>/database/migrations/*.sql; do
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$file"
done

for file in <CAMBIE POR SU RUTA>/database/seeders/*.sql; do
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$file"
done

for file in <CAMBIE POR SU RUTA>/database/triggers/*.sql; do
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$file"
done

```
