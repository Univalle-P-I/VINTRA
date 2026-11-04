# Arquitectura de VINTRA

![Node.js](https://img.shields.io/badge/Node.js-LTS-339933?logo=nodedotjs&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-Framework-E0234E?logo=nestjs&logoColor=white)
![TypeORM](https://img.shields.io/badge/TypeORM-ORM-FE0803?logo=typeorm&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-5A29E4?logo=axios&logoColor=white)
![Git](https://img.shields.io/badge/Git-F05032?logo=git&logoColor=white)
![Estado](https://img.shields.io/badge/Estado-En_revision-yellow)

Este documento es la referencia técnica para los componentes del sistema VINTRA, sus relaciones y las decisiones arquitectónicas que afectan a más de un área. Complementa la visión general del [README raíz](../../README.md).

## Estado

- **Estado:** En revisión.
- **Responsable:** Célula de Frontend, según el informe de organización y tareas, con aportes de las células involucradas.
- **Fuente anterior:** `docs/` — Informe "Stack Tecnológico, Herramientas y Configuración del Entorno" (Proyecto Integrador).
- **Universidad:** Universidad del Valle — Seccional Pacífico.
- **Programa:** Tecnología en Desarrollo de Software.
- **Año:** 2026.
- **Equipo:** Jose Luis Mosquera Largacha · Lucio Lopez Gonzalo Andres (equipo de cinco integrantes).

## Resumen

VINTRA es una plataforma web compuesta por un backend con API REST, una base de datos relacional, servicios de geolocalización y notificaciones, y un frontend con dos vistas principales: un dashboard para el operador o administrador y una vista de consulta para la ciudadanía.

El diagnóstico que originó el proyecto, relacionado con la falta de planificación, coordinación y comunicación en la recolección de residuos, define el alcance funcional del sistema: gestión de rutas, seguimiento de vehículos y comunicación ciudadana.

**Stack tecnológico definido por el equipo:** PostgreSQL como sistema gestor de base de datos, Node.js como entorno de ejecución, NestJS como framework backend, TypeORM como herramienta ORM para la gestión de datos, React con Vite para el frontend, Axios para las solicitudes HTTP hacia la API REST y Git para el control de versiones.

La arquitectura lógica separa la interfaz de usuario, la API y la persistencia de datos. El frontend no se conecta directamente a PostgreSQL: todas las operaciones de información pasan por el backend, que recibe las solicitudes, valida los datos, aplica las reglas de negocio y utiliza TypeORM para interactuar con la base de datos.

**Objetivo del informe de stack:** definir y documentar las tecnologías, la arquitectura lógica, la distribución de responsabilidades y el plan de configuración del entorno de desarrollo, para preparar una integración controlada entre frontend, backend y base de datos.

**Objetivos específicos:**

1. Identificar las tecnologías y herramientas previstas para cada componente del sistema.
2. Justificar la selección de las tecnologías según su función dentro de la arquitectura.
3. Establecer una secuencia de configuración que considere las dependencias entre componentes.
4. Definir criterios verificables para comprobar el funcionamiento del entorno.
5. Documentar prácticas iniciales de seguridad, control de versiones y manejo de configuración.

## Stack tecnológico definido

![Stack tecnológico](https://skillicons.dev/icons?i=nodejs,nestjs,ts,postgres,react,vite,git&theme=light)

| Componente | Tecnología | Responsabilidad | Estado documental |
|---|---|---|---|
| Base de datos | PostgreSQL | Almacenar y organizar la información del sistema. | Definido; instalación pendiente. |
| Runtime backend | Node.js | Proporcionar el entorno de ejecución del servidor. | Definido; versión pendiente. |
| Framework backend | NestJS | Organizar módulos, controladores, servicios y API REST. | Definido; configuración pendiente. |
| Lenguaje backend | TypeScript | Implementar la lógica del backend mediante tipado estático. | Definido. |
| Acceso a datos | TypeORM | Gestionar entidades, repositorios y operaciones con PostgreSQL. | Definido; integración pendiente. |
| Frontend | React + Vite | Construir y ejecutar la interfaz web. | Definido; configuración pendiente. |
| Comunicación HTTP | API REST + Axios | Permitir que el frontend consuma los endpoints del backend. | Definido; integración pendiente. |
| Control de versiones | Git | Registrar cambios y facilitar el trabajo colaborativo. | En proceso de adopción. |
| Pruebas de API | Cliente HTTP de pruebas (por definir) | Enviar solicitudes y verificar respuestas de los endpoints. | Herramienta por seleccionar. |

## Justificación de las herramientas

**Node.js** — Entorno de ejecución de JavaScript que permite ejecutar el backend fuera del navegador. Proporciona la base necesaria para ejecutar NestJS y sus dependencias.

**NestJS** — Framework de Node.js para construir servicios backend y APIs escalables. Organiza la lógica de negocio mediante módulos, controladores y providers, facilitando la separación de responsabilidades, el mantenimiento y la ampliación del sistema. Utiliza TypeScript como lenguaje de desarrollo.

**TypeScript** — Lenguaje basado en JavaScript que incorpora tipado estático. Facilita la detección de errores durante el desarrollo y mejora la organización del código en aplicaciones de mayor tamaño.

**PostgreSQL** — Sistema gestor de bases de datos relacional que permite estructurar la información mediante tablas, restricciones y relaciones. Es adecuado cuando se requiere consistencia, integridad de datos y consultas SQL.

**TypeORM** — ORM (Object-Relational Mapping) utilizado junto con NestJS para gestionar la conexión y las operaciones con la base de datos PostgreSQL. Permite trabajar con entidades, repositorios y consultas utilizando TypeScript, reduciendo la necesidad de escribir consultas SQL directamente.

Para establecer la conexión con PostgreSQL, TypeORM utiliza el controlador correspondiente de Node.js. El paquete `pg` (node-postgres) puede actuar como dependencia de dicho controlador, pero la gestión de las entidades y las operaciones de acceso a datos se realiza mediante TypeORM.

Las credenciales de conexión, como el host, puerto, nombre de la base de datos, usuario y contraseña, deben configurarse mediante variables de entorno y no quedar escritas directamente en el código fuente.

**React** — Biblioteca para construir interfaces de usuario mediante componentes reutilizables. Permite separar la interfaz en unidades que pueden mantenerse y ampliarse conforme crezca el sistema.

**Vite** — Herramienta de desarrollo y compilación para el frontend. Proporciona un servidor de desarrollo ágil y un proceso de construcción para preparar los archivos de la aplicación.

**Axios** — Cliente HTTP que facilita el envío de solicitudes desde React hacia los endpoints de la API REST. Permite gestionar respuestas, configurar encabezados y tratar errores de comunicación.

**Git** — Sistema de control de versiones que permite registrar cambios, revisar contribuciones y reducir conflictos al trabajar entre varios integrantes.

## Alcance funcional

### MVP (mínimo producto viable)

- Gestión y visualización de rutas de recolección.
- Asignación de vehículos y conductores.
- Seguimiento del estado de los vehículos.
- Reporte y consulta de acumulación de residuos.

### Funcionalidades posteriores

- Notificaciones push o SMS al ciudadano.
- Seguimiento geolocalizado interactivo en tiempo real.
- Indicadores avanzados y visualización geográfica.
- Modo ciudadano para consultar rutas y realizar reportes mediante una interfaz dedicada.

## Diagrama de arquitectura VINTRA

El siguiente diagrama representa la separación entre las capas principales del sistema y sus relaciones de comunicación. El frontend consume la API REST del backend, mientras que NestJS utiliza TypeORM para acceder a PostgreSQL. Los servicios geográficos y de notificaciones son gestionados desde el backend.

```mermaid
flowchart TB

    subgraph SISTEMA["VINTRA - Plataforma de coordinación de rutas"]

        subgraph FRONTEND["Frontend - React + Vite"]
            direction TB
            F1["Dashboard y Mapa"]
            F2["Operador / Administrador"]
            F3["Ciudadanía"]
            F4["Axios - Cliente HTTP"]
            
            F1 --> F4
            F2 --> F1
            F3 --> F1
        end

        subgraph BACKEND["Backend - Node.js + NestJS"]
            direction TB
            B0["API REST"]
            B1["Gestión de Rutas"]
            B2["Tracking y Geolocalización"]
            B3["Comunicación Ciudadana"]

            B0 --> B1
            B0 --> B2
            B0 --> B3
        end

        subgraph PERSISTENCIA["Persistencia de datos"]
            direction TB
            D1["TypeORM - ORM"]
            D2[("PostgreSQL - Base de datos")]
            D1 --> D2
        end

        subgraph SERVICIOS["Servicios externos"]
            direction TB
            S1["Servicios geográficos"]
            S2["Notificaciones / Alertas"]
        end

        F4 <-->|"Solicitudes HTTP / JSON"| B0

        B1 --> D1
        B2 --> D1
        B3 --> D1

        B2 --> S1
        B3 --> S2

    end

    subgraph DEVOPS["Integración y despliegue - DevOps"]
        direction LR
        C1["Git - Control de versiones"]
        C2["GitHub - Repositorio"]
        C3["GitHub Actions - CI/CD"]
        C4["VPS - Entorno de despliegue"]

        C1 --> C2
        C2 --> C3
        C3 --> C4
    end

    C4 -.->|"Despliegue de la aplicación"| FRONTEND
    C4 -.->|"Despliegue de la aplicación"| BACKEND

    classDef frontend fill:#dbeafe,stroke:#2563eb,color:#1e3a8a
    classDef backend fill:#dcfce7,stroke:#16a34a,color:#14532d
    classDef database fill:#fef3c7,stroke:#d97706,color:#78350f
    classDef services fill:#fce7f3,stroke:#db2777,color:#831843
    classDef devops fill:#f3e8ff,stroke:#9333ea,color:#581c87

    class F1,F2,F3,F4 frontend
    class B0,B1,B2,B3 backend
    class D1,D2 database
    class S1,S2 services
    class C1,C2,C3,C4 devops
```

## Consideraciones de seguridad y configuración

- Las credenciales de PostgreSQL deben almacenarse en variables de entorno.
- El archivo `.env` no debe subirse al repositorio.
- Se debe mantener un archivo `.env.example` sin credenciales reales para documentar las variables necesarias.
- El backend debe validar las solicitudes recibidas desde el frontend.
- La comunicación entre frontend y backend debe realizarse mediante los endpoints definidos de la API REST.
- Las operaciones sobre la base de datos deben gestionarse desde el backend mediante TypeORM.
- Las modificaciones del código deben registrarse mediante Git y organizarse en ramas de trabajo.

## Consideraciones finales

La arquitectura propuesta establece una separación de responsabilidades entre la interfaz de usuario, la lógica de negocio, la persistencia de información y los procesos de despliegue.

La utilización de NestJS con TypeORM permite centralizar el acceso a PostgreSQL desde el backend, mientras que React, Vite y Axios facilitan la construcción y comunicación de la interfaz web con la API REST.

La implementación definitiva de cada componente, sus integraciones y los servicios externos deberá verificarse con el código fuente y la configuración real del proyecto VINTRA.
