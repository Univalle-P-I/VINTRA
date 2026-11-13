# Decisiones de arquitectura de VINTRA

## Cómo usar este registro

Una decisión marcada `Aceptada` debe estar respaldada por aprobación del equipo o evidencia del repositorio. `Propuesta` orienta el diseño pero no autoriza implementación. `Pendiente` requiere resolver el issue asociado. Las PR #47/#49/#50 se consideran integraciones futuras condicionadas a correcciones/merge; no son baseline actual de `develop`.

## ADR-001 — Organizar backend como monolito modular

- **Estado:** Propuesta para aprobar en issue #54.
- **Contexto:** VINTRA tiene un único MVP, un backend que se integra con frontend, una DB PostgreSQL planeada y despliegue limitado. No hay requerimiento probado de despliegues autónomos por dominio.
- **Decisión propuesta:** NestJS organizado en módulos de dominio dentro de una API desplegable como unidad. Exponer REST; aislar acceso a persistencia mediante repositorios/interfaces.
- **Consecuencias:** Menos infraestructura inicial; se deben mantener límites entre módulos y evitar que controllers accedan a repositorios de otras áreas. Si escala más adelante, evaluar separación con evidencia.
- **Fuente:** PR #47 propone reemplazo de .NET por NestJS; user confirmó NestJS; issue #54 aprueba formalmente stack pendiente.

## ADR-002 — Framework backend: NestJS

- **Estado:** Decisión del usuario; integración en `develop` pendiente de merge de PR #47.
- **Contexto:** El usuario confirmó NestJS como framework recomendado por documentación, frente a una tarjeta que mencionaba Express. PR #47 propone reemplazar backend .NET.
- **Decisión:** Diseñar backend nuevo sobre NestJS. No mantener dos backends paralelos como arquitectura objetivo.
- **Consecuencias:** Actualizar documentación/comandos CI/quality analysis de .NET a Node/Nest; conservar el historial de migración. Confirmar versiones soportadas y estructura final al fusionar PR.
- **Pendiente:** Revisar PR #47 y #49; remover referencias .NET/Django obsoletas una vez confirmado cambio.

## ADR-003 — Base relacional PostgreSQL

