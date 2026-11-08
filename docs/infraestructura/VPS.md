# Despliegue e infraestructura de VINTRA

> **Estado:** la configuración del servidor no se ha verificado desde este repositorio. El dominio y las rutas siguientes proceden de los workflows y documentos del proyecto; no acreditan que el servicio esté activo ni que los secrets/variables de GitHub estén configurados.

## Automatización visible en el repositorio

| Rama | Workflow | Alcance |
| --- | --- | --- |
| `develop` | [deploy.yml](../../.github/workflows/deploy.yml) | Construye el frontend y publica `frontend/dist/` en `/var/www/vintra.qsuene.com/html-dev`. |
| `main` | [main-deploy.yml](../../.github/workflows/main-deploy.yml) | Construye el frontend y publica `frontend/dist/` en `/var/www/vintra.qsuene.com/html-main`. |

Ambos workflows publican archivos estáticos por SCP; **no despliegan NestJS ni PostgreSQL**. El backend debe estar desplegado y accesible por separado para que la pantalla de conexión funcione en el sitio público. La transferencia sobrescribe archivos publicados sin borrar `.htaccess` ni limpiar archivos antiguos.

## Configuración necesaria en GitHub

Configura antes de permitir pushes de despliegue:

- **Variables opcionales de Actions `VITE_API_URL_STAGING` y `VITE_API_URL_PRODUCTION`:** URL base pública de la API, sin secreto. Los valores predeterminados son `http://vintra.qsuene.com:8080/api` en staging y `https://vintra.qsuene.com/api` en producción. Cada workflow valida `/health` y `/health/db` antes de publicar.
- **Secrets `HOST`, `USERNAME` y `SSH_KEY`:** destino SSH, usuario de despliegue y clave privada.
- **Configuración del backend en el servidor:** `CORS_ORIGIN` debe permitir el origen del frontend; configura también `DB_HOST`, `DB_PORT`, `POSTGRES_DB`, `POSTGRES_USER` y `POSTGRES_PASSWORD` según la red real del servidor.

No guardes secretos en variables `VITE_*`: Vite los incorpora al JavaScript público.

## Validación requerida para producción

1. Confirmar DNS y HTTPS del dominio con el responsable del VPS.
2. Verificar que la URL de API correspondiente responde `GET /health` y `GET /health/db` y que CORS permite el origen del sitio.
3. Revisar permisos mínimos del usuario SSH y huella del host antes de habilitar despliegues.
4. Ejecutar el workflow de staging desde `develop`, probar el sitio y solo entonces promover por el flujo acordado a `main`.
5. Acordar un procedimiento de respaldo, limpieza de versiones antiguas y reversión; aún no está automatizado aquí.

El equipo confirmó que Apache sirve el frontend en la raíz y enruta NestJS por `/api/`; staging usa el puerto 8080. Por eso las rutas públicas de salud son `/api/health` y `/api/health/db`, no rutas bajo la raíz. En una consulta externa del 8 de noviembre de 2026 ambas rutas de producción devolvieron 404 y staging devolvió 503; la URL raíz del sitio respondió 200. La conectividad pública de la API queda pendiente de corregir en el VPS/proxy. El preflight de los workflows detectará el fallo y detendrá la publicación; staging permite HTTP y producción exige HTTPS.
