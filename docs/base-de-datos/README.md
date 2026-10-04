# Base de datos

Guía para documentar la persistencia de VINTRA y su evolución.

## Debe publicarse aquí

- motor y versión soportada;
- diagrama entidad-relación y diccionario de datos;
- tablas, columnas, tipos, claves, restricciones e índices;
- relaciones con el modelo de dominio;
- migraciones, datos iniciales y orden de ejecución;
- políticas para respaldos, restauración y datos sensibles;
- configuración local sin publicar secretos.

El modelo conceptual y los diagramas de negocio se mantienen en `modelado/`. Las consultas o endpoints que consumen estas estructuras se enlazan desde `backend/`.

## Estado

- Estado: `Borrador`
- Responsable: Célula Base de Datos
- Pendiente: completar el modelo en PostgreSQL, migraciones y diccionario de datos.
