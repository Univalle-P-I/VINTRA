# Orden de ejecución

Las migraciones se ejecutan en orden numérico ascendente. El orden respeta las dependencias entre tablas: primero las entidades base, después las entidades que las referencian y al final las tablas transaccionales y de auditoría. A continuación, se presenta la propuesta de orden de ejución de las migraciones y datos semillas:

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
| 020 | `020_create_user_account_log.sql` | `user_account`, `user_account` ([RELACIÓN DOBLE](/docs/base-de-datos/diccionario-de-datos/README.md)) |
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

Los seeders actuales (`docs/base-de-datos/migraciones/seeders/`) pertenecen al modelo anterior: referencian catálogos eliminados y algunas fechas o valores no son válidos. No deben ejecutarse contra este esquema hasta que se regeneren para el DER v2.


| # | Inserción | Depedencia |
| --- | --- | --- |
|  |  |  |


## Ejecución usando `psql`

Utilice los siguientes comandos con la herramienta `psql`. **RECUERDE**: debe reemplazar el contenido señalado entre paréntesis por la ruta real de los archivos.

```bash
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 \
  -f (CAMBIAR POR RUTA REAL)/docs/base-de-datos/migraciones/migrations/000_create_extensions.sql

for file in (CAMBIE POR SU RUTA)/docs/base-de-datos/migraciones/migrations/[0-9][0-9][0-9]_create_*.sql; do
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$file"
done
```
