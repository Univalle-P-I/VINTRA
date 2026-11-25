# Módulo Seguimiento

Estructura inicial del módulo de seguimiento de vehículos de VINTRA
(tarjeta #131). Prepara la entidad de posiciones geográficas para su futura
integración con Asignaciones y los recursos operativos.

**Estado:** estructura sin endpoints ni lógica de negocio. No se implementa la
captura ni la consulta de posiciones GPS.

## Estructura

```text
seguimiento/
├── dto/
│   └── create-vehicle-position.dto.ts
├── entities/
│   └── vehicle-position.entity.ts
├── README.md
├── seguimiento.controller.ts
├── seguimiento.module.spec.ts
├── seguimiento.module.ts
└── seguimiento.service.ts
```

## Dependencias

| Dependencia | Estado | Detalle |
| --- | --- | --- |
| Asignaciones (#130) | Pendiente | No existe `backend/src/asignaciones/` en `develop`. |
| Autenticación y roles | Disponible | Los guards se aplican globalmente desde `AppModule`. |
| Auditoría (#123) | Pendiente | No existe un módulo de auditoría en `develop`. |
| Validación GeoJSON | Pendiente | Se agrega con la implementación funcional. |
| Mapa y ubicación (#91) | Por confirmar | Alcance de la ubicación operativa. |
| Esquema de BD (#65) | Integrado | PR #115 en `develop`; migración 018. |

`assignment_id` se declara como UUID sin relación hasta que la entidad de
Asignaciones llegue a `develop`.

## Correspondencia con la tabla

| Entidad | Tabla |
| --- | --- |
| `VehiclePosition` | `vehicle_position` |

Columnas: `id`, `assignment_id`, `geom` (`geometry(Point, 4326)`),
`is_active`, `recorded_at` y `created_at`. `created_at` lo asigna la base de
datos (`DEFAULT now()`).

La migración `018_create_vehicle_position.sql`, integrada en `develop` con la
PR #115, crea la tabla y dos índices: uno por asignación y fecha
(`idx_vehicle_position_assignment_recorded`) y uno espacial (GIST) sobre
`geom`. También define la FK `fk_vehicle_position_assignment` hacia
`assignment` con `ON DELETE CASCADE`. La entidad no declara índices ni FK: el
esquema lo gestionan las migraciones y `synchronize` está desactivado.

## Fuera de alcance

- Endpoints de captura y consulta de posiciones.
- Validación de geometrías GeoJSON.
- Auditoría de operaciones y migraciones.