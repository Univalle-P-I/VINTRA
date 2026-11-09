# Infraestructura

Aquí se ubican los archivos que permiten ejecutar y desplegar los componentes de VINTRA.

## Archivos actuales

- [`../docker-compose.yml`](../docker-compose.yml): inicia PostgreSQL, la API y el frontend en conjunto desde la raíz.
- Los workflows de GitHub permanecen en [`../.github/workflows/`](../.github/workflows/), que es la ubicación que GitHub Actions requiere.
- La guía operativa y la documentación del VPS están en [`../docs/infraestructura/`](../docs/infraestructura/README.md).

## Ejecutar los servicios localmente

Desde la raíz del repositorio, crea `.env` a partir de `.env.example` y ejecuta:

```powershell
docker compose up --build
```

Para detenerlos:

```powershell
docker compose down
```

No guardes secretos del VPS ni credenciales reales en esta carpeta.
