# Documentación de Configuración VPS - Proyecto Vintra

Este documento detalla la infraestructura, servicios, entornos y seguridad configurados en el servidor privado virtual (VPS) para el despliegue del proyecto **Vintra** a través del subdominio dedicado.

---

## 📌 Subdominio de Servicios

El proyecto Vintra se encuentra expuesto en la web mediante la siguiente URL:

* **Subdominio principal:** `vintra.qsuene.com`

---

## 🛠️ Stack Tecnológico y Requisitos Previos

Las tecnologías e infraestructura instaladas en el servidor para el correcto funcionamiento de la aplicación son:

* **Entorno de ejecución:** Node.js
* **Framework Backend:** Nest.js
* **Base de datos:** PostgreSQL
* **Servidor Web / Reverse Proxy:** Apache

---

## 🚀 Entornos de Despliegue

La aplicación cuenta con dos entornos independientes para diferenciar la versión estable de las fases de desarrollo e integración:

| Entorno | Rama en Git | Descripción |
| :--- | :--- | :--- |
| **Producción** | `main` | Despliegue funcional visible para usuarios finales. |
| **Pruebas (Staging)** | `develop` | Despliegue para verificación y validación de nuevas características. |

---

## 🔒 Configuración de Seguridad y Servidor

### 1. Usuario de Despliegue

Se configuró un usuario exclusivo sin privilegios elevados en el sistema operativo para gestionar la construcción y actualización de las ramas `main` y `develop`:

* **Usuario:** `vintra_deploy`

### 2. Firewall (UFW / IPTables)

El cortafuegos se mantiene activo constantemente para limitar las conexiones externas únicamente a las zonas y puertos expresamente permitidos, protegiendo el sistema contra accesos no autorizados.

### 3. Configuración HTTPS / TLS

* Implementación de certificados **SSL/TLS** para garantizar comunicaciones cifradas mediante HTTPS entre los navegadores y el servidor Apache.

### 4. Mapeo y Apertura de Puertos

| Puerto | Protocolo / Servicio | Descripción / Uso |
| :---: | :--- | :--- |
| `22` | SSH | Administración remota del servidor |
| `80` | HTTP | Redirección estándar web |
| `443` | HTTPS | Tráfico web cifrado seguro |
| `3000` | Interno | Puerto local de la aplicación Nest.js |
| `5433` | PostgreSQL | Servicio de base de datos |

### 5. Variables de Entorno

(En espera de variables de entorno de las demás celulas)

### 6. Backups

**Hora del Backup:** 3am cada 2 días

(En proceso)

---

## 📂 Arquitectura de Directorios en Servidor

Estructura organizativa de archivos dentro de `/var/www/` para alojar los entornos de producción y pruebas:

```text
/var/www/
└── vintra.qsuene.com/
    ├── html-main/     <-- Proyecto en Producción (rama main)
    └── html-dev/      <-- Proyecto de Pruebas (rama develop)
```

---

## Proximos Pasos

* Desarrollo de las variables de entorno
* Terminación del backup para la base de datos
