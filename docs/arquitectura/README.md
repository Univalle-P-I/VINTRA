# Arquitectura de VINTRA

![Node.js](https://img.shields.io/badge/Node.js-LTS-339933?logo=nodedotjs&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-Framework-E0234E?logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-5A29E4?logo=axios&logoColor=white)
![Git](https://img.shields.io/badge/Git-F05032?logo=git&logoColor=white)
![Estado](https://img.shields.io/badge/estado-en_configuraci%C3%B3n-yellow)

Este documento es la referencia técnica para los componentes del sistema, sus relaciones y las decisiones que afectan a más de un área. Complementa la visión general del [`README` raíz](../../README.md).

## Estado

- Estado: `En revisión`
- Responsable: Célula de Frontend (según el informe de organización y tareas), con aportes de las células involucradas
- Fuente anterior: `docs/` — Informe "Stack Tecnológico, Herramientas y Configuración del Entorno" (Proyecto Integrador)
- Universidad: Del Valle — Seccional Pacífico · Tecnología en Desarrollo de Software · 2026
- Equipo: Jose Luis Mosquera Largacha · Lucio Lopez Gonzalo Andres *(equipo de cinco integrantes)*

## Resumen

VINTRA es una plataforma web compuesta por un backend con API REST, una base de datos, servicios de geolocalización y notificaciones, y un frontend con dos vistas: un dashboard para el operador/administrador y una vista de consulta para la ciudadanía. El diagnóstico que originó el proyecto —falta de planificación, coordinación y comunicación en la recolección de residuos— define el alcance funcional: gestión de rutas, tracking en tiempo real y comunicación ciudadana.

**Stack tecnológico definido (informe del equipo):** PostgreSQL como sistema gestor de base de datos, Node.js con NestJS para el backend, React con Vite para el frontend, el paquete pg para el acceso a PostgreSQL desde el backend y Axios para las solicitudes HTTP del frontend hacia la API REST, con Git como control de versiones. La arquitectura lógica separa la interfaz de usuario, la API y la persistencia de datos: el frontend no se conecta directamente a PostgreSQL; toda operación de datos pasa por el backend, que valida la solicitud, aplica las reglas correspondientes y consulta la base de datos.

**Objetivo del informe de stack:** definir y documentar el stack tecnológico, la arquitectura lógica, la distribución de responsabilidades y el plan de configuración del entorno de desarrollo, para preparar una integración controlada entre frontend, backend y base de datos.

**Objetivos específicos:**

1. Identificar las tecnologías y herramientas previstas para cada componente del sistema.
2. Justificar la selección de las tecnologías según su función dentro de la arquitectura.
3. Establecer una secuencia de configuración que considere las dependencias entre componentes.
4. Definir criterios verificables para comprobar el funcionamiento del entorno.
5. Documentar prácticas iniciales de seguridad, control de versiones y manejo de configuración.

## Stack tecnológico definido

![Node.js](https://skillicons.dev/icons?i=nodejs,nestjs,ts,postgres,react,vite,git&theme=light)
![Axios](https://img.shields.io/badge/Axios-5A29E4?logo=axios&logoColor=white)

| Componente | Tecnología propuesta | Responsabilidad | Estado documental |
|---|---|---|---|
| Base de datos | PostgreSQL | Almacenar y organizar los datos del sistema | Definido; instalación pendiente |
| Runtime backend | Node.js | Ejecutar la aplicación del servidor | Definido; versión pendiente |
| Framework backend | Node.js + NestJS | Organizar módulos, controladores, servicios y API REST | Definido; configuración pendiente |
| Acceso a datos | pg (node-postgres) | Permitir consultas desde el backend hacia PostgreSQL | Propuesto; integración pendiente |
| Frontend | React + Vite | Construir y ejecutar la interfaz web | Definido; configuración pendiente |
| Comunicación HTTP | API REST + Axios | Permitir que el frontend consuma los endpoints del backend | Definido; integración pendiente |
| Control de versiones | Git (recomendado) | Registrar cambios y facilitar el trabajo colaborativo | Pendiente de adopción |
| Pruebas de API | Cliente HTTP de pruebas (por definir) | Enviar solicitudes y verificar respuestas de los endpoints | Herramienta por seleccionar |

## Justificación de las herramientas

**PostgreSQL** — Sistema gestor relacional que permite estructurar la información mediante tablas, restricciones y relaciones. Adecuado cuando se requiere consistencia y consultas SQL. La estructura definitiva del esquema dependerá de los requisitos funcionales del proyecto.

**NestJS** — Framework de Node.js para construir servicios backend y APIs escalables. Organiza la lógica de negocio en módulos, controladores y providers, con **TypeScript** como lenguaje tipado y validación de entradas con `class-validator`.

**React** — Biblioteca para construir interfaces a partir de componentes reutilizables. Permite separar la interfaz en unidades que pueden mantenerse y ampliarse conforme crezca el sistema.

**Vite** — Herramienta de desarrollo y compilación para el frontend. Proporciona un servidor de desarrollo ágil y un proceso de construcción para preparar los archivos de la aplicación.

**pg** — Cliente de PostgreSQL para Node.js. Permite que el backend ejecute consultas SQL y gestione conexiones a la base de datos. Las credenciales deben provenir de variables de entorno y no quedar escritas directamente en el código.

**Axios** — Cliente HTTP que facilita enviar solicitudes desde React hacia los endpoints de la API REST, gestionar respuestas y tratar errores de comunicación.

**Git** — Sistema de control de versiones recomendado para registrar cambios, revisar contribuciones y reducir conflictos al trabajar entre varios integrantes.

## Diagrama de arquitectura

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
