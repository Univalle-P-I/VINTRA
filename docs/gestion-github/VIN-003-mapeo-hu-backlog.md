# VIN-003 — Mapeo de HU1–HU12 al backlog ejecutable

**Estado:** propuesta para revisión de Product/profesor. Las prioridades son sugeridas; no convierten reglas operativas en decisiones aprobadas.

## Mapeo y decisiones

| Historia | Resultado y fichas ejecutables | Prioridad | Decisión pendiente |
|---|---|---|---|
| HU1 | Acceso administrativo: roles/matriz [#70](https://github.com/Univalle-P-I/VINTRA/issues/70) → autenticación [#71](https://github.com/Univalle-P-I/VINTRA/issues/71). El login visual ya llegó en [PR #52](https://github.com/Univalle-P-I/VINTRA/pull/52); no equivale a autenticación real. | P1 | Confirmar actores y roles en #53/#70; #71 requiere stack, modelo y contrato (#54/#65/#66). |
| HU2 | Registro/API [#72](https://github.com/Univalle-P-I/VINTRA/issues/72), listado [#73](https://github.com/Univalle-P-I/VINTRA/issues/73) y formulario [#74](https://github.com/Univalle-P-I/VINTRA/issues/74). | P0 | Confirmar campos y alcance CRUD (#53/#58). |
| HU3 | Estado y disponibilidad de vehículos [#75](https://github.com/Univalle-P-I/VINTRA/issues/75); pruebas de integración [#86](https://github.com/Univalle-P-I/VINTRA/issues/86). Extiende el catálogo de HU2; no duplica su registro. | P0 | Validar estados y transiciones en #58. |
| HU4 | Gestión de personal operativo, consolidada con la gestión de cuadrillas/turnos en [#76](https://github.com/Univalle-P-I/VINTRA/issues/76); pantallas coordinadas en [#77](https://github.com/Univalle-P-I/VINTRA/issues/77). | P0 | Confirmar tipos y datos mínimos (#53/#58). |
| HU5 | Conductor y disponibilidad por turno/jornada, dentro del mismo resultado de dominio #76 y pantallas #77. | P0 | Acordar regla de disponibilidad y compatibilidad (#58). |
| HU6 | Recolector, cuadrilla y turnos, consolidados con HU5 en #76/#77. No crear tickets duplicados por tipo de personal. | P0 | Acordar composición de cuadrilla y turnos (#58). |
| HU7 | Jerarquía de rutas: modelo [#78](https://github.com/Univalle-P-I/VINTRA/issues/78) → API [#79](https://github.com/Univalle-P-I/VINTRA/issues/79) → pantallas [#80](https://github.com/Univalle-P-I/VINTRA/issues/80). | P1 | Confirmar términos y jerarquía (#53/#58). |
| HU8 | Barrios/sectores asociados a rutas en #78/#79/#80; una sola capacidad de planificación, sin ticket duplicado. | P1 | Confirmar catálogo/fuente (#53/#58); geometría depende de #54. |
| HU9 | Mapa separado de la gestión básica de rutas. Decisión sobre necesidad/proveedor en [#91](https://github.com/Univalle-P-I/VINTRA/issues/91); #80 no debe bloquearse si el mapa se difiere. | P3, diferible | Product/profesor decide alcance, privacidad, proveedor y costo (#91). |
| HU10 | Asignación: modelo [#81](https://github.com/Univalle-P-I/VINTRA/issues/81) → API transaccional [#93](https://github.com/Univalle-P-I/VINTRA/issues/93) y tablero [#82](https://github.com/Univalle-P-I/VINTRA/issues/82) → orden de trabajo [#85](https://github.com/Univalle-P-I/VINTRA/issues/85) → aceptación integrada [#87](https://github.com/Univalle-P-I/VINTRA/issues/87). | P0 | Confirmar conflictos, compatibilidad y jornada (#58). |
| HU11 | Segundo recorrido de camión de 7 yd³: decisión/implementación condicional [#83](https://github.com/Univalle-P-I/VINTRA/issues/83), tras #58/#81/#93. | P2, diferible | Exigir fuente y aprobación; si no se valida, posponer HU11 y cerrar #83 como no planificado. |
| HU12 | Auditoría de cambios de asignación [#84](https://github.com/Univalle-P-I/VINTRA/issues/84), dependiente de #70/#81/#93. | P2 | Confirmar necesidad, datos y permisos; si sale del MVP, posponer #84 explícitamente. |

## Dependencias de producto y ejecución

- Alcance, actores y glosario: [#53](https://github.com/Univalle-P-I/VINTRA/issues/53); reglas operativas: [#58](https://github.com/Univalle-P-I/VINTRA/issues/58).
- Stack/arquitectura: [#54](https://github.com/Univalle-P-I/VINTRA/issues/54), documentación canónica [#62](https://github.com/Univalle-P-I/VINTRA/issues/62).
- UX: navegación [#59](https://github.com/Univalle-P-I/VINTRA/issues/59) → wireframes [#60](https://github.com/Univalle-P-I/VINTRA/issues/60).
- Datos: modelo [#63](https://github.com/Univalle-P-I/VINTRA/issues/63) → diccionario [#64](https://github.com/Univalle-P-I/VINTRA/issues/64) → migración [#65](https://github.com/Univalle-P-I/VINTRA/issues/65); contrato API [#66](https://github.com/Univalle-P-I/VINTRA/issues/66).
- Plataforma: workflow/trazabilidad [#67](https://github.com/Univalle-P-I/VINTRA/issues/67), entorno [#68](https://github.com/Univalle-P-I/VINTRA/issues/68), CI [#69](https://github.com/Univalle-P-I/VINTRA/issues/69).

Orden sugerido: validar alcance/reglas (#53/#58), cerrar decisiones y contratos (#54/#63–#66), implementar catálogos (#72–#77), rutas (#78–#80), asignación/orden (#81–#85), y ejecutar integración/entrega (#86–#90). #91, #83 y #84 quedan fuera del compromiso P0 hasta resolver sus decisiones.

## Duplicados, tarjetas y PR

- HU5/HU6 se solapan en personal/disponibilidad: un solo resultado de dominio en #76 y pantallas coordinadas en #77.
- HU7–HU9 se separan por modelo/API/pantalla; el mapa es opcional y no bloquea la planificación básica.
- HU10 se divide por responsabilidad técnica y dependencia entre #81, #93, #82 y #85. #87 valida el flujo; no duplica implementación.
- Las tarjetas BD 3/6/7 se trazan a #63/#64/#65; Stack 8/9 a #62/#68; UX 1/2 a #59/#60; DevOps 12/14 a #67/#69/#90. Las tarjetas de origen no se recrean como Issues.
- [PR #47](https://github.com/Univalle-P-I/VINTRA/pull/47) está fusionada y aporta base de entorno/CI. [PR #49](https://github.com/Univalle-P-I/VINTRA/pull/49) está abierta y es documental; no reemplaza la implementación de #68.
- PRs documentales enlazadas por sus fichas: arquitectura #94/#99 → #62; diccionario #95 → #64; API #96 → #66; propuesta de seguridad #97 → #70/#71; plan backend #98 → #90. No cuentan como aprobación de reglas ni como entrega de implementación.
- [PR #52](https://github.com/Univalle-P-I/VINTRA/pull/52) ya integró landing/login visual; conservar #61 solo para sistema visual o trabajo institucional que aún falte.

## Pendientes para cerrar VIN-003

- Product/profesor confirma alcance y prioridades en #53/#58, roles en #70, y las decisiones de HU9/#91, HU11/#83 y HU12/#84.
- Revisar y normalizar los milestones existentes después de acordar calendario: #71 tiene un milestone que no coincide con su ficha; #83 no tiene milestone; verificar #61 y #70–#84. No asignar hitos por inferencia.
- Mantener dependencias como números de Issue; actualizar las fichas si cambian los estados de PR o las decisiones del profesor.
