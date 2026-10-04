# Documentación de VINTRA

Este directorio reúne la documentación de cada área del proyecto. Cada célula debe actualizar el README de su carpeta y enlazar desde allí los documentos adicionales, diagramas, contratos o decisiones que publique.

## Dónde documentar cada tema

| Área | Carpeta | Qué debe contener | Responsable |
| --- | --- | --- | --- |
| Arquitectura | [`arquitectura/`](arquitectura/README.md) | Componentes, relaciones entre servicios, flujos y decisiones que afecten a varias áreas. | GitHub / CI-CD / VPS, con aportes de las demás células |
| Frontend | [`frontend/`](frontend/README.md) | Stack, estructura de la aplicación, rutas, componentes, estados, consumo de API y ejecución local. | Backend / Frontend |
| Backend | [`backend/`](backend/README.md) | Stack, módulos, reglas de negocio, endpoints, autenticación, errores y ejecución local. | Backend / Frontend |
| Base de datos | [`base-de-datos/`](base-de-datos/README.md) | Motor, configuración, tablas, restricciones, índices, migraciones y datos iniciales. | Base de Datos |
| Modelado | [`modelado/`](modelado/README.md) | Requisitos, historias de usuario, modelo de dominio, diagramas y trazabilidad entre necesidades y solución. | Scrum, Base de Datos y Backend / Frontend |
| UI/UX | [`ui-ux/`](ui-ux/README.md) | Flujos de usuario, decisiones visuales, accesibilidad, prototipos y criterios de entrega. | UI/UX |
| Infraestructura | [`infraestructura/`](infraestructura/README.md) | Entornos, variables, CI/CD, despliegue, VPS, observabilidad y recuperación. | GitHub / CI-CD / VPS |
| Scrum | [`scrum/`](scrum/README.md) | Historias de usuario, criterios de aceptación, acuerdos y decisiones de planificación. | Scrum |

## Regla de publicación

Una modificación de código debe actualizar la documentación afectada cuando cambie un contrato, una decisión técnica, un comando, una configuración o el comportamiento visible del sistema. Si un documento pertenece a más de un área, se guarda en `arquitectura/` y se enlaza desde las áreas involucradas.

Cada documento debe indicar, cuando aplique:

- fecha de actualización y responsable;
- estado: `Borrador`, `En revisión`, `Aprobado` o `Obsoleto`;
- alcance y supuestos;
- enlaces a código, issues, decisiones o documentos relacionados;
- instrucciones para validar la información.

No se deben copiar contratos o decisiones en varias carpetas. Se mantiene una sola fuente y las demás áreas la enlazan.

## Convenciones

- Los archivos Markdown usan nombres en minúsculas y guiones: `contrato-rutas.md`.
- Los diagramas editables se guardan junto a su exportación cuando sea necesario revisarlos sin una herramienta adicional.
- Las decisiones que afecten el diseño se registran con fecha, alternativas consideradas y razón de la decisión.
- La documentación sigue las reglas de colaboración de [`CONTRIBUTING.md`](../CONTRIBUTING.md), incluido el uso de Pull Requests y mensajes de commit en español.

## Estado actual

Las carpetas contienen una guía inicial. Cada célula debe reemplazar los apartados pendientes con información verificable y enlazar los entregables que ya existan. La arquitectura general está en [`arquitectura/README.md`](arquitectura/README.md).
