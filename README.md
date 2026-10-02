<!-- markdownlint-disable MD033 MD041 -->

<div align="center">

<h1> VINTRA </h1>

<p><strong>Sistema de coordinación y seguimiento de rutas de recolección de residuos sólidos.</strong></p>

<p>
  <a href="#estado-del-proyecto"><img src="https://img.shields.io/badge/Estado-Desarrollo-yellow?style=for-the-badge" alt="Estado: desarrollo"></a>
  <a href="#"><img src="https://img.shields.io/badge/Universidad%20del%20Valle%20Buenaventura-blue?style=for-the-badge" alt="Universidad del Valle, Sede Buenaventura">
  <a href="LICENSE"><img src="https://img.shields.io/badge/Licencia-Apache%202.0-green?style=for-the-badge" alt="Licencia Apache 2.0"></a>
</p>

<p>
  <a href="docs/ARCHITECTURE.md">Arquitectura</a> ·
  <a href="VINTRA.pdf">Propuesta VINTRA</a> ·
  <a href="CONTRIBUTING.md">Contribuir</a>
</p>

</div>

<!-- markdownlint-enable MD033 MD041 -->

---

## ¿Qué es VINTRA?

VINTRA es una plataforma digital para la gestión, coordinación y seguimiento de rutas de recolección de residuos sólidos, que conecta la operación del servicio de aseo con la ciudadanía mediante información clara y oportuna sobre horarios, recorridos y novedades del servicio.

## Génesis del proyecto

VINTRA nace de un análisis realizado en clase sobre la problemática de la recolección de residuos sólidos en Buenaventura. Mediante un diagrama de Ishikawa, el equipo identificó y priorizó las causas del problema, encontrando que las de mayor peso eran:

- Deficiencia en la planificación y coordinación de rutas (causa con mayor puntuación).
- Falta de información en tiempo real sobre el paso del vehículo recolector.
A partir de este diagnóstico, se concluyó que el problema no es únicamente la acumulación de basuras —que es una consecuencia—, sino la falta de organización, coordinación y comunicación entre el operador del servicio de aseo y la ciudadanía. VINTRA es la respuesta tecnológica a ese diagnóstico.

## Problema que resuelve

Deficiencias en la planificación, coordinación y comunicación del servicio de recolección de residuos sólidos en Buenaventura, que generan incertidumbre en la ciudadanía sobre el paso del vehículo recolector y favorecen la acumulación de residuos en las calles.

## Propuesta de valor

VINTRA convierte un servicio operado de forma dispersa y poco visible en un sistema coordinado, trazable y comunicado:

| Para el operador | Para la ciudadanía |
| --- | --- |
| Planificación y asignación de rutas | Consulta de horarios y recorridos |
| Seguimiento en tiempo real de vehículos | Aviso de proximidad del vehículo |
| Registro de novedades e incumplimientos | Reporte de acumulación de residuos |
| Indicadores de cumplimiento del servicio | Visibilidad del estado de sus reportes |

## Objetivos

### Objetivo general

Desarrollar una plataforma web que permita gestionar, planificar y monitorear las rutas de recolección de residuos sólidos, proporcionando información operativa y geográfica que facilite la coordinación del servicio y permita a la ciudadanía reportar situaciones relacionadas con la acumulación de residuos.

### Objetivos específicos

- Centralizar la planificación y asignación de rutas y horarios de recolección.
- Ofrecer seguimiento geográfico en tiempo real de los vehículos recolectores.
- Reducir la incertidumbre ciudadana sobre el paso del servicio.
- Permitir el registro y gestión de reportes ciudadanos.
- Generar indicadores de cumplimiento para la toma de decisiones.

## Arquitectura resumida

```mermaid
flowchart TD
    A[VINTRA<br/>Plataforma de coordinación de rutas] --> B[Gestión de Rutas]
    A --> C[Tracking y Geolocalización]
    A --> D[Comunicación Ciudadana]
    B --> E[Backend / REST API]
    C --> E
    D --> E
    E --> F[(Base de datos)]
    E --> G[Servicios geográficos]
    E --> H[Notificaciones / Alertas]
    E --> I[Frontend<br/>Dashboard y Mapa]
    I --> J[Operador / Administrador]
    I --> K[Ciudadanía]
    subgraph DEVOPS["DevOps · Grupo GitHub-CI-CD-VPS"]
        L[GitHub Actions - CI/CD]
        M[VPS / Despliegue]
    end
    E -.integración y despliegue.-> DEVOPS
    I -.integración y despliegue.-> DEVOPS
```

