# UI/UX

Guía para documentar la experiencia de quienes consultan o administran el servicio.

## Debe publicarse aquí

- objetivos y necesidades de cada perfil;
- flujos de navegación y prototipos;
- decisiones de diseño visual y componentes reutilizables;
- estados vacíos, carga, error y confirmación;
- criterios de accesibilidad y diseño responsive;
- recursos entregados al frontend y su versión vigente.

## Estado

- Estado: `Borrador`
- Responsable: Célula UI/UX
- Pendiente: publicar la landing page, flujos y criterios visuales.

---

## 1. Objetivo

Definir la estructura de navegación, las pantallas, los flujos y los criterios de experiencia de usuario necesarios para que VINTRA permita gestionar la flota, el personal, las rutas y la operación del servicio de recolección de residuos.

El diseño contempla los diferentes perfiles de usuario y sus responsabilidades dentro de la plataforma:

- Administrador
- Conductor
- Ciudadano

---

## 2. Perfiles y roles

### 2.1 Administrador

Responsable de gestionar y supervisar la operación de la plataforma.

**Permisos**

- Gestionar vehículos.
- Gestionar conductores.
- Crear y modificar macrorutas.
- Crear y modificar microrutas.
- Asignar vehículos.
- Asignar conductores.
- Consultar recorridos.
- Consultar incidencias.
- Supervisar el estado de las rutas.
- Consultar la ubicación GPS de los vehículos.

---

### 2.2 Conductor

Responsable de ejecutar el recorrido que le fue asignado.

**Permisos**

- Consultar recorrido asignado.
- Iniciar recorrido.
- Enviar o registrar ubicación GPS.
- Consultar información de la ruta.
- Registrar incidencias durante el recorrido.
- Marcar novedades de recolección.
- Finalizar recorrido.

---

### 2.3 Ciudadano

Responsable de consultar información relacionada con el servicio y reportar problemas.

**Permisos**

- Consultar horarios.
- Consultar rutas.
- Consultar el estado de recolección.
- Reportar residuos no recogidos.
- Consultar el estado de sus reportes.

---

## 3. Pantallas identificadas

### 3.1 Gestión de flota

#### 3.1.1 Listado principal / Dashboard de flota

**Elementos principales**

**Acciones**

---

#### 3.1.2 Registro / edición de vehículo

**Información**

**Acciones**

---

#### 3.1.3 Hoja de vida / detalle del vehículo

**Información**

---

#### 3.1.4 Registro de mantenimiento / novedad

**Información**

---

### 3.2 Gestión del personal

#### 3.2.1 Listado de conductores

**Elementos**

**Acciones**

---

#### 3.2.2 Detalle / perfil del conductor

**Información**

**Acción**

---

#### 3.2.3 Crear / editar conductor

**Datos personales**

**Datos de licencia**

**Acceso**

**Acciones**

**Validaciones**

---

#### 3.2.4 Activar / desactivar conductor

**Elementos**

---

#### 3.2.5 Disponibilidad y turnos

**Elementos**

**Estados**

**Acciones**

---

#### 3.2.6 Gestión de usuarios y roles

**Información**

**Roles**

**Acciones**

---

### 3.3 Gestión de rutas

#### 3.3.1 Listado de rutas

**Información**

**Acciones**

---

#### 3.3.2 Crear macroruta

**Información**

**Acción**

---

#### 3.3.3 Crear microruta

**Información**

**Acción**

---

#### 3.3.4 Detalle de ruta

**Información**

---

#### 3.3.5 Editar / modificar ruta

**Información modificable**

---

#### 3.3.6 Asignación de vehículo y conductor

**Elementos**

**Acciones**

---

#### 3.3.7 Estado de la ruta