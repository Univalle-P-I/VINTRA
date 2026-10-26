# Backend — Documentación de la API y reglas de negocio de VINTRA

**Estado:** `Borrador`  
**Responsable:** Célula Backend  
**Proyecto:** VINTRA  
**Stack:** Node.js · NestJS · PostgreSQL · TypeORM

---

## 1. Objetivo

Documentar la arquitectura del backend de VINTRA, las responsabilidades de sus módulos, las reglas de negocio y los contratos de la API REST. Esta documentación servirá como referencia para el desarrollo, las pruebas y la integración entre el frontend y el backend.

El objetivo es mantener una comunicación clara entre los componentes del sistema y establecer criterios comunes para el manejo de rutas, recorridos, vehículos, personal, seguimiento operativo, reportes e indicadores.

## 2. Stack tecnológico y requisitos

| Componente | Tecnología |
|---|---|
| Lenguaje | TypeScript |
| Entorno de ejecución | Node.js |
| Framework backend | NestJS |
| Base de datos | PostgreSQL |
| ORM | TypeORM |
| Comunicación | API REST sobre HTTP |
| Contenedores | Docker y Docker Compose |

### Requisitos de ejecución

- Node.js y npm para ejecución local.
- PostgreSQL para persistencia de datos.
- Variables de entorno para configurar la conexión a la base de datos y el puerto de la API.
- Docker y Docker Compose para ejecutar los servicios en un entorno reproducible.

**Versiones:** deben confirmarse las versiones exactas utilizadas por el equipo antes de cerrar la documentación.

## 3. Arquitectura y módulos

El backend se organiza por responsabilidades para facilitar el mantenimiento y permitir que cada componente evolucione de manera independiente.

### Módulos propuestos

| Módulo | Responsabilidad |
|---|---|
| Autenticación y usuarios | Identidad, inicio de sesión, permisos y acceso a recursos. |
| Vehículos | Consulta y administración de los vehículos disponibles. |
| Personal y cuadrillas | Gestión del personal, integrantes de cuadrillas y asignaciones. |
| Rutas y microrrutas | Administración de la planificación geográfica y operativa. |
| Recorridos | Registro de la ejecución de las operaciones de recolección. |
| Tracking | Recepción y consulta de posiciones y eventos de seguimiento. |
| Reportes | Consulta de novedades e incidencias operativas. |
| Indicadores | Consolidación de métricas para evaluar el cumplimiento de la operación. |
| Notificaciones | Comunicación de novedades relevantes a los usuarios correspondientes. |

Estos módulos representan la organización funcional propuesta. Su existencia e implementación deben verificarse en el código antes de considerarlos terminados.

## 4. Reglas de negocio

### 4.1. Rutas, microrrutas y recorridos

VINTRA debe distinguir entre la planificación de la operación y su ejecución.

- **Ruta:** agrupación operativa de zonas o sectores que deben atenderse.
- **Microrruta:** división de una ruta en una unidad más específica de trabajo.
- **Recorrido:** ejecución operativa realizada por un vehículo y su cuadrilla durante un periodo de trabajo.

Las asignaciones deben permitir identificar el vehículo, la cuadrilla, la microrruta y el periodo de ejecución correspondiente.

Un vehículo puede tener una cantidad de recorridos permitida según su capacidad y las condiciones operativas. Para VINTRA se contempla que los vehículos de siete yardas puedan realizar dos recorridos cuando la programación lo requiera, mientras que los vehículos convencionales normalmente realizan uno y, en casos autorizados, hasta dos.

La cantidad definitiva de recorridos debe validarse con las reglas operativas acordadas por el equipo.

### 4.2. Asignaciones y novedades de personal

- Las asignaciones deben registrar su vigencia para identificar quién estaba asignado en un momento determinado.
- Una ausencia puede requerir el reemplazo de un integrante de la cuadrilla.
- Si una cuadrilla no logra completar el trabajo asignado, puede ser necesario reasignar recursos o modificar la programación.
- Los cambios deben conservar un registro de la asignación original y de la modificación realizada.

### 4.3. Tracking

- Cada evento de seguimiento debe asociarse al vehículo o recurso correspondiente.
- Las posiciones deben incluir coordenadas y fecha y hora de captura.
- El sistema debe diferenciar entre la última posición conocida y una posición actualizada recientemente.
- Los datos inválidos o incompletos deben rechazarse o registrarse como errores de validación.

La frecuencia de actualización y los criterios de vigencia de las posiciones deben definirse durante la implementación.

### 4.4. Reportes e incidencias

Los reportes deben permitir registrar novedades relacionadas con la ejecución de las rutas, las microrrutas, los vehículos o el personal.

Cada reporte debe identificar, según corresponda, su autor, fecha, categoría, descripción, estado y recurso relacionado. Los cambios de estado deben respetar los permisos definidos para cada rol.

### 4.5. Indicadores

Los indicadores podrán utilizar información consolidada de rutas, recorridos, seguimiento y reportes.

Entre las métricas propuestas se encuentran:

- Cumplimiento de rutas y microrrutas programadas.
- Recorridos finalizados frente a recorridos planificados.
- Incidencias registradas por periodo o sector.
- Novedades operativas por vehículo o cuadrilla.
- Tiempo de ejecución de los recorridos cuando existan datos suficientes.

Las fórmulas, los filtros y los criterios de cálculo deben acordarse antes de implementar cada indicador.

## 5. Contratos iniciales de la API REST

