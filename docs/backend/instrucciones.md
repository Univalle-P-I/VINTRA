# INSTRUCCIONES PARA TRABAJAR EN EQUIPO – VINTRA

**Proyecto:** VINTRA – Sistema de gestión de rutas de recolección de residuos
**Repositorio:** VINTRA
**Rama de integración:** `develop`

## 1. Objetivo

Establecer los lineamientos de trabajo que deben seguir los integrantes del equipo durante el desarrollo del backend de VINTRA, con el propósito de mantener una estructura organizada, facilitar el desarrollo independiente de los módulos y garantizar una integración controlada de los cambios.

Cada integrante debe conocer cómo trabajar sobre su módulo, cómo relacionar sus funcionalidades con los demás componentes y cómo entregar sus cambios para revisión e integración.

## 2. Organización del trabajo

El backend de VINTRA está organizado en módulos que representan diferentes funcionalidades del sistema.

Cada integrante debe trabajar sobre el módulo o las tareas que le hayan sido asignados, respetando la arquitectura y las convenciones existentes.

Durante el desarrollo se deben tener en cuenta los siguientes principios:

- Cada integrante es responsable de implementar y probar las funcionalidades de su módulo.
- Se debe respetar la estructura general del backend.
- No se deben duplicar funcionalidades que ya estén implementadas en otros módulos.
- Las dependencias entre módulos deben utilizar las relaciones y servicios existentes.
- Los cambios que afecten componentes compartidos deben coordinarse con el equipo.

## 3. Organización de responsabilidades

Cada integrante debe asumir la responsabilidad de las tareas asignadas a su módulo.

Entre sus responsabilidades se encuentran:

1. Revisar las historias de usuario y los criterios de aceptación correspondientes.
2. Comprender las entidades, relaciones y DTO que intervienen en su funcionalidad.
3. Implementar la lógica correspondiente en los servicios.
4. Desarrollar o actualizar los controladores y endpoints cuando corresponda.
5. Crear y ejecutar las pruebas de su módulo.
6. Documentar los endpoints o modificaciones realizadas.
7. Entregar los cambios mediante una Pull Request para su revisión.

La implementación de cada módulo debe respetar los contratos y dependencias establecidos en el backend.

## 4. Flujo de trabajo con Git y GitHub

El proyecto utiliza un flujo de trabajo basado en ramas para evitar modificaciones directas sobre las ramas principales.

### 4.1. Ramas principales

- `main`: rama principal del proyecto.
- `develop`: rama destinada a integrar los cambios desarrollados por los integrantes.

No se deben realizar cambios directamente sobre estas ramas como parte del trabajo individual.

### 4.2. Creación de ramas de trabajo

Cada integrante debe crear su propia rama a partir de `develop` actualizado.

Se utilizan los siguientes prefijos:

| Prefijo | Uso | Ejemplo |
|---|---|---|
| `feature/` | Nueva funcionalidad | `feature/gestion-vehiculos` |
| `fix/` | Corrección de errores | `fix/validacion-asignaciones` |
| `task/` | Tareas técnicas o de configuración | `task/documentacion-backend` |

Cada rama debe tener un nombre claro que permita identificar el propósito del trabajo.

No se recomienda crear ramas de trabajo a partir de otras ramas personales, salvo que exista una dependencia técnica previamente coordinada.

### 4.3. Desarrollo individual

Una vez creada la rama, el integrante debe:

1. Implementar únicamente los cambios correspondientes a su tarea.
2. Mantener la organización del código existente.
3. Evitar modificar archivos de otros módulos sin necesidad.
4. Realizar commits pequeños y descriptivos.
5. Ejecutar las validaciones correspondientes antes de publicar sus cambios.

### 4.4. Convenciones para los commits

Se recomienda utilizar mensajes descriptivos con los siguientes prefijos:

| Prefijo | Descripción |
|---|---|
| `feat` | Nueva funcionalidad. |
| `fix` | Corrección de errores. |
| `docs` | Cambios en documentación. |
| `test` | Creación o actualización de pruebas. |
| `refactor` | Reorganización del código sin cambiar su comportamiento. |
| `chore` | Tareas de mantenimiento o configuración. |

Ejemplos:

```text
feat: agrega validación de disponibilidad de vehículos
fix: corrige validación de estado en seguimiento
test: agrega pruebas para el servicio de personal
docs: actualiza documentación de endpoints
```

### 4.5. Actualización de la rama

Antes de integrar los cambios, cada integrante debe verificar que su rama esté actualizada con respecto a `develop`.

Si existen cambios realizados por otros integrantes que afectan su trabajo, debe coordinar su incorporación y resolver los conflictos sin sobrescribir código ajeno.

### 4.6. Creación de Pull Requests

Cuando la tarea esté terminada, el integrante debe publicar su rama y crear una Pull Request hacia `develop`.

La Pull Request debe incluir:

- Descripción del objetivo del cambio.
- Historia de usuario o tarea de Trello relacionada.
- Archivos o funcionalidades modificadas.
- Pruebas ejecutadas y sus resultados.
- Evidencias o capturas cuando sean necesarias.
- Dependencias o consideraciones importantes para la integración.

Los encargados de revisar e integrar los cambios verificarán que la implementación cumpla los requisitos y que no afecte el funcionamiento de otros módulos.

Los integrantes que no tengan permisos de merge no deben intentar integrar directamente sus ramas.

## 5. Convenciones de desarrollo del backend

