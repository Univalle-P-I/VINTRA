# Arquitectura del backend — VINTRA

## 1. Introducción

El backend de VINTRA es el componente encargado de proporcionar la estructura y los servicios necesarios para gestionar la información y las operaciones del sistema. Su desarrollo utiliza NestJS, un framework basado en Node.js y TypeScript que permite organizar la aplicación mediante módulos y separar las responsabilidades de sus componentes.

La arquitectura se está construyendo de manera modular, tomando como referencia las funcionalidades del sistema y el modelo de datos definido para el proyecto.

El propósito de esta organización es establecer una base técnica compartida para que los integrantes del equipo puedan desarrollar sus respectivos módulos de manera independiente, manteniendo criterios comunes de organización, acceso a los datos y comunicación entre componentes.

En esta etapa se ha priorizado la preparación de la estructura del backend, la correspondencia de las entidades con el modelo de base de datos y la definición inicial de los objetos de transferencia de datos (DTO).

Se implementó una primera capa provisional de servicios y endpoints para autenticación, usuarios, perfiles, vehículos, personal, cuadrillas, rutas, turnos, asignaciones, seguimiento y consultas de auditoría. Los contratos y permisos aún deben revisarse con el equipo; no se consideran aprobados por estar implementados.

## 2. Tecnologías utilizadas

| Tecnología | Responsabilidad dentro del proyecto |
|---|---|
| Node.js | Entorno de ejecución del backend. |
| TypeScript | Lenguaje utilizado para desarrollar la aplicación. |
| NestJS | Framework para organizar la aplicación mediante módulos, controladores y proveedores. |
| PostgreSQL | Sistema gestor de la base de datos relacional. |
| TypeORM | ORM utilizado para representar las tablas y relaciones mediante entidades TypeScript. |
| class-validator | Biblioteca utilizada para definir validaciones en los DTO. |
| class-transformer | Biblioteca de transformación de objetos utilizada en el procesamiento de solicitudes. |
| Docker | Herramienta prevista para la contenerización y ejecución del entorno. |

## 3. Organización general del proyecto

El código fuente del backend se encuentra dentro del directorio `backend/src`.

La aplicación utiliza una arquitectura modular. Cada módulo agrupa los componentes relacionados con una funcionalidad del sistema y permite mantener una organización independiente de sus responsabilidades.

Los módulos funcionales registrados en `AppModule` son:

| Módulo | Responsabilidad general |
|---|---|
| `autenticacion` | Inicio/cierre de sesión JWT con sesión persistida y guard compartido; recuperación, renovación y correo siguen pendientes. |
| `usuarios` | Representar y gestionar la información de las cuentas de usuario y sus datos personales. |
| `perfiles` | Representar los perfiles y roles asociados a los usuarios. |
| `vehiculos` | Representar los tipos de vehículos y los vehículos registrados en el sistema. |
| `personal` | Representar la información de los conductores. |
| `cuadrillas` | Representar las cuadrillas y sus integrantes. |
| `turnos` | Representar los horarios y su asociación con las microrutas. |
| `rutas` | Representar barrios, macrorutas, microrutas y sus relaciones. |
| `asignaciones` | Representar las asignaciones operativas. |
| `seguimiento` | Representar las posiciones registradas de los vehículos. |
| `auditoria` | Representar los registros históricos de cambios y eventos sobre las entidades auditadas. |
| `salud` | Comprobar el estado del servicio y la conectividad con la base de datos. |

Swagger/OpenAPI se genera desde los controladores y DTO implementados. En ejecución, Swagger UI está disponible en `/api/docs` y el documento JSON en `/api/docs-json`; no incluye flujos que solo tienen DTO o entidades pero carecen de controlador/servicio.

Además de los módulos funcionales, se han preparado directorios transversales para organizar componentes compartidos:

- `base-datos`: espacio previsto para componentes relacionados con el acceso y la gestión de datos.
- `comun`: contiene el contexto transaccional de auditoría y la validación compartida de geometrías GeoJSON.
- `configuracion`: espacio previsto para organizar componentes de configuración de la aplicación.

