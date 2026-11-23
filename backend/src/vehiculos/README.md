# Módulo Vehículos (VIN-023 / #75)

Gestión de estado operativo, disponibilidad (`esAsignable`) e inhabilitación por falla mecánica (**HU3**, **RN-02**, **[C2]**, **RN-07**), alineado con el esquema de base de datos `vehicle` y `vehicle_type`.

## Estados permitidos (`vehicle_status`)
- `available` (`AVAILABLE`): Disponible (`esAsignable = true` si `activo = true`).
- `in_service` (`IN_USE`): En servicio (`esAsignable = false`).
- `maintenance` (`MAINTENANCE`): En mantenimiento (`esAsignable = false`).
- `out_of_service` (`OUT_OF_SERVICE`): Fuera de servicio / Inhabilitado por falla mecánica (`esAsignable = false`).

## Transiciones permitidas
- `available` -> `in_service` | `maintenance` | `out_of_service` (requiere `reason`).
- `in_service` -> `available` | `maintenance` | `out_of_service` (requiere `reason`).
- `maintenance` -> `available` | `out_of_service` (requiere `reason`).
- `out_of_service` -> `maintenance` (prohibido pasar directo a `available` o `in_service` sin mantenimiento previo; retorna `409 Conflict`).

## Endpoints (`/api/v1`)
- `GET /api/v1/vehicle-types`: Lista tipos de vehículo activos.
- `POST /api/v1/vehicle-types`: Registra un tipo de vehículo.
- `PATCH /api/v1/vehicle-types/:id`: Actualiza un tipo de vehículo.
- `GET /api/v1/vehicles/statuses`: Lista estados operativos y matriz de transiciones permitidas.
- `GET /api/v1/vehicles`: Lista vehículos con `esAsignable` (filtros: `status`, `vehicleTypeId`, `plate`, `isActive`, `onlyAssignable`).
- `GET /api/v1/vehicles/:id`: Consulta un vehículo por UUID con su disponibilidad actual.
- `POST /api/v1/vehicles`: Registra un vehículo en la flota.
- `PATCH /api/v1/vehicles/:id/status`: Ejecuta transición de estado operativo e inhabilitación por falla mecánica (`ActualizarEstadoVehiculoDto`).
- `PATCH /api/v1/vehicles/:id`: Actualiza atributos del vehículo (validando máquina de estados si cambia `vehicleStatus`).
