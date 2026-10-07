# Módulo Backend y API REST - VINTRA

## Descripción General

El servidor de VINTRA está construido sobre **Node.js** utilizando
**Express**. Su propósito principal es procesar la lógica de negocio,
exponer endpoints de la **API REST** y gestionar consultas a la base de
datos **PostgreSQL** mediante el conector **`pg` (node-postgres)**.

## Imágenes Requeridas

Asegúrate de incluir las siguientes imágenes en `docs/backend/`:

1. **`tabla-tecnologias-backend.png`**: Imagen con la tabla del servidor.
2. **`diagrama-backend-bd.png`**: Diagrama de conexión Express-PostgreSQL.

## Stack Tecnológico

### Herramientas Principales

- **Entorno de Ejecución**: Node.js
- **Framework de Servidor**: Express
- **Conector a Base de Datos**: `pg` (node-postgres)
- **Base de Datos**: PostgreSQL
- **Middleware Auxiliar**: `dotenv`, `cors`

### Justificación de Selección

- **Node.js + Express**: Entorno liviano y de alto rendimiento.
- **`pg` (node-postgres)**: Driver oficial y robusto para PostgreSQL.
- **PostgreSQL**: Gestor de base de datos relacional íntegro y seguro.

## Esqueleto de Archivos del Backend