## 4. Organización interna de los módulos

La estructura interna de los módulos se organiza según las responsabilidades de sus componentes.

### 4.1. Entidades

Las entidades son clases TypeScript decoradas con anotaciones de TypeORM que representan las tablas de la base de datos.

Su responsabilidad es establecer la correspondencia entre el modelo relacional y el código del backend, incluyendo:

- Nombre de la tabla.
- Columnas y tipos de datos.
- Claves primarias y foráneas.
- Enumeraciones.
- Relaciones entre entidades.

Las entidades se encuentran organizadas dentro de directorios denominados `entidades`.

### 4.2. DTO (Data Transfer Objects)

Los DTO definen la estructura de los datos que pueden recibirse o transferirse en las operaciones del backend.

Se utilizan para establecer propiedades, tipos de datos y reglas de validación mediante decoradores de bibliotecas como `class-validator`.

Los DTO se organizan dentro de directorios denominados `dto`.

Su definición permite establecer criterios comunes para la recepción de información, sin implementar por sí sola la lógica de negocio ni crear endpoints.

### 4.3. Servicios

Los servicios son componentes de NestJS destinados a implementar la lógica de negocio de cada módulo.

En ellos se desarrollan las operaciones relacionadas con el procesamiento de información, las consultas, las validaciones de negocio y la coordinación con otros componentes. `AutenticacionService` implementa login/logout; los servicios operativos cuentan con una primera implementación provisional y pruebas unitarias con repositorios simulados.

### 4.4. Controladores

Los controladores reciben las solicitudes HTTP y definen los puntos de entrada de la API.

Su responsabilidad es recibir los datos de las solicitudes y delegar el procesamiento correspondiente a los servicios.

`AutenticacionController` implementa login y logout. Los controladores de negocio delegan en servicios y usan los DTO existentes; sus rutas y permisos provisionales están inventariados en `docs/API_SPECIFICATION.md`.

### 4.5. Protección JWT compartida

Los módulos que deban proteger una operación importan `AutenticacionModule` y aplican `JwtAuthGuard` y `RolesGuard` al controlador o handler. El guard JWT valida la firma HS256, la expiración, la sesión persistida y el UUID del sujeto; `@UsuarioAutenticado()` permite obtener el `userId`. `RolesGuard` consulta perfiles activos en cada petición y aplica la matriz provisional descrita en `docs/API_SPECIFICATION.md`.

```typescript
@UseGuards(JwtAuthGuard)
handler(@UsuarioAutenticado() actor: AuthenticatedUser) {
  // Usar actor.userId como identidad autenticada.
}
```

El módulo de salud cuenta con un controlador técnico para las comprobaciones del servicio y de la conexión con PostgreSQL.

## 5. Acceso a la base de datos

El backend utiliza PostgreSQL como sistema gestor de base de datos y TypeORM como herramienta de mapeo objeto-relacional.

La configuración de la conexión se centraliza en `AppModule` mediante `TypeOrmModule.forRootAsync()` y `ConfigService`.

Los módulos funcionales registran sus entidades con `TypeOrmModule.forFeature()` e inyectan los repositorios en sus servicios. El flujo de inicio de sesión usa las entidades `DatosUsuario` y `CuentaUsuario` sin modificar el DER ni activar la sincronización.

Los parámetros de conexión se obtienen mediante variables de entorno, evitando incluir directamente las credenciales en el código fuente.

Se utilizan las siguientes opciones de configuración:

- `autoLoadEntities: true`: permite incorporar al registro de TypeORM las entidades registradas mediante los módulos.
- `synchronize: false`: evita que TypeORM modifique automáticamente la estructura de la base de datos.

La correspondencia de las entidades se establece tomando como referencia el modelo de datos definido para VINTRA.

La desactivación de la sincronización automática permite mantener el control sobre la estructura de PostgreSQL y evitar modificaciones involuntarias del esquema.

## 6. Configuración y validación general

La aplicación utiliza `ConfigModule` para centralizar la lectura de las variables de entorno.

