# Infraestructura

Guía para documentar el entorno que integra, prueba y despliega VINTRA.

## Debe publicarse aquí

- entornos y diferencias entre desarrollo, pruebas y producción;
- workflows de CI/CD y condiciones de ejecución;
- configuración del VPS, dominios y servicios, sin secretos;
- variables de entorno requeridas y cómo obtenerlas de forma segura;
- monitoreo, logs, respaldos, restauración y respuesta ante fallos;
- procedimiento de despliegue y reversión.

## Estado

- Estado: `Borrador`
- Responsable: Célula GitHub / CI-CD / VPS
- Los workflows `deploy.yml` y `main-deploy.yml` publican solo el frontend en los directorios `html-dev` y `html-main`.
- Los despliegues admiten `VITE_API_URL_STAGING` y `VITE_API_URL_PRODUCTION` como variables opcionales de Actions, además de los secrets SSH descritos en [VPS.md](VPS.md).
- El backend y PostgreSQL no se despliegan mediante esos workflows; la configuración real del servidor debe verificarse antes de operar producción.
