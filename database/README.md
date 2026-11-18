# Base de datos

Esta carpeta reúne los recursos de base de datos del proyecto, como migraciones, esquemas, disparadores y datos iniciales.

## Estado actual

- PostgreSQL se inicia desde `docker-compose.yml` en la raíz.
- La conexión de la API se configura en `backend/src/app.module.ts` y recibe sus valores mediante variables de entorno.
- El diseño y los acuerdos de datos están documentados en [`docs/base-de-datos/`](../docs/base-de-datos/README.md) y [`docs/DATABASE_DESIGN.md`](../docs/DATABASE_DESIGN.md).
- Las migraciones, los seeders, los esquemas y los disparadores se organizan en subcarpetas por tipo de recurso.

No guardes credenciales reales ni archivos `.env` en el repositorio.