También se ha configurado un `ValidationPipe` global en el punto de entrada de la aplicación con las siguientes opciones:

- `whitelist: true`: permite excluir propiedades que no estén contempladas en los DTO.
- `forbidNonWhitelisted: true`: permite rechazar solicitudes que incluyan propiedades no permitidas.
- `transform: true`: habilita la transformación de los datos recibidos según las definiciones correspondientes.

La aplicación también dispone de una configuración CORS para controlar los orígenes desde los cuales se permiten solicitudes.

## 7. Comprobación técnica del servicio

El módulo `salud` contiene un controlador destinado a verificar el funcionamiento básico del backend.

Actualmente dispone de dos rutas técnicas:

| Método | Ruta | Propósito |
|---|---|---|
| GET | `/health` | Comprobar que el servicio backend responde. |
| GET | `/health/db` | Comprobar la conexión con PostgreSQL mediante una consulta. |

Estas rutas tienen una finalidad técnica y no representan operaciones funcionales del negocio de VINTRA.

## 8. Criterios de arquitectura

La organización del backend sigue los siguientes criterios:

1. **Separación de responsabilidades:** cada módulo agrupa componentes relacionados con una funcionalidad del sistema.
2. **Correspondencia con el modelo de datos:** las entidades deben respetar la estructura definida en el DER.
3. **Configuración centralizada:** los parámetros de conexión y configuración se administran mediante variables de entorno.
4. **Validación de entradas:** los DTO establecen la estructura y las reglas iniciales de validación de los datos.
5. **Reutilización:** los componentes transversales se organizarán en espacios compartidos cuando sean necesarios.
6. **Protección del esquema:** se mantiene desactivada la sincronización automática de TypeORM.
7. **Desarrollo coordinado:** los contratos de API y las reglas de negocio servirán como referencia común para la implementación de cada módulo.
8. **Implementación progresiva:** ampliar los servicios y controladores conforme se aprueben reglas de negocio y contratos.

## 9. Estado actual de implementación

La siguiente tabla describe el estado de los componentes en esta etapa del desarrollo:

| Componente | Estado |
|---|---|
| Estructura modular | Creada. |
| Registro de módulos en `AppModule` | Configurado. |
| Configuración de PostgreSQL mediante TypeORM | Preparada. |
| Registro de entidades en los módulos | Configurado. |
| Entidades correspondientes al modelo de datos | 29 entidades implementadas. |
| DTO de entrada | Implementados inicialmente en los módulos que los requieren. |
| Validación global de solicitudes | Configurada. |
| Directorios para componentes compartidos | Preparados. |
| Controlador técnico de salud | Implementado. |
| Documentación Swagger / OpenAPI | Implementada en `/api/docs`, agrupada por módulos y con Bearer JWT para rutas protegidas. |
| Servicios de lógica de negocio | Primera implementación provisional en los módulos operativos. |
| Controladores funcionales de los módulos | Implementados para los módulos operativos; requieren revisión funcional y de permisos. |
| Implementación de endpoints de negocio | Disponible según inventario de `docs/API_SPECIFICATION.md`; pendiente de aprobación del contrato. |
| Pruebas específicas de entidades y reglas de negocio | Pruebas unitarias con mocks; no hay integración contra PostgreSQL. |

La estructura constituye una base común para continuar el desarrollo del backend. No representa la implementación completa de las funcionalidades operativas ni la aprobación final de las reglas de VINTRA.

## 10. Evolución de la arquitectura

La arquitectura se actualizará conforme avance el desarrollo del proyecto.

Las siguientes actividades contempladas son:

- Completar la documentación de correspondencia entre las entidades y el modelo de datos.
- Revisar y acordar los contratos de API con el equipo.
- Definir y documentar las reglas de negocio de cada módulo.
- Implementar progresivamente los servicios y controladores.
- Incorporar las validaciones y mecanismos de seguridad correspondientes.
- Ampliar las pruebas automatizadas de los componentes.
- Documentar las decisiones técnicas y los cambios realizados durante el desarrollo.

Este documento constituye la referencia de la organización arquitectónica del backend de VINTRA en su estado actual.