Para mantener la consistencia del proyecto, todos los integrantes deben respetar la arquitectura existente.

### 5.1. Organización de responsabilidades

- **Entidades:** representan las estructuras y relaciones del modelo de datos.
- **DTO:** definen la información que reciben los endpoints y sus validaciones.
- **Servicios:** contienen la lógica de negocio.
- **Controladores:** reciben las solicitudes HTTP y delegan el procesamiento a los servicios.
- **Módulos:** organizan y conectan los componentes correspondientes.

### 5.2. Organización de archivos

Los archivos deben conservar las convenciones de nombres y ubicación que utiliza el proyecto.

Se deben evitar duplicaciones, nombres ambiguos y modificaciones innecesarias de componentes compartidos.

### 5.3. Reutilización de componentes

Antes de implementar una funcionalidad, cada integrante debe revisar si ya existe un servicio, entidad, DTO o componente que pueda reutilizar.

No se deben duplicar validaciones ni implementar relaciones alternativas para resolver una funcionalidad que ya está contemplada en la arquitectura.

## 6. Trabajo con la base de datos

El modelo de datos y las migraciones de la PR #115 constituyen la referencia de trabajo del equipo mientras se completa su proceso de revisión y aprobación.

Por tanto:

- No modificar migraciones ni relaciones de la PR #115 por iniciativa individual.
- No crear tablas, columnas o claves foráneas sin coordinación y aprobación del equipo responsable de base de datos.
- No ejecutar migraciones pendientes sobre bases de datos compartidas o de producción.
- Respetar las entidades y relaciones existentes.
- Informar cualquier inconsistencia entre una historia de usuario y el modelo de datos antes de implementar una solución que implique cambiarlo.

Si una funcionalidad no puede implementarse con la estructura actual, debe documentarse y consultarse con el responsable correspondiente.

## 7. Seguimiento de tareas en Trello

El equipo utiliza el tablero `BuenaventuraLimpiaUV` para organizar las historias de usuario, tareas y sprints.

Las tarjetas se gestionan mediante las siguientes columnas:

- **Por hacer:** tareas pendientes de iniciar.
- **En curso:** tareas que se encuentran en desarrollo.
- **En revisión:** tareas terminadas por el responsable y pendientes de revisión.
- **Hecho:** tareas revisadas y completadas.

Cada integrante debe mantener actualizada la tarjeta correspondiente a su trabajo.

La tarjeta debe reflejar el estado real de la implementación y permitir relacionar la tarea con los cambios realizados en GitHub.

## 8. Coordinación entre módulos

Debido a que los módulos del backend pueden depender unos de otros, los integrantes deben coordinar las funcionalidades que involucren componentes compartidos.

Se deben tener en cuenta las siguientes recomendaciones:

- Consultar la documentación de endpoints antes de consumir un servicio.
- Respetar los contratos de entrada y salida existentes.
- Evitar cambiar respuestas de endpoints sin coordinación.
- Comunicar cambios que puedan afectar a otros módulos.
- Reutilizar los servicios y relaciones disponibles.
- Informar bloqueos o dependencias que impidan avanzar con una tarea.

Si una modificación afecta a varios módulos, debe coordinarse antes de implementarla.

## 9. Revisión e integración de cambios

Antes de integrar una Pull Request, se debe verificar:

1. Que los cambios correspondan a la tarea asignada.
2. Que no existan modificaciones ajenas al alcance.
3. Que el backend compile correctamente.
4. Que las pruebas correspondientes se ejecuten satisfactoriamente.
5. Que se respeten las convenciones del proyecto.
6. Que no se hayan alterado relaciones o contratos compartidos sin autorización.
7. Que la documentación esté actualizada cuando corresponda.

Los encargados de integración revisarán los cambios, solicitarán correcciones cuando sean necesarias y realizarán el merge de acuerdo con los permisos y las reglas del repositorio.

Después de la integración, los integrantes deben actualizar sus ramas y verificar que puedan continuar trabajando sobre la versión vigente de `develop`.

## 10. Criterios de entrega de cada módulo

Para considerar que una tarea está lista para revisión, el integrante debe entregar:

- Implementación correspondiente a la historia de usuario.
- DTO y validaciones necesarias.
- Servicios y controladores correspondientes.
- Pruebas unitarias.
- Documentación de endpoints cuando aplique.
- Pull Request con descripción y evidencias.
- Tarjeta de Trello actualizada.

La tarea se considera completada cuando ha pasado por el proceso de revisión e integración establecido por el equipo.

## 11. Comunicación y resolución de inconvenientes

Si durante el desarrollo se presenta un problema relacionado con:

- El modelo de datos.
- Las relaciones entre módulos.
- Los contratos de los endpoints.
- Las reglas de negocio.
- Los conflictos de Git.
- Las dependencias con otros integrantes.

El responsable debe comunicarlo oportunamente al equipo y evitar implementar soluciones que cambien unilateralmente la arquitectura o el comportamiento acordado.

## 12. Consideraciones finales

El cumplimiento de estas instrucciones permite que los integrantes desarrollen sus módulos de manera independiente, manteniendo una estructura común y facilitando la integración del backend.

La responsabilidad de cada integrante no termina con la escritura del código: también debe probar, documentar y entregar sus cambios de forma organizada para que el resto del equipo pueda revisarlos y utilizarlos.

El objetivo es que el backend de VINTRA evolucione de manera coordinada, evitando duplicaciones, conflictos y modificaciones no autorizadas sobre componentes compartidos.