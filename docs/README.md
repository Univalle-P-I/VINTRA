# Documentación de VINTRA

La documentación está separada por tema para que cada equipo encuentre y actualice la información de su área.

## Áreas del proyecto

| Carpeta | Contenido |
| --- | --- |
| [`arquitectura/`](arquitectura/README.md) | Visión general y decisiones de arquitectura. |
| [`backend/`](backend/README.md) | API, endpoints y ejecución del backend. |
| [`base-de-datos/`](base-de-datos/README.md) | Persistencia y diseño de datos. |
| [`frontend/`](frontend/README.md) | Aplicación web y guía del frontend. |
| [`infraestructura/`](infraestructura/README.md) | Entornos, VPS, ejecución y despliegues. |
| [`modelado/`](modelado/README.md) | Requisitos, historias y modelos del dominio. |
| [`scrum/`](scrum/README.md) | Organización del trabajo y acuerdos funcionales. |
| [`ui-ux/`](ui-ux/README.md) | Flujos, prototipos y accesibilidad. |
| [`gestion-github/`](gestion-github/README.md) | Uso del repositorio, Issues, Pull Requests y seguimiento. |

## Documentos de referencia

- [Especificación de la API](API_SPECIFICATION.md)
- [Arquitectura técnica del backend](BACKEND_ARCHITECTURE.md)
- [Tareas del backend](BACKEND_TASKS.md)
- [Diseño de base de datos](DATABASE_DESIGN.md)
- [Diseño de seguridad](SECURITY_DESIGN.md)
- [Configuración de SonarQube](SONARQUBE.md)

## Regla de publicación

Actualiza la documentación afectada cuando cambie un contrato, una decisión técnica, un comando, una configuración o el comportamiento visible del sistema. Si una decisión pertenece a varias áreas, mantenla en `arquitectura/` y enlázala desde las áreas involucradas.

Cada documento debe indicar, cuando aplique:

- fecha de actualización y responsable;
- estado: `Borrador`, `En revisión`, `Aprobado` u `Obsoleto`;
- alcance y supuestos;
- enlaces a código, issues, decisiones o documentos relacionados;
- instrucciones para validar la información.

Mantén una sola fuente para cada contrato o decisión. Los documentos de referencia del índice anterior conservan sus rutas y deben enlazarse desde el área correspondiente.

## Convenciones

- Los documentos nuevos usan nombres en minúsculas y guiones, por ejemplo `contrato-rutas.md`.
- Guarda los diagramas editables junto a su exportación cuando sea necesaria para revisarlos.
- Registra las decisiones con fecha, alternativas y razón de la selección.
- Sigue las reglas de colaboración y trazabilidad de [CONTRIBUTING.md](../CONTRIBUTING.md).
