# Módulo de Asignaciones (VIN-030 / #93)

Asigna un conductor y un vehículo a una programación de microruta (`microroute_schedule`) en una fecha concreta, sin dobles reservas incompatibles.

| Método | Ruta               | Roles     | Descripción                                     |
| ------ | ------------------ | --------- | ----------------------------------------------- |
| POST   | `/assignments`     | ADMIN, OP | Crea la asignación (`201`, `400`, `404`, `409`) |
| GET    | `/assignments`     | ADMIN, OP | Lista                                           |
| GET    | `/assignments/:id` | ADMIN, OP | Detalle (`400` si no es UUID, `404`)            |

Cuerpo del POST: `{ programacionId, conductorId, vehiculoId, fecha: "YYYY-MM-DD" }`.

## Reglas (una sola transacción)

1. Programación, conductor y vehículo existen → si no, `404`.
2. La fecha cae en el `day_of_week` de la programación → si no, `400`.
3. Disponibles → si no, `409` con `details[{field, reason}]`:
   programación/horario/microruta activos, conductor activo y sin `ended_at`, cuadrilla del conductor activa, vehículo activo y fuera de `MAINTENANCE`/`OUT_OF_SERVICE`.
4. Sin otra asignación vigente (`SCHEDULED`/`IN_PROGRESS`, `is_active`) que se solape en el tiempo con el mismo conductor, vehículo, cuadrilla del conductor o microruta → si no, `409`.
5. Se guarda en estado `SCHEDULED` con `scheduled_start_at`/`end_at` calculados desde `schedule` (hora local UTC-5).

## Concurrencia

Se bloquean con `FOR UPDATE`, en este orden fijo (evita interbloqueos): programación, microruta, conductor, cuadrilla, vehículo. La segunda solicitud espera, ve la asignación de la primera y responde `409`. Una violación única (`23505`) también se responde `409`.

## Supuestos

- `IN_USE` no bloquea el vehículo (el cruce de horarios ya lo controla).
- `day_of_week` usa 1 = lunes … 7 = domingo.
- Los intervalos son `[inicio, fin)`: una asignación que empieza justo cuando termina otra no se cruza.
- `Vehiculo`, `Horario` y `ProgramacionMicroruta` son mapeos mínimos; reemplazar por las entidades de #75/#79 cuando lleguen a develop.
