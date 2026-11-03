# Diseño de seguridad de VINTRA

## Estado

Propuesta para validar antes de exponer endpoints de negocio. El repositorio y issue #71 no confirman un mecanismo de autenticación definitivo; issue #54 pide aprobarlo. No asumir JWT, proveedor externo, login social ni roles de usuarios finales antes de esa decisión. La autorización por rol/acción debe derivarse de la matriz #70.

## Identidad y autenticación

- Definir en ADR #54 el origen de identidad, mecanismo, ciclo de vida de sesión, expiración, revocación, recuperación y protección ante intentos repetidos.
- Guardar hashes de credenciales con algoritmo de derivación de contraseñas reconocido y parámetros vigentes al implementarlo; nunca texto plano ni cifrado reversible. La selección concreta se registra con fecha y justificación al aprobar autenticación.
- Si se eligen tokens: definir emisor/audiencia, expiración, rotación/refresh, revocación, almacenamiento del frontend y protección XSS/CSRF acorde al mecanismo; no crear un token propio ad hoc.
- Si se eligen cookies: `Secure`, `HttpOnly`, `SameSite` apropiado, dominio y protección CSRF según despliegue HTTPS.
- No incluir credenciales/tokens en URL, logs, capturas de CI ni mensajes de error.

## Autorización

- Guard por defecto para endpoints de negocio; excepciones públicas explícitas solo para liveness/readiness u operaciones aprobadas.
- Aplicar permiso por recurso y acción, validando que el rol esté vigente y asociado al actor. No confiar en controles solo del frontend.
- Separar autenticación (quién es) de autorización (qué puede hacer).
- Issue #70 plantea roles administrativos para el MVP; acceso de personal de campo o ciudadanía requiere confirmar alcance (#53).
- Las consultas de auditoría y datos personales requieren permiso mínimo. Evitar que un rol pueda elevar sus propios permisos.

## Validación y protección de API

- Usar DTOs con validación de esquema, límite de tamaño configurado y rechazo de campos inesperados en comandos.
- Normalizar identificadores antes de búsquedas/unicidad. Usar parámetros del driver/ORM, nunca SQL construido por concatenación.
- Aplicar transacciones y control de concurrencia en asignaciones; las reglas críticas tienen respaldo en restricciones DB (#93).
- Configurar CORS desde variable validada por entorno con lista explícita de orígenes; no usar `*` junto con credenciales ni mantener URLs fijas en el código.
- TLS en tránsito en entornos expuestos. Requerir HTTPS para cookies/credenciales; confirmar terminación TLS en infraestructura antes de desplegar.
- Limitar abuso por endpoint/auth y aplicar rate limiting cuando el perfil de exposición lo defina; parámetros configurables, no umbrales inventados.
- Respuestas de error no revelan existencia de credenciales, stack traces, consultas, archivos o configuración sensible.

## Secretos y configuración

- Secretos en secret manager/variables protegidas del entorno (GitHub Secrets para CI/deploy); no en repositorio, Dockerfile, compose versionado, `.env.example`, documentación o historial Git.
- `.env.example` muestra únicamente nombres y marcadores como `<configurar-localmente>` sin claves válidas o contraseñas predeterminadas.
- Validar al iniciar la app variables obligatorias y formato. Evitar fallback silencioso a credenciales o endpoints de desarrollo en builds productivos.
- Rotar y revocar secretos al sospechar exposición. Limitar el alcance de credenciales de DB y despliegue; separar staging y producción.
- No exponer secretos en logs de `docker compose config`, workflows ni comandos copiables.

## Datos, privacidad y auditoría

- Recoger solo datos personales que una HU requiera; definir finalidad, acceso, conservación, anonimización y eliminación con responsables antes del esquema final.
- Enmascarar identificadores sensibles en logs; restringir backup y acceso a la base.
- Registrar cambios importantes de asignación con actor, fecha, acción y antes/después (#84). Proteger auditoría contra edición/eliminación por rutas normales de negocio.
- Definir también quién consulta auditoría y cuánto se conserva; no inferir periodos.
- Usar datos semilla ficticios y no productivos; impedir credenciales/usuarios de prueba en el despliegue real.

## Dependencias y cadena de suministro

- Bloquear versiones con lockfile y usar instalación reproducible (`npm ci` si el backend se confirma en Node/NestJS).
- Actualizar dependencias en cambios revisables; revisar alertas de seguridad y registrar excepciones.
- No descargar ejecutables no fijados ni ejecutar scripts remotos sin revisión.
- Proteger permisos de workflows por mínimo privilegio; no conceder escritura al job que solo prueba/lint.

## SonarQube, CI y manejo de incidentes

La PR #47 actualiza el análisis Sonar del backend a Node/NestJS y usa un token de Sonar. El token debe guardarse como secreto, no como variable de texto ni imprimirse. El workflow debe analizar el directorio backend correcto, recibir el reporte de cobertura real y aplicar quality gate. Mantener exclusiones mínimas y justificadas; no excluir fuentes para reducir hallazgos.

SonarQube complementa pruebas, revisiones y dependabot/escaneo de dependencias; no confirma autorización correcta ni protección operativa por sí solo. Issue #69 aún debe integrar compilación, lint y pruebas al CI. Ante credenciales expuestas: revocar/rotar, determinar alcance, limpiar exposición futura y documentar incidente conforme proceso institucional.

## Despliegue y operación

- La documentación VPS y workflows actuales declaran SSH/SCP para frontend, pero backend/staging requiere validación (#90). Aplicar permisos mínimos a usuario de despliegue, llaves dedicadas, almacenamiento restringido y rotación.
- No exponer PostgreSQL directamente a internet; restringir red/firewall a los componentes que lo requieren.
- Separar configuración/secretos por entorno. Cambios de esquema y despliegues con copia de respaldo verificada y rollback documentado.
- Logs estructurados, health separado del estado DB, alertas sin datos sensibles y procedimiento de respuesta.

## Lista de verificación para aceptar el diseño

1. Alcance/actores y datos personales definidos (#53, #55).
2. Autenticación y matriz de permisos aprobadas (#54, #70, #71).
3. Variables obligatorias sin valores secretos por defecto y `.env.example` inocuo.
4. CORS, TLS, errores, validación y límites definidos por entorno/política.
5. Migraciones con FKs, restricciones e índices aprobados.
6. Auditoría para mutaciones sensibles y control de acceso a su lectura.
7. CI/Sonar con secretos protegidos, cobertura real, quality gate y logs limpios (#69).
8. Plan de staging, respaldo y rollback revisado (#90).

## Fuentes y pendientes

Issues #54, #58, #69–#71, #84, #90, #93; PR #47 (Sonar/compose/health); `docs/SONARQUBE.md`, `docs/infraestructura/VPS.md`, `CONTRIBUTING.md`. Las dos últimas guías contienen referencias antiguas o incompletas: deben alinearse con la integración final antes de usarlas como runbook operativo.
