# Documentación de Endpoints – VINTRA

## 1. Descripción general

Este directorio contiene la documentación técnica de los endpoints de la API REST de VINTRA .

La documentación describe los recursos propuestos, métodos HTTP, rutas, mecanismos de autenticación, parámetros, estructuras de datos, respuestas, validaciones y reglas de negocio.

> **Estado del contrato:** los documentos son propuestas para revisión y no implican que los endpoints estén implementados o que sus formatos hayan sido aprobados. El formato común de respuestas, errores y paginación sigue pendiente en el issue #66. La autenticación y la matriz de permisos siguen pendientes de las decisiones #54, #70 y #71; las menciones a JWT no representan una decisión aprobada.

## 2. Organización de la documentación

La documentación se encuentra dividida por módulos funcionales:

| N.º | Módulo | Archivo |
|---|---|---|
| 01 | Autenticación | `01-autenticacion.md` |
| 02 | Vehículos | `02-vehiculos.md` |
| 03 | Personal recolector | `03-personal-recolectores.md` |
| 04 | Personal conductor | `04-personal-conductores.md` |
| 05 | Cuadrillas | `05-cuadrillas.md` |
| 06 | Turnos | `06-turnos.md` |
| 07 | Macrorrutas | `07-macrorutas.md` |
| 08 | Microrrutas | `08-microrutas.md` |
| 09 | Barrios | `09-barrios.md` |
| 10 | Asignaciones | `10-asignaciones.md` |
| 11 | Turnos de microrruta | `11-turnos-microruta.md` |

El estado y la estructura de los contratos siguen sujetos a las decisiones pendientes del issue #66. Las decisiones de autenticación y permisos siguen sujetas a #54, #70 y #71; los ejemplos de JWT y los roles no constituyen una aprobación.

## 3. Estructura de cada endpoint

Cada endpoint documentado incluye, según corresponda:

- Método HTTP.
- Ruta.
- Descripción y propósito.
- Autenticación y autorización.
- Headers.
- Parámetros.
- Body o estructura de solicitud.
- Respuestas y códigos HTTP.
- Validaciones.
- Reglas de negocio.
- Entidades y relaciones de base de datos.
- Historia de usuario asociada.

## 4. Documento integral de referencia

[Documentación completa de endpoints VINTRA](../pdf/documentacion-completa-vintra.pdf)

## 5. Consideraciones

La documentación debe mantenerse alineada con las historias de usuario y el DER v2 compartido. En ese DER, los valores ENUM se indican como marcadores de posición; deben confirmarse con Base de Datos antes de tratarlos como catálogos definitivos. También debe confirmarse con Base de Datos la grafía `microrute_neighborhood` usada literalmente en el SQL.

Los valores de ejemplo son ilustrativos: no fijan valores predeterminados que el SQL no declare ni convierten en aprobadas las decisiones pendientes de autenticación, permisos, respuestas, paginación o reglas operativas.