- **Estado:** PostgreSQL se usa provisionalmente en backend/Compose; PR #115, aún abierto, propone PostGIS 16.3.6.
- **Contexto:** Las tarjetas/modelado y Compose contemplan PostgreSQL; el dominio requiere relaciones, restricciones, transacciones e integridad.
- **Decisión propuesta:** PostgreSQL relacional para datos operativos. El diccionario de BD propone PostGIS para macrorutas, microrutas, barrios y puntos de ubicación de vehículos.
- **Pendiente:** confirmar el alcance de GIS y seguimiento GPS, SRID, frecuencia, retención, privacidad y ambientes (#54/#58/#91). Compose utiliza la imagen PostGIS indicada por PR #115 para ser compatible con las entidades; no ejecuta migraciones ni aprueba por sí mismo el alcance funcional.
- **Consecuencias:** Migraciones versionadas, FKs/constraints para invariantes, backups y manejo de concurrencia.

## ADR-004 — ORM o acceso con `pg`

- **Estado:** Pendiente; issue #54.
- **Contexto:** PR #47 contiene `@nestjs/typeorm` y driver `pg`; documento de PR #49 propone `pg` directo. Son enfoques diferentes para mapeo/migraciones, consultas y pruebas.
- **Opciones:** TypeORM por integración Nest y migraciones; `pg` directo para control explícito SQL; evaluar cualquier alternativa solo si issue lo permite.
- **Criterios:** Mantenibilidad del equipo, transacciones/locks para asignación, migraciones/reversión, compatibilidad con esquema relacional, seguridad de consultas, pruebas y soporte del stack.
- **Recomendación técnica:** Mantener interfaz de repositorio y resolver elección antes de B-09. Si no hay una razón concreta contra TypeORM, alinear doc con la implementación que ya propone #47; no declarar aceptada sin aprobación.

## ADR-005 — REST y contrato OpenAPI

- **Estado:** Generación OpenAPI implementada en `/api/docs`; el contrato funcional sigue pendiente de aprobación (#66).
- **Contexto:** React/Vite necesita contrato de integración estable; issues piden API REST y documentación de request/response.
- **Decisión propuesta:** REST/JSON versionada y OpenAPI generado desde los controladores y DTO realmente implementados. Los permisos, reglas de negocio y formato global de errores continúan provisionales.
- **Consecuencias:** Contratos probables se validan con frontend antes de implementar. Las rutas de recursos no se consideran finales hasta que modelo/HUs se aprueben.

## ADR-006 — Autenticación y permisos

- **Estado:** Base técnica inicial autorizada; ciclo de vida de sesión, recuperación e identidad institucional y permisos siguen pendientes #54/#70/#71.
- **Contexto:** HU1 y Trello mencionan usuarios/roles. El diccionario propone `user_account`, perfiles/roles, hash Argon2id, sesiones con token hash SHA-256, bloqueo temporal y tokens de restablecimiento de un solo uso.
- **Decisión inicial:** `POST /api/v1/auth/login` recibe email/contraseña, verifica Argon2id y emite JWT de acceso HS256 con `sub` igual al UUID de la cuenta. El secreto es obligatorio por entorno y tiene mínimo 32 bytes. La duración inicial configurable es 900 segundos. No se emiten roles en el token.
- **Consecuencias:** La implementación actual persiste sesiones con el hash SHA-256 del JWT y permite revocarlas con logout; no implementa refresh, recuperación ni verificación por correo. Los permisos aplicados por `RolesGuard` son provisionales y deben revisarse contra la matriz #70 antes de producción.

## ADR-007 — Geografía y rastreo

- **Estado:** Pendiente #54/#58/#91.
- **Contexto:** Recolección tiene contexto geográfico, pero “mapa de ruta”, “GPS en vivo”, “ETA” y “mapa ciudadano” implican capacidades y datos distintos. Trello #7 menciona PostGIS; aún falta aprobación de requisito.
- **Decisión:** El Compose local usa `postgis/postgis:16-3.6`, como referencia provisional del PR #115 y de las columnas geométricas de TypeORM. Esto solo hace posible preparar el entorno; no se ejecutan migraciones ni se aprueba el uso funcional de mapas/GPS.
- **Consecuencias:** La API admite geometrías y posiciones según el modelo provisional. Confirmar con BD/producto SRID, formato, privacidad, frecuencia, precisión y costo antes de habilitar el alcance en un entorno compartido o de producción.

## ADR-008 — Configuración y secretos externos al código

- **Estado:** Requisito de implementación.
- **Contexto:** Entorno local, CI, staging y producción necesitan hosts, puertos, DB, CORS y tokens diferentes. Hay riesgo de exponer secretos al fijarlos en archivos fuente.
- **Decisión:** Leer configuración de variables/secret manager por entorno y validarla al inicio. No codificar URLs, puertos, credenciales, tokens, orígenes CORS ni límites operativos como valores universales. `.env.example` usa solo placeholders inocuos.
- **Consecuencias:** Configuración obligatoria ausente produce error claro al arrancar; CI usa secrets protegidos; no dejar credenciales funcionales por defecto.

## ADR-009 — Migraciones explícitas

- **Estado:** Propuesta para aprobación en #65.
- **Contexto:** El esquema evoluciona por PR y debe poder replicarse y revisarse en todos los entornos.
- **Decisión propuesta:** Migraciones versionadas y ejecutadas como paso explícito; desactivar sincronización automática de esquema en producción. Semillas para desarrollo con datos ficticios.
- **Consecuencias:** Cada cambio persistente requiere revisión y prueba desde DB limpia, incluyendo rollback razonable.

## ADR-010 — SonarQube como control de calidad complementario

- **Estado:** SonarQube ya está configurado en el proyecto; adaptación Nest propuesta por PR #47 sigue pendiente de integración.
- **Contexto:** `docs/SONARQUBE.md` aún describe el análisis .NET, mientras #47 cambia a scan Node. El workflow backend en `develop` es placeholder según revisión actual y issue #69 pide CI.
- **Decisión:** Mantener el servicio/configuración existentes y actualizarlo al código backend finalmente integrado; cubrir compilación, lint, pruebas y reporte de cobertura en CI. Hacer que quality gate requerido bloquee PR según política configurada.
- **Consecuencias:** Sonar no sustituye pruebas o revisión de seguridad. Verificar project key/base directory, exclusiones, cobertura importada y secreto de token antes de merge.

## ADR-011 — Despliegue y VPS

- **Estado:** No confirmado para backend; issue #90.
- **Contexto:** Workflows existentes publican frontend por SSH/SCP. La guía VPS declara servidores y puertos, pero tiene campos pendientes y requiere comprobar entorno real.
- **Decisión:** Conservar compatibilidad con el mecanismo SSH/SCP solicitado mientras se valida staging backend; no reemplazar infraestructura por Docker/Kubernetes o cloud sin justificación aprobada.
- **Consecuencias:** Antes de declarar staging listo, verificar acceso, dominio, TLS, env, PostgreSQL privado, migraciones, backups, health y rollback. No copiar valores sensibles al repo.

## Insumo recibido del equipo de Base de Datos

El diccionario compartido propone tablas concretas para cuentas, perfiles, sesiones, restablecimiento, auditoría, vehículos, cuadrillas, rutas, barrios, horarios, asignaciones y posiciones GPS. Se usa como referencia para diseñar la integración del backend; el equipo de BD conserva la responsabilidad del modelo físico.

Antes de tratarlo como contrato definitivo, coordinar estas diferencias con BD/producto: el catálogo de perfiles incluye conductor frente al alcance administrativo de #70; la restricción microruta-fecha puede impedir el segundo viaje; asignación no enlaza la programación semanal y complica verificar conflictos de horario; el seguimiento GPS requiere decisión de alcance; y la relación obligatoria cuenta-datos personales debe quedar garantizada transaccionalmente o ajustarse en el diseño.

La decisión de ORM (`TypeORM` vs `pg`) sigue abierta en #54: el diccionario especifica tablas y tipos de PostgreSQL, no selecciona la herramienta de persistencia de NestJS.

## Registro de asuntos abiertos

| Asunto | Resolución requerida | Issue |
| --- | --- | --- |
| Alcance, actores y vocabulario | Validar HUs y quién opera | #53, #55 |
| TypeORM vs `pg` | Decisión razonada y aprobación | #54 |
| Proveedor/mecanismo auth | Identidad, sesión, ciclo de vida | #54, #71 |
| Modelo y reglas de dominio | ERD, unidades, estados, capacidades y solapamientos | #58, #63–#64 |
| GIS/PostGIS/seguimiento | Evidencia de requerimiento y decisión de datos/infra | #54, #91 |
| CI backend y Sonar | Pipeline con cobertura, quality gate y secretos | #69 |
| Backend en VPS | Validar estado real y ruta de despliegue | #90 |

## Fuentes

PR #47/#49/#50; issues #53/#54/#58/#63–#71/#90/#91; `CONTRIBUTING.md`, `docs/SONARQUBE.md`, `docs/infraestructura/VPS.md` y tablero Trello. Actualizar estado de cada ADR al quedar registrada la aprobación, no por aparición en un documento o tarjeta.
