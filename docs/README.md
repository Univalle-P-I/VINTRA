# Documentación de VINTRA

Índice de documentación del repositorio. Los archivos de diseño describen propuestas cuando así se indica; el código y los workflows definen el comportamiento ejecutable actual.

## Fuentes vigentes

| Tema | Documento | Alcance |
| --- | --- | --- |
| Arquitectura implementada | [ARCHITECTURE.md](ARCHITECTURE.md) | Componentes actuales, conexiones y límites conocidos. |
| API | [API_SPECIFICATION.md](API_SPECIFICATION.md) | Contratos candidatos; los únicos endpoints implementados hoy son `/health` y `/health/db`. |
| Datos | [DATABASE_DESIGN.md](DATABASE_DESIGN.md) y [base-de-datos/](base-de-datos/) | Propuesta del equipo de datos; no hay migraciones ejecutables todavía. |
| Seguridad | [SECURITY_DESIGN.md](SECURITY_DESIGN.md) | Riesgos y decisiones pendientes; no implica que los controles descritos estén implementados. |
| Decisiones | [ARCHITECTURE_DECISIONS.md](ARCHITECTURE_DECISIONS.md) | Registro de decisiones y estado de aprobación. |
| Despliegue | [infraestructura/VPS.md](infraestructura/VPS.md) | Notas del VPS; validar antes de usarlas como procedimiento de producción. |
| Calidad | [SONARQUBE.md](SONARQUBE.md) | Configuración del análisis SonarQube Cloud del backend NestJS. |
| Colaboración | [gestion-github/](gestion-github/) y [../CONTRIBUTING.md](../CONTRIBUTING.md) | Gestión del trabajo y flujo de contribución. |

## Material histórico o sujeto a aprobación

- [BACKEND_ARCHITECTURE.md](BACKEND_ARCHITECTURE.md), [BACKEND_TASKS.md](BACKEND_TASKS.md) y [arquitectura/registro-decisiones-historico.md](arquitectura/registro-decisiones-historico.md) conservan diseños y tareas de cortes anteriores. Sus estados de PR/issues deben verificarse antes de reutilizarlos.
- [arquitectura/informe-stack-historico.md](arquitectura/informe-stack-historico.md) conserva el informe académico de stack.
- [ARCHITECTURE_DECISIONS.md](ARCHITECTURE_DECISIONS.md), [SECURITY_DESIGN.md](SECURITY_DESIGN.md), [API_SPECIFICATION.md](API_SPECIFICATION.md) y [DATABASE_DESIGN.md](DATABASE_DESIGN.md) contienen decisiones o propuestas; el estado actual está indicado al inicio de cada uno.

## Documentación por área

- [Arquitectura](arquitectura/README.md): índice de la arquitectura actual e informe académico histórico.
- [Backend](backend/README.md): contratos y propuesta funcional del backend.
- [Frontend](frontend/README.md): instalación y validación de la interfaz.
- [Base de datos](base-de-datos/README.md): modelo y referencias del equipo de datos.
- [Modelado](modelado/README.md): historias y dominio.
- [UI/UX](ui-ux/README.md): flujos y diseño.
- [Infraestructura](infraestructura/README.md): CI/CD y operación.
- [Scrum](scrum/README.md): planificación y acuerdos funcionales.

## Cómo mantenerla

Actualiza el documento que sea fuente de verdad y enlaza desde los índices. No copies contratos o comandos en varios lugares; si una sección queda histórica o propuesta, indícalo en su estado y enlaza la referencia vigente.