Los siguientes contratos son una propuesta inicial para orientar la integración. Las rutas definitivas, los parámetros y los formatos deben coincidir con los controladores realmente implementados.

| Recurso | Método | Ruta propuesta | Propósito |
|---|---|---|---|
| Salud del servicio | GET | `/health` | Comprobar la disponibilidad de la API. |
| Usuarios | GET | `/users` | Consultar usuarios autorizados. |
| Vehículos | GET | `/vehicles` | Consultar vehículos. |
| Rutas | GET | `/routes` | Consultar rutas registradas. |
| Microrrutas | GET | `/micro-routes` | Consultar microrrutas. |
| Recorridos | GET | `/trips` | Consultar ejecuciones operativas. |
| Tracking | POST | `/tracking` | Registrar un evento de posición. |
| Reportes | GET | `/reports` | Consultar reportes operativos. |
| Indicadores | GET | `/indicators` | Consultar métricas consolidadas. |

### 5.1. Ejemplo de solicitud y respuesta

### Consultar la disponibilidad del servicio**

```http
GET /health HTTP/1.1
Host: localhost:3002
Accept: application/json
```

Respuesta propuesta:

```json
{
  "status": "ok",
  "service": "vintra-api"
}
```

Este contrato solo debe darse por implementado cuando exista el endpoint `/health` en el backend.

### Registrar una posición de seguimiento**

```http
POST /tracking
Content-Type: application/json
```

Cuerpo propuesto:

```json
{
  "vehicleId": 12,
  "latitude": 3.8801,
  "longitude": -77.0312,
  "recordedAt": "2026-10-26T14:30:00Z"
}
```

Respuesta propuesta:

```json
{
  "message": "Posición registrada",
  "trackingId": 101
}
```

Los nombres de campos, identificadores y respuestas son ilustrativos y deberán ajustarse al modelo de datos y a los DTO implementados.

### 5.2. Autenticación y permisos

Los recursos que contienen información operativa deben protegerse mediante autenticación y autorización cuando corresponda.

La documentación de cada endpoint deberá especificar:

- Si requiere autenticación.
- Qué roles o permisos pueden acceder.
- Los parámetros de ruta, consulta y cuerpo.
- Los códigos de respuesta HTTP.
- Los errores de validación y autorización.

El mecanismo definitivo de autenticación debe coincidir con el que implemente el equipo.

## 6. Integración con servicios y persistencia

### Base de datos

PostgreSQL será la base de datos relacional del sistema y TypeORM permitirá que el backend consulte y persista la información.

La API debe validar los datos antes de enviarlos a la base de datos y gestionar las relaciones entre los recursos de acuerdo con el modelo documentado en `base-de-datos/`.

Este documento describe el uso de la base de datos desde la API; la definición de tablas y relaciones se mantiene en la documentación específica de base de datos.

### Geolocalización

El módulo de tracking deberá recibir, validar y consultar las coordenadas de los vehículos. La visualización cartográfica y la integración con proveedores de mapas dependerán de los servicios seleccionados por el equipo.

### Notificaciones

Las notificaciones podrán utilizarse para comunicar incidencias, cambios de asignación y novedades operativas. El proveedor, los canales y los eventos que generan notificaciones están pendientes de definición.

## 7. Validación, errores y seguridad

La API debe aplicar validación de datos de entrada, manejo centralizado de errores y controles de acceso.

Códigos HTTP previstos:

| Código | Uso |
|---|---|
| `200 OK` | Consulta o actualización exitosa. |
| `201 Created` | Recurso creado correctamente. |
| `400 Bad Request` | Datos inválidos. |
| `401 Unauthorized` | Falta autenticación válida. |
| `403 Forbidden` | El usuario no tiene permisos suficientes. |
| `404 Not Found` | Recurso inexistente. |
| `409 Conflict` | Conflicto con el estado actual del recurso. |
| `500 Internal Server Error` | Error interno no controlado. |

Las respuestas de error no deben exponer contraseñas, tokens, cadenas de conexión ni detalles internos sensibles.

El registro de eventos deberá facilitar el diagnóstico de fallos y la trazabilidad de operaciones importantes sin almacenar secretos ni datos sensibles innecesarios.

## 8. Instalación, ejecución y pruebas

### Instalación local

```bash
cd vintra-api
npm install
```

### Ejecución en desarrollo

```bash
npm run start:dev
```

### Compilación

```bash
npm run build
```

### Ejecución de pruebas

```bash
npm test
```

### Ejecución con Docker Compose

Desde la raíz del proyecto:

```bash
docker compose config --quiet
docker compose up -d --build
docker compose ps
docker compose logs -f backend
```

Para detener los servicios:

```bash
docker compose down
```

La configuración de la base de datos debe estar definida mediante las variables de entorno requeridas. No se deben subir archivos `.env` con credenciales reales al repositorio.

## 9. Pendientes para cerrar la documentación
- [ ] Verificar los módulos que existen realmente en el código.
- [ ] Definir los contratos definitivos por recurso.
- [ ] Confirmar el mecanismo de autenticación y los permisos.
- [ ] Acordar las reglas de negocio pendientes sobre recorridos y asignaciones.
- [ ] Definir la estrategia de geolocalización y notificaciones.
- [ ] Ejecutar y documentar las pruebas de la API.
- [ ] Revisar la documentación junto con la célula Frontend para garantizar la integración.

---

**Estado actual:** Borrador de documentación funcional y técnica. Los contratos y módulos propuestos deberán contrastarse con la implementación real antes de marcarse como definitivos.
