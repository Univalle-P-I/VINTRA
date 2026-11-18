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

Los workflows están en [`.github/workflows/`](../../.github/workflows/): CI valida PR hacia `develop` y `main`; staging se despliega en pushes a `develop` y producción en pushes a `main`.

Cada directorio del VPS necesita su propio `.env` con credenciales, `IP`, `POSTGRES_PORT`, `BACKEND_PORT`, `FRONTEND_PORT`, `CORS_ORIGIN`, `VITE_API_URL` y, si corresponde, `VITE_BASE_PATH`. Los puertos publicados deben ser distintos entre staging y producción. `CORS_ORIGIN` debe coincidir con el origen del navegador y `VITE_API_URL` con la URL pública de la API; las variables `VITE_*` se incorporan al compilar el frontend. La guía del servidor está en [VPS.md](VPS.md).

- Estado: `Borrador`
- Responsable: Célula GitHub / CI-CD / VPS
- Pendiente: verificar la configuración efectiva del VPS, respaldos y reversión antes de promover una versión.
