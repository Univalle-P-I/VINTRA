# Orden de ejecución

Las migraciones se ejecutan en orden numérico ascendente. El orden respeta las dependencias entre tablas: primero los catálogos, después las entidades que los referencian y al final las tablas transaccionales. Los [datos iniciales](/docs/base-de-datos/database/seeds/) tienen el mismo número que su migración y deben ejecutarse después de ejecutar todas las migraciones.

| # | Migración | Dato Inicial | Dependencia |
| --- | --- | --- | --- |
| 000 | `000_create_extensions.sql` | — | PostgreSQL 16 |
| 001 | `001_create_user_role.sql` | `001_insert_user_role.sql` | — |
| 002 | `002_create_user_status.sql` | `002_insert_user_status.sql` | — |
| 003 | `003_create_document_type.sql` | `003_insert_document_type.sql` | — |
| 004 | `004_create_user_account.sql` | `004_insert_user_account.sql` | `user_status`, `document_type` |
| 005 | `005_create_user_data.sql` | `005_insert_user_data.sql` | `user_account` |
| 006 | `006_create_profile.sql` | `006_insert_profile.sql` | `user_role`, `user_account` |
| 007 | `007_create_session.sql` | N/A | `user_account` |
| 008 | `008_create_password_reset_token.sql` | N/A | `user_account` |
| 009 | `009_create_email_validation_token.sql` | N/A | `user_account` |
| 010 | `010_create_audit_log.sql` | N/A | — |
| 011 | `011_create_vehicle_status.sql` | `011_insert_vehicle_status.sql` | — |
| 012 | `012_create_vehicle_type.sql` | `012_insert_vehicle_type.sql` | — |
| 013 | `013_create_vehicle.sql` | `013_insert_vehicle.sql` | `vehicle_status`, `vehicle_type` |
| 014 | `014_create_assignment_status.sql` | `014_insert_assignment_status.sql` | — |
| 015 | `015_create_macroroute.sql` | `015_insert_macroroute.sql` | PostGIS |
| 016 | `016_create_microroute.sql` | `016_insert_microroute.sql` | `macroroute` |
| 017 | `017_create_btura_neighborhood.sql` | `017_insert_btura_neighborhood.sql` | PostGIS |
| 018 | `018_create_schedule.sql` | `018_insert_schedule.sql` | — |
| 019 | `019_create_microroute_schedule.sql` | `019_insert_microroute_schedule.sql` | `microroute`, `schedule` |
| 020 | `020_create_microroute_neighborhood.sql` | `020_insert_microroute_neighborhood.sql` | `microroute`, `btura_neighborhood` |
| 021 | `021_create_crew.sql` | `021_insert_crew.sql` | `user_data` |
| 022 | `022_create_crew_member.sql` | `022_insert_crew_member.sql` | `crew` |
| 023 | `023_create_assignment.sql` | `023_insert_assignment.sql` | `crew`, `microroute`, `vehicle`, `assignment_status` |
| 024 | `024_create_vehicle_position.sql` | N/A | `assignment` |

## Ejecución usando `psql`

Utilice los siguientes comandos con la herramienta `psql`. **RECUERDE**: debe reemplazar el contenido señalado entre paréntesis por la ruta real de los archivos.

```bash
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 \
  -f (CAMBIAR POR RUTA REAL)/database/migrations/000_create_extensions.sql

for file in (CAMBIE POR SU RUTA)/database/migrations/[0-9][0-9][0-9]_create_*.sql; do
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$file"
done

for file in (CAMBIE POR SU RUTA)/database/seeds/[0-9][0-9][0-9]_insert_*.sql; do
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$file"
done
```

## Datos iniciales

Los seeds son ejemplos y usan `ON CONFLICT DO NOTHING` para poder ejecutarse más de una vez sin duplicar catálogos ni registros con identificadores fijos. Las cuentas de demostración (**admin**, **101**, **102**) preguntar por las contraseñas al equipo de base de datos (no se comparte por aquí por seguridad).
