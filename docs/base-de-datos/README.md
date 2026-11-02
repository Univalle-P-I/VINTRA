# Base de datos

Guía para documentar la persistencia de VINTRA y su evolución.

## Debe publicarse aquí

- [motor y versión soportada](#1-motor-y-version-soportada)
- [diagrama entidad-relación y diccionario de datos](#2-diagrama-entidad-relación-y-diccionario-de-datos);
- tablas, columnas, tipos, claves, restricciones e índices;
- relaciones con el modelo de dominio;
- migraciones, datos iniciales y orden de ejecución;
- políticas para respaldos, restauración y datos sensibles;
- configuración local sin publicar secretos.

El modelo conceptual y los diagramas de negocio se mantienen en `modelado/`. Las consultas o endpoints que consumen estas estructuras se enlazan desde `backend/`.

## Estado

- Estado: `Borrador`
- Responsable: Farid Cuero
- Pendiente: validación del DER como BD para PostgresSQL, migraciones y diccionario de datos.

## 1. Motor y Version Soportada
el motor de la base de datos usado es **PostgresSQL** en conjunto con la herramienta **PostGIS**. la versión soportada aún no esta definida....

## 2. Diagrama entidad-relación y diccionario de datos

```mermaid
%%{init: {'theme': 'forest'}}%%
erDiagram

    user_role {
        UUID id PK
        VARCHAR code
        VARCHAR name
        BOOLEAN is_active
        TIMESTAMPTZ created_at
    }

    profile {
        UUID id PK
        UUID user_role_id FK
        UUID user_account_id FK
        BOOLEAN is_active
        TIMESTAMPTZ created_at
    }

    user_status {
        UUID id PK
        VARCHAR code
        VARCHAR name
        BOOLEAN is_active
        TIMESTAMPTZ created_at
    }

    session {
        UUID id PK
        UUID user_account_id FK
        CHAR token_hash
        INET request_ip
        TIMESTAMPTZ revoked_at
        TIMESTAMPTZ last_used_at
        TIMESTAMPTZ expires_at
        TIMESTAMPTZ created_at
    }

    user_account {
        UUID id PK
        UUID status_id FK
        UUID document_type_id FK
        CHAR document_id
        TEXT pwd_hash
        SMALLINT failed_attempts
        TIMESTAMPTZ locked_until
        TIMESTAMPTZ last_login_at
        TIMESTAMPTZ password_changed_at
        TIMESTAMPTZ updated_at
        TIMESTAMPTZ created_at
    }

    password_reset_token {
        UUID id PK
        UUID user_account_id FK
        CHAR token_hash
        INET request_ip
        TIMESTAMPTZ used_at
        TIMESTAMPTZ expires_at
        TIMESTAMPTZ created_at
    }

    document_type {
        UUID id PK
        VARCHAR code
        VARCHAR name
        BOOLEAN is_active
        TIMESTAMPTZ created_at
    }

    user_data {
        UUID id PK, FK
        VARCHAR first_name
        VARCHAR last_name
        VARCHAR email
        VARCHAR phone
        TIMESTAMPTZ updated_at
        TIMESTAMPTZ created_at
    }

    audit_log {
        UUID id PK
        TEXT actor
        ENUM action
        VARCHAR entity
        UUID entity_id
        JSONB old_values
        JSONB new_values
        INET request_ip
        TIMESTAMPTZ created_at
    }

    crew_member {
        UUID id PK
        UUID crew_id FK
        VARCHAR full_name
        BOOLEAN is_active
        TIMESTAMPTZ created_at
    }

    crew {
        UUID id PK
        UUID user_data_id FK
        VARCHAR name
        BOOLEAN is_active
        TIMESTAMPTZ updated_at
        TIMESTAMPTZ created_at
    }

    assignment {
        UUID id PK
        UUID crew_id FK
        UUID microroute_id FK
        UUID vehicle_id FK
        UUID assignment_status_id FK
        DATE scheduled_date
        TIMESTAMPTZ started_at
        TIMESTAMPTZ ended_at
        TIMESTAMPTZ updated_at
        TIMESTAMPTZ created_at
    }

    vehicle {
        UUID id PK
        UUID vehicle_status_id FK
        UUID vehicle_type_id FK
        CHAR plate
        NUMERIC capacity_kg
        NUMERIC capacity_yd3
        BOOLEAN is_active
        TIMESTAMPTZ updated_at
        TIMESTAMPTZ created_at
    }

    vehicle_status {
        UUID id PK
        VARCHAR code
        VARCHAR name
        BOOLEAN is_active
        TIMESTAMPTZ created_at
    }

    vehicle_type {
        UUID id PK
        VARCHAR code
        VARCHAR name
        BOOLEAN is_active
        TIMESTAMPTZ created_at
    }

    assignment_status {
        UUID id PK
        VARCHAR code
        VARCHAR name
        BOOLEAN is_active
        TIMESTAMPTZ created_at
    }

    vehicle_position {
        UUID id PK
        UUID assignment_id FK
        POINT geom
        TIMESTAMPTZ recorded_at
        TIMESTAMPTZ created_at
    }

    macroroute {
        UUID id PK
        VARCHAR name
        MULTIPOLYGON geom
        BOOLEAN is_active
        TIMESTAMPTZ updated_at
        TIMESTAMPTZ created_at
    }

    microroute {
        UUID id PK
        UUID macroroute_id FK
        VARCHAR name
        MULTILINESTRING geom
        BOOLEAN is_active
        TIMESTAMPTZ updated_at
        TIMESTAMPTZ created_at
    }

    schedule {
        UUID id PK
        VARCHAR name
        TIME start_time
        TIME end_time
        BOOLEAN is_active
        TIMESTAMPTZ updated_at
        TIMESTAMPTZ created_at
    }

    microroute_schedule {
        UUID id PK
        UUID microroute_id FK
        UUID schedule_id FK
        SMALLINT day_of_week
        BOOLEAN is_active
        TIMESTAMPTZ updated_at
        TIMESTAMPTZ created_at
    }

    btura_neighborhood {
        UUID id PK
        VARCHAR commune
        VARCHAR name
        MULTIPOLYGON geom
        TIMESTAMPTZ created_at
    }

    microroute_neighborhood {
        UUID id PK
        UUID neighborhood_id FK
        UUID microroute_id FK
        INT order_visit
    }

    user_role ||--o{ profile : "tiene"
    user_account ||--o| profile : "tiene"
    user_status ||--o{ user_account : "tiene"
    document_type ||--o{ user_account : "identifica"
    user_account ||--o{ session : "abre"
    user_account ||--o{ password_reset_token : "genera"
    user_account ||--o| user_data : "tiene"
    user_account ||--o{ audit_log : "hace"

    user_data ||--o{ crew : "pertenece"
    crew ||--o{ crew_member : "tiene"
    crew ||--o{ assignment : "realiza"

    microroute ||--o{ assignment : "hace"
    vehicle ||--o{ assignment : "utiliza"
    assignment_status ||--o{ assignment : "tiene"
    vehicle_status ||--o{ vehicle : "tiene"
    vehicle_type ||--o{ vehicle : "tiene"
    assignment ||--o{ vehicle_position : "reporta"

    macroroute ||--o{ microroute : "contiene"
    schedule ||--o{ microroute_schedule : "programa"
    microroute ||--o{ microroute_schedule : "tiene"

    btura_neighborhood ||--o{ microroute_neighborhood : "es atendido"
    microroute ||--o{ microroute_neighborhood : "pasa por"
```