El detalle técnico completo de la arquitectura (componentes, contratos entre módulos, modelo de datos y decisiones de diseño) se documentará en [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) *(en actualizacion)*.

## Tecnologías

Pendiente de definición por el grupo responsable de Backend/Frontend/Base de Datos. Esta sección se completará una vez esos equipos definan el stack (lenguaje de backend, framework de frontend y motor de base de datos), para que el grupo de GitHub-CI-CD-VPS pueda ajustar los workflows de CI/CD y la configuración del VPS en consecuencia.

| Componente | Tecnología | Responsable |
| --- | --- | --- |
| Frontend | *Por definir* | Célula Backend / Frontend |
| Backend | *Por definir* | Célula Backend / Frontend |
| Base de datos | PostgreSQL | Célula Base de Datos |
| Infraestructura y despliegue | *Por definir* | Célula GitHub / CI-CD / VPS |

## Equipo

| Célula | Responsabilidad |
| --- | --- |
| UI/UX | Diseño de la Landing Page |
| Base de Datos | Diseño de la base de datos |
| Backend / Frontend | Stack tecnológico, herramientas y configuración del entorno (PostgreSQL) |
| Scrum | Historias de usuario |
| GitHub / CI-CD / VPS | Repositorio, integración continua, despliegue y VPS |

## Estructura del repositorio

Estructura objetivo, a cargo del grupo GitHub-CI-CD-VPS:

```text
.
├── .github/          # Plantillas de Issues/PR y workflows de CI/CD
├── docs/              # Documentación técnica (arquitectura, contratos, historias de usuario)
├── backend/           # API REST
├── frontend/          # Dashboard y aplicación de cara a la ciudadanía
├── database/          # Modelo de datos, migraciones y scripts
├── infrastructure/    # Configuración de despliegue y VPS
└── README.md
```

## Flujo de trabajo

- **Estrategia de ramas:** `main` → `develop` → `feature/` · `fix/` · `task/`
- **Workflows de CI/CD:** `ci.yml` valida cambios en PR hacia `develop` y pushes a `develop`/`main`; `backend.yml` y `frontend.yml` están pendientes de implementación.
- **Plantillas de Issues y Pull Requests:** ver mas en  [`CONTRIBUTING.md`](CONTRIBUTING.md)
- **Despliegue:** VPS *(configuración pendiente)*
Responsable: grupo GitHub-CI-CD-VPS, encargado de que el repositorio funcione como columna vertebral que integra a los demás equipos, no solo como un lugar donde guardar código.

## Estado del proyecto

VINTRA se encuentra en fase de definición. La propuesta general, el problema, los objetivos y la arquitectura resumida ya están establecidos. Falta que cada célula complete la información de su área:

- [ ] **UI/UX** — Diseño de la landing page.
- [ ] **Base de Datos** — Modelo y diseño de la base de datos.
- [ ] **Backend / Frontend** — Definición del stack tecnológico y configuración del entorno (PostgreSQL).
- [ ] **Scrum** — Historias de usuario.
- [ ] **GitHub / CI-CD / VPS** — Plantillas de Issues/PR, workflows de CI/CD, estrategia de ramas ya definida, configuración y despliegue en el VPS.
Este README se irá actualizando a medida que cada célula entregue su información.

## Cómo contribuir

*(Guía de flujo de trabajo para el equipo del proyecto. Aplica para todas las célu­las, disponible en[`CONTRIBUTING.md`](CONTRIBUTING.md).)*

## Licencia

*Apache 2.0 — Universidad del Valle, Sede Buenaventura.*

 <!-- markdownlint-disable MD033 -->
---

<div align="center">
**VINTRA** — Coordinación de rutas, información para la ciudadanía.

</div>
<!-- markdownlint-enable MD033 -->
